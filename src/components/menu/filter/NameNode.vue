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
  <div class="flex fles-row flex-wrap ml-20 gap-x-2 -mt-10">
    <label
      class="flex flex-col items-center min-w-[30px] cursor-pointer w-[60px]"
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
        :class="`w-[44px] h-[44px] rounded-full transition ${checkList[i] ? 'outline outline-2 outline-red-400 outline-offset-2' : ''} `"
        loading="lazy"
      />
      <div
        :class="`text-xs tracking-tight ${checkList[i] ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-900'}  -mt-2 px-1  rounded-full`"
      >
        <p class="line-clamp-1">
          {{ name }}
        </p>
      </div>
    </label>
  </div>
</template>
