/**
 * 配信一覧のメインビュー。にじさんじ・ホロライブの配信情報を統合表示する。
 *
 * ## 機能
 *
 * - イベント情報を1分間隔で自動更新
 * - 日付・時間セクションで配信を整理して表示
 * - ヘッダー・フッターメニューによる操作
 */
import { useIntervalFn } from "@vueuse/core";
import { defineComponent, onMounted } from "vue";
import { FooterMenu, HeaderMenu } from "../features/menu";
import {
  LiverEventDateSectionList,
  LiverEventDetailList,
  useEventListStore,
} from "../features/streams";

const fetchInterval = 1 * 60 * 1000; // 1min

export default defineComponent(
  () => {
    const eventListStore = useEventListStore();

    onMounted(async () => {
      // イベント情報を更新
      const updateList = () => eventListStore.updateLiverEventList();

      // 一定時間ごとにスケジュールを再取得
      useIntervalFn(updateList, fetchInterval);

      // 初回取得
      void updateList();
    });

    return () => (
      <main class="liver-streams-view text-[clamp(11px,11px+0.25vw,15px)]">
        <LiverEventDateSectionList
          dateSectionList={eventListStore.dateSectionList}
          isLoading={eventListStore.isLoading}
        />
        <LiverEventDetailList />
        <HeaderMenu />
        <FooterMenu />
      </main>
    );
  },
  { name: "LiverStreamsView" },
);
