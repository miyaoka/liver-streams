// vue-jsx-vapor の JSX 型はイベントを React の合成イベント（nativeEvent を持つ型）として型付けするが、
// 実行時にハンドラが受け取るのはネイティブの DOM イベントそのものである（vuejs/vue-jsx-vapor#82）。
// vue-jsx-vapor 3.3.0（vuejs/vue-jsx-vapor#83 が入る minor 系）に上げると nativeEvent が型から消え、
// この関数の呼び出しが型エラーになるので、そこが外す箇所になる
export function asNativeEvent<E extends Event>(event: { nativeEvent: E }): E {
  return event as unknown as E;
}
