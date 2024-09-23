<script setup lang="ts">
import { ref } from "vue";
import type { LiverEvent } from "@/services/api";
import { getThumnail } from "@/lib/youtube";
import { useFocusStore } from "@/store/focusStore";
import { fullDateFormatter } from "@/utils/dateFormat";

defineProps<{
  liverEvent: LiverEvent;
}>();

const focusStore = useFocusStore();
const dialogEl = ref<HTMLDialogElement | null>(null);

function open() {
  dialogEl.value?.showModal();
}
// ダイアログ外をクリックしたら閉じる
function onClickDialog(evt: MouseEvent) {
  if (!dialogEl.value) return;
  // ターゲットがダイアログならダイアログ外判定
  if (evt.target !== dialogEl.value) return;
  evt.preventDefault();
  dialogEl.value.close();
}

defineExpose({
  open,
});
</script>

<template>
  <dialog
    ref="dialogEl"
    @click="onClickDialog"
    class="fixed bottom-4 top-auto w-[480px] overflow-hidden rounded-[20px] shadow-xl"
  >
    <div class="px-4 py-2">
      <div class="font-bold">
        {{ fullDateFormatter.format(liverEvent.startAt) }}
      </div>
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
        <a :href="liverEvent.url" class="hover:underline" target="_blank">
          {{ liverEvent.title }}
        </a>
      </div>
      <div class="flex flex-row items-center gap-2">
        <img
          :src="liverEvent.talent.image"
          class="h-[70px] w-[70px] rounded-full border hover:outline hover:outline-2 hover:outline-red-500"
          loading="lazy"
          @mouseover="focusStore.setHoveredTalents(liverEvent.talent.name)"
          @mouseleave="focusStore.clearHoveredTalents()"
          @click.prevent="focusStore.setFocusedTalent(liverEvent.talent.name)"
          @contextmenu.prevent="focusStore.setFocusedTalent(liverEvent.talent.name)"
        />
        <div>
          <div class="text-base font-bold">
            {{ liverEvent.talent.name }}
          </div>
          <div class="flex flex-row flex-wrap">
            <img
              v-for="talent in liverEvent.collaboTalents"
              :key="talent.image"
              :src="talent.image"
              class="w-[40px] rounded-full hover:outline hover:outline-2 hover:outline-red-500 max-sm:w-[30px]"
              :title="talent.name"
              loading="lazy"
              @mouseenter="focusStore.setHoveredTalents(talent.name)"
              @mouseleave="focusStore.clearHoveredTalents()"
              @click.prevent="focusStore.setFocusedTalent(talent.name)"
              @contextmenu.prevent="focusStore.setFocusedTalent(talent.name)"
            />
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog {
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  }
  &[open] {
    animation: fadeIn 0.2s forwards;
  }
}

@keyframes fadeIn {
  from {
    translate: 0 50%;
  }
}
</style>
