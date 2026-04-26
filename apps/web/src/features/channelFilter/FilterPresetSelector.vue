<doc lang="md">
フィルタープリセットの選択・保存・削除を行うセレクター。

## 操作

- プリセットを選ぶと即座にフィルターに反映
- 現在のフィルター状態を名前付きで新規追加
- 既存プリセットの上書き保存・削除
</doc>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useTalentFilterStore } from "./";

const emit = defineEmits<{
  loaded: [];
}>();

const talentFilterStore = useTalentFilterStore();

const isEditing = ref(false);
const editName = ref("");
const editNameInput = ref<HTMLInputElement | null>(null);

function onPresetSelect(event: Event) {
  const select = event.target as HTMLSelectElement;
  const id = select.value;
  if (!id) {
    talentFilterStore.resetTalentFilter();
    emit("loaded");
    return;
  }
  talentFilterStore.loadPreset(id);
  emit("loaded");
}

async function startSave() {
  editName.value = "";
  isEditing.value = true;
  await nextTick();
  editNameInput.value?.focus();
}

function confirmSave() {
  const name = editName.value.trim();
  if (!name) return;
  talentFilterStore.savePreset(name);
  isEditing.value = false;
}

function onEnter(event: KeyboardEvent) {
  if (event.isComposing) return;
  confirmSave();
}

function cancelEdit() {
  isEditing.value = false;
}

function overwritePreset() {
  const preset = talentFilterStore.activePreset;
  if (!preset) return;
  talentFilterStore.updatePreset(preset.id);
}

function deleteActivePreset() {
  const preset = talentFilterStore.activePreset;
  if (!preset) return;
  if (!window.confirm(`「${preset.name}」を削除しますか？`)) return;
  talentFilterStore.deletePreset(preset.id);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- 行1: プリセット選択 or 名前入力 -->
    <div v-if="isEditing" class="flex gap-1">
      <input
        ref="editNameInput"
        v-model="editName"
        type="text"
        class="min-w-0 flex-1 rounded-lg border bg-white px-2 py-1 text-sm"
        placeholder="プリセット名"
        @keydown.enter="onEnter"
        @keydown.escape="cancelEdit"
      />
      <button
        class="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40"
        :disabled="!editName.trim()"
        @click="confirmSave"
      >
        <i class="i-mdi-check size-5" />
      </button>
      <button
        class="grid size-8 shrink-0 place-items-center rounded-lg bg-gray-200 hover:bg-gray-300"
        @click="cancelEdit"
      >
        <i class="i-mdi-close size-5" />
      </button>
    </div>
    <div v-else class="flex gap-1">
      <select
        class="min-w-0 flex-1 rounded-lg border bg-white px-2 py-1 text-sm"
        :value="talentFilterStore.activePresetId ?? ''"
        @change="onPresetSelect"
      >
        <option value="">プリセット未選択</option>
        <option v-for="preset in talentFilterStore.presets" :key="preset.id" :value="preset.id">
          {{ preset.name }}（{{ preset.talents.length }}）
        </option>
      </select>

      <button
        class="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-800 not-disabled:bg-amber-500 not-disabled:text-white not-disabled:hover:bg-amber-600 disabled:opacity-30"
        title="上書き保存"
        :disabled="!talentFilterStore.activePreset || !talentFilterStore.isModified"
        @click="overwritePreset"
      >
        <i class="i-mdi-check size-5" />
      </button>

      <button
        class="grid size-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-800 not-disabled:bg-red-500 not-disabled:text-white not-disabled:hover:bg-red-600 disabled:opacity-30"
        title="削除"
        :disabled="!talentFilterStore.activePreset"
        @click="deleteActivePreset"
      >
        <i class="i-mdi-delete-outline size-5" />
      </button>
    </div>

    <!-- 行2: 新規保存ボタン（常に表示） -->
    <button
      class="flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-blue-100 text-sm text-blue-800 not-disabled:bg-blue-500 not-disabled:text-white not-disabled:hover:bg-blue-600 disabled:opacity-30"
      :disabled="talentFilterStore.talentFilterMap.size === 0 || isEditing"
      @click="startSave"
    >
      <i class="i-mdi-plus size-5" />
      <span>新規プリセット追加</span>
    </button>
  </div>
</template>
