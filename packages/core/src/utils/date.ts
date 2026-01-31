// 時分秒を切り捨てたDateを取得
export function getDateTime(date: Date): number {
  return new Date(date).setHours(0, 0, 0, 0);
}

// 分以下を切り捨てたDateを取得
export function getHourTime(date: Date): number {
  return new Date(date).setHours(date.getHours(), 0, 0, 0);
}

// 0時のdatetime同士を比較して日数差を返す
export function compareDate({
  baseDateTime,
  targetDateTime,
}: {
  baseDateTime: number;
  targetDateTime: number;
}): number {
  const oneDay = 24 * 60 * 60 * 1000;

  // 日数差を計算
  const differenceInDays = (targetDateTime - baseDateTime) / oneDay;

  return differenceInDays;
}
