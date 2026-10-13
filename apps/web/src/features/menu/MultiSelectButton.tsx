/**
 * マルチセレクトモードの切り替えボタン。複数の配信を選択してマルチビュー画面で開くために使用する。
 */
import { defineComponent } from "vue";
import { useMultiSelectStore } from "../../shared/stores";

export default defineComponent(
  () => {
    const multiSelectStore = useMultiSelectStore();

    return () => (
      <button
        class={[
          "relative flex size-11 items-center justify-center rounded-full border shadow-md",
          {
            "bg-green-600 text-white": multiSelectStore.isMultiSelectMode,
            "bg-white text-black": !multiSelectStore.isMultiSelectMode,
          },
        ]}
        title="multiple select"
        onClick={multiSelectStore.toggleMultiSelectMode}
      >
        <i
          class={[
            "size-8",
            {
              "i-mdi-checkbox-multiple-marked-outline": multiSelectStore.isMultiSelectMode,
              "i-mdi-checkbox-multiple-outline": !multiSelectStore.isMultiSelectMode,
            },
          ]}
        />
      </button>
    );
  },
  { name: "MultiSelectButton" },
);
