/**
 * 検索・フィルター適用中に表示されるインジケーター。絞り込み件数を表示し、クリックで解除する。
 */
import { selectHasQuery, useSearchStore } from "../../shared/stores";
import { useFilteredEventList } from "../streams";

export default function FilteringButton() {
  const hasQuery = useSearchStore(selectHasQuery);
  const filteredEventList = useFilteredEventList();

  function close() {
    useSearchStore.getState().setSearchString("");
  }

  if (!hasQuery) return null;

  return (
    <div className="filtering-button-container fixed inset-0 top-auto bottom-4 z-10 m-auto flex w-fit items-center justify-center gap-2 max-md:bottom-16">
      <button
        className="flex h-11 w-fit items-center gap-2 rounded-full border-2 bg-blue-600 px-2 text-sm font-bold text-white shadow-md"
        onClick={close}
      >
        <div className="px-1">
          <span>絞り込み中: </span>
          <span>{filteredEventList.length}件</span>
        </div>

        <div className="flex gap-2">
          <i className="i-mdi-close size-6" />
        </div>
      </button>
    </div>
  );
}
