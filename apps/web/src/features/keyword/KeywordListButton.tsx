/**
 * トレンドキーワード一覧のポップオーバーを開くボタン。
 */
import { defineVaporComponent } from "vue";
import { usePopover } from "../../shared/composables";
import KeywordListPopover from "./KeywordListPopover";

export default defineVaporComponent(
  () => {
    const popover = usePopover();

    return (
      <>
        <button
          class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
          onClick={popover.togglePopover}
          title="popular keywords"
        >
          <i
            class={[
              "size-8",
              {
                "i-icon-park-solid-topic": popover.isShow.value,
                "i-icon-park-outline-topic": !popover.isShow.value,
              },
            ]}
          />
        </button>

        <popover.PopOver class="keyword-list-button-popover top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] overflow-visible bg-transparent p-0">
          <KeywordListPopover />
        </popover.PopOver>
      </>
    );
  },
  { name: "KeywordListButton" },
);
