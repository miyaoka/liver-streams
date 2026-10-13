import type { LiverEvent } from "@liver-streams/core";
import { selectCurrentTime, useDateStore, useHoverStore } from "../../shared/stores";
import { selectHasBookmark, selectHasNotify, useBookmarkStore } from "../bookmark";
import { selectNewArrivalsIdSet, useNewArrivalsStore } from "../newArrivals";

const oneHour = 60 * 60 * 1000;

// ホロライブのライブ開始判定用
const liveStartDuration = 20 * 60 * 1000;
const liveEndDuration = 60 * 60 * 1000;

// 配信終了判定
function getIsFinished(liverEvent: LiverEvent, elapsedTime: number): boolean {
  // 終了時刻が設定されているか（にじさんじのみ）
  if (liverEvent.endAt) return true;
  // 配信中か
  if (liverEvent.isLive) return false;

  // 配信していない場合、経過時間で判定
  // 現在時刻を過ぎていなければ開始前
  if (elapsedTime === 0) return false;

  // ホロライブの場合
  if (liverEvent.affiliation === "hololive") {
    // 配信開始直後は開始時間が更新されてもliveになっていない場合があるので一定時間判定しない
    if (elapsedTime < liveStartDuration) return false;

    // startTimeの秒数が0以外あれば配信開始済み
    if (liverEvent.startAt.getSeconds() !== 0) return true;

    // 秒数が0の場合、1時間経過していたら終了と見なす
    if (elapsedTime > liveEndDuration) return true;
  }
  // それ以外の場合：未終了
  return false;
}

// 配信した時間
function getLiveDuration(liverEvent: LiverEvent, startTime: number, elapsedTime: number): number {
  // 終了時間が設定されている場合はイベント開始から終了までの時間を返す
  const { endAt, isLive } = liverEvent;
  const startToEndDuration = endAt ? endAt.getTime() - startTime : null;
  if (startToEndDuration) return startToEndDuration;

  // 配信中の場合は経過時間を返す
  if (isLive) return elapsedTime;

  // それ以外の場合は0を返す
  return 0;
}

// 配信時間をラベル表示用に整形
function getLiveDurationLabel(liveDuration: number) {
  if (liveDuration === 0) return null;

  const hour = liveDuration / oneHour;
  return {
    fixed: hour.toFixed(1),
    count: Math.min(12, Math.max(1, Math.round(hour))),
  };
}

function getIsHovered(
  liverEvent: LiverEvent,
  hoveredTalent: string | null,
  hoveredCollaboTalentSet: Set<string>,
): boolean {
  if (!hoveredTalent) return false;
  // 自身がホバー中のタレントか
  if (hoveredTalent === liverEvent.talent.name) return true;
  // ホバー中のタレントがコラボタレントに含まれているか
  if (liverEvent.collaboTalentSet.has(hoveredTalent)) return true;
  // ホバー中のコラボタレントにタレントが含まれているか
  return hoveredCollaboTalentSet.has(liverEvent.talent.name);
}

/**
 * カードの表示状態。store は真偽値・文字列・数に絞って購読し、
 * 時刻やホバーが変わっても値が変わらないカードは再描画しない。
 */
export const useLiverEvent = (liverEvent: LiverEvent) => {
  const { id, isLive } = liverEvent;
  const startTime = liverEvent.startAt.getTime();

  // 開始時刻からの経過時間
  const getElapsedTime = (state: Parameters<typeof selectCurrentTime>[0]) =>
    Math.max(0, selectCurrentTime(state) - startTime);
  const getLabel = (state: Parameters<typeof selectCurrentTime>[0]) =>
    getLiveDurationLabel(getLiveDuration(liverEvent, startTime, getElapsedTime(state)));

  const isFinished = useDateStore((state) => getIsFinished(liverEvent, getElapsedTime(state)));
  const labelFixed = useDateStore((state) => getLabel(state)?.fixed ?? null);
  const labelCount = useDateStore((state) => getLabel(state)?.count ?? 0);
  const isNew = useNewArrivalsStore((state) => selectNewArrivalsIdSet(state).has(id));
  const hasBookmark = useBookmarkStore(selectHasBookmark(id));
  const hasNotify = useBookmarkStore(selectHasNotify(id));
  const isHovered = useHoverStore((state) =>
    getIsHovered(liverEvent, state.hoveredTalent, state.hoveredCollaboTalentSet),
  );

  return {
    isUpcoming: !isLive && !isFinished,
    isLive,
    isFinished,
    isHovered,
    liveDurationLabel: labelFixed === null ? null : { fixed: labelFixed, count: labelCount },
    isNew,
    hasBookmark,
    hasNotify,
  };
};
