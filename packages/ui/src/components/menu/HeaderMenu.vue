<script setup lang="ts">
import ChannelFilter from "./channelFilter/ChannelFilter.vue";
import SearchFilter from "./SearchFilter.vue";
</script>

<template>
  <header class="fixed top-4 right-4 z-30 flex flex-row gap-2">
    <SearchFilter />
    <ChannelFilter />
  </header>
</template>
