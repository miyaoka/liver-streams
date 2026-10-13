import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createStore } from "zustand/vanilla";
import { bindLocalStorageItem, createLocalStorageItem } from "./localStorage";

const key = "test-key";

function dispatchStorage(init: StorageEventInit) {
  window.dispatchEvent(new StorageEvent("storage", { storageArea: localStorage, ...init }));
}

beforeEach(() => {
  localStorage.clear();
});

describe("createLocalStorageItem", () => {
  describe("Map", () => {
    it("entries の配列を JSON で保存する", () => {
      const item = createLocalStorageItem(key, new Map<string, string>());
      item.write(
        new Map([
          ["a", "bookmark"],
          ["b", "notify"],
        ]),
      );
      expect(localStorage.getItem(key)).toBe('[["a","bookmark"],["b","notify"]]');
    });

    it("entries の配列の JSON から Map を読む", () => {
      localStorage.setItem(key, '[["a","bookmark"]]');
      const item = createLocalStorageItem(key, new Map<string, string>());
      expect(item.read()).toEqual(new Map([["a", "bookmark"]]));
    });
  });

  describe("boolean", () => {
    it("文字列の true / false で保存する", () => {
      const item = createLocalStorageItem(key, true);
      item.write(false);
      expect(localStorage.getItem(key)).toBe("false");
      item.write(true);
      expect(localStorage.getItem(key)).toBe("true");
    });

    it("true 以外の文字列は false として読む", () => {
      localStorage.setItem(key, "false");
      expect(createLocalStorageItem(key, true).read()).toBe(false);
      localStorage.setItem(key, "yes");
      expect(createLocalStorageItem(key, true).read()).toBe(false);
    });
  });

  describe("配列", () => {
    it("JSON で保存し、JSON から読む", () => {
      const item = createLocalStorageItem<{ id: string }[]>(key, []);
      item.write([{ id: "x" }]);
      expect(localStorage.getItem(key)).toBe('[{"id":"x"}]');
      expect(createLocalStorageItem<{ id: string }[]>(key, []).read()).toEqual([{ id: "x" }]);
    });
  });

  describe("既定値が null", () => {
    it("文字列をそのまま保存し、そのまま読む", () => {
      const item = createLocalStorageItem<string | null>(key, null);
      item.write("preset-1");
      expect(localStorage.getItem(key)).toBe("preset-1");
      expect(createLocalStorageItem<string | null>(key, null).read()).toBe("preset-1");
    });

    it("キーが無ければ null を返し、書き込まない", () => {
      const item = createLocalStorageItem<string | null>(key, null);
      expect(item.read()).toBeNull();
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  it("キーが無ければ既定値を書き込んで返す", () => {
    const item = createLocalStorageItem(key, true);
    expect(item.read()).toBe(true);
    expect(localStorage.getItem(key)).toBe("true");
  });

  it("null を書き込むとキーを削除する", () => {
    localStorage.setItem(key, "preset-1");
    const item = createLocalStorageItem<string | null>(key, null);
    item.write(null);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("壊れた値は既定値として読む", () => {
    localStorage.setItem(key, "{broken");
    const consoleError = mock();
    const original = console.error;
    console.error = consoleError;
    try {
      const defaults: string[] = [];
      expect(createLocalStorageItem(key, defaults).read()).toBe(defaults);
      expect(consoleError).toHaveBeenCalledTimes(1);
    } finally {
      console.error = original;
    }
  });

  describe("別タブでの変更", () => {
    it("同じキーの変更を受け取る", () => {
      const item = createLocalStorageItem(key, new Map<string, string>());
      item.read();
      const listener = mock();
      const unsubscribe = item.subscribe(listener);
      dispatchStorage({ key, newValue: '[["a","notify"]]' });
      unsubscribe();
      expect(listener).toHaveBeenCalledWith(new Map([["a", "notify"]]));
    });

    it("別のキー・別のストレージ・同じ値の変更は無視する", () => {
      const item = createLocalStorageItem(key, true);
      item.read();
      const listener = mock();
      const unsubscribe = item.subscribe(listener);
      dispatchStorage({ key: "other", newValue: "false" });
      window.dispatchEvent(
        new StorageEvent("storage", { key, newValue: "false", storageArea: sessionStorage }),
      );
      dispatchStorage({ key, newValue: "true" });
      unsubscribe();
      expect(listener).not.toHaveBeenCalled();
    });

    it("キーが削除されたら既定値を書き込んで既定値を渡す", () => {
      const item = createLocalStorageItem(key, true);
      item.write(false);
      const listener = mock();
      const unsubscribe = item.subscribe(listener);
      localStorage.removeItem(key);
      dispatchStorage({ key, newValue: null });
      unsubscribe();
      expect(listener).toHaveBeenCalledWith(true);
      expect(localStorage.getItem(key)).toBe("true");
    });

    it("clear されたら既定値を渡す", () => {
      const item = createLocalStorageItem(key, true);
      item.write(false);
      const listener = mock();
      const unsubscribe = item.subscribe(listener);
      dispatchStorage({ key: null });
      unsubscribe();
      expect(listener).toHaveBeenCalledWith(true);
    });
  });
});

describe("bindLocalStorageItem", () => {
  it("フィールドの参照が変わったら保存し、別タブの変更を store に反映する", () => {
    const item = createLocalStorageItem(key, new Map<string, boolean>());
    const store = createStore<{ map: Map<string, boolean>; other: number }>()(() => ({
      map: item.read(),
      other: 0,
    }));
    bindLocalStorageItem(store, "map", item);

    store.setState({ map: new Map([["a", true]]) });
    expect(localStorage.getItem(key)).toBe('[["a",true]]');

    localStorage.setItem(key, "[]");
    store.setState({ other: 1 });
    expect(localStorage.getItem(key)).toBe("[]");

    dispatchStorage({ key, newValue: '[["b",true]]' });
    expect(store.getState().map).toEqual(new Map([["b", true]]));
  });
});
