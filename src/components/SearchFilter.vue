<script setup lang="ts">
import { computed, ref } from "vue";
import { useChannelFilterStore } from "./filter/channelFilterStore";

const filterStore = useChannelFilterStore();
const inputEl = ref<HTMLInputElement | null>(null);

const searchQuery = ref(filterStore.searchTerm);
let timeout: ReturnType<typeof setTimeout> | null = null;

const isFocused = ref(false);
const isInput = computed(() => {
  return searchQuery.value !== "" || isFocused.value;
});

// debounce
function onInput() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    filterStore.searchTerm = searchQuery.value;
  }, 500);
}
function onClick() {
  if (filterStore.searchTerm !== "") {
    filterStore.searchTerm = "";
    searchQuery.value = "";
    isFocused.value = false;
    return;
  }
  inputEl.value?.focus();
  isFocused.value = true;
}
</script>

<template>
  <div class="bg-white flex flex-row">
    <div :class="`transition-all ${isInput ? 'w-56' : 'w-0'}`">
      <input
        class="w-full h-full p-2"
        ref="inputEl"
        @blur="isFocused = false"
        v-model="searchQuery"
        @input="onInput"
      />
    </div>
    <button class="flex p-1 m-0 z-30 rounded" @click="onClick">
      <i :class="`${isInput ? 'i-mdi-close' : 'i-mdi-search'} h-[32px] w-[32px] text-gray-800`" />
    </button>
  </div>
</template>
