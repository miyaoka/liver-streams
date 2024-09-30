import { type LiverEvent } from "@/services/api";

export interface SearchTerm {
  type: "quoted" | "unquoted";
  value: string;
}

export function parseInput(input: string) {
  // 引用符で囲まれた文字列とそれ以外の文字列にスペースで分割
  const regex = /"(?<quoted>[^"]*)"|(?<unquoted>\S+)/g;
  let match: RegExpExecArray | null;

  const terms: SearchTerm[] = [];

  while ((match = regex.exec(input)) !== null) {
    // グループ1がマッチした場合（""内の文字列）
    const [_, quoted, unquoted] = match;
    terms.push(quoted ? { type: "quoted", value: quoted } : { type: "unquoted", value: unquoted });
  }

  // // 検索語をorでグループ化する
  // const or = ["or", "|"]
  // const orRegExp = new RegExp(`(${or.join("|")})`, "i");

  const wordList: string[] = [];
  const prefix = ["tag", "talent", "collabo"];
  const prefixRegExp = new RegExp(`^(?<prefix>${prefix.join("|")}):(?<term>.*)`, "i");
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

// クエリから正規表現を生成
export function createSearchRegexp(queryArray: string[]) {
  const orParts: string[][] = [];
  let currentAndPart: string[] = [];

  // "or" を基準に配列を OR 条件ごとに分割
  queryArray.forEach((term) => {
    if (term === "or") {
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
  return regexParts.length > 1 ? `(${regexParts.join("|")})` : regexParts[0];
}

function getSearchTerms(input: string): string[] {
  const { quoted, unquoted } = parseInput(input);
  return [...quoted, ...unquoted];
}

export function getFilteredEventList({
  liverEventList,
  filterMap,
  filterEnabled,
  searchTerms,
  // focusedTalent,
  // isLiveOnly,
}: {
  liverEventList: LiverEvent[];
  filterMap: Map<string, boolean>;
  filterEnabled: boolean;
  searchTerms: string[];
  // focusedTalent: string | null;
  // isLiveOnly: boolean;
}): LiverEvent[] {
  // 単一セレクト時
  if (focusedTalent) {
    return liverEventList.filter((video) => {
      return (
        video.talent.name === focusedTalent ||
        video.collaboTalents.some((collaborator) => {
          return collaborator.name === focusedTalent;
        })
      );
    });
  }

  // 検索語をスペースで分割してOR検索
  const searchRegExp = searchTerms.length > 0 ? new RegExp(searchTerms.join("|"), "i") : null;

  return (
    liverEventList
      // talentでフィルタリング
      .filter((liverEvent) => talentFilter({ filterEnabled, filterMap, liverEvent }))
      .filter((liverEvent) => {
        // live中のみ表示
        if (!isLiveOnly) return true;
        return liverEvent.isLive;
      })
      .filter((liverEvent) => {
        // 検索語にマッチしたイベントのみ表示
        if (!searchRegExp) return true;
        return (
          searchRegExp.test(liverEvent.title) ||
          searchRegExp.test(liverEvent.talent.name) ||
          liverEvent.collaboTalents.some((collaborator) => {
            return searchRegExp.test(collaborator.name);
          })
        );
      })
  );
}

export function talentFilter({
  filterEnabled,
  filterMap,
  liverEvent,
}: {
  filterEnabled: boolean;
  filterMap: Map<string, boolean>;
  liverEvent: LiverEvent;
}) {
  // フィルタなし
  if (!filterEnabled || filterMap.size === 0) return true;

  // タレント名かコラボタレント名がフィルターに含まれる動画のみ表示
  return (
    filterMap.has(liverEvent.talent.name) ||
    liverEvent.collaboTalents.some((collaborator) => {
      return filterMap.has(collaborator.name);
    })
  );
}
