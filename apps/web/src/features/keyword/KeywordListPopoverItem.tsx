/**
 * キーワード一覧の各アイテム表示。クリックで検索クエリに設定する。
 */
import { defineVaporComponent } from "vue";
import { useSearchStore } from "../../shared/stores";
import type { KeywordItem } from "./KeywordListPopover";

type Props = {
  itemList: KeywordItem[];
};

export default defineVaporComponent(
  (props: Props) => {
    const searchStore = useSearchStore();

    function setSearchString(str: string) {
      // 空白を含むならダブルクォーテーションで囲む
      const formattedStr = str.includes(" ") ? `"${str}"` : str;
      // 同じものなら検索を解除
      if (searchStore.searchString === formattedStr) {
        searchStore.setSearchString("");
        return;
      }
      searchStore.setSearchString(formattedStr);
    }

    return (
      <div class="grid [scrollbar-width:none] gap-1 overflow-y-scroll pt-2 pb-6">
        {props.itemList.map((item) => (
          <button
            key={item.value}
            class="py-1 hover:bg-gray-100"
            onClick={() => setSearchString(item.value)}
          >
            <div class="flex items-center gap-2 px-3 text-start">
              <p class="line-clamp-2 flex-1 wrap-anywhere">{item.value}</p>
              <div class="w-12 text-center">{item.count}</div>
            </div>
          </button>
        ))}
      </div>
    );
  },
  { name: "KeywordListPopoverItem", props: ["itemList"] },
);
