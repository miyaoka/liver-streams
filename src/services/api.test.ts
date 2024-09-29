import { describe, it, expect } from "vitest";
import { extractParenthesizedText } from "./api";

describe("extractParenthesizedText", () => {
  it("should extract text within parentheses", () => {
    const input = "This is a test (example) text.";
    const expected = ["example"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("should extract text within multiple parentheses", () => {
    const input = "This is a test (example1) text (example2).";
    const expected = ["example1", "example2"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("should return an empty array if there are no parentheses", () => {
    const input = "This is a test text.";
    expect(extractParenthesizedText(input)).toEqual([]);
  });

  it("should handle different types of parentheses", () => {
    const input = "This is a test (example1) text [example2] {example3} 〈example4〉.";
    const expected = ["example1", "example2", "example3", "example4"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  // it("should handle nested parentheses", () => {
  //   const input = "This is a test (example1 (nested)) text.";
  //   const expected = ["example1 (nested)"];
  //   expect(extractParenthesizedText(input)).toEqual(expected);
  // });

  it("should handle Japanese parentheses", () => {
    const input = "これはテストです（例1）テキスト［例2］です。";
    const expected = ["例1", "例2"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("should handle empty parentheses", () => {
    const input = "This is a test () text.";
    const expected = [""];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("should handle text with no matching closing parenthesis", () => {
    const input = "This is a test (example text.";
    expect(extractParenthesizedText(input)).toEqual([]);
  });
});
