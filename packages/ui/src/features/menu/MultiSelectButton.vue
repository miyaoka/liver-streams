<script setup lang="ts">
import { useMultiSelectStore } from "../../shared/stores/multiSelectStore";

const multiSelectStore = useMultiSelectStore();
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border shadow-md"
    :class="{
      'bg-green-600 text-white': multiSelectStore.isMultiSelectMode,
      'bg-white text-black': !multiSelectStore.isMultiSelectMode,
    }"
    title="multiple select"
    @click="multiSelectStore.toggleMultiSelectMode"
  >
    <i
      class="size-8"
      :class="{
        'i-mdi-checkbox-multiple-marked-outline': multiSelectStore.isMultiSelectMode,
        'i-mdi-checkbox-multiple-outline': !multiSelectStore.isMultiSelectMode,
      }"
    />
  </button>
</template>
