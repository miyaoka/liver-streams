/**
 * 検索フィルターの入力 UI。クリックで展開し、入力中は遅延実行で検索クエリを更新する。
 *
 * 外部から検索文字列が設定された場合（タレント名クリックなど）は自動で展開する。
 */
import { defineVaporComponent, ref, watch } from "vue";
import { useSearchStore } from "../../shared/stores";

export default defineVaporComponent(
  () => {
    const searchStore = useSearchStore();
    const inputEl = ref<HTMLInputElement | null>(null);

    const searchQuery = ref<string>("");
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const isInput = ref(false);

    // 入力文字によるフィルタを遅延実行
    function onInput() {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        searchStore.setSearchString(searchQuery.value);
      }, 500);
    }

    function onSubmit() {
      inputEl.value?.blur();
    }

    // clickより先にblurが発火するためmousedownしたかを保存
    let isMouseDown = false;
    function onMousedown() {
      isMouseDown = true;
    }
    function onBlur() {
      // mousedownした場合はclickで処理させるためblurを無視
      if (isMouseDown) return;
      if (searchQuery.value === "") {
        isInput.value = false;
      }
    }
    function onClick() {
      isInput.value = !isInput.value;
      isMouseDown = false;
      if (isInput.value) {
        // open
        inputEl.value?.focus();
      } else {
        // close
        searchStore.setSearchString("");
        searchQuery.value = "";
      }
    }

    watch(
      () => searchStore.searchString,
      (newVal) => {
        searchQuery.value = newVal;
        isInput.value = newVal !== "";
      },
      { immediate: true },
    );

    return (
      <div class="group flex flex-row items-center justify-center overflow-hidden rounded-full bg-white shadow-md hover:bg-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          class={[
            "h-full transition-[width]",
            {
              "w-56": isInput.value,
              "w-0": !isInput.value,
            },
          ]}
        >
          <input
            class="size-full rounded-l-full p-2 pl-4 text-base"
            ref={inputEl}
            v-model={searchQuery.value}
            onInput={onInput}
            onBlur={onBlur}
          />
        </form>
        <button
          class="z-30 flex size-11 items-center justify-center rounded-full group-hover:bg-gray-100"
          onClick={onClick}
          onMousedown={onMousedown}
          title="search"
        >
          <i
            class={[
              "size-8 text-gray-800",
              { "i-mdi-close": isInput.value, "i-mdi-search": !isInput.value },
            ]}
          />
        </button>
      </div>
    );
  },
  { name: "SearchFilter" },
);
