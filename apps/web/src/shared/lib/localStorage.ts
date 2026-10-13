/**
 * zustand の persist に渡す、store のフィールドを localStorage のキーへ 1 つずつ保存する PersistStorage。
 *
 * 利用者のブラウザに保存済みの値を読めるよう、キー名と保存形式を変えない。形式は `serializers` とテストが正本。
 * 読み書きに失敗したキーは console.error を出して既定値で続ける。例外にすると、壊れた値を持つ利用者がアプリを開けなくなる。
 *
 * ```ts
 * const persisted = { map: new Map<string, boolean>() };
 * const mapPersist = createLocalStoragePersist("xxx", { map: "storageKey" }, persisted);
 * export const useXxxStore = create<State>()(
 *   persist((set) => ({ ...persisted, ...actions }), mapPersist.options),
 * );
 * stopOnHotReexecute(import.meta.hot, "storage", mapPersist.rehydrateOnStorageEvent(useXxxStore));
 * ```
 */
import type { PersistOptions, PersistStorage } from "zustand/middleware";

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

interface Field {
  key: string;
  defaults: unknown;
  serializer: Serializer;
  /**
   * 最後に読み書きした値。同じ参照なら書き込みを省き、同じ文字列なら読み込みで前の参照を返す。
   * 読めなかったときの raw は undefined で、どの保存値とも一致しない
   */
  last: { value: unknown; raw: string | null | undefined } | null;
}

function serialize(field: Field, value: unknown): string | null {
  if (value == null) return null;
  return field.serializer.write(value);
}

function readField(field: Field): unknown {
  try {
    const raw = localStorage.getItem(field.key);
    if (field.last && field.last.raw === raw) return field.last.value;
    if (raw === null) {
      const defaultsRaw = serialize(field, field.defaults);
      if (defaultsRaw !== null) localStorage.setItem(field.key, defaultsRaw);
      field.last = { value: field.defaults, raw: defaultsRaw };
      return field.defaults;
    }
    const value = field.serializer.read(raw);
    field.last = { value, raw };
    return value;
  } catch (error) {
    console.error(error);
    field.last = { value: field.defaults, raw: undefined };
    return field.defaults;
  }
}

function writeField(field: Field, value: unknown) {
  if (field.last && Object.is(field.last.value, value)) return;
  try {
    const raw = serialize(field, value);
    field.last = { value, raw };
    if (raw === null) {
      localStorage.removeItem(field.key);
      return;
    }
    if (localStorage.getItem(field.key) === raw) return;
    localStorage.setItem(field.key, raw);
  } catch (error) {
    console.error(error);
  }
}

interface RehydratableStore {
  persist: { rehydrate: () => Promise<void> | void };
}

/**
 * @param name persist の name。localStorage のキーには使わない
 * @param keys store のフィールド名 → localStorage のキー
 * @param defaults キーが無いときと読めないときの値。null を既定値にしたフィールドは文字列をそのまま保存する
 */
export function createLocalStoragePersist<P extends object>(
  name: string,
  keys: { [F in keyof P]: string },
  defaults: P,
) {
  const fieldNames = Object.keys(keys) as (keyof P & string)[];
  const fields = new Map<keyof P, Field>(
    fieldNames.map((fieldName) => [
      fieldName,
      {
        key: keys[fieldName],
        defaults: defaults[fieldName],
        serializer: serializers[guessSerializerType(defaults[fieldName])],
        last: null,
      },
    ]),
  );
  const storageKeySet = new Set(fieldNames.map((fieldName) => keys[fieldName]));

  const storage: PersistStorage<P> = {
    getItem: () => {
      const state = {} as P;
      fields.forEach((field, fieldName) => {
        state[fieldName] = readField(field) as P[keyof P];
      });
      return { state };
    },
    setItem: (_name, { state }) => {
      fields.forEach((field, fieldName) => {
        writeField(field, state[fieldName]);
      });
    },
    removeItem: () => {
      fields.forEach((field) => {
        field.last = null;
        localStorage.removeItem(field.key);
      });
    },
  };

  const options = { name, storage } satisfies PersistOptions<P, P>;

  /** 別タブでの変更を store に読み直す。戻り値で購読を解除する */
  function rehydrateOnStorageEvent(store: RehydratableStore): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== null && !storageKeySet.has(event.key)) return;
      void store.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage, { passive: true });
    return () => window.removeEventListener("storage", onStorage);
  }

  return { options, rehydrateOnStorageEvent };
}
