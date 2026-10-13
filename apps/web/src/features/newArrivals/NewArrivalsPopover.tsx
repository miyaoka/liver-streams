/**
 * 新着イベント一覧のポップオーバー UI。ブラウザを開いてから追加されたイベントを新着順（逆順）で表示する。
 */
import { closePopover } from "../../shared/utils";
import NewArrivalsListItem from "./NewArrivalsListItem";
import { useNewArrivalsList } from "./newArrivalsStore";

type Props = {
  lastCloseTime: number;
};

export default function NewArrivalsPopover({ lastCloseTime }: Props) {
  const newArrivalsList = useNewArrivalsList();
  const eventCount = newArrivalsList.length;

  return (
    <div className="flex max-h-[min(500px,calc(100dvh-5rem))] min-h-[150px] w-[400px] flex-col overflow-hidden rounded-md bg-white outline-2 outline-solid">
      <div className="flex h-11 items-center justify-start gap-1 bg-black p-2 text-white">
        <i className="i-mdi-sparkles size-5" />
        <span> 最近追加されたイベント ({eventCount}) </span>

        <button
          className="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
          onClick={(e) => closePopover(e.nativeEvent)}
        >
          <i className="i-mdi-close size-6" />
        </button>
      </div>
      <div className="flex w-full [scrollbar-width:none] flex-col gap-2 overflow-auto p-1 pb-10">
        {eventCount === 0 ? (
          <div className="p-2">ブラウザを開いてから追加されたイベントがここに載ります</div>
        ) : (
          // 逆順表示
          <div className="flex flex-col-reverse">
            {newArrivalsList.map(({ liverEvent, addedTime }) => (
              <NewArrivalsListItem
                key={liverEvent.id}
                addedTime={addedTime}
                lastCloseTime={lastCloseTime}
                liverEvent={liverEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
