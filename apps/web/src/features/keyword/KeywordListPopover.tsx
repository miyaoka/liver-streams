/**
 * トレンドキーワード一覧のポップオーバー UI。配信タイトルから抽出したキーワード・ハッシュタグを出現回数順で表示する。
 *
 * 大文字小文字を区別せずにカウントし、最も多く使われている表記をキーとして採用する。
 */
import { getFilteredEventList } from "@liver-streams/core";
import { useMemo } from "react";
import { selectSearchQuery, useSearchStore } from "../../shared/stores";
import { closePopover } from "../../shared/utils";
import { selectTalentFilterMap, useTalentFilterStore } from "../channelFilter";
import { useEventListStore } from "../streams";
import KeywordListPopoverItem from "./KeywordListPopoverItem";

export interface KeywordItem {
  value: string;
  count: number;
}

// 大文字小文字を区別せずにカウントし、一番多いものをキーにする
function createCountList(eventList: string[][]): KeywordItem[] {
  const keywordMap: Map<string, Map<string, number>> = new Map();
  eventList.forEach((keywordList) => {
    keywordList.forEach((keyword) => {
      // 小文字化したキーでカウント
      const lowerKeyword = keyword.toLowerCase();
      const countMap = keywordMap.get(lowerKeyword);
      if (countMap) {
        countMap.set(keyword, (countMap.get(keyword) ?? 0) + 1);
      } else {
        keywordMap.set(lowerKeyword, new Map([[keyword, 1]]));
      }
    });
  });

  const resultList: KeywordItem[] = [];
  keywordMap.forEach((countMap, _lowerItem) => {
    let totalCount = 0;
    let key = "";
    let maxCount = 0;

    // キーワードごとのカウントを合計し、最大カウントを持つキーワードをキーにする
    countMap.forEach((count, keyword) => {
      totalCount += count;
      if (count > maxCount) {
        maxCount = count;
        key = keyword;
      }
    });

    resultList.push({ value: key, count: totalCount });
  });

  return resultList;
}

export default function KeywordListPopover() {
  const liverEventList = useEventListStore((state) => state.liverEventList);
  const filterMap = useTalentFilterStore(selectTalentFilterMap);
  const searchQuery = useSearchStore(selectSearchQuery);

  const wholeList = useMemo(() => {
    // searchTermsを指定しない状態のリスト
    const filteredEventList = liverEventList
      ? getFilteredEventList({
          liverEventList,
          filterMap,
          searchQuery: {
            ...searchQuery,
            wordList: [],
            hashtagList: [],
            options: {},
          },
        })
      : [];

    const keywordList = createCountList(filteredEventList.map((event) => event.keywordList));
    const hashtagList = createCountList(filteredEventList.map((event) => event.hashtagList)).map(
      (item) => {
        return { value: `#${item.value}`, count: item.count };
      },
    );

    const list = [...keywordList, ...hashtagList];
    return list.sort((a, b) => b.count - a.count);
  }, [liverEventList, filterMap, searchQuery]);

  return (
    <div className="flex max-h-[min(500px,calc(100dvh-5rem))] min-h-[150px] w-[350px] flex-col overflow-hidden rounded-md border-2 border-gray-800 bg-white">
      <div className="flex h-11 shrink-0 items-center justify-start gap-1 bg-black p-2 text-white">
        <i className="i-icon-park-solid-topic size-5" />
        <span>トレンド</span>

        <button
          className="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
          onClick={(e) => closePopover(e.nativeEvent)}
        >
          <i className="i-mdi-close size-6" />
        </button>
      </div>

      <KeywordListPopoverItem itemList={wholeList} />
    </div>
  );
}
