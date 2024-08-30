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
    <VerticalSchedule v-if="data" :data="data" />
  </main>
</template>
