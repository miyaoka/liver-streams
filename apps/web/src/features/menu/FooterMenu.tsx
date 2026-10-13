/**
 * 画面右下に固定表示されるフッターメニュー。各種操作ボタンを配置する。
 *
 * ## 機能
 *
 * - マルチセレクトモードの操作パネル（選択数表示、マルチビュー画面を開く）
 * - キーワード一覧、ブックマーク、新着、ライブ中フィルター、スクロールボタン
 */
import { getYouTubeVideoId } from "@liver-streams/core";
import { defineVaporComponent } from "vue";
import { useMultiSelectStore, useSearchStore } from "../../shared/stores";
import { BookmarkedEventButton } from "../bookmark";
import { KeywordListButton } from "../keyword";
import { NewArrivalsButton } from "../newArrivals";
import { useEventListStore } from "../streams";
import FilteringButton from "./FilteringButton";
import LiveFilterButton from "./LiveFilterButton";
import MultiSelectButton from "./MultiSelectButton";
import ScrollButton from "./ScrollButton";

const multiviewPlayerUrl = "https://multiview-player.miyaoka.workers.dev/";

export default defineVaporComponent(
  () => {
    const multiSelectStore = useMultiSelectStore();
    const eventListStore = useEventListStore();
    const searchStore = useSearchStore();

    function openInMultiPlayer() {
      const idList = Array.from(multiSelectStore.multiSelectEventIdSet);
      if (idList.length === 0) return;

      const eventList = idList.flatMap((id) => eventListStore.liverEventMap.get(id) ?? []);
      const vidList = eventList.flatMap((event) => {
        const videoId = getYouTubeVideoId(event.url);
        return videoId ?? [];
      });

      const url = new URL(multiviewPlayerUrl);
      url.search = new URLSearchParams(vidList.map((vid) => ["v", vid])).toString();
      window.open(url.href, "_blank");
    }

    function selectAll() {
      multiSelectStore.isMultiSelectMode = true;
      multiSelectStore.multiSelectEventIdSet.clear();
      eventListStore.filteredEventList.forEach((event) => {
        multiSelectStore.multiSelectEventIdSet.add(event.id);
      });
    }

    return (
      <footer class="relative z-30">
        <FilteringButton />

        <div class="fixed right-4 bottom-4 flex flex-col items-end gap-2">
          {multiSelectStore.isMultiSelectMode && (
            <div class="flex items-center justify-center gap-4 rounded-xl bg-green-700 px-4 py-2 text-white shadow-md">
              <div class="flex flex-col gap-1">
                <p class="text-lg font-bold">複数選択モード</p>
                <p>
                  選択した動画をマルチビュー画面で表示
                  <br />（{multiSelectStore.multiSelectEventIdSet.size}個選択中）
                </p>
                {searchStore.hasQuery && (
                  <button
                    class="flex h-8 items-center justify-center gap-1 rounded-full bg-green-600/90 px-2"
                    onClick={selectAll}
                  >
                    <i class="i-mdi-check-all size-6" />
                    全選択
                  </button>
                )}
              </div>
              <div>
                <button
                  disabled={multiSelectStore.multiSelectEventIdSet.size === 0}
                  class="flex size-11 items-center justify-center rounded-full bg-white px-2 py-1 text-black disabled:opacity-20"
                  title="マルチビュー画面で開く"
                  onClick={openInMultiPlayer}
                >
                  <i class="i-mdi-open-in-new size-8" />
                </button>
              </div>
            </div>
          )}
          <div class="flex flex-col items-end gap-2">
            <MultiSelectButton />
            <div class="flex flex-row items-end gap-2">
              <KeywordListButton />
              <BookmarkedEventButton />
              <NewArrivalsButton />
              <LiveFilterButton />
              <ScrollButton />
            </div>
          </div>
        </div>
      </footer>
    );
  },
  { name: "FooterMenu" },
);
