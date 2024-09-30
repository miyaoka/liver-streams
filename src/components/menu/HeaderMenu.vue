<script setup lang="ts">
import ChannelFilter from "./filter/ChannelFilter.vue";
import KeywordListButton from "./keyword/KeywordListButton.vue";
import SearchFilter from "./SearchFilter.vue";
</script>

<template>
  <header class="fixed right-4 top-4 z-30 flex flex-row gap-2">
    <SearchFilter />
    <KeywordListButton />
    <ChannelFilter />
  </header>
</template>
