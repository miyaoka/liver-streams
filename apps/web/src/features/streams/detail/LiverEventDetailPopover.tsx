/**
 * イベント詳細のポップオーバー UI。カードクリックで開き、配信の詳細情報を表示する。
 *
 * ## 機能
 *
 * - 大きめのサムネイル表示
 * - タイトル内のキーワード・ハッシュタグをクリックして検索
 * - コラボメンバーのアイコン一覧と検索
 * - ブックマーク・通知の追加/解除
 * - 通知許可リクエスト（未許可時）
 */
import type { LiverEvent } from "@liver-streams/core";
import { parseSegment, getThumbnail, fullDateFormatter } from "@liver-streams/core";
import { computed, defineVaporComponent, toRef } from "vue";
import { VaporFor } from "vue-jsx-vapor";
import { usePopover } from "../../../shared/composables";
import { asNativeEvent } from "../../../shared/lib";
import { useHoverStore, useSearchStore } from "../../../shared/stores";
import { closePopover } from "../../../shared/utils";
import { useBookmarkStore, useNotificationStore } from "../../bookmark";
import { useLiverEvent } from "../useLiverEvent";

type Props = {
  liverEvent: LiverEvent;
};

export default defineVaporComponent(
  (props: Props) => {
    const bookmarkStore = useBookmarkStore();
    const hoverStore = useHoverStore();
    const searchStore = useSearchStore();
    const notificationStore = useNotificationStore();

    const { hasBookmark, hasNotify } = useLiverEvent(toRef(props.liverEvent));
    const permissionPopover = usePopover();

    const fullDate = computed(() => {
      return fullDateFormatter.format(props.liverEvent.startAt);
    });

    // セグメント化したタイトル
    const segmentList = computed(() => {
      const { title, keywordList, hashtagList } = props.liverEvent;
      return parseSegment(title, keywordList, hashtagList);
    });

    function setSearchString(str: string) {
      // 空白を含むならダブルクォーテーションで囲む
      const formattedStr = str.includes(" ") ? `"${str}"` : str;
      // 同じものなら検索を解除
      if (searchStore.searchString === formattedStr) {
        searchStore.setSearchString("");
        return;
      }
      searchStore.setSearchString(formattedStr);
    }

    // 通知機能が使えるか
    const canSetNotify = computed(() => {
      if (!notificationStore.isSupported) return false;
      return true;
    });

    async function onClickNotify(id: string) {
      if (!notificationStore.isSupported) return;

      // 通知許可済みなら通知をトグル
      if (notificationStore.permissionGranted) {
        bookmarkStore.toggleNotifyEvent(id);
        return;
      }

      // 通知許可ポップオーバーを表示
      permissionPopover.showPopover();
      // 通知許可を求める
      const permission = await notificationStore.ensurePermissions();
      if (!permission) return;

      // 許可されたらポップオーバーを閉じて通知をトグル
      permissionPopover.hidePopover();
      bookmarkStore.toggleNotifyEvent(id);
    }

    return (
      <div class="w-[480px] max-w-full overflow-hidden rounded-lg border border-gray-500 bg-white pb-2 shadow-xl">
        <div class="flex h-11 items-center bg-gray-800 px-4 text-gray-200">
          <div class="font-bold">{fullDate.value}</div>
          <button
            class="absolute right-0 grid size-11 place-items-center text-gray-400 hover:text-gray-200"
            onClick={(e) => closePopover(asNativeEvent(e))}
          >
            <i class="i-mdi-close size-5" />
          </button>
        </div>

        <a href={props.liverEvent.url} target="_blank">
          <img
            src={getThumbnail(props.liverEvent.thumbnail, "sd")}
            class="event-detail-popover-thumb aspect-video w-[480px] bg-gray-800 object-cover p-0"
            loading="lazy"
          />
        </a>

        <div class="relative flex flex-col gap-2 px-6 py-4 max-sm:p-3">
          <div class="text-lg font-bold">
            <VaporFor in={segmentList.value} getKey={(_, i) => i}>
              {(segment) => (
                <>
                  {segment.value.type === "hashtag" || segment.value.type === "keyword" ? (
                    <span
                      class="cursor-pointer text-blue-500 hover:underline"
                      onClick={() => setSearchString(segment.value.value)}
                    >
                      {segment.value.value}
                    </span>
                  ) : (
                    <span>{segment.value.value}</span>
                  )}
                </>
              )}
            </VaporFor>
          </div>

          <div class="flex flex-row items-center gap-2">
            <button
              class="size-[70px] overflow-hidden rounded-full border hover:outline-2 hover:outline-red-500 hover:outline-solid"
              onMouseover={() => hoverStore.setHoveredTalents(props.liverEvent.talent.name)}
              onMouseleave={() => hoverStore.clearHoveredTalents()}
              onClick={(e) => {
                e.preventDefault();
                searchStore.setFocusedTalent(props.liverEvent.talent.name);
              }}
              onContextmenu={(e) => {
                e.preventDefault();
                searchStore.setFocusedTalent(props.liverEvent.talent.name);
              }}
            >
              <img src={props.liverEvent.talent.image} class="size-full" loading="lazy" />
            </button>
            <div class="flex-1">
              <div class="text-base font-bold">{props.liverEvent.talent.name}</div>
              <div class="flex flex-row flex-wrap">
                <VaporFor in={props.liverEvent.collaboTalents} getKey={(talent) => talent.image}>
                  {(talent) => (
                    <button
                      class="w-[40px] overflow-hidden rounded-full hover:outline-2 hover:outline-red-500 hover:outline-solid max-sm:w-[30px]"
                      title={talent.value.name}
                      onMouseenter={() => hoverStore.setHoveredTalents(talent.value.name)}
                      onMouseleave={() => hoverStore.clearHoveredTalents()}
                      onClick={(e) => {
                        e.preventDefault();
                        searchStore.setFocusedTalent(talent.value.name);
                      }}
                      onContextmenu={(e) => {
                        e.preventDefault();
                        searchStore.setFocusedTalent(talent.value.name);
                      }}
                    >
                      <img class="size-full" src={talent.value.image} loading="lazy" />
                    </button>
                  )}
                </VaporFor>
              </div>
            </div>
            <div class="flex flex-col place-items-center">
              <button
                class="group/fav grid size-11 place-items-center"
                onClick={() => bookmarkStore.toggleBookmarkEvent(props.liverEvent.id)}
                title="add bookmark"
              >
                <div
                  class={[
                    "grid size-10 place-items-center rounded-full border-2 bg-white group-hover/fav:bg-gray-100",
                    {
                      "border-green-800": hasBookmark.value,
                      "border-gray-400": !hasBookmark.value,
                    },
                  ]}
                >
                  <i
                    class={[
                      "size-7",
                      {
                        "i-mdi-bookmark text-green-600": hasBookmark.value,
                        "i-mdi-bookmark-outline text-gray-400": !hasBookmark.value,
                      },
                    ]}
                  />
                </div>
              </button>
              {canSetNotify.value && (
                <button
                  class="group/fav grid size-11 place-items-center"
                  onClick={() => onClickNotify(props.liverEvent.id)}
                  title="add notification"
                >
                  <div
                    class={[
                      "grid size-10 place-items-center rounded-full border-2 border-gray-400 bg-white group-hover/fav:bg-gray-100",
                      {
                        "border-yellow-800": hasNotify.value,
                        "border-gray-400": !hasNotify.value,
                      },
                    ]}
                  >
                    <i
                      class={[
                        "size-7",
                        {
                          "i-mdi-bell text-yellow-600": hasNotify.value,
                          "i-mdi-bell-outline text-gray-400": !hasNotify.value,
                        },
                      ]}
                    />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        <permissionPopover.PopOver class="event-detail-popover-permission inset-x-0 top-auto bottom-4 mx-auto overflow-visible bg-transparent p-0">
          <button
            class="rounded-full bg-yellow-400 p-4 text-sm shadow-md"
            onClick={() => permissionPopover.hidePopover()}
          >
            ブラウザのサイト設定で通知を許可してください
          </button>
        </permissionPopover.PopOver>
      </div>
    );
  },
  { name: "LiverEventDetailPopover", props: ["liverEvent"] },
);
