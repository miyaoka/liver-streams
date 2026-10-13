/**
 * チャンネルツリーの再帰的なノード表示。グループノードとタレント名を階層構造で表示する。
 *
 * グループ単位でまとめてチェック/解除でき、子ノードのチェック状態に応じて親のチェック状態も連動する。
 */
import type { ChannelNode, EventService } from "@liver-streams/core";
import { computed, defineVaporComponent, onMounted, ref } from "vue";
import { asNativeEvent } from "../../shared/lib";
import { useSearchStore } from "../../shared/stores";
import { useTalentFilterStore } from "./";

type Props = {
  node: ChannelNode;
  service: EventService;
  onChange?: () => void;
};

const ChannelNodeComponent = defineVaporComponent(
  (props: Props) => {
    function getIcon(name: string): string {
      return props.service.getIcon(name);
    }

    const talentFilterStore = useTalentFilterStore();
    const searchStore = useSearchStore();

    const children = computed(() => {
      const names: string[] = [];
      const childNodes: ChannelNode[] = [];
      props.node.children.map((child) => {
        if (typeof child === "string") {
          names.push(child);
        } else {
          childNodes.push(child);
        }
      });
      return { names, childNodes };
    });

    const groupEl = ref<HTMLInputElement | null>(null);
    const namesEl = ref<HTMLElement | null>(null);
    const childNodeEl = ref<HTMLElement | null>(null);
    function onNameCheck(evt: Event, name: string) {
      const input = evt.target as HTMLInputElement;
      talentFilterStore.setTalentFilter(name, input.checked);

      update();
    }

    function update() {
      if (!namesEl.value || !groupEl.value) return;
      // 全ての名前がチェックされているか
      const inputs = [...namesEl.value.querySelectorAll("input")];
      const isAllChecked = inputs.every((input) => {
        return input.checked;
      });

      // 親ノードのチェック状態を変更
      groupEl.value.checked = isAllChecked;
      props.onChange?.();
    }

    onMounted(async () => {
      update();
    });

    function onGroupClick(e: Event) {
      const group = e.target as HTMLInputElement;
      props.onChange?.();

      children.value.names.forEach((name) => {
        talentFilterStore.setTalentFilter(name, group.checked);
      });

      if (childNodeEl.value) {
        const childInputs = [...childNodeEl.value.querySelectorAll("input")];

        childInputs.forEach((input) => {
          input.checked = group.checked;
          // コンポーネントに変更を通知する
          input.dispatchEvent(new Event("change"));
        });
      }
    }

    async function onNodeChange() {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      if (!childNodeEl.value || !groupEl.value) return;

      // 子ノードが全てチェックされているか
      const childInputs = [...childNodeEl.value.querySelectorAll("input")];
      const isAllChecked = childInputs.every((input) => {
        return input.checked;
      });

      if (groupEl.value.checked === isAllChecked) return;

      // 子ノードの状態に応じて現ノードのチェック状態を変更
      groupEl.value.checked = isAllChecked;

      // 親に変更を通知
      props.onChange?.();
    }

    return (
      <div class="ml-4 flex flex-col items-start gap-2 text-sm font-bold select-none">
        <div class="flex flex-col items-start">
          <label class="flex h-9 cursor-pointer place-items-center gap-1 rounded-lg bg-gray-100 px-2 whitespace-nowrap hover:outline-2 hover:outline-solid has-checked:bg-red-200 has-checked:text-red-900 has-focus-visible:outline-solid">
            <input
              ref={groupEl}
              type="checkbox"
              class="sr-only"
              onClick={(e) => onGroupClick(asNativeEvent<MouseEvent>(e))}
            />
            <i class="i-mdi-folder-open size-6"></i>
            <p>{props.node.name}</p>
          </label>
        </div>

        <div>
          {children.value.names.length > 0 && (
            <div ref={namesEl} class="ml-4 flex flex-col gap-px rounded-xl px-2 pt-1 pb-3">
              {children.value.names.map((name) => (
                <label
                  key={name}
                  class="group relative flex cursor-pointer place-items-center gap-2 hover:z-10 has-focus-visible:outline"
                  title={name}
                  onContextmenu={(e) => {
                    e.preventDefault();
                    searchStore.setFocusedTalent(name);
                  }}
                >
                  <input
                    type="checkbox"
                    class="sr-only"
                    onChange={(e) => onNameCheck(asNativeEvent<Event>(e), name)}
                    checked={talentFilterStore.talentFilterMap.get(name)}
                  />
                  <img
                    src={getIcon(name)}
                    alt="icon"
                    class="size-[40px] rounded-full border bg-gray-200 outline-gray-800 group-hover:outline-2 group-hover:outline-solid"
                    loading="lazy"
                  />
                  <div class="rounded-lg bg-gray-100 px-2 py-1 group-hover:outline-2 group-hover:outline-solid group-has-checked:bg-red-200 group-has-checked:text-red-900 group-has-focus-visible:outline-2">
                    {name}
                  </div>
                </label>
              ))}
            </div>
          )}
          {children.value.childNodes.length > 0 && (
            <div ref={childNodeEl} class="flex flex-col gap-2">
              {children.value.childNodes.map((child) => (
                <ChannelNodeComponent
                  node={child}
                  service={props.service}
                  key={child.name}
                  onChange={onNodeChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
  { name: "ChannelNode", props: ["node", "service", "onChange"] },
);

export default ChannelNodeComponent;
