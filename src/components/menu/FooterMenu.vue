<script setup lang="ts">
import FocusedTalent from "./FocusedTalent.vue";
import LiveFilterButton from "./LiveFilterButton.vue";
import ScrollButton from "./ScrollButton.vue";
</script>

<template>
  <div class="z-10">
    <FocusedTalent />
    <div class="fixed bottom-4 right-4 flex flex-row gap-2 items-end">
      <LiveFilterButton />
      <ScrollButton />
    </div>
  </div>
</template>
