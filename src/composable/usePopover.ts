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

  // iOS safariではoutsideクリックで閉じないバグがあるのでハンドリングする
  let removeClickOutsideListener: (() => void) | null = null;

  useEventListener(popoverEl, "beforetoggle", (evt: ToggleEvent) => {
    isOpen.value = evt.newState === "open";
    removeClickOutsideListener?.();

    if (isOpen.value) {
      options.onShow?.();

      // popover出現後にoutsideクリックで閉じる処理を追加
      requestAnimationFrame(() => {
        removeClickOutsideListener = useEventListener(
          document,
          "click",
          (e) => {
            if (!popoverEl.value?.contains(e.target as Node)) {
              hidePopover();
            }
          },
          { once: true },
        );
      });
    } else {
      options.onHide?.();
    }
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
