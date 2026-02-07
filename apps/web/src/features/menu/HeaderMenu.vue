<doc lang="md">
画面右上に固定表示されるヘッダーメニュー。検索フィルターとチャンネルフィルターを配置する。
</doc>

<script setup lang="ts">
import ChannelFilter from "../channelFilter/ChannelFilter.vue";
import SearchFilter from "../search/SearchFilter.vue";
</script>

<template>
  <header class="fixed top-4 right-4 z-30 flex flex-row gap-2">
    <SearchFilter />
    <ChannelFilter />
  </header>
</template>
