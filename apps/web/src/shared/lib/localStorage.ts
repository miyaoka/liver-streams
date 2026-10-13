/**
 * localStorage の 1 キーを読み書きする。
 *
 * 保存形式と挙動は @vueuse/core 15.0.0 の useLocalStorage と同じにしてあり、
 * それで保存済みの利用者のデータをそのまま読める。
 *
 * ```ts
 * const item = createLocalStorageItem("key", new Map<string, boolean>());
 * export const useXxxStore = create<State>()(() => ({ map: item.read() }));
 * bindLocalStorageItem(useXxxStore, "map", item);
 * ```
 */
import type { StoreApi } from "zustand";

interface Serializer {
  read: (raw: string) => unknown;
  write: (value: unknown) => string;
}

type SerializerType = "map" | "boolean" | "object" | "any";

const serializers: Record<SerializerType, Serializer> = {
  map: {
    read: (raw) => new Map(JSON.parse(raw)),
    write: (value) => JSON.stringify([...(value as Map<unknown, unknown>).entries()]),
  },
  boolean: {
    read: (raw) => raw === "true",
    write: (value) => String(value),
  },
  object: {
    read: (raw) => JSON.parse(raw),
    write: (value) => JSON.stringify(value),
  },
  any: {
    read: (raw) => raw,
    write: (value) => String(value),
  },
};

function guessSerializerType(defaults: unknown): SerializerType {
  if (defaults === null) return "any";
  if (defaults instanceof Map) return "map";
  if (typeof defaults === "boolean") return "boolean";
  if (typeof defaults === "object" && !(defaults instanceof Set) && !(defaults instanceof Date)) {
    return "object";
  }
  throw new Error(
    `unsupported localStorage default value: ${Object.prototype.toString.call(defaults)}`,
  );
}

export interface LocalStorageItem<T> {
  /** 保存値を読む。キーが無ければ既定値を返し、既定値が null でなければ書き込む */
  read: () => T;
  /** 値を保存する。null はキーを削除する */
  write: (value: T) => void;
  /** 別タブでの変更を受け取る。戻り値で購読を解除する */
  subscribe: (listener: (value: T) => void) => () => void;
}

export function createLocalStorageItem<T>(key: string, defaults: T): LocalStorageItem<T> {
  const serializer = serializers[guessSerializerType(defaults)];
  // メモリ上の値を直列化したもの。別タブから同じ値が届いたときに更新を省く
  let currentSerialized: string | null = null;

  function serialize(value: T): string | null {
    if (value == null) return null;
    return serializer.write(value);
  }

  function parse(raw: string | null): T {
    if (raw === null) {
      if (defaults !== null) localStorage.setItem(key, serializer.write(defaults));
      return defaults;
    }
    return serializer.read(raw) as T;
  }

  function read(): T {
    try {
      const value = parse(localStorage.getItem(key));
      currentSerialized = serialize(value);
      return value;
    } catch (error) {
      console.error(error);
      currentSerialized = serialize(defaults);
      return defaults;
    }
  }

  function write(value: T) {
    try {
      const serialized = serialize(value);
      currentSerialized = serialized;
      if (serialized === null) {
        localStorage.removeItem(key);
        return;
      }
      if (localStorage.getItem(key) === serialized) return;
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(error);
    }
  }

  function subscribe(listener: (value: T) => void) {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      // localStorage.clear() はキーが null で届く
      if (event.key === null) {
        listener(defaults);
        return;
      }
      if (event.key !== key) return;
      if (event.newValue === currentSerialized) return;
      try {
        listener(parse(event.newValue));
      } catch (error) {
        console.error(error);
      }
    };
    window.addEventListener("storage", onStorage, { passive: true });
    return () => window.removeEventListener("storage", onStorage);
  }

  return { read, write, subscribe };
}

/**
 * store の 1 フィールドを localStorage と同期する。
 * フィールドの参照が変わったら保存し、別タブでの変更を store に反映する。
 */
export function bindLocalStorageItem<S, K extends keyof S>(
  store: StoreApi<S>,
  field: K,
  item: LocalStorageItem<S[K]>,
) {
  store.subscribe((state, prevState) => {
    if (state[field] === prevState[field]) return;
    item.write(state[field]);
  });
  item.subscribe((value) => {
    const partial: Partial<S> = {};
    partial[field] = value;
    store.setState(partial);
  });
}
