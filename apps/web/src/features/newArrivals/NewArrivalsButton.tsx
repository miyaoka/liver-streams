/**
 * 新着イベント一覧のポップオーバーを開くボタン。ポップオーバーを閉じてから追加されたイベント数をバッジで表示する。
 */
import { useState } from "react";
import { Popover, usePopover } from "../../shared/composables";
import { classNames } from "../../shared/lib";
import NewArrivalsPopover from "./NewArrivalsPopover";
import { useNewArrivalsList } from "./newArrivalsStore";

export default function NewArrivalsButton() {
  const newArrivalsList = useNewArrivalsList();

  const [lastCloseTime, setLastCloseTime] = useState(0);
  const popover = usePopover({
    onHide: () => {
      setLastCloseTime(Date.now());
    },
  });

  const unreadCount = newArrivalsList.filter((item) => item.addedTime > lastCloseTime).length;

  return (
    <>
      <button
        className="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
        onClick={popover.togglePopover}
        title="recently added events"
      >
        <i
          className={classNames(
            "size-8",
            popover.isShow ? "i-mdi-sparkles" : "i-mdi-sparkles-outline",
          )}
        />
        {unreadCount > 0 && (
          <p className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white">
            {unreadCount}
          </p>
        )}
      </button>

      <Popover
        control={popover}
        className="new-arrivals-button-popover top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] justify-center overflow-visible bg-transparent p-0"
      >
        <NewArrivalsPopover lastCloseTime={lastCloseTime} />
      </Popover>
    </>
  );
}
