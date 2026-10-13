/**
 * マルチセレクトモードの切り替えボタン。複数の配信を選択してマルチビュー画面で開くために使用する。
 */
import { useMultiSelectStore } from "../../shared/stores";

export default function MultiSelectButton() {
  const isMultiSelectMode = useMultiSelectStore((state) => state.isMultiSelectMode);
  const toggleMultiSelectMode = useMultiSelectStore((state) => state.toggleMultiSelectMode);

  return (
    <button
      className={[
        "relative flex size-11 items-center justify-center rounded-full border shadow-md",
        isMultiSelectMode ? "bg-green-600 text-white" : "bg-white text-black",
      ].join(" ")}
      title="multiple select"
      onClick={() => toggleMultiSelectMode()}
    >
      <i
        className={[
          "size-8",
          isMultiSelectMode
            ? "i-mdi-checkbox-multiple-marked-outline"
            : "i-mdi-checkbox-multiple-outline",
        ].join(" ")}
      />
    </button>
  );
}
