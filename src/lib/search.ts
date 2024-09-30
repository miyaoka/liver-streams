import { type LiverEvent } from "@/services/api";

type SearchQuery = {
  wordList: string[];
  hashtagList: string[];
  options: Record<string, string[]>;
};

// 正規表現でクォートされた文字列、キー・バリュー形式、ハッシュタグ、単純な単語をキャプチャ

// 有効な文字の正規表現
const continueChars = "[\\p{XID_Continue}\\p{Extended_Pictographic}\\p{Emoji_Component}_+-]";

// 正規表現の共通部分を変数として定義
const quoted = '"[^"]+"'; // クォートされた文字列
const optionKey = "\\w+"; // オプションのキー
const optionValue = `"[^"]+"|${continueChars}+`; // オプションの値
const hashtag = `#${continueChars}+`; // ハッシュタグ
const word = `${continueChars}+`; // 単純な単語

// 正規表現パターンを文字列として組み立て
const regexPattern = `(?<quoted>${quoted})|(?<optionKey>${optionKey}):(?<optionValue>${optionValue})|(?<hashtag>${hashtag})|(?<word>${word})`;

const searchRegex = new RegExp(regexPattern, "gu");

export function parseInput(input: string): SearchQuery {
  const wordList: string[] = [];
  const hashtagList: string[] = [];
  const options: Record<string, string[]> = {};

  let match;

  while ((match = searchRegex.exec(input)) !== null) {
    if (match.groups?.quoted) {
      // クォートされた文字列から両端のクォートを削除してwordlistに追加
      wordList.push(match.groups.quoted.slice(1, -1));
    } else if (match.groups?.optionKey && match.groups?.optionValue) {
      // オプションのキーと値を処理
      const key = match.groups.optionKey;
      const value = match.groups.optionValue.replace(/"/g, ""); // クォートを削除
      if (!options[key]) {
        options[key] = [];
      }
      options[key].push(value);
    } else if (match.groups?.hashtag) {
      // ハッシュタグをhashtagListに追加
      hashtagList.push(match.groups.hashtag);
    } else if (match.groups?.word) {
      // 単純な単語はwordlistに追加
      wordList.push(match.groups.word);
    }
  }

  return { wordList, hashtagList, options };
}

export function toTerms(searchQuery: SearchQuery): string {
  const { wordList, options, hashtagList } = searchQuery;
  const optionStr = Object.entries(options)
    .flatMap(([key, valueList]) => {
      if (valueList.length === 0) return [];
      return valueList.map((value) => `${key}:${value}`);
    })
    .join(" ");
  return [...wordList, optionStr, ...hashtagList].join(" ");
}

// orにする区切り文字
const or = ["or", "\\|"];
const orRegExp = new RegExp(`^(${or.join("|")})$`, "i");

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
  const { wordList, options, hashtagList } = searchQuery;
  const searchRegExp = createSearchRegexp(wordList);

  const { talent, status } = options;

  let result: LiverEvent[] = liverEventList;

  // ライブ中
  if (status?.includes("live")) {
    result = result.filter((liverEvent) => liverEvent.isLive);
  }

  // オプションのtalentが指定されている場合はfilterMapを無視してtalentで絞り込む
  result = talent
    ? getTalentFocusedList({ talent, liverEventList: result })
    : getTalentFilterMapApplyedList({ filterMap, liverEventList: result });

  // ハッシュタグがある場合はプロパティから完全一致でフィルタリング
  if (hashtagList.length > 0) {
    result = result.filter((liverEvent) => {
      return hashtagList.every((hashtag) => {
        return liverEvent.hashSet.has(hashtag);
      });
    });
  }

  // 検索語がある場合はタイトル、タレント名、コラボタレント名の部分一致でフィルタリング
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
  talent: string[];
  liverEventList: LiverEvent[];
}) {
  return liverEventList.filter((liverEvent) => {
    return (
      talent.includes(liverEvent.talent.name) ||
      liverEvent.collaboTalents.some((collaborator) => {
        return talent.includes(collaborator.name);
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
