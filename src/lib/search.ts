export function splitAndCategorize(input: string): { quoted: string[]; unquoted: string[] } {
  const regex = /"([^"]*)"|(\S+)/g;
  const quoted: string[] = [];
  const unquoted: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // グループ1がマッチした場合（""内の文字列）
    if (match[1]) {
      quoted.push(match[1]); // 追加: ""で囲まれた文字列
    } else if (match[2]) {
      unquoted.push(match[2]); // 追加: スペースで区切られた文字列
    }
  }

  return { quoted, unquoted }; // それぞれの配列を返す
}
