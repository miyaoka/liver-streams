<script setup lang="ts">
import type { Schedule, VideoDetail } from '@/api/hololive/schedule'
import { onMounted, ref, watch } from 'vue'
import VerticalScheduleColumn from './VerticalScheduleColumn.vue'
import ChannelFilter from '@/components/filter/ChannelFilter.vue'
import { useChannelFilterStore } from '../filter/channelFilterStore'
import { useTalentStore } from '@/store/talentStore'
import { getChannelIcon } from '@/utils/icons'

const props = defineProps<{
  data: Schedule
}>()

const channelFilterStore = useChannelFilterStore()
const talentStore = useTalentStore()

onMounted(() => {
  const now = Date.now()
  const sections = [...document.querySelectorAll('section[data-time]')]
  const sectionIndex = sections.findIndex((el) => {
    const time = Number(el.getAttribute('data-time'))
    // 現在時刻を超える最初のセクションを探す
    if (time > now) return true
  })
  // 現在時刻の直前のセクション
  const prevSection = sections[sectionIndex - 1]

  if (prevSection) {
    // セクションにスクロール
    prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})

export interface VideoDetailWithTime extends VideoDetail {
  startTime: number
}

const sectionMap = ref<Record<number, VideoDetailWithTime[]>>({})

function getFilteredData(
  filterMap: Map<string, boolean>,
  filterEnabled: boolean,
  wholeList: VideoDetail[],
  focusedTalent: string | null
): VideoDetail[] {
  // 単一セレクト時
  if (focusedTalent) {
    return wholeList.filter((video) => {
      return (
        video.talent.name === focusedTalent ||
        video.collaboTalents.some((collaborator) => {
          return collaborator.name === focusedTalent
        })
      )
    })
  }
  // フィルタなし
  if (!filterEnabled || filterMap.size === 0) return wholeList

  // タレント名かコラボタレント名がフィルターに含まれる動画のみ表示
  return wholeList.filter((video) => {
    return (
      filterMap.has(video.talent.name) ||
      video.collaboTalents.some((collaborator) => {
        return filterMap.has(collaborator.name)
      })
    )
  })
}

watch(
  [
    () => props.data,
    () => channelFilterStore.map,
    () => channelFilterStore.enabled,
    () => talentStore.focusedTalent
  ],
  ([data, map, enabled, focusedTalent]) => {
    const wholeList = data.dateGroupList.flatMap((dataGroup) => dataGroup.videoList)

    sectionMap.value = createSectionMap(getFilteredData(map, enabled, wholeList, focusedTalent))
  },
  { immediate: true, deep: true }
)

function createSectionMap(wholeList: VideoDetail[]): Record<number, VideoDetailWithTime[]> {
  // 全日付の動画をflat化し、time情報を付加
  const listWithTime = wholeList.map((video) => {
    const startTime = new Date(video.datetime).getTime()
    return {
      ...video,
      startTime
    }
  })

  const sectionVideoList: Record<number, VideoDetailWithTime[]> = {}

  // 6hrごとに区切る
  const sectionSpan = 6 * 60 * 60 * 1000
  const timezoneOffset = 9 * 60 * 60 * 1000

  listWithTime.forEach((video) => {
    const time = video.startTime
    // 区切った時間に丸める
    const sectionTime =
      Math.floor((time - timezoneOffset) / sectionSpan) * sectionSpan + timezoneOffset

    if (!sectionVideoList[sectionTime]) {
      sectionVideoList[sectionTime] = []
    }
    sectionVideoList[sectionTime].push(video)
  })

  return sectionVideoList
}
</script>
<template>
  <ChannelFilter />
  <VerticalScheduleColumn v-if="Object.keys(sectionMap).length > 0" :sectionMap="sectionMap" />
  <div v-else>no data</div>
  <button
    v-if="talentStore.focusedTalent != null"
    class="selected fixed inset-0 bottom-4 m-auto top-auto w-fit h-fit z-20 flex flex-row justify-center items-center gap-4 px-4 py-1 rounded-full shadow-md bg-blue-800 text-white outline outline-white"
    @click="talentStore.setFocusedTalent(null)"
  >
    focused:
    <img
      :src="getChannelIcon(talentStore.focusedTalent)"
      loading="lazy"
      class="rounded-full w-[44px]"
    />
    {{ talentStore.focusedTalent }}

    <div class="i-mdi-cross-circle w-[32px] h-[32px]" />
  </button>
</template>

<style scoped>
.selected {
  transition: all 0.3s;
  @starting-style {
    opacity: 0;
    translate: 0 100px;
  }
}
</style>
