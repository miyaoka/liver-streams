/**
 * にじさんじタレント自動更新スクリプト
 *
 * にじさんじ公式APIからタレント情報を取得し、新規タレントを検出して以下を更新する:
 * - livers.json: タレントID → 名前のマッピング
 * - icons.json: タレント名 → アイコンパスのマッピング
 * - channels.json: 新規タレントを「未分類」グループに追加
 * - assets/icons/: アイコン画像をダウンロード
 *
 * 実行: pnpm --filter @liver-streams/nijisanji update-talents
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// API エンドポイント
const NIJISANJI_JP_API =
  "https://www.nijisanji.jp/api/livers?limit=300&orderKey=subscriber_count&order=asc&affiliation=nijisanji&locale=ja&includeAll=true";
const NIJISANJI_EN_API =
  "https://www.nijisanji.jp/api/livers?limit=300&orderKey=subscriber_count&order=asc&affiliation=nijisanjien&locale=ja&includeAll=true";

// ファイルパス
const LIVERS_PATH = join(__dirname, "../data/livers.json");
const ICONS_PATH = join(__dirname, "../data/icons.json");
const CHANNELS_PATH = join(__dirname, "../data/channels.json");
const ICONS_DIR = join(__dirname, "../assets/icons");

// 型定義
interface ApiLiver {
  id: string;
  name: string;
  images: {
    head: {
      url: string;
    };
  };
}

interface LiverMap {
  [id: string]: {
    name: string;
  };
}

interface IconMap {
  [name: string]: string;
}

interface ChannelNode {
  name: string;
  children?: (string | ChannelNode)[];
  initial?: string;
}

/**
 * API からタレント情報を取得
 */
async function fetchTalents(url: string): Promise<ApiLiver[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * アイコン画像をダウンロード
 */
async function downloadIcon(apiUrl: string, filename: string): Promise<void> {
  const url = `https://www.nijisanji.jp${apiUrl}&w=88&fm=webp`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download icon: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const filepath = join(ICONS_DIR, filename);
  await writeFile(filepath, Buffer.from(buffer));
}

/**
 * 名前からファイル名を生成
 */
function toFilename(name: string): string {
  // 日本語名はそのまま使用
  return `${name}.webp`;
}

/**
 * channels.json の「未分類」グループに追加
 */
function addToNewcomersGroup(
  channels: ChannelNode,
  names: string[],
  affiliation: "JP" | "EN",
): void {
  if (names.length === 0) return;

  const affiliationNode = channels.children?.find(
    (child): child is ChannelNode => typeof child !== "string" && child.name === affiliation,
  );

  if (!affiliationNode || !affiliationNode.children) {
    throw new Error(`Affiliation node not found: ${affiliation}`);
  }

  // 先頭の「未分類」グループを探す
  const newcomersIndex = affiliationNode.children.findIndex(
    (child): child is ChannelNode => typeof child !== "string" && child.name === "未分類",
  );

  if (newcomersIndex !== -1) {
    // 既存の「未分類」グループに追加
    const newcomers = affiliationNode.children[newcomersIndex] as ChannelNode;
    newcomers.children = [...(newcomers.children ?? []), ...names];
  } else {
    // 「未分類」グループを先頭に作成
    affiliationNode.children.unshift({
      name: "未分類",
      children: names,
    });
  }
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log("Fetching talents from API...");

  // API からデータ取得
  const [jpTalents, enTalents] = await Promise.all([
    fetchTalents(NIJISANJI_JP_API),
    fetchTalents(NIJISANJI_EN_API),
  ]);

  console.log(`Fetched JP: ${jpTalents.length}, EN: ${enTalents.length}`);

  // 現在のデータを読み込み
  const [liversJson, iconsJson, channelsJson] = await Promise.all([
    readFile(LIVERS_PATH, "utf-8"),
    readFile(ICONS_PATH, "utf-8"),
    readFile(CHANNELS_PATH, "utf-8"),
  ]);

  const livers: LiverMap = JSON.parse(liversJson);
  const icons: IconMap = JSON.parse(iconsJson);
  const channels: ChannelNode = JSON.parse(channelsJson);

  const existingIds = new Set(Object.keys(livers));

  // 新規タレントを検出
  const newJpTalents = jpTalents.filter((t) => !existingIds.has(t.id));
  const newEnTalents = enTalents.filter((t) => !existingIds.has(t.id));

  const totalNew = newJpTalents.length + newEnTalents.length;
  if (totalNew === 0) {
    console.log("No new talents found.");
    return;
  }

  console.log(
    `Found ${totalNew} new talents (JP: ${newJpTalents.length}, EN: ${newEnTalents.length})`,
  );

  // アイコンディレクトリ確認
  await mkdir(ICONS_DIR, { recursive: true });

  // 新規タレントを処理
  const newJpNames: string[] = [];
  const newEnNames: string[] = [];

  for (const talent of newJpTalents) {
    const filename = toFilename(talent.name);

    console.log(`  Adding JP: ${talent.name}`);

    // livers.json に追加
    livers[talent.id] = { name: talent.name };

    // icons.json に追加
    icons[talent.name] = `/${filename}`;

    // アイコンダウンロード
    await downloadIcon(talent.images.head.url, filename);

    newJpNames.push(talent.name);
  }

  for (const talent of newEnTalents) {
    const filename = toFilename(talent.name);

    console.log(`  Adding EN: ${talent.name}`);

    // livers.json に追加
    livers[talent.id] = { name: talent.name };

    // icons.json に追加
    icons[talent.name] = `/${filename}`;

    // アイコンダウンロード
    await downloadIcon(talent.images.head.url, filename);

    newEnNames.push(talent.name);
  }

  // channels.json の「未分類」グループに追加
  addToNewcomersGroup(channels, newJpNames, "JP");
  addToNewcomersGroup(channels, newEnNames, "EN");

  // ファイル書き込み
  await Promise.all([
    writeFile(LIVERS_PATH, JSON.stringify(livers, null, 2) + "\n"),
    writeFile(ICONS_PATH, JSON.stringify(icons, null, 2) + "\n"),
    writeFile(CHANNELS_PATH, JSON.stringify(channels, null, 2) + "\n"),
  ]);

  console.log("Update completed!");
  console.log(`  livers.json: ${Object.keys(livers).length} talents`);
  console.log(`  icons.json: ${Object.keys(icons).length} entries`);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
