import { describe, expect, it } from "vitest";
import {
	createSearchRegexp,
	parseSearchString,
	searchQueryToSearchString,
} from "./search";

describe("parseInput", () => {
	it("引用符で囲まれた文字列は空白があっても区切られないこと", () => {
		const input = '"quoted text" unquoted';
		const expected = {
			wordList: ["quoted text", "unquoted"],
			hashtagList: [],
			options: {},
		};
		expect(parseSearchString(input)).toEqual(expected);
	});

	it("接頭辞がある文字列とそれ以外の文字列に分割できること", () => {
		const input = 'tag:example "quoted text" unquoted status:live';
		const expected = {
			wordList: ["quoted text", "unquoted"],
			hashtagList: [],
			options: { tag: ["example"], status: ["live"] },
		};
		expect(parseSearchString(input)).toEqual(expected);
	});

	it("同じ接頭辞が指定されていたらすべてが配列に追加されること", () => {
		const input = 'tag:example "quoted text" unquoted tag:example2';
		const expected = {
			wordList: ["quoted text", "unquoted"],
			hashtagList: [],
			options: { tag: ["example", "example2"] },
		};
		expect(parseSearchString(input)).toEqual(expected);
	});

	it("クォートされた接頭辞の値が正しく処理されること", () => {
		const input = 'abc talent:"the talent" def';
		const expected = {
			wordList: ["abc", "def"],
			hashtagList: [],
			options: { talent: ["the talent"] },
		};
		expect(parseSearchString(input)).toEqual(expected);
	});

	it("空のとき", () => {
		const input = "   ";
		const expected = {
			wordList: [],
			hashtagList: [],
			options: {},
		};
		expect(parseSearchString(input)).toEqual(expected);
	});

	it("複数の接頭辞と単語が混在する場合", () => {
		const input = 'tag:example "quoted text" unquoted status:live tag:example2';
		const expected = {
			wordList: ["quoted text", "unquoted"],
			hashtagList: [],
			options: { tag: ["example", "example2"], status: ["live"] },
		};
		expect(parseSearchString(input)).toEqual(expected);
	});

	it("hashtagがある場合", () => {
		const input = 'abc #tag1 "quoted text" unquoted #tag2';
		const expected = {
			wordList: ["abc", "quoted text", "unquoted"],
			hashtagList: ["tag1", "tag2"],
			options: {},
		};
		expect(parseSearchString(input)).toEqual(expected);
	});

	it("unicode対応", () => {
		const input = 'tag:絵文🔥字 #日本語タグ unquoted tag:"日本語 空白入り" ';
		const expected = {
			wordList: ["unquoted"],
			hashtagList: ["日本語タグ"],
			options: { tag: ["絵文🔥字", "日本語 空白入り"] },
		};
		expect(parseSearchString(input)).toEqual(expected);
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

	it("orを含む語にマッチしないこと", () => {
		const queryArray = ["example", "short", "test"];
		const expected = /(?=.*example)(?=.*short)(?=.*test)/i;
		expect(createSearchRegexp(queryArray)).toEqual(expected);
	});

	it("複数のAND条件とOR条件を含む正規表現を生成できること", () => {
		const queryArray = ["example", "test", "or", "sample", "demo"];
		const expected = /((?=.*example)(?=.*test)|(?=.*sample)(?=.*demo))/i;
		expect(createSearchRegexp(queryArray)).toEqual(expected);
	});

	it("空の検索語配列に対してnullを返すこと", () => {
		const queryArray: string[] = [];
		expect(createSearchRegexp(queryArray)).toBeNull();
	});

	it("制御文字が含まれていても正規表現が生成できること", () => {
		const queryArray = [
			"example",
			"test",
			"or",
			"sample",
			"demo",
			"|",
			"()[]{}^$*+?.|\\",
		];
		const expected =
			/((?=.*example)(?=.*test)|(?=.*sample)(?=.*demo)|(?=.*\(\)\[\]\{\}\^\$\*\+\?\.\|\\))/i;
		expect(createSearchRegexp(queryArray)).toEqual(expected);
	});
});
describe("searchQueryToTerms", () => {
	it("単純な単語リストを文字列に変換できること", () => {
		const searchQuery = {
			wordList: ["example", "test"],
			hashtagList: [],
			options: {},
		};
		const expected = "example test";

		expect(searchQueryToSearchString(searchQuery)).toEqual(expected);
	});

	it("オプションを含むクエリを文字列に変換できること", () => {
		const searchQuery = {
			wordList: ["example"],
			hashtagList: [],
			options: { tag: ["exampleTag"], status: ["live"] },
		};
		const expected = "example tag:exampleTag status:live";
		expect(searchQueryToSearchString(searchQuery)).toEqual(expected);
	});

	it("ハッシュタグを含むクエリを文字列に変換できること", () => {
		const searchQuery = {
			wordList: ["example"],
			hashtagList: ["#tag1", "#tag2"],
			options: {},
		};
		const expected = "example #tag1 #tag2";
		expect(searchQueryToSearchString(searchQuery)).toEqual(expected);
	});

	it("単語、オプション、ハッシュタグを含むクエリを文字列に変換できること", () => {
		const searchQuery = {
			wordList: ["example", "test"],
			hashtagList: ["#tag1"],
			options: { tag: ["exampleTag"], status: ["live"] },
		};
		const expected = "example test tag:exampleTag status:live #tag1";
		expect(searchQueryToSearchString(searchQuery)).toEqual(expected);
	});

	it("空のクエリを空文字列に変換できること", () => {
		const searchQuery = {
			wordList: [],
			hashtagList: [],
			options: {},
		};
		const expected = "";
		expect(searchQueryToSearchString(searchQuery)).toEqual(expected);
	});

	it("オプションが空の配列の場合は無視されること", () => {
		const searchQuery = {
			wordList: ["example"],
			hashtagList: [],
			options: { tag: [] },
		};
		const expected = "example";
		expect(searchQueryToSearchString(searchQuery)).toEqual(expected);
	});

	it("空白を含むオプションの値がクォートされること", () => {
		const searchQuery = {
			wordList: ["example", "the space"],
			hashtagList: [],
			options: { tag: ["example tag"] },
		};
		const expected = 'example "the space" tag:"example tag"';
		expect(searchQueryToSearchString(searchQuery)).toEqual(expected);
	});
});
