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

// タイトルからhash部分を抜き出す
const excludedChars = "()（）［］｛｝「」『』〈〉《》【】〔〕〖〗｜/\\|";
const hashRegExp = new RegExp(`#(?![\\d０-９])[^\\s${excludedChars.split("").join("\\")}]+`, "g");

export function getHashList(input: string): string[] {
  return input.match(hashRegExp) ?? [];
}
