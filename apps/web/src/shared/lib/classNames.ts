/** 偽の値を除いたクラス名を空白でつなぐ */
export function classNames(...list: (string | false | null | undefined)[]): string {
  return list.filter(Boolean).join(" ");
}
