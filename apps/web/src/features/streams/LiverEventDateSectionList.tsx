/**
 * 日付セクションのリスト表示。ローディング・データなしの状態も含めて配信一覧全体を管理する。
 *
 * 初回読み込み完了時に自動で現在時刻までスクロールする。
 */
import type { DateSection } from "@liver-streams/core";
import { defineComponent, nextTick, onMounted, watch } from "vue";
import { scrollToCurrentTime } from "../../shared/lib";
import { LoadingSpinner } from "../common";
import { useEventListStore } from "./eventListStore";
import LiverEventDateSection from "./LiverEventDateSection";

type Props = {
  dateSectionList: DateSection[];
  isLoading: boolean;
};

export default defineComponent(
  (props: Props) => {
    const eventListStore = useEventListStore();

    // ローディング完了後に現在時刻へスクロール
    watch(
      () => props.isLoading,
      async (isLoading, wasLoading) => {
        if (wasLoading && !isLoading) {
          // DOM更新を待ってからスクロール
          await nextTick();
          scrollToCurrentTime(eventListStore.dateSectionList, { behavior: "instant" });
        }
      },
    );

    onMounted(() => {
      if (!props.isLoading) {
        scrollToCurrentTime(eventListStore.dateSectionList, { behavior: "instant" });
      }
    });

    return () => {
      // ローディング中
      if (props.isLoading) {
        return (
          <div class="flex h-screen flex-col items-center justify-center px-4 py-20 text-white">
            <LoadingSpinner size="lg" message="読み込み中..." />
          </div>
        );
      }
      // イベントリスト
      if (props.dateSectionList.length > 0) {
        return (
          <div class="overflow-x-clip pb-60" data-id="event-list">
            {props.dateSectionList.map((dateSection, i) => (
              <LiverEventDateSection
                key={dateSection.time}
                dateSection={dateSection}
                prevSection={props.dateSectionList[i - 1]}
                nextSection={props.dateSectionList[i + 1]}
              />
            ))}
            <div class="pointer-events-none fixed inset-0 bottom-auto z-10 h-20 bg-linear-to-b from-black/40" />
          </div>
        );
      }
      // データなし
      return (
        <div class="flex h-screen flex-col items-center justify-center px-4 py-20 text-white">
          <i class="i-mdi-file-document-error size-16" />
          <p class="text-base font-bold">no data</p>
        </div>
      );
    };
  },
  { name: "LiverEventDateSectionList", props: ["dateSectionList", "isLoading"] },
);
