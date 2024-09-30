import { describe, it, expect } from "vitest";
import { parseInput, createSearchRegexp } from "./search";

describe("parseInput", () => {
  it("引用符で囲まれた文字列は空白があっても区切られないこと", () => {
    const input = '"quoted text" unquoted';
    const expected = {
      wordList: ["quoted text", "unquoted"],
      options: {},
    };
    expect(parseInput(input)).toEqual(expected);
  });

  it("接頭辞がある文字列とそれ以外の文字列に分割できること", () => {
    const input = 'tag:example "quoted text" unquoted talent:example';
    const expected = {
      wordList: ["quoted text", "unquoted"],
      options: { tag: "example", talent: "example" },
    };
    expect(parseInput(input)).toEqual(expected);
  });

  it("同じ接頭辞が指定されていたら後者が採用されること", () => {
    const input = 'tag:example "quoted text" unquoted tag:example2';
    const expected = {
      wordList: ["quoted text", "unquoted"],
      options: { tag: "example2" },
    };
    expect(parseInput(input)).toEqual(expected);
  });
});
describe("createSearchRegexp", () => {
  it("単一の検索語を含む正規表現を生成できること", () => {
    const queryArray = ["example"];
    const expected = /(?=.*example)/i;
    expect(createSearchRegexp(queryArray)).toEqual(expected);
  });

  it("複数のAND条件を含む正規表現を生成できること", () => {
    const queryArray = ["example", "test"];
    const expected = /(?=.*example)(?=.*test)/i;
    expect(createSearchRegexp(queryArray)).toEqual(expected);
  });

  it("OR条件を含む正規表現を生成できること", () => {
    const queryArray = ["example", "or", "test"];
    const expected = /((?=.*example)|(?=.*test))/i;
    expect(createSearchRegexp(queryArray)).toEqual(expected);
  });

  it("orに|も使えること", () => {
    const queryArray = ["example", "|", "test"];
    const expected = /((?=.*example)|(?=.*test))/i;
    expect(createSearchRegexp(queryArray)).toEqual(expected);
  });

  it("複数のAND条件とOR条件を含む正規表現を生成できること", () => {
    const queryArray = ["example", "test", "or", "sample", "demo"];
    const expected = /((?=.*example)(?=.*test)|(?=.*sample)(?=.*demo))/i;
    expect(createSearchRegexp(queryArray)).toEqual(expected);
  });

  it("空の検索語配列に対して空の正規表現を生成できること", () => {
    const queryArray: string[] = [];
    const expected = new RegExp("", "i");
    expect(createSearchRegexp(queryArray)).toEqual(expected);
  });
});
