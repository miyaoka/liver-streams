<script setup lang="ts">
import { useFocusStore } from "@/store/focusStore";

const focusStore = useFocusStore();
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border shadow-md"
    :class="`${focusStore.isMultiSelectMode ? 'bg-green-600 text-white' : 'bg-white text-black'}`"
    title="multiple select"
    @click="focusStore.toggleMultiSelectMode"
  >
    <i
      class="size-8"
      :class="`${focusStore.isMultiSelectMode ? 'i-mdi-checkbox-multiple-marked-outline' : ' i-mdi-checkbox-multiple-outline'}`"
    />
  </button>
</template>
