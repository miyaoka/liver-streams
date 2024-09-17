<script setup lang="ts">
import ChannelFilter from "./filter/ChannelFilter.vue";
import SearchFilter from "./SearchFilter.vue";
</script>

<template>
  <div class="fixed top-4 right-4 flex flex-row gap-2 z-30">
    <SearchFilter />
    <ChannelFilter />
  </div>
</template>
