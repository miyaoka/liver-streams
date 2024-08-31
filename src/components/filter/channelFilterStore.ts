import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface TreeNode {
  id: string
  checked: boolean
  children?: TreeNode[]
}

export interface Node {
  [key: string]: string[] | Node
}

export const useChannelFilterStore = defineStore('channelFilter', () => {
  const map = useLocalStorage('talentFilter', new Map<string, boolean>())

  function setName(name: string, value: boolean) {
    if (value) {
      map.value.set(name, value)
    } else {
      map.value.delete(name)
    }
  }

  function reset() {
    map.value.clear()
  }

  return {
    map,
    setName,
    reset
  }
})
