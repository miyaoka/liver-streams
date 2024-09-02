<script setup lang="ts">
import VerticalSchedule from '@/components/vertical/VerticalSchedule.vue'
import { getSchedule, type Schedule } from '@/api/hololive/schedule'
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
  <main class="text-[clamp(8px,3vw,16px)]">
    <VerticalSchedule v-if="data" :data="data" />
  </main>
</template>

<style>
/* スクロールバーが消えてもガタつかないようにする */
html {
  /* scrollbar-gutter: stable; */
}
/* dialogやpopoverが開かれていたらスクロールを禁止する */
html:has(dialog:modal),
html:has([popover]:popover-open) {
  /* overflow: hidden; */
}
</style>
