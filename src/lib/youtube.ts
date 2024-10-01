type YoutubeImageQuality = "" | "mq" | "hq" | "sd" | "maxres";

/**
 * Get thumbnail url with quality
 * @param url Thumbnail url
 * @param quality Thumbnail quality
 * @returns Thumbnail url with quality
 * @example
 * getThumnail("https://i.ytimg.com/vi/VIDEO_ID/default.jpg", "hq") // "https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg"
 */
export function getThumnail(url: string, quality: YoutubeImageQuality) {
  const groups = url.match(/^(?<base>.+\/)(.*default)(?<filename>(_live)?\..+)$/)?.groups;
  if (!groups) return url;

  const { base, filename } = groups;
  return `${base}${quality}default${filename}`;
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
  let isHash = false;

  // `Intl.Segmenter` を使用して1文字ずつ処理
  for (const { segment } of segmenter.segment(input)) {
    // ハッシュタグに有効な文字か
    const matched = segment.match(continueRegExp);

    // マッチしない、または#が出てきた場合そこで区切る
    if (!matched || segment === "#") {
      // ハッシュタグ中ならそれまでの文字列をリストに追加
      if (isHash) {
        // ハッシュタグ込みで4文字以上で追加
        if (buffer.length > 3) {
          result.push(buffer);
        }
        // reset
        buffer = "";
        isHash = false;
      }
    }
    // ハッシュタグの開始
    if (segment === "#") {
      isHash = true;
    }

    // ハッシュタグ中ならバッファに追加
    if (isHash) {
      buffer += segment;
    }
  }
  // ハッシュタグ中で終了した場合
  if (isHash) {
    result.push(buffer);
  }

  // ハッシュタグの重複を削除
  return [...new Set(result)];
}

// YouTubeのURLから動画IDを取得する
// 標準URL: https://www.youtube.com/watch?v=videoId
// 短縮URL: https://youtu.be/videoId
// 埋め込みURL: https://www.youtube.com/embed/videoId
// 短縮URL: https://www.youtube.com/v/videoId
// ライブURL: https://www.youtube.com/live/videoId
const videoIdPattern = /(?:v=|\/(?:embed|v|live)\/|youtu\.be\/)([0-9A-Za-z_-]+)/;
export function getYouTubeVideoId(url: string): string | undefined {
  const videoId = url.match(videoIdPattern)?.[1];
  return videoId;
}
