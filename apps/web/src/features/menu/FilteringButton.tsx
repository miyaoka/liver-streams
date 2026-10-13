/**
 * 検索・フィルター適用中に表示されるインジケーター。絞り込み件数を表示し、クリックで解除する。
 */
import { defineVaporComponent } from "vue";
import { useSearchStore } from "../../shared/stores";
import { useEventListStore } from "../streams";

export default defineVaporComponent(
  () => {
    const searchStore = useSearchStore();
    const eventListStore = useEventListStore();

    function close() {
      searchStore.setSearchString("");
    }

    return (
      <>
        {searchStore.hasQuery && (
          <div class="filtering-button-container fixed inset-0 top-auto bottom-4 z-10 m-auto flex w-fit items-center justify-center gap-2 max-md:bottom-16">
            <button
              class="flex h-11 w-fit items-center gap-2 rounded-full border-2 bg-blue-600 px-2 text-sm font-bold text-white shadow-md"
              onClick={close}
            >
              <div class="px-1">
                <span>絞り込み中: </span>
                <span>{eventListStore.filteredEventList.length}件</span>
              </div>

              <div class="flex gap-2">
                <i class="i-mdi-close size-6" />
              </div>
            </button>
          </div>
        )}
      </>
    );
  },
  { name: "FilteringButton" },
);
