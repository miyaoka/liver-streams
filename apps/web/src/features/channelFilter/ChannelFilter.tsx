/**
 * タレントフィルターのポップオーバー。ホロライブ/にじさんじを切り替えて、グループ・タレント単位で表示対象を選択する。
 *
 * フィルター状態はプリセットとして名前付きで複数保存でき、切り替えて使用できる。
 */
import { hololiveChannels } from "@liver-streams/hololive";
import { nijisanjiChannels } from "@liver-streams/nijisanji";
import { useState } from "react";
import { Popover, usePopover } from "../../shared/popover";
import { getAffiliationLogo, services } from "../../shared/services";
import ChannelNode from "./ChannelNode";
import FilterPresetSelector from "./FilterPresetSelector";
import { selectTalentFilterMap, useTalentFilterStore } from "./";

const groups = [
  { key: "hololive", affiliation: "hololive" },
  { key: "にじさんじ", affiliation: "nijisanji" },
] as const;

const channels = [hololiveChannels, nijisanjiChannels];

export default function ChannelFilter() {
  const talentFilterMap = useTalentFilterStore(selectTalentFilterMap);
  const popover = usePopover({
    popoverId: "filter",
  });

  const [selectedGroup, setSelectedGroup] = useState<string>("hololive");
  const [treeVersion, setTreeVersion] = useState(0);

  const filterCount = talentFilterMap.size;

  const rootNode = channels.find((channel) => channel.name === selectedGroup);

  const group = groups.find((g) => g.key === selectedGroup);
  const selectedService = group
    ? services.find((s) => s.affiliation === group.affiliation)
    : undefined;

  function reset() {
    useTalentFilterStore.getState().resetTalentFilter();
    setTreeVersion((v) => v + 1);
  }

  function onPresetLoaded() {
    setTreeVersion((v) => v + 1);
  }

  return (
    <>
      <button
        className="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-100"
        popoverTarget="filter"
      >
        <i className="i-mdi-person-outline size-[32px] text-gray-800" />
      </button>

      <Popover
        control={popover}
        className="channel-filter-popover top-0 right-0 bottom-auto left-auto w-[350px] overflow-visible p-0"
      >
        <div className="flex max-h-dvh flex-col overflow-hidden">
          <div className="flex min-h-11 place-items-center bg-gray-200 px-4 font-bold">
            <p>フィルター（{filterCount}）</p>

            <button
              className="absolute right-0 z-10 flex size-11 items-center justify-center text-gray-400 hover:text-gray-600"
              onClick={popover.hidePopover}
            >
              <i className="i-mdi-close size-6" />
            </button>
          </div>

          <div className="flex place-content-between p-4 shadow-sm">
            <fieldset className="flex gap-2">
              {groups.map((group) => (
                <label
                  className="grid size-11 cursor-pointer place-items-center rounded-lg focus-within:outline hover:bg-gray-200 has-[input:checked]:bg-gray-200"
                  key={group.key}
                >
                  <input
                    type="radio"
                    checked={selectedGroup === group.key}
                    onChange={() => setSelectedGroup(group.key)}
                    value={group.key}
                    name="channel"
                    className="sr-only"
                  />
                  <img
                    src={getAffiliationLogo(group.affiliation)}
                    alt="icon"
                    className="size-[32px] rounded-full bg-white"
                  />
                </label>
              ))}
            </fieldset>
            <button
              className="flex h-11 place-items-center rounded-full bg-slate-100 px-2"
              onClick={reset}
            >
              <i className="i-mdi-refresh size-8 text-gray-400" />
              <span>reset</span>
            </button>
          </div>

          {rootNode && selectedService && (
            <div
              className="-ml-4 flex-1 overflow-auto p-2 pt-4 pb-4"
              key={`${rootNode.name}-${treeVersion}`}
            >
              <ChannelNode node={rootNode} service={selectedService} />
            </div>
          )}

          <div className="bg-gray-800 px-4 py-3 shadow-[0_-2px_4px_rgba(0,0,0,0.08)]">
            <FilterPresetSelector onLoaded={onPresetLoaded} />
          </div>
        </div>
      </Popover>
    </>
  );
}
