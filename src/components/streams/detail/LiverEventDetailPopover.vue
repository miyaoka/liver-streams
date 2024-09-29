<script setup lang="ts">
import { computed } from "vue";
import type { LiverEvent } from "@/services/api";
import { getThumnail } from "@/lib/youtube";
import { useFocusStore } from "@/store/focusStore";
import { useStorageStore } from "@/store/storageStore";
import { fullDateFormatter } from "@/utils/dateFormat";
import { closePopover } from "@/utils/popover";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const focusStore = useFocusStore();
const storageStore = useStorageStore();

const isBookmark = computed(() => {
  return storageStore.bookmarkEventSet.has(props.liverEvent.id);
});
const fullDate = computed(() => {
  return fullDateFormatter.format(props.liverEvent.startAt);
});
</script>

<template>
  <div
    class="w-[480px] max-w-full overflow-hidden rounded-lg border border-gray-500 bg-white pb-2 shadow-xl"
  >
    <div class="flex items-center bg-gray-800 px-4 py-2 text-gray-200">
      <div class="font-bold">
        {{ fullDate }}
      </div>
      <button
        class="absolute right-0 grid size-11 place-items-center text-gray-400 hover:text-gray-200"
        @click="closePopover"
      >
        <i class="i-mdi-close size-5" />
      </button>
    </div>

    <a :href="liverEvent.url" target="_blank">
      <img
        :src="getThumnail(liverEvent.thumbnail, 'sd')"
        class="_thumb [@starting-style:opacity-0] aspect-video w-[480px] bg-gray-800 object-cover p-0 transition-colors"
        loading="lazy"
      />
    </a>

    <div class="relative flex flex-col gap-2 px-6 py-4 max-sm:p-3">
      <div class="relative">
        <p class="text-lg font-bold">
          {{ liverEvent.title }}
        </p>
      </div>

      <div class="flex flex-row items-center gap-2">
        <button
          class="size-[70px] overflow-hidden rounded-full border hover:outline hover:outline-2 hover:outline-red-500"
          @mouseover="focusStore.setHoveredTalents(liverEvent.talent.name)"
          @mouseleave="focusStore.clearHoveredTalents()"
          @click.prevent="focusStore.setFocusedTalent(liverEvent.talent.name)"
          @contextmenu.prevent="focusStore.setFocusedTalent(liverEvent.talent.name)"
        >
          <img :src="liverEvent.talent.image" class="size-full" loading="lazy" />
        </button>
        <div class="flex-1">
          <div class="text-base font-bold">
            {{ liverEvent.talent.name }}
          </div>
          <div class="flex flex-row flex-wrap">
            <button
              class="w-[40px] overflow-hidden rounded-full hover:outline hover:outline-2 hover:outline-red-500 max-sm:w-[30px]"
              v-for="talent in liverEvent.collaboTalents"
              :key="talent.image"
              :title="talent.name"
              @mouseenter="focusStore.setHoveredTalents(talent.name)"
              @mouseleave="focusStore.clearHoveredTalents()"
              @click.prevent="focusStore.setFocusedTalent(talent.name)"
              @contextmenu.prevent="focusStore.setFocusedTalent(talent.name)"
            >
              <img class="size-full" :src="talent.image" loading="lazy" />
            </button>
          </div>
        </div>
        <button
          class="group/fav grid size-11 place-items-center"
          @click="storageStore.toggleBookmarkEvent(liverEvent.id)"
        >
          <div
            :class="`size-10 place-items-center bg-white rounded-full grid  border-2 ${isBookmark ? 'border-green-800' : 'border-gray-400'} group-hover/fav:bg-gray-100`"
          >
            <i
              :class="`size-7 ${isBookmark ? 'i-mdi-bookmark text-green-600' : 'i-mdi-bookmark-outline  text-gray-400'}`"
            />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
._thumb {
  transition: opacity 1s;
  @starting-style {
    opacity: 0;
  }
}
</style>
