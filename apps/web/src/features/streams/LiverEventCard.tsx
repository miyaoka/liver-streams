/**
 * 配信イベントのカード表示。サムネイル、タレント情報、配信状態を1枚のカードで表現する。
 *
 * ## 状態表示
 *
 * - 配信中（赤）、配信予定（黒）、配信済み（灰）で色分け
 * - 新着イベント、ブックマーク、通知のバッジ表示
 * - コラボメンバーのアイコン一覧
 *
 * ## インタラクション
 *
 * - クリックで詳細ポップオーバーを開く
 * - ホイールクリックでYouTubeを直接開く
 * - 右クリックでタレントをフォーカス検索
 * - マルチセレクトモード対応
 * - セクションの初回描画の後に追加されたカードは出現アニメーションする（`.time-section-card`）
 */
import { getThumbnail, hhss } from "@liver-streams/core";
import type { LiverEvent } from "@liver-streams/core";
import { memo } from "react";
import type { MouseEvent } from "react";
import { classNames } from "../../shared/lib";
import { getAffiliationLogo } from "../../shared/services";
import { useHoverStore, useMultiSelectStore, useSearchStore } from "../../shared/stores";
import { useLiverEvent } from "./useLiverEvent";

type Props = {
  liverEvent: LiverEvent;
  animateEnter?: boolean;
};

function LiverEventCard({ liverEvent, animateEnter = false }: Props) {
  // ホバー中のイベントのハッシュタグを持つか
  const hasHoveredHash = useHoverStore(
    (state) =>
      state.hoveredHashSet.size > 0 &&
      liverEvent.hashtagSet.intersection(state.hoveredHashSet).size > 0,
  );
  const isMultiSelected = useMultiSelectStore(
    (state) => state.isMultiSelectMode && state.multiSelectEventIdSet.has(liverEvent.id),
  );
  const {
    isUpcoming,
    isLive,
    isFinished,
    isHovered,
    liveDurationLabel: label,
    isNew,
    hasBookmark,
    hasNotify,
  } = useLiverEvent(liverEvent);

  const timeDisplay = (() => {
    const strs: string[] = [];

    // 開始時刻
    strs.push(hhss(liverEvent.startAt));
    // ライブ中
    if (liverEvent.isLive) {
      strs.push("-");
    }
    // 終了時刻
    if (isFinished) {
      strs.push("- 配信済み");
    }

    return strs.join(" ");
  })();

  const hash = liverEvent.hashtagList[0];

  // 通常クリック時はpreventしてダイアログを開き、ホイールクリックはリンクを開く
  function onClickCard(evt: MouseEvent) {
    evt.preventDefault();

    // マルチセレクトモードの場合はトグルして終了
    const { isMultiSelectMode, toggleMultiSelectEvent } = useMultiSelectStore.getState();
    if (isMultiSelectMode) {
      toggleMultiSelectEvent(liverEvent.id);
      return;
    }

    // idからpopover要素を取得
    const popover = document.getElementById(liverEvent.id);
    if (!popover) return;
    popover.togglePopover();
  }

  function setSearchString(str: string) {
    const { searchString, setSearchString } = useSearchStore.getState();
    const hashtag = `#${str}`;
    // 同じものなら検索を解除
    if (searchString === hashtag) {
      setSearchString("");
      return;
    }
    setSearchString(hashtag);
  }

  function setFocusedTalent(talent: string) {
    useSearchStore.getState().setFocusedTalent(talent);
  }

  return (
    <div
      className={classNames(animateEnter && "time-section-card", "group relative scroll-mt-16")}
      data-id="liver-event-card"
      data-event-id={`${liverEvent.id}`}
      onPointerOver={() => useHoverStore.getState().hoverEvent(liverEvent)}
      onPointerLeave={() => useHoverStore.getState().unhoverEvent()}
    >
      <a href={liverEvent.url} target="_blank" onClick={onClickCard}>
        <div
          className={classNames(
            "absolute top-0 left-0 z-20 flex -translate-y-1/2 flex-row items-center gap-1 rounded-full px-2 font-bold shadow-sm",
            isLive && "bg-red-600 text-white",
            isFinished && "bg-gray-300 text-gray-700",
            isUpcoming && "bg-gray-800 text-white",
          )}
        >
          {liverEvent.isLive && <i className="i-mdi-play-circle size-5" />}
          <span>{timeDisplay}</span>
          {label && (
            <>
              <span className="font-normal">{`(${label.fixed}h)`}</span>
              <div className="flex items-center opacity-50">
                {Array.from({ length: label.count }, (_, i) => i + 1).map((time) => (
                  <i key={time} className="i-mdi-clock size-4" />
                ))}
              </div>
            </>
          )}
        </div>

        <img
          src={getAffiliationLogo(liverEvent.affiliation)}
          className="absolute bottom-[4px] left-[4px] z-10 w-[clamp(14px,14px+0.4vw,20px)]"
          loading="lazy"
        />

        <div
          className={classNames(
            "flex h-[clamp(80px,80px+1vw,108px)] flex-row items-center justify-center gap-1 overflow-hidden rounded-xl rounded-tl-none border-2 shadow-md transition-colors",
            isUpcoming && !isHovered && "border-gray-800 bg-white",
            isFinished && !isHovered && "border-gray-600 bg-gray-50",
            isLive && !isHovered && "border-red-600 bg-white",
            isHovered && "border-amber-600 bg-amber-200",
          )}
        >
          <img
            src={liverEvent.talent.image}
            className="ml-1 w-[clamp(36px,36px+1vw,60px)] rounded-full bg-white transition-transform group-hover:scale-110"
            loading="lazy"
            onContextMenu={(e) => {
              e.preventDefault();
              setFocusedTalent(liverEvent.talent.name);
            }}
          />

          <div className="relative flex h-full flex-1 flex-col items-start justify-center pb-2 text-[clamp(11px,11px+0.25vw,14px)] tracking-tighter">
            <h3 className="line-clamp-1 font-bold">{liverEvent.talent.name}</h3>
            <div className="line-clamp-2 wrap-anywhere">{liverEvent.title}</div>
            <div className="absolute bottom-px z-10 flex flex-row">
              {liverEvent.collaboTalents.map((talent) => (
                <img
                  key={talent.image}
                  src={talent.image}
                  className="aspect-square w-[clamp(12px,12px+0.4vw,20px)] rounded-full outline-1 outline-gray-300 outline-solid hover:outline-2 hover:outline-red-500 hover:outline-solid"
                  title={talent.name}
                  loading="lazy"
                  onMouseEnter={() => useHoverStore.getState().setHoveredTalents(talent.name)}
                  onMouseLeave={() => useHoverStore.getState().clearHoveredTalents()}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setFocusedTalent(talent.name);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex aspect-video h-full overflow-hidden max-sm:w-[clamp(140px,30vw,200px)]">
            <img
              src={getThumbnail(liverEvent.thumbnail, "mq")}
              className="size-full object-cover transition-transform group-hover:scale-110"
              loading="lazy"
            />
          </div>

          <div className="absolute -top-4 right-0 z-10 flex">
            {isNew && (
              <div
                className="grid size-10 place-items-center rounded-full border-2 border-purple-800 bg-white shadow-md"
                title="new"
              >
                <i className="i-mdi-sparkles size-7 text-purple-600" />
              </div>
            )}
            {hasBookmark &&
              (hasNotify ? (
                <div
                  className="grid size-10 place-items-center rounded-full border-2 border-yellow-800 bg-white shadow-md"
                  title="bookmark"
                >
                  <i className="i-mdi-bell size-7 text-yellow-600" />
                </div>
              ) : (
                <div
                  className="grid size-10 place-items-center rounded-full border-2 border-green-800 bg-white shadow-md"
                  title="bookmark"
                >
                  <i className="i-mdi-bookmark size-7 text-green-600" />
                </div>
              ))}
          </div>

          {hash && (
            <div
              className={classNames(
                "absolute right-0 bottom-0 flex max-w-[50%] flex-row gap-1 overflow-hidden rounded-tl-[10px] p-1 shadow-md",
                hasHoveredHash && "bg-amber-600 text-amber-100",
                !hasHoveredHash && "bg-blue-600 text-blue-100",
              )}
              onContextMenu={(e) => {
                e.preventDefault();
                setSearchString(hash);
              }}
            >
              <span className="text-xs whitespace-nowrap">#{hash}</span>
            </div>
          )}

          {isMultiSelected && (
            <div className="absolute z-10 flex size-full items-center justify-end">
              <div className="absolute inset-0 rounded-xl bg-green-500/30" />

              <div className="absolute right-2 z-10 flex rounded-full bg-white">
                <i className="i-mdi-checkbox-marked-circle size-12 text-green-600" />
              </div>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

// 親のセクションが時刻で再描画されても、props と購読値が変わらないカードは描画し直さない
export default memo(LiverEventCard);
