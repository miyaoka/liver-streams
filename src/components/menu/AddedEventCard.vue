<script setup lang="ts">
import { computed } from "vue";
import type { LiverEvent } from "@/services/api";
import { useDateStore } from "@/store/dateStore";
import { toRelativeTime } from "@/utils/dateFormat";

const props = defineProps<{
  liverEvent: LiverEvent;
  addedTime: number;
  lastOpenTime: number;
}>();

const dateStore = useDateStore();

const pastTime = computed(() => {
  const past = props.addedTime - dateStore.currentTime;
  return toRelativeTime(past);
});

const isUnread = computed(() => props.addedTime > props.lastOpenTime);
</script>

<template>
  <div :key="liverEvent.url" class="relative flex flex-row items-center gap-2">
    <img :src="liverEvent.talent.image" loading="lazy" class="h-8 w-8 rounded-full" />
    <p class="line-clamp-2 flex-1 text-sm">{{ liverEvent.title }}</p>
    <p class="w-10 text-right text-xs">{{ pastTime }}</p>
    <i class="i-mdi-circle absolute right-0 top-0 h-2 w-2 text-red-700" v-if="isUnread" />
  </div>
</template>
