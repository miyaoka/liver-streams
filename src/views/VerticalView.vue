<script setup lang="ts">
import VerticalSchedule from '@/components/vertical/VerticalSchedule.vue'
import { getSchedule, type Schedule } from '@/schedule'
import { onMounted, ref } from 'vue'

const data = ref<Schedule | null>(null)

async function setSchedule() {
  data.value = await getSchedule()
}
onMounted(async () => {
  setSchedule()
  // 5分毎にスケジュールを再取得
  setInterval(setSchedule, 5 * 60 * 1000)
})
</script>

<template>
  <main>
    <VerticalSchedule v-if="data" :data="data" />
  </main>
</template>
