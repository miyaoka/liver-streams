<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSchedule, type Schedule } from "@/api/hololive/schedule";
import HorizontalSchedule from "@/components/horizontal/HorizontalSchedule.vue";

const data = ref<Schedule | null>(null);
onMounted(async () => {
  data.value = await getSchedule();
});
</script>

<template>
  <main>
    <div v-if="data" class="flex flex-row p-8">
      <HorizontalSchedule :data="data" />
    </div>
  </main>
</template>
