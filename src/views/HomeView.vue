<script setup lang="ts">
import DateSchedule from '@/components/DateSchedule.vue'
import { getSchedule, type Schedule } from '@/schedule'
import { onMounted, ref } from 'vue'

const data = ref<Schedule | null>(null)
onMounted(async () => {
  data.value = await getSchedule()
})
</script>

<template>
  <main>
    <div v-if="data" class="flex flex-row p-8">
      <DateSchedule :data="data" />
    </div>
  </main>
</template>
