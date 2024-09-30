import { type LiverEvent } from "@/services/api";

export function splitAndCategorize(input: string): { quoted: string[]; unquoted: string[] } {
  const regex = /"([^"]*)"|(\S+)/g;
  const quoted: string[] = [];
  const unquoted: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // グループ1がマッチした場合（""内の文字列）
    if (match[1]) {
      quoted.push(match[1]); // 追加: ""で囲まれた文字列
    } else if (match[2]) {
      unquoted.push(match[2]); // 追加: スペースで区切られた文字列
    }
  }

  return { quoted, unquoted }; // それぞれの配列を返す
}

export function getFilteredEventList({
  liverEventList,
  filterMap,
  filterEnabled,
  searchTerms,
  focusedTalent,
  isLiveOnly,
}: {
  liverEventList: LiverEvent[];
  filterMap: Map<string, boolean>;
  filterEnabled: boolean;
  searchTerms: string[];
  focusedTalent: string | null;
  isLiveOnly: boolean;
}): LiverEvent[] {
  // 単一セレクト時
  if (focusedTalent) {
    return liverEventList.filter((video) => {
      return (
        video.talent.name === focusedTalent ||
        video.collaboTalents.some((collaborator) => {
          return collaborator.name === focusedTalent;
        })
      );
    });
  }

  // 検索語をスペースで分割してOR検索
  const searchRegExp = searchTerms.length > 0 ? new RegExp(searchTerms.join("|"), "i") : null;

  return (
    liverEventList
      // talentでフィルタリング
      .filter((liverEvent) => talentFilter({ filterEnabled, filterMap, liverEvent }))
      .filter((liverEvent) => {
        // live中のみ表示
        if (!isLiveOnly) return true;
        return liverEvent.isLive;
      })
      .filter((liverEvent) => {
        // 検索語にマッチしたイベントのみ表示
        if (!searchRegExp) return true;
        return (
          searchRegExp.test(liverEvent.title) ||
          searchRegExp.test(liverEvent.talent.name) ||
          liverEvent.collaboTalents.some((collaborator) => {
            return searchRegExp.test(collaborator.name);
          })
        );
      })
  );
}

export function talentFilter({
  filterEnabled,
  filterMap,
  liverEvent,
}: {
  filterEnabled: boolean;
  filterMap: Map<string, boolean>;
  liverEvent: LiverEvent;
}) {
  // フィルタなし
  if (!filterEnabled || filterMap.size === 0) return true;

  // タレント名かコラボタレント名がフィルターに含まれる動画のみ表示
  return (
    filterMap.has(liverEvent.talent.name) ||
    liverEvent.collaboTalents.some((collaborator) => {
      return filterMap.has(collaborator.name);
    })
  );
}
