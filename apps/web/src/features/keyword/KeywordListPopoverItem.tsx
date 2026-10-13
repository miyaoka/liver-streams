/**
 * キーワード一覧の各アイテム表示。クリックで検索クエリに設定する。
 */
import { useSearchStore } from "../../shared/stores";
import type { KeywordItem } from "./KeywordListPopover";

type Props = {
  itemList: KeywordItem[];
};

function setSearchString(str: string) {
  const searchStore = useSearchStore.getState();
  // 空白を含むならダブルクォーテーションで囲む
  const formattedStr = str.includes(" ") ? `"${str}"` : str;
  // 同じものなら検索を解除
  if (searchStore.searchString === formattedStr) {
    searchStore.setSearchString("");
    return;
  }
  searchStore.setSearchString(formattedStr);
}

export default function KeywordListPopoverItem({ itemList }: Props) {
  return (
    <div className="grid [scrollbar-width:none] gap-1 overflow-y-scroll pt-2 pb-6">
      {itemList.map((item) => (
        <button
          key={item.value}
          className="py-1 hover:bg-gray-100"
          onClick={() => setSearchString(item.value)}
        >
          <div className="flex items-center gap-2 px-3 text-start">
            <p className="line-clamp-2 flex-1 wrap-anywhere">{item.value}</p>
            <div className="w-12 text-center">{item.count}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
