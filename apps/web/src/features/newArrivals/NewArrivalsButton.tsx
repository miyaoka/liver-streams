/**
 * 新着イベント一覧のポップオーバーを開くボタン。ポップオーバーを閉じてから追加されたイベント数をバッジで表示する。
 */
import { computed, defineVaporComponent, ref } from "vue";
import { usePopover } from "../../shared/composables";
import NewArrivalsPopover from "./NewArrivalsPopover";
import { useNewArrivalsStore } from "./newArrivalsStore";

export default defineVaporComponent(
  () => {
    const newArrivalsStore = useNewArrivalsStore();

    const lastCloseTime = ref(0);
    const popover = usePopover({
      onHide: () => {
        lastCloseTime.value = Date.now();
      },
    });

    const unreadCount = computed(
      () =>
        newArrivalsStore.newArrivalsList.filter((item) => item.addedTime > lastCloseTime.value)
          .length,
    );

    return (
      <>
        <button
          class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
          onClick={popover.togglePopover}
          title="recently added events"
        >
          <i
            class={[
              "size-8",
              {
                "i-mdi-sparkles": popover.isShow.value,
                "i-mdi-sparkles-outline": !popover.isShow.value,
              },
            ]}
          />
          {unreadCount.value > 0 && (
            <p class="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white">
              {unreadCount.value}
            </p>
          )}
        </button>

        <popover.PopOver class="new-arrivals-button-popover top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] justify-center overflow-visible bg-transparent p-0">
          <NewArrivalsPopover lastCloseTime={lastCloseTime.value} />
        </popover.PopOver>
      </>
    );
  },
  { name: "NewArrivalsButton" },
);
