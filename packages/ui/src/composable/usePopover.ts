import { useEventListener } from "@vueuse/core";
import { computed, defineComponent, ref } from "vue";

interface PopoverOptions {
  mountAtOpen?: boolean;
  popoverId?: string;
  onShow?: () => void;
  onHide?: () => void;
}
export function usePopover(options: PopoverOptions = {}) {
  const { mountAtOpen = true } = options;
  const popoverId = options.popoverId || `p-${crypto.randomUUID()}`;
  const popoverEl = ref<HTMLElement | null>(null);
  const isShow = ref(false);

  let removePointerdownListener: (() => void) | null = null;
  let removePointerupListener: (() => void) | null = null;

  useEventListener(popoverEl, "toggle", async (evt: ToggleEvent) => {
    isShow.value = evt.newState === "open";
    removePointerdownListener?.();
    removePointerupListener?.();

    // 開閉時のハンドラ処理
    if (!isShow.value) {
      options.onHide?.();
      return;
    }
    options.onShow?.();

    let popover: Element | null = null;

    // iOS safariではoutsideクリックで閉じないバグがあるので閉じる処理を追加
    // pointerdown時に親を取得
    removePointerdownListener = useEventListener(document, "pointerdown", (e) => {
      const target = e.target as HTMLElement;
      popover = target.closest("[popover]");
    });

    // pointerup時にpopover外なら閉じる
    removePointerupListener = useEventListener(document, "pointerup", () => {
      // popover内なら無視する（別のpopover内でも閉じないようにする）
      if (popover) return;
      hidePopover();
    });
  });

  function showPopover() {
    popoverEl.value?.showPopover();
  }
  function hidePopover() {
    popoverEl.value?.hidePopover();
  }
  function togglePopover() {
    if (isShow.value) {
      hidePopover();
    } else {
      showPopover();
    }
  }

  const PopOver = defineComponent({
    setup() {
      const isMountable = computed(() => {
        if (!mountAtOpen) return true;
        return isShow.value;
      });

      return {
        popoverEl,
        popoverId,
        isMountable,
      };
    },
    template: `
      <div
        ref="popoverEl"
        :id="popoverId"
        popover
      >
        <template v-if="isMountable">
          <slot />
        </template>
      </div>
    `,
  });

  return {
    PopOver,
    popoverId,
    isShow,
    showPopover,
    hidePopover,
    togglePopover,
  };
}
