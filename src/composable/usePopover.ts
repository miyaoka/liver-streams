import { useEventListener } from "@vueuse/core";
import { computed, defineComponent, ref } from "vue";

interface PopoverOptions {
  mountAfterOpen?: boolean;
  popoverId?: string;
  onShow?: () => void;
  onHide?: () => void;
}
export function usePopover(options: PopoverOptions = {}) {
  const { mountAfterOpen = false } = options;
  const popoverId = options.popoverId ? options.popoverId : `p-${crypto.randomUUID()}`;
  const popoverEl = ref<HTMLElement | null>(null);
  const isOpen = ref(false);

  useEventListener(popoverEl, "beforetoggle", (evt: ToggleEvent) => {
    isOpen.value = evt.newState === "open";

    if (isOpen.value && options.onShow) {
      options.onShow?.();
    }
    if (!isOpen.value && options.onHide) {
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
        if (!mountAfterOpen) return true;
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
