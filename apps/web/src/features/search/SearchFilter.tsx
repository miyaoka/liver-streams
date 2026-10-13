/**
 * 検索フィルターの入力 UI。クリックで展開し、入力中は遅延実行で検索クエリを更新する。
 * IME の変換中は検索を走らせず、変換の確定で遅延検索を始める。
 *
 * 外部から検索文字列が設定された場合（タレント名クリックなど）は自動で展開する。
 */
import { useRef, useState } from "react";
import type { ChangeEvent, CompositionEvent } from "react";
import { classNames } from "../../shared/lib";
import { useSearchStore } from "../../shared/stores";

const searchDelay = 500;

export default function SearchFilter() {
  const searchString = useSearchStore((state) => state.searchString);
  const inputEl = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState(searchString);
  const [isInput, setIsInput] = useState(searchString !== "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComposingRef = useRef(false);
  // clickより先にblurが発火するためmousedownしたかを保存
  const isMouseDownRef = useRef(false);

  function clearSearchTimeout() {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  // 入力文字によるフィルタを遅延実行
  function scheduleSearch(value: string) {
    clearSearchTimeout();
    timeoutRef.current = setTimeout(() => {
      useSearchStore.getState().setSearchString(value);
    }, searchDelay);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    if (isComposingRef.current) {
      clearSearchTimeout();
      return;
    }
    scheduleSearch(e.target.value);
  }

  function onCompositionStart() {
    isComposingRef.current = true;
  }

  function onCompositionEnd(e: CompositionEvent<HTMLInputElement>) {
    isComposingRef.current = false;
    scheduleSearch(e.currentTarget.value);
  }

  function onSubmit() {
    inputEl.current?.blur();
  }

  function onMouseDown() {
    isMouseDownRef.current = true;
  }
  function onBlur() {
    // mousedownした場合はclickで処理させるためblurを無視
    if (isMouseDownRef.current) return;
    if (searchQuery === "") {
      setIsInput(false);
    }
  }
  function onClick() {
    const nextIsInput = !isInput;
    setIsInput(nextIsInput);
    isMouseDownRef.current = false;
    if (nextIsInput) {
      // open
      inputEl.current?.focus();
      return;
    }
    // close
    useSearchStore.getState().setSearchString("");
    setSearchQuery("");
  }

  // 検索文字列が変わったら入力欄に反映する
  const [prevSearchString, setPrevSearchString] = useState(searchString);
  if (searchString !== prevSearchString) {
    setPrevSearchString(searchString);
    setSearchQuery(searchString);
    setIsInput(searchString !== "");
  }

  return (
    <div className="group flex flex-row items-center justify-center overflow-hidden rounded-full bg-white shadow-md hover:bg-gray-100">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={classNames("h-full transition-[width]", isInput ? "w-56" : "w-0")}
      >
        <input
          className="size-full rounded-l-full p-2 pl-4 text-base"
          ref={inputEl}
          value={searchQuery}
          onChange={onChange}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          onBlur={onBlur}
        />
      </form>
      <button
        className="z-30 flex size-11 items-center justify-center rounded-full group-hover:bg-gray-100"
        onClick={onClick}
        onMouseDown={onMouseDown}
        title="search"
      >
        <i
          className={classNames("size-8 text-gray-800", isInput ? "i-mdi-close" : "i-mdi-search")}
        />
      </button>
    </div>
  );
}
