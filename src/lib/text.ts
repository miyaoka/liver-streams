export const hashtagPrefixPattern = "[#＃]";
const hashtagPrefixRegExp = new RegExp(hashtagPrefixPattern);
const hashTagRegex = new RegExp(hashtagPrefixPattern + ".+", "g");
const minKeywordLength = 2;
const minHashtagLength = 3;

// テキストから括弧で括られた文字列を抽出する
export function extractParenthesizedText(text: string, author: string = ""): string[] {
  const parentheses = "[]{}［］【】｛｝〔〕〈〉《》「」『』〘〙〚〛";
  const openingParentheses = parentheses
    .split("")
    .filter((_, index) => index % 2 === 0)
    .map((p) => "\\" + p);
  const closingParentheses = parentheses
    .split("")
    .filter((_, index) => index % 2 !== 0)
    .map((p) => "\\" + p);
  const parenthesesPattern = new RegExp(
    `(?<=[${openingParentheses.join("")}])(.*?)(?=[${closingParentheses.join("")}])`,
    "g",
  );
  const matches = text.match(parenthesesPattern);
  if (!matches) return [];

  const ignoreList = ["にじさんじ", "nijisanji", "ホロライブ", "hololive"];
  if (author) ignoreList.push(author);
  const ignoreRegExp = new RegExp(ignoreList.join("|"), "i");

  const list = matches.flatMap((match) => {
    // ハッシュ以降を削除
    const cleanedText = match.replace(hashTagRegex, "").trim().toLowerCase();
    // 2文字未満は無視
    if (cleanedText.length < minKeywordLength) return [];
    // 除外リストは無視
    if (cleanedText.match(ignoreRegExp)) return [];

    return cleanedText;
  });

  // ユニークなものだけにする
  return [...new Set(list)];
}

// https://unicode.org/reports/tr31/#hashtag_identifiers
// 有効な文字の正規表現
const continueChars = "[\\p{XID_Continue}\\p{Extended_Pictographic}\\p{Emoji_Component}_+-]";
// ハッシュタグに使える文字の正規表現
const continueRegExp = new RegExp(continueChars, "gu");
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// タイトルからhash部分を抜き出す
export function getHashTagList(input: string): string[] {
  let result: string[] = [];

  let buffer = "";
  let afterHash = false;

  // `Intl.Segmenter` を使用して1文字ずつ処理
  for (const { segment } of segmenter.segment(input)) {
    // ハッシュタグに有効な文字か
    const matched = segment.match(continueRegExp);
    // #か＃が出てきた場合はハッシュタグとして処理
    const isHash = hashtagPrefixRegExp.test(segment);

    // マッチしない、または#が出てきた場合そこで区切る
    if (!matched || isHash) {
      // ハッシュタグ中ならそれまでの文字列をリストに追加
      if (afterHash) {
        result.push(buffer);
        // reset
        buffer = "";
        afterHash = false;
      }
    }

    // ハッシュタグ中ならバッファに追加
    if (afterHash) {
      buffer += segment;
    }

    // ハッシュタグの開始
    if (isHash) {
      afterHash = true;
    }
  }
  // ハッシュタグ中で終了した場合
  if (afterHash) {
    result.push(buffer);
  }

  // 3文字未満のハッシュタグは含めない
  result = result.filter((tag) => tag.length >= minHashtagLength);

  // ハッシュタグの重複を削除
  return [...new Set(result)];
}

export type Segment = {
  value: string;
  type: "text" | "keyword" | "hashtag";
};

export function parseSegment(text: string, keywords: string[], hashtags: string[]): Segment[] {
  const segments: Segment[] = [];

  const hasKeywords = keywords.length > 0;
  const hasHashtags = hashtags.length > 0;

  // キーワードとハッシュタグがない場合はテキストのみを返す
  if (!hasKeywords && !hasHashtags) {
    return [{ value: text, type: "text" }];
  }

  // キーワードとハッシュタグのパターンを作成
  const keywordsPattern = hasKeywords ? `(?<keywords>${keywords.join("|")})` : null;
  const hashtagsPattern = hasHashtags
    ? `(?<hashtags>${hashtagPrefixPattern}(${hashtags.join("|")}))`
    : null;

  // 正規表現を作成
  const regex = new RegExp([keywordsPattern, hashtagsPattern].filter((v) => v).join("|"), "gi");

  // 文字列全体を順に解析する
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    // マッチ部分の前にテキストがある場合、テキストとして追加
    const beforeMatch = text.slice(lastIndex, match.index);
    if (beforeMatch) {
      segments.push({ value: beforeMatch, type: "text" });
    }

    const { keywords, hashtags } = match.groups ?? {};

    // キーワードかハッシュタグに応じてセグメントを追加
    if (keywords) {
      segments.push({ value: keywords, type: "keyword" });
    } else if (hashtags) {
      segments.push({ value: hashtags, type: "hashtag" });
    }

    lastIndex = regex.lastIndex;
  }

  // 最後のテキスト部分もセグメントとして追加
  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    segments.push({ value: remainingText, type: "text" });
  }

  return segments;
}
