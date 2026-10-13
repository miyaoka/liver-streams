/**
 * 入力が同じ参照のあいだ前回の計算結果を返すセレクタを作る。
 *
 * zustand のセレクタは useSyncExternalStore の getSnapshot として呼ばれ、
 * 毎回新しいオブジェクトを返すと無限に再描画される。
 * Map / Set / オブジェクトを返す派生値はこれで包む。
 */
export function createMemoSelector<S, I, R>(
  input: (state: S) => I,
  compute: (value: I) => R,
): (state: S) => R {
  let cache: { input: I; result: R } | null = null;
  return (state) => {
    const value = input(state);
    if (cache && Object.is(cache.input, value)) return cache.result;
    const result = compute(value);
    cache = { input: value, result };
    return result;
  };
}
