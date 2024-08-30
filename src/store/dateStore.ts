import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDateStore = defineStore('dateStore', () => {
  const date = ref(new Date())

  setInterval(() => {
    date.value = new Date()
  }, 5000)

  return {
    date
  }
})
