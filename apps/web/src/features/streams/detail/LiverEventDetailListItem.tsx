/**
 * イベント詳細ポップオーバーのラッパー。イベント ID を popover ID として設定し、カードからの参照を可能にする。
 */
import type { LiverEvent } from "@liver-streams/core";
import { defineComponent } from "vue";
import { usePopover } from "../../../shared/composables";
import LiverEventDetailPopover from "./LiverEventDetailPopover";

type Props = {
  liverEvent: LiverEvent;
};

export default defineComponent(
  (props: Props) => {
    const popover = usePopover({
      popoverId: props.liverEvent.id,
    });

    return () => (
      <popover.PopOver class="event-detail-list-item-popover inset-x-0 top-auto bottom-2 mx-auto max-w-[calc(100%-16px)] overflow-visible bg-transparent p-0">
        <LiverEventDetailPopover liverEvent={props.liverEvent} />
      </popover.PopOver>
    );
  },
  { name: "LiverEventDetailListItem", props: ["liverEvent"] },
);
