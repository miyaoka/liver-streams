<script setup lang="ts">
import AddedEventButton from "./addedEvent/AddedEventButton.vue";
import BookmarkedEventButton from "./bookmarkedEvent/BookmarkedEventButton.vue";
import FilteringButton from "./FilteringButton.vue";
import KeywordListButton from "./keywordList/KeywordListButton.vue";
import LiveFilterButton from "./LiveFilterButton.vue";
import ScrollButton from "./ScrollButton.vue";
</script>

<template>
  <footer class="relative z-30">
    <FilteringButton />
    <div class="fixed bottom-4 right-4 flex flex-row items-end gap-2">
      <KeywordListButton />
      <BookmarkedEventButton />
      <AddedEventButton />
      <LiveFilterButton />
      <ScrollButton />
    </div>
  </footer>
</template>
