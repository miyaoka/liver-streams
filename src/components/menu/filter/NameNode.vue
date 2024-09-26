<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useFocusStore } from "@/store/focusStore";
import { useStorageStore } from "@/store/storageStore";
import { getChannelIcon } from "@/utils/icons";

const storageStore = useStorageStore();
const focusStore = useFocusStore();

const props = defineProps<{
  nameList: string[];
  checked: boolean;
}>();
const emit = defineEmits<{
  "update:checked": [checked: boolean];
}>();

const checkList = ref<boolean[]>(props.nameList.map(() => false));

function update() {
  const isAllChecked = checkList.value.every((checked) => checked);
  emit("update:checked", isAllChecked);
}

function onChange(name: string, checked: boolean) {
  storageStore.setTalentFilter(name, checked);
  update();
}

onMounted(() => {
  checkList.value = props.nameList.map((name) => storageStore.talentFilterMap.get(name) ?? false);
  update();
});
watch(
  () => props.checked,
  (val) => {
    checkList.value = props.nameList.map(() => val);
    props.nameList.forEach((name) => {
      storageStore.setTalentFilter(name, val);
    });
  },
);

watch(storageStore.talentFilterMap, () => {
  checkList.value = props.nameList.map((name) => storageStore.talentFilterMap.get(name) ?? false);
  update();
});
</script>
<template>
  <div class="-mt-10 ml-20 flex flex-row flex-wrap gap-x-2">
    <label
      class="flex w-[60px] min-w-[30px] cursor-pointer flex-col items-center"
      v-for="(name, i) in nameList"
      :key="name"
      :title="name"
      @mouseenter="focusStore.setHoveredTalents(name)"
      @mouseleave="focusStore.clearHoveredTalents()"
      :class="`${focusStore.hoveredTalents.includes(name) ? 'scale-125' : ''}`"
      @contextmenu.prevent="focusStore.setFocusedTalent(name)"
    >
      <input
        type="checkbox"
        v-model="checkList[i]"
        @change="($event) => onChange(name, ($event.target as HTMLInputElement).checked)"
        class="hidden"
      />
      <img
        :src="getChannelIcon(name)"
        :class="`h-[44px] w-[44px] rounded-full transition ${checkList[i] ? 'outline outline-2 outline-offset-2 outline-red-400' : ''} `"
        loading="lazy"
      />
      <div
        :class="`text-xs tracking-tight ${checkList[i] ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-900'} -mt-2 rounded-full px-1`"
      >
        <p class="line-clamp-1">
          {{ name }}
        </p>
      </div>
    </label>
  </div>
</template>
