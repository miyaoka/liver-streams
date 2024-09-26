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

// スペース文字
const spaceChars = "\\s\\u3000\\u00A0\\u2000-\\u200F\\u2028\\u2029\\u202F";
// 区切り文字
const delimiterChars = "()（）［］｛｝「」『』〈〉《》【】〔〕〖〗｜/\\|";
// マッチさせない文字
const excludedChars = `${spaceChars}${delimiterChars.split("").join("\\")}`;
// 数字
const digitChars = "\\d０-９";
// ハッシュタグの正規表現
const hashRegExp = new RegExp(`#(?![${digitChars}])[^${excludedChars}]+`, "g");

// タイトルからhash部分を抜き出す
export function getHashList(input: string): string[] {
  return input.match(hashRegExp) ?? [];
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
