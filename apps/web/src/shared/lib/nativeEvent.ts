// vue-jsx-vapor の JSX 型はイベントを React の合成イベントとして型付けするが、
// 実行時にハンドラが受け取るのはネイティブの DOM イベントである（vuejs/vue-jsx-vapor#82）
export function asNativeEvent<E extends Event>(event: unknown): E {
  return event as E;
}
