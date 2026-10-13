/**
 * 画面右上に固定表示されるヘッダーメニュー。検索フィルターとチャンネルフィルターを配置する。
 */
import { defineVaporComponent } from "vue";
import { ChannelFilter } from "../channelFilter";
import { SearchFilter } from "../search";

export default defineVaporComponent(
  () => (
    <header class="fixed top-4 right-4 z-30 flex flex-row gap-2">
      <SearchFilter />
      <ChannelFilter />
    </header>
  ),
  { name: "HeaderMenu" },
);
