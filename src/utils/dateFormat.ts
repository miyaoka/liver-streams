export const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

export const mmddhhssDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const mdwdayDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

export function hhss(date: Date) {
  return date.toTimeString().slice(0, 5);
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, { style: "narrow" });

function getTimeUnitAndValue(ms: number): { value: number; unit: Intl.RelativeTimeFormatUnit } {
  const absSec = Math.abs(ms) / 1000;

  // 境界値のリスト
  const thresholds = [
    // { unit: "second", min: 1, max: 60 }, // 1分未満はnowにする
    { unit: "minute", min: 60, max: 3600 },
    { unit: "hour", min: 3600, max: 86400 },
  ] as const;

  // 境界値を超えるまでループ
  for (const threshold of thresholds) {
    if (absSec < threshold.max) {
      return {
        unit: threshold.unit,
        value: Math.trunc(ms / threshold.min / 1000),
      };
    }
  }

  // Default return in case all thresholds are exceeded
  return {
    unit: "day",
    value: Math.trunc(ms / 86400 / 1000),
  };
}

export function toRelativeTime(time: number) {
  const { unit, value } = getTimeUnitAndValue(time);
  if (value === 0) return "now";

  return relativeTimeFormatter.format(value, unit);
}
