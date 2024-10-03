<script setup lang="ts">
import { computed } from "vue";
import type { LiverEvent } from "@/services/api";
import { scrollToLiverEventTop } from "@/lib/scroll";
import { useDateStore } from "@/store/dateStore";
import { useFocusStore } from "@/store/focusStore";
import { compareDate, getDateTime } from "@/utils/date";
import { hhmmDateFormatter, toRelativeTime } from "@/utils/dateFormat";

const props = defineProps<{
  liverEvent: LiverEvent;
  addedTime: number;
  lastCloseTime: number;
}>();

const dateStore = useDateStore();
const focusStore = useFocusStore();

const eventTime = computed(() => {
  const startAt = props.liverEvent.startAt;
  const startDateTime = getDateTime(startAt);

  const dateDiff = compareDate({
    baseDateTime: dateStore.currentDateTime,
    targetDateTime: startDateTime,
  });

  // 今日なら時刻を返す
  if (dateDiff === 0) {
    return hhmmDateFormatter.format(startAt);
  }

  // 別の日なら相対時刻を返す
  return toRelativeTime(startDateTime - dateStore.currentDateTime);
});

const isUnread = computed(() => props.addedTime > props.lastCloseTime);

function onClickEvent() {
  scrollToLiverEventTop(props.liverEvent.id);
}
</script>

<template>
  <button
    :key="liverEvent.id"
    class="relative flex flex-row items-center gap-2 p-2 text-start hover:bg-slate-200"
    :popovertarget="liverEvent.id"
    @click="onClickEvent"
    @mouseover="focusStore.hoverEvent(liverEvent)"
    @mouseleave="focusStore.unhoverEvent"
  >
    <img
      :src="liverEvent.talent.image"
      loading="lazy"
      class="size-8 rounded-full"
      :title="liverEvent.talent.name"
    />
    <p class="line-clamp-2 flex-1 text-sm [overflow-wrap:anywhere]">
      {{ liverEvent.title }}
    </p>
    <p class="w-12 text-right text-sm">{{ eventTime }}</p>
    <i class="i-mdi-circle absolute right-0 top-2 size-2 text-red-700" v-if="isUnread" />
  </button>
</template>
