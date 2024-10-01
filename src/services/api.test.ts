import { describe, it, expect } from "vitest";
import { extractParenthesizedText } from "./api";

describe("extractParenthesizedText", () => {
  it("括弧内のテキストを抽出する", () => {
    const input = "【お知らせ】明日の[生配信]について[重要]";
    const expected = ["お知らせ", "生配信", "重要"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("2文字未満のテキストは無視する", () => {
    const input = "[a]【bc】{def}";
    const expected = ["bc", "def"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("無視するワード入り", () => {
    const input = "[#live]【にじさんじ/あああ】[hololive]";
    const expected: string[] = [];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("大文字小文字を区別しない", () => {
    const input = "[TEST]【test】";
    const expected = ["test"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("複数の括弧タイプを処理する", () => {
    const input = "[English]{Français}「にほんご」";
    const expected = ["english", "français", "にほんご"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("括弧がない場合は空の配列を返す", () => {
    const input = "テストテキスト";
    expect(extractParenthesizedText(input)).toEqual([]);
  });

  it("丸括弧は判定しない", () => {
    const input =
      "【 Among Us 】協力と裏切りと王覇山と。（ 宇宙を舞台にした人狼系ゲーム ）です【にじさんじ/葉山舞鈴/コラボ】";
    const expected = ["among us"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  it("ナンバリングが入る場合は除外する", () => {
    const input =
      "【スーパーマリオヨッシーアイランド#12】完全初見🦖！！4‐2からやってくよ！！【にじさんじ/梢桃音】";
    const expected = ["スーパーマリオヨッシーアイランド"];
    expect(extractParenthesizedText(input)).toEqual(expected);
  });

  // it("特殊な括弧", () => {
  //   const input =
  //     "𓊆 あつまれ どうぶつの森 𓊇 島評価おしえてくださいお願いします！！！ 𓊆 雲母たまこ ┊ にじさんじ 𓊇";
  //   const expected = ["あつまれ どうぶつの森"];
  //   expect(extractParenthesizedText(input)).toEqual(expected);
  // });
});
