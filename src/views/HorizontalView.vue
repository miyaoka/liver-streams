<script setup lang="ts">
import HorizontalSchedule from "@/components/horizontal/HorizontalSchedule.vue";
import { getSchedule, type Schedule } from "@/api/hololive/schedule";
import { onMounted, ref } from "vue";

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
