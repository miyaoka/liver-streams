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
import { Popover, usePopover } from "../../../shared/composables";
import { classNames } from "../../../shared/lib";
import { useHoverStore, useSearchStore } from "../../../shared/stores";
import { closePopover } from "../../../shared/utils";
import {
  selectHasBookmark,
  selectHasNotify,
  useBookmarkStore,
  useNotificationStore,
} from "../../bookmark";

type Props = {
  liverEvent: LiverEvent;
};

export default function LiverEventDetailPopover({ liverEvent }: Props) {
  const isNotificationSupported = useNotificationStore((state) => state.isSupported);

  const hasBookmark = useBookmarkStore(selectHasBookmark(liverEvent.id));
  const hasNotify = useBookmarkStore(selectHasNotify(liverEvent.id));
  const permissionPopover = usePopover();

  const fullDate = fullDateFormatter.format(liverEvent.startAt);

  // セグメント化したタイトル
  const segmentList = parseSegment(
    liverEvent.title,
    liverEvent.keywordList,
    liverEvent.hashtagList,
  );

  function setSearchString(str: string) {
    const { searchString, setSearchString } = useSearchStore.getState();
    // 空白を含むならダブルクォーテーションで囲む
    const formattedStr = str.includes(" ") ? `"${str}"` : str;
    // 同じものなら検索を解除
    if (searchString === formattedStr) {
      setSearchString("");
      return;
    }
    setSearchString(formattedStr);
  }

  function setFocusedTalent(talent: string) {
    useSearchStore.getState().setFocusedTalent(talent);
  }

  function setHoveredTalents(talent: string) {
    useHoverStore.getState().setHoveredTalents(talent);
  }

  function clearHoveredTalents() {
    useHoverStore.getState().clearHoveredTalents();
  }

  // 通知機能が使えるか
  const canSetNotify = isNotificationSupported;

  async function onClickNotify(id: string) {
    const { isSupported, permissionGranted, ensurePermissions } = useNotificationStore.getState();
    const { toggleNotifyEvent } = useBookmarkStore.getState();
    if (!isSupported) return;

    // 通知許可済みなら通知をトグル
    if (permissionGranted) {
      toggleNotifyEvent(id);
      return;
    }

    // 通知許可ポップオーバーを表示
    permissionPopover.showPopover();
    // 通知許可を求める
    const permission = await ensurePermissions();
    if (!permission) return;

    // 許可されたらポップオーバーを閉じて通知をトグル
    permissionPopover.hidePopover();
    toggleNotifyEvent(id);
  }

  return (
    <div className="w-[480px] max-w-full overflow-hidden rounded-lg border border-gray-500 bg-white pb-2 shadow-xl">
      <div className="flex h-11 items-center bg-gray-800 px-4 text-gray-200">
        <div className="font-bold">{fullDate}</div>
        <button
          className="absolute right-0 grid size-11 place-items-center text-gray-400 hover:text-gray-200"
          onClick={(e) => closePopover(e.nativeEvent)}
        >
          <i className="i-mdi-close size-5" />
        </button>
      </div>

      <a href={liverEvent.url} target="_blank">
        <img
          src={getThumbnail(liverEvent.thumbnail, "sd")}
          className="event-detail-popover-thumb aspect-video w-[480px] bg-gray-800 object-cover p-0"
          loading="lazy"
        />
      </a>

      <div className="relative flex flex-col gap-2 px-6 py-4 max-sm:p-3">
        <div className="text-lg font-bold">
          {segmentList.map((segment, i) => {
            if (segment.type === "hashtag") {
              return (
                <span
                  key={i}
                  className="cursor-pointer text-blue-500 hover:underline"
                  onClick={() => setSearchString(segment.value)}
                >
                  {segment.value}
                </span>
              );
            }
            if (segment.type === "keyword") {
              return (
                <span
                  key={i}
                  className="cursor-pointer text-blue-500 hover:underline"
                  onClick={() => setSearchString(segment.value)}
                >
                  {segment.value}
                </span>
              );
            }
            return <span key={i}>{segment.value}</span>;
          })}
        </div>

        <div className="flex flex-row items-center gap-2">
          <button
            className="size-[70px] overflow-hidden rounded-full border hover:outline-2 hover:outline-red-500 hover:outline-solid"
            onMouseOver={() => setHoveredTalents(liverEvent.talent.name)}
            onMouseLeave={clearHoveredTalents}
            onClick={(e) => {
              e.preventDefault();
              setFocusedTalent(liverEvent.talent.name);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setFocusedTalent(liverEvent.talent.name);
            }}
          >
            <img src={liverEvent.talent.image} className="size-full" loading="lazy" />
          </button>
          <div className="flex-1">
            <div className="text-base font-bold">{liverEvent.talent.name}</div>
            <div className="flex flex-row flex-wrap">
              {liverEvent.collaboTalents.map((talent) => (
                <button
                  key={talent.image}
                  className="w-[40px] overflow-hidden rounded-full hover:outline-2 hover:outline-red-500 hover:outline-solid max-sm:w-[30px]"
                  title={talent.name}
                  onMouseEnter={() => setHoveredTalents(talent.name)}
                  onMouseLeave={clearHoveredTalents}
                  onClick={(e) => {
                    e.preventDefault();
                    setFocusedTalent(talent.name);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setFocusedTalent(talent.name);
                  }}
                >
                  <img className="size-full" src={talent.image} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col place-items-center">
            <button
              className="group/fav grid size-11 place-items-center"
              onClick={() => useBookmarkStore.getState().toggleBookmarkEvent(liverEvent.id)}
              title="add bookmark"
            >
              <div
                className={classNames(
                  "grid size-10 place-items-center rounded-full border-2 bg-white group-hover/fav:bg-gray-100",
                  hasBookmark ? "border-green-800" : "border-gray-400",
                )}
              >
                <i
                  className={classNames(
                    "size-7",
                    hasBookmark
                      ? "i-mdi-bookmark text-green-600"
                      : "i-mdi-bookmark-outline text-gray-400",
                  )}
                />
              </div>
            </button>
            {canSetNotify && (
              <button
                className="group/fav grid size-11 place-items-center"
                onClick={() => onClickNotify(liverEvent.id)}
                title="add notification"
              >
                <div
                  className={classNames(
                    "grid size-10 place-items-center rounded-full border-2 border-gray-400 bg-white group-hover/fav:bg-gray-100",
                    hasNotify ? "border-yellow-800" : "border-gray-400",
                  )}
                >
                  <i
                    className={classNames(
                      "size-7",
                      hasNotify ? "i-mdi-bell text-yellow-600" : "i-mdi-bell-outline text-gray-400",
                    )}
                  />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
      <Popover
        control={permissionPopover}
        className="event-detail-popover-permission inset-x-0 top-auto bottom-4 mx-auto overflow-visible bg-transparent p-0"
      >
        <button
          className="rounded-full bg-yellow-400 p-4 text-sm shadow-md"
          onClick={() => permissionPopover.hidePopover()}
        >
          ブラウザのサイト設定で通知を許可してください
        </button>
      </Popover>
    </div>
  );
}
