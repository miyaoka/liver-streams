<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { HoloSchedule, HoloVideoDetail } from "@/api/hololive/schedule";

interface VideoWithDuration extends HoloVideoDetail {
  startTime: Date;
  endTime: Date;
  offset: number;
  isShorts: boolean;
}

const props = defineProps<{
  data: HoloSchedule;
}>();

const channels = ref<VideoWithDuration[][]>([]);

const minute = 60 * 1000;
// 仮の動画の長さ
const defaultDuration = 90 * minute;
const shortsDuration = 30 * minute;
const hourWidth = 150;
const channelHeight = 250;

const currentDate = ref(new Date());

// YYYY/mm/ddの形式で現在日付を取得
const ymd = computed(() => {
  return currentDate.value.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
});

onMounted(async () => {
  setInterval(() => {
    currentDate.value = new Date();
  }, 5000);
});

const dateList = computed(() => {
  return props.data.dateGroupList.map((dateGroup) => {
    const { displayDate, datetime } = dateGroup;
    return {
      displayDate,
      datetime,
    };
  });
});

const originTime = computed(() => new Date(props.data.dateGroupList[0].datetime).getTime());

const videoList = computed<VideoWithDuration[]>(() => {
  const wholeVideoList = props.data.dateGroupList.flatMap((dataGroup) => dataGroup.videoList);
  return wholeVideoList.map((video) => {
    const startTime = new Date(video.datetime);
    const isShorts = false; ///shorts/i.test(video.title)
    const duration = isShorts ? shortsDuration : defaultDuration;
    const endTime = new Date(startTime.getTime() + duration);
    return {
      ...video,
      startTime,
      endTime,
      offset: (startTime.getTime() - originTime.value) / 1000 / 3600,
      isShorts,
    };
  });
});

// videoが重ならないようにチャンネルに詰めていく
function makeChannels() {
  videoList.value.forEach((video) => {
    let channel = channels.value.find((channel) => {
      const lastVideo = channel[channel.length - 1];
      return lastVideo.endTime < video.startTime;
    });
    if (!channel) {
      channel = [];
      channels.value.push(channel);
    }
    channel.push(video);
  });
}
onMounted(() => {
  makeChannels();
});
</script>
<template>
  <div class="flex flex-col mt-4" :style="{ minWidth: `${hourWidth * 24 * dateList.length}px` }">
    <div class="flex flex-col relative text-xs">
      <div class="flex flex-row absolute inset-0">
        <div v-for="date in dateList" :key="date.datetime" class="flex-1 flex flex-row relative">
          <div
            :class="`absolute w-full bottom-full h-[48px] ${date.datetime.startsWith(ymd) ? 'bg-sky-300' : ''}`"
          >
            <div class="text-lg">
              {{ date.datetime }}
            </div>
          </div>
          <div v-for="hour in 24" :key="hour" class="flex-1 bg-slate-50 even:bg-white relative">
            <div class="absolute bottom-full ml-1 text-base">
              {{ hour - 1 }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-for="(channel, i) in channels"
        :key="i"
        class="relative"
        :style="{
          height: `${channelHeight}px`,
        }"
      >
        <div
          v-for="video in channel"
          :key="video.url"
          :class="`absolute bg-white shadow-lg w-[240px] rounded-[20px] hover:scale-125 hover:z-10 transition-all overflow-hidden ${video.isLive ? 'outline outline-red-500 outline-8 bg-yellow-300' : ''}`"
          :style="{ left: `${video.offset * hourWidth}px` }"
        >
          <a :href="video.url" target="_blank">
            <img :src="video.thumbnail" class="w-full h-[135px] object-cover" loading="lazy" />
            <div class="absolute bg-slate-700 top-0 text-white p-1 text-sm">
              {{ video.displayDate }}
            </div>
            <div class="flex flex-col p-2">
              <div class="flex flex-row items-center gap-2">
                <img
                  :src="video.talent.iconImageUrl"
                  class="rounded-full w-[36px] h-[36px]"
                  loading="lazy"
                />
                <h3 class="text-base">{{ video.name }}</h3>
              </div>
              <div>
                <h3>{{ video.title }}</h3>
                <div class="flex flex-row flex-wrap items-end">
                  <img
                    v-for="talent in video.collaboTalents"
                    :key="talent.iconImageUrl"
                    :src="talent.iconImageUrl"
                    class="rounded-full w-[24px] h-[24px]"
                    :title="talent.name"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
