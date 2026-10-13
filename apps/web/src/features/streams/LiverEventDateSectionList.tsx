/**
 * 日付セクションのリスト表示。ローディング・データなしの状態も含めて配信一覧全体を管理する。
 *
 * 初回読み込み完了時に自動で現在時刻までスクロールする。
 */
import type { DateSection } from "@liver-streams/core";
import { useEffectEvent, useLayoutEffect, useRef } from "react";
import { scrollToCurrentTime } from "../../shared/lib";
import { LoadingSpinner } from "../common";
import LiverEventDateSection from "./LiverEventDateSection";

type Props = {
  dateSectionList: DateSection[];
  isLoading: boolean;
};

export default function LiverEventDateSectionList({ dateSectionList, isLoading }: Props) {
  const wasLoadingRef = useRef(isLoading);

  const scrollToNow = useEffectEvent(() => {
    scrollToCurrentTime(dateSectionList, { behavior: "instant" });
  });

  // ローディング完了後に現在時刻へスクロール
  useLayoutEffect(() => {
    const wasLoading = wasLoadingRef.current;
    wasLoadingRef.current = isLoading;
    if (wasLoading && !isLoading) {
      scrollToNow();
    }
  }, [isLoading]);

  useLayoutEffect(() => {
    if (!wasLoadingRef.current) {
      scrollToNow();
    }
  }, []);

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center px-4 py-20 text-white">
        <LoadingSpinner size="lg" message="読み込み中..." />
      </div>
    );
  }
  // イベントリスト
  if (dateSectionList.length > 0) {
    return (
      <div className="overflow-x-clip pb-60" data-id="event-list">
        {dateSectionList.map((dateSection, i) => (
          <LiverEventDateSection
            key={dateSection.time}
            dateSection={dateSection}
            prevSection={dateSectionList[i - 1]}
            nextSection={dateSectionList[i + 1]}
          />
        ))}
        <div className="pointer-events-none fixed inset-0 bottom-auto z-10 h-20 bg-linear-to-b from-black/40" />
      </div>
    );
  }
  // データなし
  return (
    <div className="flex h-screen flex-col items-center justify-center px-4 py-20 text-white">
      <i className="i-mdi-file-document-error size-16" />
      <p className="text-base font-bold">no data</p>
    </div>
  );
}
