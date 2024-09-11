<script setup lang="ts">
import { ref } from "vue";
import { useStorageStore } from "../store/storageStore";

const filterStore = useStorageStore();
const inputEl = ref<HTMLInputElement | null>(null);

const searchQuery = ref(filterStore.searchTerm);
let timeout: ReturnType<typeof setTimeout> | null = null;

const isInput = ref(filterStore.searchTerm !== "");

// 入力文字によるフィルタを遅延実行
function onInput() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    filterStore.setSearchTerm(searchQuery.value);
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
    filterStore.setSearchTerm("");
    searchQuery.value = "";
  }
}
</script>

<template>
  <div class="flex flex-row items-center bg-white rounded">
    <form
      @submit.prevent="onSubmit"
      :class="`h-full transition-[width] ${isInput ? 'w-56' : 'w-0'}`"
    >
      <input
        class="w-full h-full p-2 rounded"
        ref="inputEl"
        v-model="searchQuery"
        @input="onInput"
        @blur="onBlur"
      />
    </form>
    <button class="flex p-1 m-0 z-30 rounded" @click="onClick" @mousedown="onMousedown">
      <i :class="`${isInput ? 'i-mdi-close' : 'i-mdi-search'} h-[32px] w-[32px] text-gray-800`" />
    </button>
  </div>
</template>
