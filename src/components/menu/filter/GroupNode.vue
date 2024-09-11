<script setup lang="ts">
import { ref, watch } from "vue";
import GroupNodeItem from "./GroupNodeItem.vue";
import type { Node } from "@/store/storageStore";

const props = defineProps<{
  group: Node;
  checked?: boolean;
  clicked?: boolean;
}>();

const emit = defineEmits<{
  "update:checked": [checked: boolean];
  "update:clicked": [clicked: boolean];
}>();

const entries = Object.entries(props.group);
const checkedList = ref<boolean[]>(entries.map(() => props.checked));

// 親からのclick更新時のみ、全ての子要素を更新する
watch(
  () => props.clicked,
  (val) => {
    checkedList.value = entries.map(() => val);
  },
);

// 子要素の更新時、全チェックかどうか親に通知する
watch(
  checkedList,
  (val) => {
    const isAllChecked = val.every((checked) => checked);
    emit("update:checked", isAllChecked);
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>
<template>
  <div class="flex flex-col gap-2 py-2">
    <GroupNodeItem
      v-for="([key, val], i) in entries"
      :key="key"
      :name="key"
      :val="val"
      v-model:checked="checkedList[i]"
    />
  </div>
</template>
