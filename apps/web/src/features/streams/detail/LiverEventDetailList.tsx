/**
 * 全イベントの詳細ポップオーバーを事前生成するコンテナ。
 *
 * カードクリック時にポップオーバーを即座に表示するため、DOM 上に全イベントのポップオーバー要素を保持する。
 */
import { defineVaporComponent } from "vue";
import { VaporFor } from "vue-jsx-vapor";
import { useEventListStore } from "../eventListStore";
import LiverEventDetailListItem from "./LiverEventDetailListItem";

export default defineVaporComponent(
  () => {
    const eventListStore = useEventListStore();

    return (
      <div>
        <VaporFor in={eventListStore.liverEventList ?? []} getKey={(liverEvent) => liverEvent.id}>
          {(liverEvent) => <LiverEventDetailListItem liverEvent={liverEvent.value} />}
        </VaporFor>
      </div>
    );
  },
  { name: "LiverEventDetailList" },
);
