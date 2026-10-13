/**
 * ライブ中の配信のみを表示するフィルターボタン。ライブ中イベント数をバッジで表示する。
 */
import { selectIsLiveOnly, useSearchStore } from "../../shared/stores";
import { useOnLiveEventList } from "../streams";

export default function LiveFilterButton() {
  const isLiveOnly = useSearchStore(selectIsLiveOnly);
  const toggleLiveOnly = useSearchStore((state) => state.toggleLiveOnly);
  const onLiveEventList = useOnLiveEventList();
  const hasLiveEvents = onLiveEventList.length > 0;

  return (
    <button
      title="show only live events"
      className="relative flex size-11 flex-col items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
      onClick={() => toggleLiveOnly()}
    >
      <i
        className={[
          "size-8",
          isLiveOnly ? "i-eva-radio-fill text-red-700" : "i-eva-radio-outline",
        ].join(" ")}
      />
      {hasLiveEvents && (
        <p className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white">
          {onLiveEventList.length}
        </p>
      )}
    </button>
  );
}
