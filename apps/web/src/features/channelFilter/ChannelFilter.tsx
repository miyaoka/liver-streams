/**
 * タレントフィルターのポップオーバー。ホロライブ/にじさんじを切り替えて、グループ・タレント単位で表示対象を選択する。
 *
 * フィルター状態はプリセットとして名前付きで複数保存でき、切り替えて使用できる。
 */
import { hololiveChannels } from "@liver-streams/hololive";
import { nijisanjiChannels } from "@liver-streams/nijisanji";
import { computed, defineVaporComponent, ref } from "vue";
import { usePopover } from "../../shared/composables";
import { getAffiliationLogo, services } from "../../shared/services";
import ChannelNode from "./ChannelNode";
import FilterPresetSelector from "./FilterPresetSelector";
import { useTalentFilterStore } from "./";

const groups = [
  { key: "hololive", affiliation: "hololive" },
  { key: "にじさんじ", affiliation: "nijisanji" },
] as const;

const channels = [hololiveChannels, nijisanjiChannels];

export default defineVaporComponent(
  () => {
    const talentFilterStore = useTalentFilterStore();
    const popover = usePopover({
      popoverId: "filter",
    });

    const selectedGroup = ref<string>("hololive");
    const treeVersion = ref(0);

    const filterCount = computed(() => talentFilterStore.talentFilterMap.size);

    const rootNode = computed(() => {
      return channels.find((channel) => channel.name === selectedGroup.value);
    });

    const selectedService = computed(() => {
      const group = groups.find((g) => g.key === selectedGroup.value);
      if (!group) return undefined;
      return services.find((s) => s.affiliation === group.affiliation);
    });

    function reset() {
      talentFilterStore.resetTalentFilter();
      treeVersion.value++;
    }

    function onPresetLoaded() {
      treeVersion.value++;
    }

    return (
      <>
        <button
          class="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-100"
          popovertarget="filter"
        >
          <i class="i-mdi-person-outline size-[32px] text-gray-800" />
        </button>

        <popover.PopOver class="channel-filter-popover top-0 right-0 bottom-auto left-auto w-[350px] overflow-visible p-0">
          <div class="flex max-h-dvh flex-col overflow-hidden">
            <div class="flex min-h-11 place-items-center bg-gray-200 px-4 font-bold">
              <p>フィルター（{filterCount.value}）</p>

              <button
                class="absolute right-0 z-10 flex size-11 items-center justify-center text-gray-400 hover:text-gray-600"
                onClick={popover.hidePopover}
              >
                <i class="i-mdi-close size-6" />
              </button>
            </div>

            <div class="flex place-content-between p-4 shadow-sm">
              <fieldset class="flex gap-2">
                {groups.map((group) => (
                  <label
                    class="grid size-11 cursor-pointer place-items-center rounded-lg focus-within:outline hover:bg-gray-200 has-[input:checked]:bg-gray-200"
                    key={group.key}
                  >
                    <input
                      type="radio"
                      checked={selectedGroup.value === group.key}
                      onChange={() => (selectedGroup.value = group.key)}
                      value={group.key}
                      name="channel"
                      class="sr-only"
                    />
                    <img
                      src={getAffiliationLogo(group.affiliation)}
                      alt="icon"
                      class="size-[32px] rounded-full bg-white"
                    />
                  </label>
                ))}
              </fieldset>
              <button
                class="flex h-11 place-items-center rounded-full bg-slate-100 px-2"
                onClick={reset}
              >
                <i class="i-mdi-refresh size-8 text-gray-400" />
                <span>reset</span>
              </button>
            </div>

            {rootNode.value && selectedService.value && (
              <div
                class="-ml-4 flex-1 overflow-auto p-2 pt-4 pb-4"
                key={`${rootNode.value.name}-${treeVersion.value}`}
              >
                <ChannelNode node={rootNode.value} service={selectedService.value} />
              </div>
            )}

            <div class="bg-gray-800 px-4 py-3 shadow-[0_-2px_4px_rgba(0,0,0,0.08)]">
              <FilterPresetSelector onLoaded={onPresetLoaded} />
            </div>
          </div>
        </popover.PopOver>
      </>
    );
  },
  { name: "ChannelFilter" },
);
