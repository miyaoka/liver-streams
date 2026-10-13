/**
 * 全イベントの詳細ポップオーバーを事前生成するコンテナ。
 *
 * カードクリック時にポップオーバーを即座に表示するため、DOM 上に全イベントのポップオーバー要素を保持する。
 */
import { useEventListStore } from "../eventListStore";
import LiverEventDetailListItem from "./LiverEventDetailListItem";

export default function LiverEventDetailList() {
  const liverEventList = useEventListStore((state) => state.liverEventList);

  return (
    <div>
      {liverEventList?.map((liverEvent) => (
        <LiverEventDetailListItem key={liverEvent.id} liverEvent={liverEvent} />
      ))}
    </div>
  );
}
