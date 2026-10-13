/**
 * 新着イベント一覧のポップオーバー UI。ブラウザを開いてから追加されたイベントを新着順（逆順）で表示する。
 */
import { computed, defineVaporComponent } from "vue";
import { VaporFor } from "vue-jsx-vapor";
import { asNativeEvent } from "../../shared/lib";
import { closePopover } from "../../shared/utils";
import NewArrivalsListItem from "./NewArrivalsListItem";
import { useNewArrivalsStore } from "./newArrivalsStore";

type Props = {
  lastCloseTime: number;
};

export default defineVaporComponent(
  (props: Props) => {
    const newArrivalsStore = useNewArrivalsStore();
    const eventCount = computed(() => newArrivalsStore.newArrivalsList.length);

    return (
      <div class="flex max-h-[min(500px,calc(100dvh-5rem))] min-h-[150px] w-[400px] flex-col overflow-hidden rounded-md bg-white outline-2 outline-solid">
        <div class="flex h-11 items-center justify-start gap-1 bg-black p-2 text-white">
          <i class="i-mdi-sparkles size-5" />
          <span> 最近追加されたイベント ({eventCount.value}) </span>

          <button
            class="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
            onClick={(e) => closePopover(asNativeEvent(e))}
          >
            <i class="i-mdi-close size-6" />
          </button>
        </div>
        <div class="flex w-full [scrollbar-width:none] flex-col gap-2 overflow-auto p-1 pb-10">
          {eventCount.value === 0 ? (
            <div class="p-2">ブラウザを開いてから追加されたイベントがここに載ります</div>
          ) : (
            // 逆順表示
            <div class="flex flex-col-reverse">
              <VaporFor
                in={newArrivalsStore.newArrivalsList}
                getKey={({ liverEvent }) => liverEvent.id}
              >
                {(item) => (
                  <NewArrivalsListItem
                    addedTime={item.value.addedTime}
                    lastCloseTime={props.lastCloseTime}
                    liverEvent={item.value.liverEvent}
                  />
                )}
              </VaporFor>
            </div>
          )}
        </div>
      </div>
    );
  },
  { name: "NewArrivalsPopover", props: ["lastCloseTime"] },
);
