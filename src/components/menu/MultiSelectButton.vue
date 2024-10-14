<script setup lang="ts">
import { useFocusStore } from "@/store/focusStore";

const focusStore = useFocusStore();
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border shadow-md"
    :class="{
      'bg-green-600 text-white': focusStore.isMultiSelectMode,
      'bg-white text-black': !focusStore.isMultiSelectMode,
    }"
    title="multiple select"
    @click="focusStore.toggleMultiSelectMode"
  >
    <i
      class="size-8"
      :class="{
        'i-mdi-checkbox-multiple-marked-outline': focusStore.isMultiSelectMode,
        'i-mdi-checkbox-multiple-outline': !focusStore.isMultiSelectMode,
      }"
    />
  </button>
</template>
