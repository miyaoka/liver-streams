/**
 * 現在時刻のセクションまでスクロールするボタン。一覧を遡って見た後に現在位置に戻るために使用する。
 */
import { defineVaporComponent } from "vue";
import { scrollToCurrentTime } from "../../shared/lib";
import { useEventListStore } from "../streams";

export default defineVaporComponent(
  () => {
    const eventListStore = useEventListStore();

    return (
      <button
        title="scroll to current time"
        class="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
        onClick={() => scrollToCurrentTime(eventListStore.dateSectionList)}
      >
        <i class="i-mdi-history size-8" />
      </button>
    );
  },
  { name: "ScrollButton" },
);
