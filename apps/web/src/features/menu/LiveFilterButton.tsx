/**
 * ライブ中の配信のみを表示するフィルターボタン。ライブ中イベント数をバッジで表示する。
 */
import { computed, defineVaporComponent } from "vue";
import { useSearchStore } from "../../shared/stores";
import { useEventListStore } from "../streams";

export default defineVaporComponent(
  () => {
    const searchStore = useSearchStore();
    const eventListStore = useEventListStore();
    const hasLiveEvents = computed(() => eventListStore.onLiveEventList.length > 0);

    return (
      <button
        title="show only live events"
        class="relative flex size-11 flex-col items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
        onClick={searchStore.toggleLiveOnly}
      >
        <i
          class={[
            "size-8",
            {
              "i-eva-radio-fill text-red-700": searchStore.isLiveOnly,
              "i-eva-radio-outline": !searchStore.isLiveOnly,
            },
          ]}
        />
        {hasLiveEvents.value && (
          <p class="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white">
            {eventListStore.onLiveEventList.length}
          </p>
        )}
      </button>
    );
  },
  { name: "LiveFilterButton" },
);
