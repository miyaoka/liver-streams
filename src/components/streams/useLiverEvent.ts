import { computed, toRaw, type Ref } from "vue";
import type { LiverEvent } from "@/services/api";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useDateStore } from "@/store/dateStore";
import { useEventListStore } from "@/store/eventListStore";
import { useFocusStore } from "@/store/focusStore";

const oneHour = 60 * 60 * 1000;

// ホロライブのライブ開始判定用
const liveStartDuration = 20 * 60 * 1000;
const liveEndDuration = 60 * 60 * 1000;

export const useLiverEvent = (liverEvent: Ref<LiverEvent>) => {
  const dateStore = useDateStore();
  const eventListStore = useEventListStore();
  const bookmarkStore = useBookmarkStore();
  const focusStore = useFocusStore();

  // 配信終了判定
  const isFinished = computed(() => {
    // 終了時刻が設定されているか（にじさんじのみ）
    if (liverEvent.value.endAt) return true;
    // 配信中か
    if (liverEvent.value.isLive) return false;

    // 配信していない場合、経過時間で判定
    const elapsed = elapsedTime.value;
    // 現在時刻を過ぎていなければ開始前
    if (elapsed === 0) return false;

    // ホロライブの場合
    if (liverEvent.value.affilication === "hololive") {
      // 配信開始直後は開始時間が更新されてもliveになっていない場合があるので一定時間判定しない
      if (elapsed < liveStartDuration) return false;

      // startTimeの秒数が0以外あれば配信開始済み
      if (liverEvent.value.startAt.getSeconds() !== 0) return true;

      // 秒数が0の場合、1時間経過していたら終了と見なす
      if (elapsed > liveEndDuration) return true;
    }
    // それ以外の場合：未終了
    return false;
  });

  const startTime = computed(() => {
    return liverEvent.value.startAt.getTime();
  });

  // 開始時刻からの経過時間
  const elapsedTime = computed(() => {
    return Math.max(0, dateStore.currentTime - startTime.value);
  });

  // イベント開始から終了までの経過時間
  const startToEndDuration = computed(() => {
    const { endAt } = liverEvent.value;
    if (!endAt) return null;
    return endAt.getTime() - startTime.value;
  });

  // 配信した時間
  const liveDuration = computed(() => {
    // 終了時間が設定されている場合はそれを返す
    if (startToEndDuration.value) return startToEndDuration.value;

    // 配信中の場合は経過時間を返す
    const { isLive } = liverEvent.value;
    if (isLive) return elapsedTime.value;

    // それ以外の場合は0を返す
    return 0;
  });

  // 配信時間をラベル表示用に整形
  const liveDurationLabel = computed(() => {
    if (liveDuration.value === 0) return null;

    const hour = liveDuration.value / oneHour;
    return {
      fixed: hour.toFixed(1),
      count: Math.min(12, Math.max(1, Math.round(hour))),
    };
  });

  const isNew = computed(() => {
    return eventListStore.addedEventIdSet.has(liverEvent.value.id);
  });

  const hasBookmark = computed(() => {
    return bookmarkStore.hasBookmark(liverEvent.value.id);
  });
  const hasNotify = computed(() => {
    return bookmarkStore.hasNotify(liverEvent.value.id);
  });

  // 開始時間前か
  const beforeStartTime = computed(() => {
    return dateStore.currentTime < startTime.value;
  });

  const isUpcoming = computed(() => {
    return !isLive.value && !isFinished.value;
  });
  const isLive = computed(() => {
    return liverEvent.value.isLive;
  });
  const isHovered = computed(() => {
    if (!focusStore.hoveredTalent) return false;

    // 自身がホバー中のタレントか
    if (focusStore.hoveredTalent === liverEvent.value.talent.name) return true;

    // ホバー中のタレントがコラボタレントに含まれているか
    const collaboTalentSet = toRaw(liverEvent.value.collaboTalentSet);
    if (collaboTalentSet.has(focusStore.hoveredTalent)) return true;

    // ホバー中のコラボタレントにタレントが含まれているか
    return focusStore.hoveredCollaboTalentSet.has(liverEvent.value.talent.name);
  });

  return {
    isUpcoming,
    isLive,
    isFinished,
    isHovered,
    elapsedTime,
    liveDuration,
    liveDurationLabel,
    isNew,
    hasBookmark,
    hasNotify,
    beforeStartTime,
  };
};
