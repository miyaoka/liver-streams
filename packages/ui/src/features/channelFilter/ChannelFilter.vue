<script setup lang="ts">
import { hololiveChannels } from "@liver-streams/services-hololive";
import { nijisanjiChannels } from "@liver-streams/services-nijisanji";
import { computed, ref } from "vue";
import { usePopover } from "../../shared/composables/usePopover";
import { getChannelIcon } from "../../shared/services";
import ChannelNode from "./ChannelNode.vue";
import { useTalentFilterStore } from "./talentFilterStore";

const talentFilterStore = useTalentFilterStore();
const popover = usePopover({
  popoverId: "filter",
});

const groups = [
  { key: "hololive", icon: "hololive_logo" },
  { key: "にじさんじ", icon: "nijisanji_logo" },
] as const;

const selectedGroup = ref<string>("hololive");
const talentNodeEl = ref<HTMLElement | null>(null);

const filterCount = computed(() => talentFilterStore.talentFilterMap.size);

const channels = [hololiveChannels, nijisanjiChannels];

const rootNode = computed(() => {
  return channels.find((channel) => channel.name === selectedGroup.value);
});

function reset() {
  talentFilterStore.resetTalentFilter();
  talentNodeEl.value?.querySelectorAll("input").forEach((input) => {
    input.checked = false;
  });
}
</script>

<template>
  <button
    class="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-100"
    popovertarget="filter"
  >
    <i class="i-mdi-person-outline size-[32px] text-gray-800" />
  </button>

  <popover.PopOver class="top-0 right-0 bottom-auto left-auto w-[350px] overflow-visible p-0">
    <div class="flex max-h-dvh flex-col overflow-hidden">
      <div class="flex min-h-11 place-items-center bg-gray-200 px-4 font-bold">
        <p>フィルター（{{ filterCount }}）</p>

        <button
          class="absolute right-0 z-10 flex size-11 items-center justify-center text-gray-400 hover:text-gray-600"
          @click="popover.hidePopover"
        >
          <i class="i-mdi-close size-6" />
        </button>
      </div>

      <div class="flex place-content-between p-4 shadow-sm">
        <fieldset class="flex gap-2">
          <label
            class="grid size-11 cursor-pointer place-items-center rounded-lg focus-within:outline hover:bg-gray-200 has-[input:checked]:bg-gray-200"
            v-for="group in groups"
            :key="group.key"
          >
            <input
              type="radio"
              v-model="selectedGroup"
              :value="group.key"
              name="channel"
              class="sr-only"
            />
            <img
              :src="getChannelIcon(group.icon)"
              alt="icon"
              class="size-[32px] rounded-full bg-white"
            />
          </label>
        </fieldset>
        <button class="flex h-11 place-items-center rounded-full bg-slate-100 px-2" @click="reset">
          <i class="i-mdi-refresh size-8 text-gray-400" />
          <span>reset</span>
        </button>
      </div>

      <div
        class="-ml-4 flex-1 overflow-auto p-2 pt-4 pb-12"
        ref="talentNodeEl"
        v-if="rootNode"
        :key="rootNode.name"
      >
        <ChannelNode :node="rootNode" :key="rootNode.name" />
      </div>
    </div>
  </popover.PopOver>
</template>

<style scoped>
[popover] {
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  }
  &:popover-open {
    animation: fadeIn 0.2s ease-in-out forwards;
  }
}

@keyframes fadeIn {
  from {
    translate: 50% 0;
  }
}
</style>
