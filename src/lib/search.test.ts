import { describe, it, expect } from "vitest";
import { parseInput, createSearchRegexp } from "./search";

describe("parseInput", () => {
  it("引用符で囲まれた文字列とそれ以外の文字列に分割できること", () => {
    const input = 'tag:example "quoted text" unquoted';
    const expected = {
      wordList: ["quoted text", "unquoted"],
      options: { tag: "example" },
    };
    expect(parseInput(input)).toEqual(expected);
  });

  it("引用符で囲まれた文字列がない場合、すべてunquotedとして扱うこと", () => {
    const input = "tag:example unquoted";
    const expected = {
      wordList: ["unquoted"],
      options: { tag: "example" },
    };
    expect(parseInput(input)).toEqual(expected);
  });

  it("接頭辞がない場合、すべてwordListに追加されること", () => {
    const input = 'example "quoted text"';
    const expected = {
      wordList: ["example", "quoted text"],
      options: {},
    };
    expect(parseInput(input)).toEqual(expected);
  });
});
describe("createSearchRegexp", () => {
  it("単一の検索語を含む正規表現を生成できること", () => {
    const queryArray = ["example"];
    const expected = "(?=.*example)";
    expect(createSearchRegexp(queryArray)).toBe(expected);
  });

  it("複数のAND条件を含む正規表現を生成できること", () => {
    const queryArray = ["example", "test"];
    const expected = "(?=.*example)(?=.*test)";
    expect(createSearchRegexp(queryArray)).toBe(expected);
  });

  it("OR条件を含む正規表現を生成できること", () => {
    const queryArray = ["example", "or", "test"];
    const expected = "(?=.*example)|(?=.*test)";
    expect(createSearchRegexp(queryArray)).toBe(expected);
  });

  it("複数のAND条件とOR条件を含む正規表現を生成できること", () => {
    const queryArray = ["example", "test", "or", "sample", "demo"];
    const expected = "(?=.*example)(?=.*test)|(?=.*sample)(?=.*demo)";
    expect(createSearchRegexp(queryArray)).toBe(expected);
  });

  it("空の検索語配列に対して空の正規表現を生成できること", () => {
    const queryArray: string[] = [];
    const expected = "";
    expect(createSearchRegexp(queryArray)).toBe(expected);
  });
});
