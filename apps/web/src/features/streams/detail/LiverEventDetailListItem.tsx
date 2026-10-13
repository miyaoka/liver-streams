/**
 * イベント詳細ポップオーバーのラッパー。イベント ID を popover ID として設定し、カードからの参照を可能にする。
 */
import type { LiverEvent } from "@liver-streams/core";
import { Popover, usePopover } from "../../../shared/popover";
import LiverEventDetailPopover from "./LiverEventDetailPopover";

type Props = {
  liverEvent: LiverEvent;
};

export default function LiverEventDetailListItem({ liverEvent }: Props) {
  const popover = usePopover({
    popoverId: liverEvent.id,
  });

  return (
    <Popover
      control={popover}
      className="event-detail-list-item-popover inset-x-0 top-auto bottom-2 mx-auto max-w-[calc(100%-16px)] overflow-visible bg-transparent p-0"
    >
      <LiverEventDetailPopover liverEvent={liverEvent} />
    </Popover>
  );
}
