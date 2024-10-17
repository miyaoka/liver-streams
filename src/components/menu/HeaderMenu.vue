<script setup lang="ts">
import SearchFilter from "./SearchFilter.vue";
import ChannelFilter from "./channelFilter/ChannelFilter.vue";
</script>

<template>
  <header class="fixed right-4 top-4 z-30 flex flex-row gap-2">
    <SearchFilter />
    <ChannelFilter />
  </header>
</template>
