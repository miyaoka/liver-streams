<script setup lang="ts">
import { ref, watch } from "vue";
import GroupNode from "./GroupNode.vue";
import NameNode from "./NameNode.vue";
import { type Node } from "@/store/storageStore";

const props = defineProps<{
  name: string;
  val: Node | string[];
  checked: boolean;
}>();
const emit = defineEmits<{
  "update:checked": [checked: boolean];
}>();

const el = ref<HTMLElement | null>(null);
const checked = ref(props.checked);
const clickChecked = ref(checked.value);

// クリック時のみ更新するstate
function onClick() {
  clickChecked.value = checked.value;
}

watch(
  () => props.checked,
  (val) => {
    checked.value = val;
    clickChecked.value = val;
  },
);
watch(checked, (val) => {
  emit("update:checked", val);
});
</script>
<template>
  <div class="ml-6 flex flex-col items-start gap-3">
    <label
      :class="`cursor-pointer rounded-lg px-2 py-1 text-sm font-bold outline outline-2 ${checked ? 'bg-red-500 text-white outline-red-400' : 'outline-slate-400'}`"
    >
      <input type="checkbox" v-model="checked" @change="onClick" class="hidden" />
      {{ name }}
    </label>

    <div ref="el">
      <NameNode v-if="Array.isArray(val)" :nameList="val" v-model:checked="checked" />
      <GroupNode v-else :group="val" v-model:checked="checked" v-model:clicked="clickChecked" />
    </div>
  </div>
</template>
