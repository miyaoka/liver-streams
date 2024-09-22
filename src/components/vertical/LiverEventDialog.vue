<script setup lang="ts">
import { ref } from "vue";
import type { LiverEvent } from "@/services/api";
import { getThumnail } from "@/lib/youtube";
import { useTalentStore } from "@/store/talentStore";
import { fullDateFormatter } from "@/utils/dateFormat";

defineProps<{
  liverEvent: LiverEvent;
}>();

const talentStore = useTalentStore();
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
    class="fixed w-[480px] rounded-[20px] overflow-hidden shadow-xl top-auto bottom-4"
  >
    <div class="px-4 py-2">
      <div class="font-bold">
        {{ fullDateFormatter.format(liverEvent.startAt) }}
      </div>
    </div>

    <a :href="liverEvent.url" target="_blank">
      <img
        :src="getThumnail(liverEvent.thumbnail, 'sd')"
        class="w-[480px] aspect-video object-cover"
        loading="lazy"
      />
    </a>

    <div class="px-6 py-4 flex flex-col gap-2 max-sm:p-3">
      <div class="font-bold text-lg">
        <a :href="liverEvent.url" class="hover:underline" target="_blank">
          {{ liverEvent.title }}
        </a>
      </div>
      <div class="flex flex-row gap-2 items-center">
        <img
          :src="liverEvent.talent.image"
          class="rounded-full w-[70px] h-[70px] border hover:outline hover:outline-red-500 hover:outline-2"
          loading="lazy"
          @mouseover="talentStore.setHoveredTalents(liverEvent.talent.name)"
          @mouseleave="talentStore.clearHoveredTalents()"
          @click.prevent="talentStore.setFocusedTalent(liverEvent.talent.name)"
          @contextmenu.prevent="talentStore.setFocusedTalent(liverEvent.talent.name)"
        />
        <div>
          <div class="font-bold text-base">
            {{ liverEvent.talent.name }}
          </div>
          <div class="flex flex-row flex-wrap">
            <img
              v-for="talent in liverEvent.collaboTalents"
              :key="talent.image"
              :src="talent.image"
              class="rounded-full w-[40px] hover:outline hover:outline-red-500 hover:outline-2 max-sm:w-[30px]"
              :title="talent.name"
              loading="lazy"
              @mouseenter="talentStore.setHoveredTalents(talent.name)"
              @mouseleave="talentStore.clearHoveredTalents()"
              @click.prevent="talentStore.setFocusedTalent(talent.name)"
              @contextmenu.prevent="talentStore.setFocusedTalent(talent.name)"
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
