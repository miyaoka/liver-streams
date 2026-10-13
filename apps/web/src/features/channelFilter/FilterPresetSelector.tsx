/**
 * フィルタープリセットの選択・保存・削除を行うセレクター。
 *
 * ## 操作
 *
 * - プリセットを選ぶと即座にフィルターに反映
 * - 現在のフィルター状態を名前付きで新規追加
 * - 既存プリセットの上書き保存・削除
 */
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
  selectActivePreset,
  selectIsModified,
  selectTalentFilterMap,
  useTalentFilterStore,
} from "./";

type Props = {
  onLoaded?: () => void;
};

export default function FilterPresetSelector({ onLoaded }: Props) {
  const presets = useTalentFilterStore((state) => state.presets);
  const activePresetId = useTalentFilterStore((state) => state.activePresetId);
  const activePreset = useTalentFilterStore(selectActivePreset);
  const isModified = useTalentFilterStore(selectIsModified);
  const talentFilterMap = useTalentFilterStore(selectTalentFilterMap);

  const [isEditing, setIsEditing] = useState(false);
  // IME の変換中も追従させる。止めると React が入力欄を巻き戻す
  const [inputValue, setInputValue] = useState("");
  const editNameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;
    editNameInput.current?.focus();
  }, [isEditing]);

  function onPresetSelect(event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;
    const { resetTalentFilter, loadPreset } = useTalentFilterStore.getState();
    if (!id) {
      resetTalentFilter();
      onLoaded?.();
      return;
    }
    loadPreset(id);
    onLoaded?.();
  }

  function startSave() {
    setInputValue("");
    setIsEditing(true);
  }

  function confirmSave() {
    const name = inputValue.trim();
    if (!name) return;
    useTalentFilterStore.getState().savePreset(name);
    setIsEditing(false);
  }

  function onEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    confirmSave();
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function overwritePreset() {
    if (!activePreset) return;
    useTalentFilterStore.getState().updatePreset(activePreset.id);
  }

  function deleteActivePreset() {
    if (!activePreset) return;
    if (!window.confirm(`「${activePreset.name}」を削除しますか？`)) return;
    useTalentFilterStore.getState().deletePreset(activePreset.id);
  }

  function onEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") onEnter(event);
    if (event.key === "Escape") cancelEdit();
  }

  function onEditChange(event: ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 行1: プリセット選択 or 名前入力 */}
      {isEditing ? (
        <div className="flex gap-1">
          <input
            ref={editNameInput}
            value={inputValue}
            onChange={onEditChange}
            type="text"
            className="min-w-0 flex-1 rounded-lg border bg-white px-2 py-1 text-sm"
            placeholder="プリセット名"
            onKeyDown={onEditKeyDown}
          />
          <button
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40"
            disabled={!inputValue.trim()}
            onClick={confirmSave}
          >
            <i className="i-mdi-check size-5" />
          </button>
          <button
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-gray-200 hover:bg-gray-300"
            onClick={cancelEdit}
          >
            <i className="i-mdi-close size-5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <select
            className="min-w-0 flex-1 rounded-lg border bg-white px-2 py-1 text-sm"
            value={activePresetId ?? ""}
            onChange={onPresetSelect}
          >
            <option value="">プリセット未選択</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}（{preset.talents.length}）
              </option>
            ))}
          </select>

          <button
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-800 not-disabled:bg-amber-500 not-disabled:text-white not-disabled:hover:bg-amber-600 disabled:opacity-30"
            title="上書き保存"
            disabled={!activePreset || !isModified}
            onClick={overwritePreset}
          >
            <i className="i-mdi-check size-5" />
          </button>

          <button
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-800 not-disabled:bg-red-500 not-disabled:text-white not-disabled:hover:bg-red-600 disabled:opacity-30"
            title="削除"
            disabled={!activePreset}
            onClick={deleteActivePreset}
          >
            <i className="i-mdi-delete-outline size-5" />
          </button>
        </div>
      )}

      {/* 行2: 新規保存ボタン（常に表示） */}
      <button
        className="flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-blue-100 text-sm text-blue-800 not-disabled:bg-blue-500 not-disabled:text-white not-disabled:hover:bg-blue-600 disabled:opacity-30"
        disabled={talentFilterMap.size === 0 || isEditing}
        onClick={startSave}
      >
        <i className="i-mdi-plus size-5" />
        <span>新規プリセット追加</span>
      </button>
    </div>
  );
}
