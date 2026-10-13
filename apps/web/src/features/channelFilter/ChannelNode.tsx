/**
 * チャンネルツリーの再帰的なノード表示。グループノードとタレント名を階層構造で表示する。
 *
 * グループ単位でまとめてチェック/解除でき、子ノードのチェック状態に応じて親のチェック状態も連動する。
 */
import type { ChannelNode, EventService } from "@liver-streams/core";
import { useEffectEvent, useLayoutEffect, useRef } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { useSearchStore } from "../../shared/stores";
import { selectTalentFilterMap, useTalentFilterStore } from "./";

type Props = {
  node: ChannelNode;
  service: EventService;
  onChange?: () => void;
};

function splitChildren(node: ChannelNode) {
  const names: string[] = [];
  const childNodes: ChannelNode[] = [];
  node.children.forEach((child) => {
    if (typeof child === "string") {
      names.push(child);
    } else {
      childNodes.push(child);
    }
  });
  return { names, childNodes };
}

// 子孫ノードを含む全てのタレント名
function collectNames(node: ChannelNode): string[] {
  return node.children.flatMap((child) =>
    typeof child === "string" ? [child] : collectNames(child),
  );
}

function ChannelNodeComponent({ node, service, onChange }: Props) {
  const talentFilterMap = useTalentFilterStore(selectTalentFilterMap);

  const children = splitChildren(node);

  const groupEl = useRef<HTMLInputElement>(null);
  const namesEl = useRef<HTMLDivElement>(null);
  const childNodeEl = useRef<HTMLDivElement>(null);

  function onNameCheck(evt: ChangeEvent<HTMLInputElement>, name: string) {
    useTalentFilterStore.getState().setTalentFilter(name, evt.target.checked);

    update();
  }

  function update() {
    if (!namesEl.current || !groupEl.current) return;
    // 全ての名前がチェックされているか
    const inputs = [...namesEl.current.querySelectorAll("input")];
    const isAllChecked = inputs.every((input) => {
      return input.checked;
    });

    // 親ノードのチェック状態を変更
    groupEl.current.checked = isAllChecked;
    onChange?.();
  }

  const onMount = useEffectEvent(() => update());
  useLayoutEffect(() => {
    onMount();
  }, []);

  function onGroupClick(e: MouseEvent<HTMLInputElement>) {
    const { checked } = e.currentTarget;
    onChange?.();

    const { setTalentFilter } = useTalentFilterStore.getState();
    collectNames(node).forEach((name) => {
      setTalentFilter(name, checked);
    });

    // 子孫のグループのチェックボックスは状態を持たないため DOM を直接揃える
    childNodeEl.current?.querySelectorAll("input").forEach((input) => {
      input.checked = checked;
    });
  }

  async function onNodeChange() {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (!childNodeEl.current || !groupEl.current) return;

    // 子ノードが全てチェックされているか
    const childInputs = [...childNodeEl.current.querySelectorAll("input")];
    const isAllChecked = childInputs.every((input) => {
      return input.checked;
    });

    if (groupEl.current.checked === isAllChecked) return;

    // 子ノードの状態に応じて現ノードのチェック状態を変更
    groupEl.current.checked = isAllChecked;

    // 親に変更を通知
    onChange?.();
  }

  return (
    <div className="ml-4 flex flex-col items-start gap-2 text-sm font-bold select-none">
      <div className="flex flex-col items-start">
        <label className="flex h-9 cursor-pointer place-items-center gap-1 rounded-lg bg-gray-100 px-2 whitespace-nowrap hover:outline-2 hover:outline-solid has-checked:bg-red-200 has-checked:text-red-900 has-focus-visible:outline-solid">
          <input ref={groupEl} type="checkbox" className="sr-only" onClick={onGroupClick} />
          <i className="i-mdi-folder-open size-6"></i>
          <p>{node.name}</p>
        </label>
      </div>

      <div>
        {children.names.length > 0 && (
          <div ref={namesEl} className="ml-4 flex flex-col gap-px rounded-xl px-2 pt-1 pb-3">
            {children.names.map((name) => (
              <label
                key={name}
                className="group relative flex cursor-pointer place-items-center gap-2 hover:z-10 has-focus-visible:outline"
                title={name}
                onContextMenu={(e) => {
                  e.preventDefault();
                  useSearchStore.getState().setFocusedTalent(name);
                }}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  onChange={(e) => onNameCheck(e, name)}
                  checked={talentFilterMap.get(name) ?? false}
                />
                <img
                  src={service.getIcon(name)}
                  alt="icon"
                  className="size-[40px] rounded-full border bg-gray-200 outline-gray-800 group-hover:outline-2 group-hover:outline-solid"
                  loading="lazy"
                />
                <div className="rounded-lg bg-gray-100 px-2 py-1 group-hover:outline-2 group-hover:outline-solid group-has-checked:bg-red-200 group-has-checked:text-red-900 group-has-focus-visible:outline-2">
                  {name}
                </div>
              </label>
            ))}
          </div>
        )}
        {children.childNodes.length > 0 && (
          <div ref={childNodeEl} className="flex flex-col gap-2">
            {children.childNodes.map((child) => (
              <ChannelNodeComponent
                node={child}
                service={service}
                key={child.name}
                onChange={onNodeChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChannelNodeComponent;
