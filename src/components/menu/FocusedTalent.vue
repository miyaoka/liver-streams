<script setup lang="ts">
import { useFocusStore } from "@/store/focusStore";
import { getChannelIcon } from "@/utils/icons";

const focusStore = useFocusStore();
</script>

<template>
  <button
    v-if="focusStore.focusedTalent != null"
    class="fixed inset-0 bottom-6 top-auto z-20 m-auto flex h-fit w-fit flex-row items-center justify-center gap-4 rounded-full bg-blue-800 px-3 py-1 text-white shadow-md outline outline-white"
    @click="focusStore.setFocusedTalent(null)"
  >
    focused:
    <img
      :src="getChannelIcon(focusStore.focusedTalent)"
      loading="lazy"
      class="w-[32px] rounded-full bg-white"
    />
    {{ focusStore.focusedTalent }}

    <div class="i-mdi-cross-circle h-[32px] w-[32px]" />
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
