/**
 * 全イベントの詳細ポップオーバーを事前生成するコンテナ。
 *
 * カードクリック時にポップオーバーを即座に表示するため、DOM 上に全イベントのポップオーバー要素を保持する。
 */
import { defineComponent } from "vue";
import { useEventListStore } from "../eventListStore";
import LiverEventDetailListItem from "./LiverEventDetailListItem";

export default defineComponent(
  () => {
    const eventListStore = useEventListStore();

    return () => (
      <div>
        {eventListStore.liverEventList?.map((liverEvent) => (
          <LiverEventDetailListItem key={liverEvent.id} liverEvent={liverEvent} />
        ))}
      </div>
    );
  },
  { name: "LiverEventDetailList" },
);
