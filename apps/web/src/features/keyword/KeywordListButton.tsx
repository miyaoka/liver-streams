/**
 * トレンドキーワード一覧のポップオーバーを開くボタン。
 */
import { Popover, usePopover } from "../../shared/composables";
import KeywordListPopover from "./KeywordListPopover";

export default function KeywordListButton() {
  const popover = usePopover();

  return (
    <>
      <button
        className="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
        onClick={popover.togglePopover}
        title="popular keywords"
      >
        <i
          className={[
            "size-8",
            popover.isShow ? "i-icon-park-solid-topic" : "i-icon-park-outline-topic",
          ].join(" ")}
        />
      </button>

      <Popover
        control={popover}
        className="keyword-list-button-popover top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] overflow-visible bg-transparent p-0"
      >
        <KeywordListPopover />
      </Popover>
    </>
  );
}
