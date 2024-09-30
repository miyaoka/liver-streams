import { type LiverEvent } from "@/services/api";

export interface SearchQuery {
  wordList: string[];
  options: Record<string, string>;
}

export function parseInput(input: string): SearchQuery {
  // 引用符で囲まれた文字列とそれ以外の文字列にスペースで分割
  const regex = /"(?<quoted>[^"]*)"|(?<unquoted>\S+)/g;
  let match: RegExpExecArray | null;

  const terms: {
    type: "quoted" | "unquoted";
    value: string;
  }[] = [];

  while ((match = regex.exec(input)) !== null) {
    // グループ1がマッチした場合（""内の文字列）
    const [_, quoted, unquoted] = match;
    terms.push(quoted ? { type: "quoted", value: quoted } : { type: "unquoted", value: unquoted });
  }

  const wordList: string[] = [];
  const prefixRegExp = new RegExp(`^(?<prefix>[^:]+):(?<term>.*)`, "i");
  const options: Record<string, string> = {};

  terms.forEach((item) => {
    if (item.type !== "unquoted") {
      wordList.push(item.value);
      return;
    }
    // quoteされてない語なら接頭辞の有無をチェック
    const groups = item.value.match(prefixRegExp)?.groups;
    if (!groups) {
      wordList.push(item.value);
      return;
    }

    // 接頭辞があればオプションに追加
    const { prefix, term } = groups;
    options[prefix] = term;
  });

  return { wordList, options };
}

export function toTerms(searchQuery: SearchQuery): string {
  const { wordList, options } = searchQuery;
  const optionStr = Object.entries(options)
    .map(([key, value]) => `${key}:${value}`)
    .join(" ");
  return [...wordList, optionStr].join(" ");
}

// orにする区切り文字
const or = ["or", "\\|"];
const orRegExp = new RegExp(`(${or.join("|")})`, "i");

// クエリから正規表現を生成
export function createSearchRegexp(queryArray: string[]): RegExp | null {
  if (queryArray.length === 0) return null;
  const orParts: string[][] = [];
  let currentAndPart: string[] = [];

  // "or" を基準に配列を OR 条件ごとに分割
  queryArray.forEach((term) => {
    if (term.match(orRegExp)) {
      // "or" が出てきたら、現在の AND 条件を保存し、新しい OR 部分を開始
      orParts.push(currentAndPart);
      currentAndPart = [];
    } else {
      // "or" 以外の部分は AND 条件として追加
      currentAndPart.push(term);
    }
  });
  // 最後の AND 部分を保存
  orParts.push(currentAndPart);

  // OR 条件を正規表現に変換
  const regexParts = orParts.map((andPart) => {
    // 各 AND 部分を正規表現に変換
    return andPart.map((term) => `(?=.*${term})`).join("");
  });

  // OR 条件を正規表現で組み合わせる
  const pattern = regexParts.length > 1 ? `(${regexParts.join("|")})` : regexParts[0];
  const regexp = new RegExp(pattern, "i");
  return regexp;
}

export function getFilteredEventList({
  liverEventList,
  filterMap,
  searchQuery,
}: {
  liverEventList: LiverEvent[];
  filterMap: Map<string, boolean>;
  searchQuery: SearchQuery;
}): LiverEvent[] {
  const searchRegExp = createSearchRegexp(searchQuery.wordList);

  const { talent, status } = searchQuery.options;

  let result: LiverEvent[] = liverEventList;

  // ライブ中
  if (status === "live") {
    result = result.filter((liverEvent) => liverEvent.isLive);
  }

  // オプションのtalentが指定されている場合はfilterMapを無視してtalentで絞り込む
  result = talent
    ? getTalentFocusedList({ talent, liverEventList: result })
    : getTalentFilterMapApplyedList({ filterMap, liverEventList: result });

  // 検索語がある場合はタイトル、タレント名、コラボタレント名でフィルタリング
  if (searchRegExp) {
    result = result.filter((liverEvent) => {
      return (
        searchRegExp.test(liverEvent.title) ||
        searchRegExp.test(liverEvent.talent.name) ||
        liverEvent.collaboTalents.some((collaborator) => {
          return searchRegExp.test(collaborator.name);
        })
      );
    });
  }
  return result;
}

export function getTalentFocusedList({
  talent,
  liverEventList,
}: {
  talent: string;
  liverEventList: LiverEvent[];
}) {
  return liverEventList.filter((liverEvent) => {
    return (
      liverEvent.talent.name === talent ||
      liverEvent.collaboTalents.some((collaborator) => {
        return collaborator.name === talent;
      })
    );
  });
}
export function getTalentFilterMapApplyedList({
  filterMap,
  liverEventList,
}: {
  filterMap: Map<string, boolean>;
  liverEventList: LiverEvent[];
}) {
  // フィルタなし
  if (filterMap.size === 0) return liverEventList;

  // タレント名かコラボタレント名がフィルターに含まれるイベントのみ表示
  return liverEventList.filter((liverEvent) => talentFilter({ liverEvent, filterMap }));
}

export function talentFilter({
  liverEvent,
  filterMap,
}: {
  liverEvent: LiverEvent;
  filterMap: Map<string, boolean>;
}) {
  return (
    filterMap.has(liverEvent.talent.name) ||
    liverEvent.collaboTalents.some((collaborator) => {
      return filterMap.has(collaborator.name);
    })
  );
}
