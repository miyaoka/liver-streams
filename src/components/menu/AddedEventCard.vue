<script setup lang="ts">
import { computed } from "vue";
import type { LiverEvent } from "@/services";
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
  <div :key="liverEvent.url" class="relative flex flex-row gap-2 items-center">
    <img :src="liverEvent.talent.image" loading="lazy" class="h-8 w-8 rounded-full" />
    <p class="text-sm flex-1 line-clamp-2">{{ liverEvent.title }}</p>
    <p class="text-xs w-10 text-right">{{ pastTime }}</p>
    <i class="absolute top-0 right-0 i-mdi-circle text-red-700 h-2 w-2" v-if="isUnread" />
  </div>
</template>
