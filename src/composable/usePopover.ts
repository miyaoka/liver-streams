import { useEventListener } from "@vueuse/core";
import { computed, defineComponent, ref } from "vue";

interface PopoverOptions {
  mountAtOpen?: boolean;
  popoverId?: string;
  onShow?: () => void;
  onHide?: () => void;
}
export function usePopover(options: PopoverOptions = {}) {
  const { mountAtOpen = false } = options;
  const popoverId = options.popoverId ? options.popoverId : `p-${crypto.randomUUID()}`;
  const popoverEl = ref<HTMLElement | null>(null);
  const isOpen = ref(false);

  let removeClickOutsideListener: (() => void) | null = null;

  useEventListener(popoverEl, "beforetoggle", (evt: ToggleEvent) => {
    isOpen.value = evt.newState === "open";
    removeClickOutsideListener?.();

    // 開閉時のハンドラ処理
    if (!isOpen.value) {
      options.onHide?.();
      return;
    }
    options.onShow?.();

    // popoverの描画を待つ
    requestAnimationFrame(() => {
      // iOS safariではoutsideクリックで閉じないバグがあるので閉じる処理を追加
      removeClickOutsideListener = useEventListener(document, "click", (e) => {
        // popover内のクリックは無視
        if (!popoverEl.value?.contains(e.target as Node)) {
          hidePopover();
        }
      });
    });
  });

  function showPopover() {
    popoverEl.value?.showPopover();
  }
  function hidePopover() {
    popoverEl.value?.hidePopover();
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
  };
}
