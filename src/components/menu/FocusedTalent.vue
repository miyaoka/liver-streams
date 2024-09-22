<script setup lang="ts">
import { useFocusStore } from "@/store/focusStore";
import { getChannelIcon } from "@/utils/icons";

const talentStore = useFocusStore();
</script>

<template>
  <button
    v-if="talentStore.focusedTalent != null"
    class="fixed inset-0 bottom-6 m-auto top-auto w-fit h-fit z-20 flex flex-row justify-center items-center gap-4 px-3 py-1 rounded-full shadow-md bg-blue-800 text-white outline outline-white"
    @click="talentStore.setFocusedTalent(null)"
  >
    focused:
    <img
      :src="getChannelIcon(talentStore.focusedTalent)"
      loading="lazy"
      class="rounded-full w-[32px] bg-white"
    />
    {{ talentStore.focusedTalent }}

    <div class="i-mdi-cross-circle w-[32px] h-[32px]" />
  </button>
</template>

<style scoped>
button {
  transition: all 0.3s;
  @starting-style {
    opacity: 0;
    translate: 0 100px;
  }
}
</style>
