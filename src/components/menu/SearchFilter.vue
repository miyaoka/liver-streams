<script setup lang="ts">
import { ref } from "vue";
import { useStorageStore } from "@/store/storageStore";

const storageStore = useStorageStore();
const inputEl = ref<HTMLInputElement | null>(null);

const searchQuery = ref(storageStore.searchTerm);
let timeout: ReturnType<typeof setTimeout> | null = null;

const isInput = ref(storageStore.searchTerm !== "");

// 入力文字によるフィルタを遅延実行
function onInput() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    storageStore.setSearchTerm(searchQuery.value);
  }, 500);
}

function onSubmit() {
  inputEl.value?.blur();
}

// clickより先にblurが発火するためmousedownしたかを保存
let isMouseDown = false;
function onMousedown() {
  isMouseDown = true;
}
function onBlur() {
  // mousedownした場合はclickで処理させるためblurを無視
  if (isMouseDown) return;
  if (searchQuery.value === "") {
    isInput.value = false;
  }
}
function onClick() {
  isInput.value = !isInput.value;
  isMouseDown = false;
  if (isInput.value) {
    // open
    inputEl.value?.focus();
  } else {
    // close
    storageStore.setSearchTerm("");
    searchQuery.value = "";
  }
}
</script>

<template>
  <div
    class="group flex flex-row items-center justify-center overflow-hidden rounded-full bg-white shadow-md hover:bg-gray-100"
  >
    <form
      @submit.prevent="onSubmit"
      :class="`h-full transition-[width] ${isInput ? 'w-56' : 'w-0'}`"
    >
      <input
        class="size-full rounded-l-full p-2 pl-4"
        ref="inputEl"
        v-model="searchQuery"
        @input="onInput"
        @blur="onBlur"
      />
    </form>
    <button
      class="z-30 flex size-11 items-center justify-center rounded-full group-hover:bg-gray-100"
      @click="onClick"
      @mousedown="onMousedown"
      title="search"
    >
      <i :class="`${isInput ? 'i-mdi-close' : 'i-mdi-search'} size-8 text-gray-800`" />
    </button>
  </div>
</template>
