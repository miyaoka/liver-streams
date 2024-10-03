import { computed, type Ref } from "vue";
import type { LiverEvent } from "@/services/api";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useDateStore } from "@/store/dateStore";
import { useEventListStore } from "@/store/eventListStore";

const oneHour = 60 * 60 * 1000;

// ホロライブのライブ判定開始用
const liveStartDuration = 20 * 60 * 1000;
const liveEndDuration = 60 * 60 * 1000;

export const useLiverEvent = (liverEvent: Ref<LiverEvent>) => {
  const dateStore = useDateStore();
  const eventListStore = useEventListStore();
  const bookmarkStore = useBookmarkStore();

  // 配信終了判定
  const isFinished = computed(() => {
    // 終了時刻が設定されているか（にじさんじのみ）
    if (liverEvent.value.endAt) return true;
    // 配信中か
    if (liverEvent.value.isLive) return false;

    // 配信していない場合
    const now = dateStore.currentTime;

    const elapsed = now - startTime.value;
    // 現在時刻を過ぎていなければ開始前
    if (elapsed < 0) return false;
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

  const elapsedTime = computed(() => {
    const { isLive, endAt } = liverEvent.value;

    const time = (() => {
      // 終了時間があれば終了時間から開始時間を引く
      if (endAt) {
        return endAt.getTime() - startTime.value;
      }
      // ライブ中なら現在時刻から開始時間を引く
      if (isLive) {
        return dateStore.currentTime - startTime.value;
      }
      return 0;
    })();

    if (time === 0) return null;

    const hour = time / oneHour;
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

  return {
    isFinished,
    elapsedTime,
    isNew,
    hasBookmark,
    hasNotify,
    beforeStartTime,
  };
};
