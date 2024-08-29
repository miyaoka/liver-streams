<script setup lang="ts">
import VerticalSchedule from '@/components/vertical/VerticalSchedule.vue'
import { getSchedule, type Schedule } from '@/schedule'
import { onMounted, ref } from 'vue'

const data = ref<Schedule | null>(null)
onMounted(async () => {
  data.value = await getSchedule()
})
</script>

<template>
  <main>
    <div v-if="data" class="flex flex-row">
      <VerticalSchedule :data="data" />
    </div>
  </main>
</template>
