<script setup lang="ts">
import { useFocusStore } from "@/store/focusStore";
import { getChannelIcon } from "@/utils/icons";

const focusStore = useFocusStore();
</script>

<template>
  <button
    v-if="focusStore.focusedTalent != null"
    class="fixed inset-0 bottom-6 top-auto z-20 m-auto flex size-fit flex-row items-center justify-center gap-4 rounded-full border-2 bg-white px-3 py-1 font-bold text-black shadow-md hover:bg-gray-200"
    @click="focusStore.setFocusedTalent(null)"
  >
    focused:
    <img
      :src="getChannelIcon(focusStore.focusedTalent)"
      loading="lazy"
      class="w-[32px] rounded-full bg-white"
    />
    {{ focusStore.focusedTalent }}

    <div class="i-mdi-cross-circle size-[32px]" />
  </button>
</template>

<style scoped>
button {
  transition: translate 0.3s;
  @starting-style {
    opacity: 0;
    translate: 0 100px;
  }
}
</style>
