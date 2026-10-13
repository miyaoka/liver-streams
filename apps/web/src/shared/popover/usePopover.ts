/**
 * Popover API の要素を開閉するフック。描画は `Popover` コンポーネントが行う。
 *
 * ```tsx
 * const popover = usePopover({ onHide: () => setLastCloseTime(Date.now()) });
 *
 * <button onClick={popover.togglePopover}>{popover.isShow ? "閉じる" : "開く"}</button>
 * <Popover control={popover} className="...">
 *   中身（mountAtOpen が true なら開いている間だけマウントする）
 * </Popover>
 * ```
 *
 * - `popoverId` を渡すと要素の id になる。省略時は生成する。`popoverTarget` や
 *   `document.getElementById` から参照できる
 * - `onShow` / `onHide` は toggle イベントで開閉が確定したときに呼ぶ
 */
import { useEffect, useEffectEvent, useRef, useState } from "react";

interface PopoverOptions {
  /** 開いている間だけ中身をマウントする（既定 true） */
  mountAtOpen?: boolean;
  popoverId?: string;
  onShow?: () => void;
  onHide?: () => void;
}

export interface PopoverControl {
  popoverId: string;
  isShow: boolean;
  mountAtOpen: boolean;
  /** Popover コンポーネントが要素に渡す ref */
  setPopoverElement: (element: HTMLElement | null) => void;
  showPopover: () => void;
  hidePopover: () => void;
  togglePopover: () => void;
}

export function usePopover(options: PopoverOptions = {}): PopoverControl {
  const { mountAtOpen = true } = options;
  const [generatedId] = useState(() => `p-${crypto.randomUUID()}`);
  const popoverId = options.popoverId || generatedId;
  const [popoverElement, setPopoverElement] = useState<HTMLElement | null>(null);
  const [isShow, setIsShow] = useState(false);
  const removeOutsideListenersRef = useRef<(() => void) | null>(null);

  const onShow = useEffectEvent(() => options.onShow?.());
  const onHide = useEffectEvent(() => options.onHide?.());

  useEffect(() => {
    if (!popoverElement) return;

    const removeOutsideListeners = () => {
      removeOutsideListenersRef.current?.();
      removeOutsideListenersRef.current = null;
    };

    const onToggle = (evt: ToggleEvent) => {
      const isOpen = evt.newState === "open";
      setIsShow(isOpen);
      removeOutsideListeners();

      if (!isOpen) {
        onHide();
        return;
      }
      onShow();

      // iOS safariではoutsideクリックで閉じないバグがあるので閉じる処理を追加
      let popover: Element | null = null;
      // pointerdown時に親を取得
      const onPointerdown = (e: PointerEvent) => {
        popover = (e.target as HTMLElement).closest("[popover]");
      };
      // pointerup時にpopover外なら閉じる（別のpopover内でも閉じないようにする）
      const onPointerup = () => {
        if (popover) return;
        popoverElement.hidePopover();
      };
      document.addEventListener("pointerdown", onPointerdown);
      document.addEventListener("pointerup", onPointerup);
      removeOutsideListenersRef.current = () => {
        document.removeEventListener("pointerdown", onPointerdown);
        document.removeEventListener("pointerup", onPointerup);
      };
    };

    popoverElement.addEventListener("toggle", onToggle);
    return () => {
      popoverElement.removeEventListener("toggle", onToggle);
      removeOutsideListeners();
    };
  }, [popoverElement]);

  function showPopover() {
    popoverElement?.showPopover();
  }
  function hidePopover() {
    popoverElement?.hidePopover();
  }
  function togglePopover() {
    if (isShow) {
      hidePopover();
    } else {
      showPopover();
    }
  }

  return {
    popoverId,
    isShow,
    mountAtOpen,
    setPopoverElement,
    showPopover,
    hidePopover,
    togglePopover,
  };
}
