<script setup lang="ts">
import type { LiverEvent } from "@/services/api";
import { getThumnail } from "@/lib/youtube";
import { useFocusStore } from "@/store/focusStore";
import { fullDateFormatter } from "@/utils/dateFormat";
import { closePopover } from "@/utils/popover";

defineProps<{
  liverEvent: LiverEvent;
}>();

const focusStore = useFocusStore();
</script>

<template>
  <div class="w-[480px] max-w-full overflow-hidden rounded-md bg-white shadow-xl">
    <div class="flex items-center px-4 py-2">
      <div class="font-bold">
        {{ fullDateFormatter.format(liverEvent.startAt) }}
      </div>
      <button
        class="absolute right-0 flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-800"
        @click="closePopover"
      >
        <i class="i-mdi-close h-5 w-5" />
      </button>
    </div>

    <a :href="liverEvent.url" target="_blank">
      <img
        :src="getThumnail(liverEvent.thumbnail, 'sd')"
        class="aspect-video w-[480px] object-cover"
        loading="lazy"
      />
    </a>

    <div class="flex flex-col gap-2 px-6 py-4 max-sm:p-3">
      <div class="text-lg font-bold">
        {{ liverEvent.title }}
      </div>
      <div class="flex flex-row items-center gap-2">
        <button
          class="h-[70px] w-[70px] overflow-hidden rounded-full border hover:outline hover:outline-2 hover:outline-red-500"
          @mouseover="focusStore.setHoveredTalents(liverEvent.talent.name)"
          @mouseleave="focusStore.clearHoveredTalents()"
          @click.prevent="focusStore.setFocusedTalent(liverEvent.talent.name)"
          @contextmenu.prevent="focusStore.setFocusedTalent(liverEvent.talent.name)"
        >
          <img :src="liverEvent.talent.image" class="h-full w-full" loading="lazy" />
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
              <img class="h-full w-full" :src="talent.image" loading="lazy" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
