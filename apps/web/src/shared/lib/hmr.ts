/**
 * HMR でモジュールが再実行されたとき、前のインスタンスが始めた副作用（interval、イベントリスナー）を止める。
 *
 * store のモジュールは React Refresh の境界にならないため、編集すると import 元の境界と一緒に再実行される。
 * このとき Vite が dispose を呼ぶのは境界のモジュールだけなので、後始末を `hot.data` に置き、次のインスタンスが呼ぶ。
 * `hot` には呼び出し元のモジュールの `import.meta.hot` を渡す。
 */
export function stopOnHotReexecute(
  hot: ImportMeta["hot"],
  name: string,
  cleanup: () => void,
): void {
  if (!hot) return;
  const previous: unknown = hot.data[name];
  if (typeof previous === "function") previous();
  hot.data[name] = cleanup;
}
