import { describe, expect, it } from "vitest";
import {
	type Segment,
	extractParenthesizedText,
	getHashTagList,
	parseSegment,
} from "./text";

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

	it("大文字小文字を区別する", () => {
		const input = "[TEST]【test】{TeST}";
		const expected = ["TEST", "test", "TeST"];
		expect(extractParenthesizedText(input)).toEqual(expected);
	});

	it("複数の括弧タイプを処理する", () => {
		const input = "[English]{Français}「にほんご」";
		const expected = ["English", "Français", "にほんご"];
		expect(extractParenthesizedText(input)).toEqual(expected);
	});

	it("括弧がない場合は空の配列を返す", () => {
		const input = "テストテキスト";
		expect(extractParenthesizedText(input)).toEqual([]);
	});

	it("丸括弧は判定しない", () => {
		const input =
			"【 Among Us 】協力と裏切りと王覇山と。（ 宇宙を舞台にした人狼系ゲーム ）です【にじさんじ/葉山舞鈴/コラボ】";
		const expected = ["Among Us"];
		expect(extractParenthesizedText(input)).toEqual(expected);
	});

	it("ナンバリングが入る場合は除外する", () => {
		const input =
			"【スーパーマリオヨッシーアイランド#12】完全初見🦖！！4‐2からやってくよ！！【にじさんじ/梢桃音】";
		const expected = ["スーパーマリオヨッシーアイランド"];
		expect(extractParenthesizedText(input)).toEqual(expected);
	});

	it("括弧内に全角ハッシュタグが含まれる場合も除外する", () => {
		const input =
			"【＃マイクラ肝試し2024】まだ暑いから夏！肝を試します【＃黒夢町】";
		const expected: string[] = [];
		expect(extractParenthesizedText(input)).toEqual(expected);
	});
	// it("特殊な括弧", () => {
	//   const input =
	//     "𓊆 あつまれ どうぶつの森 𓊇 島評価おしえてくださいお願いします！！！ 𓊆 雲母たまこ ┊ にじさんじ 𓊇";
	//   const expected = ["あつまれ どうぶつの森"];
	//   expect(extractParenthesizedText(input)).toEqual(expected);
	// });
});

describe("getHashTagList", () => {
	it("複数のハッシュタグが含まれる文字列からハッシュタグの配列を返す", () => {
		const input = "This is a test #hashtag1 and another #hashtag2";
		const expected = ["hashtag1", "hashtag2"];
		expect(getHashTagList(input)).toEqual(expected);
	});

	it("ハッシュタグが含まれていない場合は空の配列を返す", () => {
		const input = "This is a test with no hashtags";
		expect(getHashTagList(input)).toEqual([]);
	});

	it("3文字未満のハッシュタグは無視する", () => {
		const input = "This is a test #ha #val #validhashtag";
		const expected = ["val", "validhashtag"];
		expect(getHashTagList(input)).toEqual(expected);
	});

	it("末尾に3文字未満のハッシュタグがある場合も無視する", () => {
		const input = "『ドラゴンボールZ:KAKAROT』やるやよッ！！！ #05";
		expect(getHashTagList(input)).toEqual([]);
	});

	it("特殊文字を含むハッシュタグを正しく処理する", () => {
		const input = "This is a test #hashtag1 #hash_tag2 #hash-tag3";
		const expected = ["hashtag1", "hash_tag2", "hash-tag3"];
		expect(getHashTagList(input)).toEqual(expected);
	});

	it("日本語の文字を含む文字列からハッシュタグの配列を返す", () => {
		const input = "これはテストです #ハッシュタグ1 #ハッシュタグ2";
		const expected = ["ハッシュタグ1", "ハッシュタグ2"];
		expect(getHashTagList(input)).toEqual(expected);
	});

	it("除外文字を含むハッシュタグは無視する", () => {
		const input = "This is a test #hash(tag) #hash[tag] #validhashtag";
		const expected = ["hash", "validhashtag"];
		expect(getHashTagList(input)).toEqual(expected);
	});

	it("絵文字を含むハッシュタグを正しく処理する", () => {
		const input = "This is a test #aaa🔥bbb #aaa🚀bbb #aaa🌟bbb";
		const expected = ["aaa🔥bbb", "aaa🚀bbb", "aaa🌟bbb"];
		expect(getHashTagList(input)).toEqual(expected);
	});

	it("ハッシュタグの前後に空白が無くてもマッチさせる", () => {
		// https://www.youtube.com/watch?v=h1eIM6n1-zc
		const input =
			"MV50万再生感謝✨️ダンスレッスンのときのお遊び💃#shorts #風真いろは #ダンスレッスン#魔法少女まじかるござる #ホロライブ";
		const expected = [
			"shorts",
			"風真いろは",
			"ダンスレッスン",
			"魔法少女まじかるござる",
			"ホロライブ",
		];
		expect(getHashTagList(input)).toEqual(expected);
	});

	it("大文字のハッシュ記号でもマッチさせる", () => {
		const input =
			"【＃生スバル】カドショ開店しゅばああああああああああああああああああああああああ！！！！！！/ TCG Card Shop Simulator【ホロライブ/大空スバル】";
		const expected = ["生スバル"];
		expect(getHashTagList(input)).toEqual(expected);
	});
});
describe("parseSegment", () => {
	it("キーワードとハッシュタグを正しくセグメント化する", () => {
		const text =
			"これはテストです #ハッシュタグ1 キーワード1 #ハッシュタグ2 キーワード2";
		const keywords = ["キーワード1", "キーワード2"];
		const hashtags = ["ハッシュタグ1", "ハッシュタグ2"];
		const expected: Segment[] = [
			{ value: "これはテストです ", type: "text" },
			{ value: "#ハッシュタグ1", type: "hashtag" },
			{ value: " ", type: "text" },
			{ value: "キーワード1", type: "keyword" },
			{ value: " ", type: "text" },
			{ value: "#ハッシュタグ2", type: "hashtag" },
			{ value: " ", type: "text" },
			{ value: "キーワード2", type: "keyword" },
		];
		expect(parseSegment(text, keywords, hashtags)).toEqual(expected);
	});

	it("キーワードのみをセグメント化する", () => {
		const text = "これはキーワード1とキーワード2のテストです";
		const keywords = ["キーワード1", "キーワード2"];
		const hashtags: string[] = [];
		const expected: Segment[] = [
			{ value: "これは", type: "text" },
			{ value: "キーワード1", type: "keyword" },
			{ value: "と", type: "text" },
			{ value: "キーワード2", type: "keyword" },
			{ value: "のテストです", type: "text" },
		];
		expect(parseSegment(text, keywords, hashtags)).toEqual(expected);
	});

	it("ハッシュタグのみをセグメント化する", () => {
		const text = "これは#ハッシュタグ1と#ハッシュタグ2のテストです";
		const keywords: string[] = [];
		const hashtags = ["ハッシュタグ1", "ハッシュタグ2"];
		const expected: Segment[] = [
			{ value: "これは", type: "text" },
			{ value: "#ハッシュタグ1", type: "hashtag" },
			{ value: "と", type: "text" },
			{ value: "#ハッシュタグ2", type: "hashtag" },
			{ value: "のテストです", type: "text" },
		];
		expect(parseSegment(text, keywords, hashtags)).toEqual(expected);
	});

	it("キーワードとハッシュタグがない場合はテキストのみをセグメント化する", () => {
		const text = "これはテストです";
		const keywords: string[] = [];
		const hashtags: string[] = [];
		const expected: Segment[] = [{ value: "これはテストです", type: "text" }];
		expect(parseSegment(text, keywords, hashtags)).toEqual(expected);
	});

	it("キーワードとハッシュタグが重複する場合は正しくセグメント化する", () => {
		const text = "これは#キーワード1とキーワード1のテストです";
		const keywords = ["キーワード1"];
		const hashtags = ["キーワード1"];
		const expected: Segment[] = [
			{ value: "これは", type: "text" },
			{ value: "#キーワード1", type: "hashtag" },
			{ value: "と", type: "text" },
			{ value: "キーワード1", type: "keyword" },
			{ value: "のテストです", type: "text" },
		];
		expect(parseSegment(text, keywords, hashtags)).toEqual(expected);
	});

	it("全角ハッシュタグの場合でも正しくセグメント化する", () => {
		const text = "これは#ハッシュタグ１と＃全角ハッシュタグ２のテストです";
		const keywords: string[] = [];
		const hashtags = ["ハッシュタグ１", "全角ハッシュタグ２"];
		const expected: Segment[] = [
			{ value: "これは", type: "text" },
			{ value: "#ハッシュタグ１", type: "hashtag" },
			{ value: "と", type: "text" },
			{ value: "＃全角ハッシュタグ２", type: "hashtag" },
			{ value: "のテストです", type: "text" },
		];
		expect(parseSegment(text, keywords, hashtags)).toEqual(expected);
	});

	it("ハッシュタグが隣接する場合でも正しくセグメント化する", () => {
		const text = "これは#ハッシュタグ1#ハッシュタグ2のテストです";
		const keywords: string[] = [];
		const hashtags = ["ハッシュタグ1", "ハッシュタグ2"];
		const expected: Segment[] = [
			{ value: "これは", type: "text" },
			{ value: "#ハッシュタグ1", type: "hashtag" },
			{ value: "#ハッシュタグ2", type: "hashtag" },
			{ value: "のテストです", type: "text" },
		];
		expect(parseSegment(text, keywords, hashtags)).toEqual(expected);
	});

	it("大文字・小文字を区別しない", () => {
		const text = "【 OMORI 】私が選んだその道が、私の運命を決定づける";
		const keywords = ["omori"];
		const hashtags: string[] = [];
		const expected: Segment[] = [
			{ value: "【 ", type: "text" },
			{ value: "OMORI", type: "keyword" },
			{ value: " 】私が選んだその道が、私の運命を決定づける", type: "text" },
		];
		expect(parseSegment(text, keywords, hashtags)).toEqual(expected);
	});
});
