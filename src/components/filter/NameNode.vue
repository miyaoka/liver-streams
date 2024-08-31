<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useChannelFilterStore } from '../filter/channelFilterStore'
import icons from '@/assets/icons.json'
import { useTalentStore } from '@/store/talentStore'

const channelFilterStore = useChannelFilterStore()
const talentStore = useTalentStore()

const props = defineProps<{
  nameList: string[]
  checked: boolean
}>()
const emit = defineEmits<{
  'update:checked': [checked: boolean]
}>()

const checkList = ref<boolean[]>(props.nameList.map(() => false))

function update() {
  const isAllChecked = checkList.value.every((checked) => checked)
  emit('update:checked', isAllChecked)
}

function onChange(name: string, checked: boolean) {
  channelFilterStore.setName(name, checked)
  update()
}

onMounted(() => {
  checkList.value = props.nameList.map((name) => channelFilterStore.map.get(name) ?? false)
  update()
})
watch(
  () => props.checked,
  (val) => {
    checkList.value = props.nameList.map(() => val)
    props.nameList.forEach((name) => {
      channelFilterStore.setName(name, val)
    })
  }
)

watch(channelFilterStore.map, () => {
  checkList.value = props.nameList.map((name) => channelFilterStore.map.get(name) ?? false)
  update()
})

function hoverTalent(name: string | null) {
  talentStore.hoveredTalent = name
}
</script>
<template>
  <div class="flex fles-row flex-wrap ml-20 gap-x-2 -mt-10">
    <label
      class="flex flex-col items-center min-w-[30px] cursor-pointer w-[80px]"
      v-for="(name, i) in nameList"
      :key="name"
      :title="name"
      @mouseenter="hoverTalent(name)"
      @mouseleave="hoverTalent(null)"
    >
      <input
        type="checkbox"
        v-model="checkList[i]"
        @change="($event) => onChange(name, ($event.target as HTMLInputElement).checked)"
        class="hidden"
      />
      <img
        :src="(icons as Record<string, string>)[name]"
        :class="`w-[44px] h-[44px] rounded-full transition ${checkList[i] ? 'outline outline-red-400 outline-offset-4' : ''} ${talentStore.hoveredTalent === name ? 'scale-125' : ''}`"
      />
      <div
        :class="`text-sm ${checkList[i] ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-900'}  -mt-2 px-2  rounded-xl`"
      >
        <p class="line-clamp-1">
          {{ name }}
        </p>
      </div>
    </label>
  </div>
</template>
