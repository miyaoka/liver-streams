/**
 * 配信一覧のメインビュー。にじさんじ・ホロライブの配信情報を統合表示する。
 *
 * ## 機能
 *
 * - イベント情報を1分間隔で自動更新
 * - 日付・時間セクションで配信を整理して表示
 * - ヘッダー・フッターメニューによる操作
 */
import { useEffect } from "react";
import { FooterMenu, HeaderMenu } from "../features/menu";
import {
  LiverEventDateSectionList,
  LiverEventDetailList,
  selectIsLoading,
  useDateSectionList,
  useEventListStore,
} from "../features/streams";

const fetchInterval = 1 * 60 * 1000; // 1min

export default function LiverStreamsView() {
  const dateSectionList = useDateSectionList();
  const isLoading = useEventListStore(selectIsLoading);

  useEffect(() => {
    // イベント情報を更新
    const updateList = () => useEventListStore.getState().updateLiverEventList();

    // 一定時間ごとにスケジュールを再取得
    const intervalId = setInterval(updateList, fetchInterval);

    // 初回取得
    void updateList();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="liver-streams-view text-[clamp(11px,11px+0.25vw,15px)]">
      <LiverEventDateSectionList dateSectionList={dateSectionList} isLoading={isLoading} />
      <LiverEventDetailList />
      <HeaderMenu />
      <FooterMenu />
    </main>
  );
}
