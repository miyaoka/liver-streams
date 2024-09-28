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
  const isOpen = ref(false);

  let removePointerdownListener: (() => void) | null = null;

  useEventListener(popoverEl, "beforetoggle", async (evt: ToggleEvent) => {
    isOpen.value = evt.newState === "open";
    removePointerdownListener?.();

    // 開閉時のハンドラ処理
    if (!isOpen.value) {
      options.onHide?.();
      return;
    }
    options.onShow?.();

    // popoverの描画を待つ
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // iOS safariではoutsideクリックで閉じないバグがあるので閉じる処理を追加
    removePointerdownListener = useEventListener(document, "pointerdown", (e) => {
      const target = e.target as HTMLElement;
      const popover = target.closest("[popover]");

      // popover内なら無視する（別のpopover内でも閉じないようにする）
      if (popover) return;

      useEventListener(
        document,
        "pointerup",
        () => {
          hidePopover();
        },
        { once: true },
      );
    });
  });

  function showPopover() {
    popoverEl.value?.showPopover();
  }
  function hidePopover() {
    popoverEl.value?.hidePopover();
  }
  function togglePopover() {
    popoverEl.value?.togglePopover();
  }

  const PopOver = defineComponent({
    setup() {
      const isMountable = computed(() => {
        if (!mountAtOpen) return true;
        return isOpen.value;
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
    showPopover,
    hidePopover,
    togglePopover,
  };
}
