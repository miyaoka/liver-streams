/**
 * 引数がすべて前回と同じ参照なら前回の計算結果を返す関数を作る。
 *
 * モジュールに 1 つ置けば、同じ入力から計算する部品がいくつあっても計算は入力が変わるごとに 1 回で済む。
 */
export function memoizeLast<A extends unknown[], R>(compute: (...args: A) => R): (...args: A) => R {
  let cache: { args: A; result: R } | null = null;
  return (...args) => {
    if (
      cache &&
      cache.args.length === args.length &&
      cache.args.every((arg, i) => Object.is(arg, args[i]))
    ) {
      return cache.result;
    }
    const result = compute(...args);
    cache = { args, result };
    return result;
  };
}

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
  const memoized = memoizeLast(compute);
  return (state) => memoized(input(state));
}
