import { beforeEach, describe, expect, it } from "bun:test";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { createLocalStoragePersist } from "./localStorage";

const key = "test-key";

function createPersistedStore<T>(defaults: T) {
  const persisted = { value: defaults };
  const { options } = createLocalStoragePersist("test", { value: key }, persisted);
  return createStore<{ value: T }>()(persist(() => ({ ...persisted }), options));
}

beforeEach(() => {
  localStorage.clear();
});

describe("createLocalStoragePersist", () => {
  describe("Map", () => {
    it("entries の配列を JSON で保存する", () => {
      const store = createPersistedStore(new Map<string, string>());
      store.setState({
        value: new Map([
          ["a", "bookmark"],
          ["b", "notify"],
        ]),
      });
      expect(localStorage.getItem(key)).toBe('[["a","bookmark"],["b","notify"]]');
    });

    it("保存済みの entries の JSON から Map を読む", () => {
      localStorage.setItem(key, '[["a","bookmark"]]');
      const store = createPersistedStore(new Map<string, string>());
      expect(store.getState().value).toEqual(new Map([["a", "bookmark"]]));
    });
  });

  describe("boolean", () => {
    it("文字列の true / false で保存する", () => {
      const store = createPersistedStore(true);
      store.setState({ value: false });
      expect(localStorage.getItem(key)).toBe("false");
      store.setState({ value: true });
      expect(localStorage.getItem(key)).toBe("true");
    });

    it("保存済みの文字列を読む", () => {
      localStorage.setItem(key, "false");
      expect(createPersistedStore(true).getState().value).toBe(false);
    });
  });

  describe("配列", () => {
    it("JSON で保存する", () => {
      const store = createPersistedStore<{ id: string }[]>([]);
      store.setState({ value: [{ id: "x" }] });
      expect(localStorage.getItem(key)).toBe('[{"id":"x"}]');
    });

    it("保存済みの JSON を読む", () => {
      localStorage.setItem(key, '[{"id":"x"}]');
      expect(createPersistedStore<{ id: string }[]>([]).getState().value).toEqual([{ id: "x" }]);
    });
  });

  describe("既定値が null", () => {
    it("文字列をそのまま保存する", () => {
      const store = createPersistedStore<string | null>(null);
      store.setState({ value: "preset-1" });
      expect(localStorage.getItem(key)).toBe("preset-1");
    });

    it("保存済みの文字列をそのまま読む", () => {
      localStorage.setItem(key, "preset-1");
      expect(createPersistedStore<string | null>(null).getState().value).toBe("preset-1");
    });

    it("null にするとキーを削除する", () => {
      localStorage.setItem(key, "preset-1");
      const store = createPersistedStore<string | null>(null);
      store.setState({ value: null });
      expect(localStorage.getItem(key)).toBeNull();
    });
  });
});
