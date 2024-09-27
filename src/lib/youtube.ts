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
const startChars = "[#]";
// 有効な文字の正規表現
const continueChars = "[\\p{XID_Continue}\\p{Extended_Pictographic}\\p{Emoji_Component}_+-]";
// ハッシュタグの正規表現
// #の後にavailableCharsが3文字以上続く文字列
const hashRegExp = new RegExp(`(?<!${continueChars})${startChars}${continueChars}{3,}`, "gu");

// タイトルからhash部分を抜き出す
export function getHashTagList(input: string): string[] {
  const list = input.match(hashRegExp) ?? [];
  // ハッシュタグの重複を削除
  return [...new Set(list)];
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
