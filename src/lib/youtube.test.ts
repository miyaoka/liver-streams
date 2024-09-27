import { describe, it, expect } from "vitest";
import { getHashTagList, getYouTubeVideoId } from "./youtube";

describe("getYouTubeVideoId", () => {
  it("should return the video ID from a standard YouTube URL", () => {
    const url = "https://www.youtube.com/watch?v=VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return the video ID from a shortened YouTube URL", () => {
    const url = "https://youtu.be/VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return the video ID from an embedded YouTube URL", () => {
    const url = "https://www.youtube.com/v/VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return the video ID from an embedded YouTube URL", () => {
    const url = "https://www.youtube.com/embed/VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return the video ID from a YouTube live URL", () => {
    const url = "https://www.youtube.com/live/VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return undefined if the URL does not contain a video ID", () => {
    const url = "https://www.youtube.com/";
    expect(getYouTubeVideoId(url)).toBeUndefined();
  });

  it("should return the video ID from a YouTube URL with additional parameters", () => {
    const url = "https://www.youtube.com/watch?v=VIDEO_ID&feature=youtu.be";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });
});

describe("getHashTagList", () => {
  it("should return an array of hashtags from a string with multiple hashtags", () => {
    const input = "This is a test #hashtag1 and another #hashtag2";
    const expected = ["#hashtag1", "#hashtag2"];
    expect(getHashTagList(input)).toEqual(expected);
  });

  it("should return an empty array if there are no hashtags", () => {
    const input = "This is a test with no hashtags";
    expect(getHashTagList(input)).toEqual([]);
  });

  it("should ignore hashtags that are too short", () => {
    const input = "This is a test #ha #validhashtag";
    const expected = ["#validhashtag"];
    expect(getHashTagList(input)).toEqual(expected);
  });

  it("should handle hashtags with special characters correctly", () => {
    const input = "This is a test #hashtag1 #hash_tag2 #hash-tag3";
    const expected = ["#hashtag1", "#hash_tag2", "#hash-tag3"];
    expect(getHashTagList(input)).toEqual(expected);
  });

  it("should return an array of hashtags from a string with Japanese characters", () => {
    const input = "これはテストです #ハッシュタグ1 #ハッシュタグ2";
    const expected = ["#ハッシュタグ1", "#ハッシュタグ2"];
    expect(getHashTagList(input)).toEqual(expected);
  });

  it("should ignore hashtags with excluded characters", () => {
    const input = "This is a test #hash(tag) #hash[tag] #validhashtag";
    const expected = ["#hash", "#validhashtag"];
    expect(getHashTagList(input)).toEqual(expected);
  });
});
