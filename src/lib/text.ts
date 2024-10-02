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
    `[${openingParentheses.join("")}](.*?)[${closingParentheses.join("")}]`,
    "g",
  );
  const matches = text.match(parenthesesPattern);
  if (!matches) return [];

  const ignoreList = ["にじさんじ", "nijisanji", "ホロライブ", "hololive"];
  if (author) ignoreList.push(author);
  const ignoreRegExp = new RegExp(ignoreList.join("|"), "i");

  const list = matches.flatMap((match) => {
    const str = match.slice(1, -1).trim().toLowerCase();

    // ハッシュ以降を削除
    const noHash = str.replace(/#.*/, "");
    // 2文字未満は無視
    if (noHash.length < 2) return [];
    // 除外リストは無視
    if (noHash.match(ignoreRegExp)) return [];

    return noHash;
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
  const result: string[] = [];

  let buffer = "";
  let afterHash = false;

  // `Intl.Segmenter` を使用して1文字ずつ処理
  for (const { segment } of segmenter.segment(input)) {
    // ハッシュタグに有効な文字か
    const matched = segment.match(continueRegExp);
    // #か＃が出てきた場合はハッシュタグとして処理
    const isHash = /[#＃]/.test(segment);

    // マッチしない、または#が出てきた場合そこで区切る
    if (!matched || isHash) {
      // ハッシュタグ中ならそれまでの文字列をリストに追加
      if (afterHash) {
        // 3文字以上なら追加
        if (buffer.length > 2) {
          result.push(buffer);
        }
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

  // ハッシュタグの重複を削除
  return [...new Set(result)];
}
