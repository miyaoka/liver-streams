<script setup lang="ts">
import AddedEventButton from "./AddedEventButton.vue";
import BookmarkedEventButton from "./BookmarkedEventButton.vue";
import FocusedTalent from "./FocusedTalent.vue";
import KeywordListButton from "./keyword/KeywordListButton.vue";
import LiveFilterButton from "./LiveFilterButton.vue";
import ScrollButton from "./ScrollButton.vue";
</script>

<template>
  <footer class="z-10">
    <FocusedTalent />
    <div class="fixed bottom-4 right-4 z-10 flex flex-row items-end gap-2">
      <KeywordListButton />
      <BookmarkedEventButton />
      <AddedEventButton />
      <LiveFilterButton />
      <ScrollButton />
    </div>
  </footer>
</template>
