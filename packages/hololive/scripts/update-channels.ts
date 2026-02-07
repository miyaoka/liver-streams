/**
 * ホロライブタレント自動更新スクリプト
 *
 * ホロライブ公式スケジュールAPIから配信情報を取得し、新規タレントを検出して以下を更新する:
 * - icons.json: タレント名 → アイコンパスのマッピング
 * - channels.json: 新規タレントを「未分類」グループに追加
 * - assets/icons/: アイコン画像をダウンロード
 *
 * 実行: pnpm --filter @liver-streams/hololive update-talents
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// API エンドポイント
const HOLO_API = "https://schedule.hololive.tv/api/list/7";

// ファイルパス
const ICONS_PATH = join(__dirname, "../data/icons.json");
const CHANNELS_PATH = join(__dirname, "../data/channels.json");
const ICONS_DIR = join(__dirname, "../assets/icons");

// 型定義
interface HoloSchedule {
  dateGroupList: HoloDateGroup[];
}

interface HoloDateGroup {
  videoList: HoloVideoDetail[];
}

interface HoloVideoDetail {
  talent: HoloTalent;
  collaboTalents: HoloTalent[];
}

interface HoloTalent {
  name: string;
  iconImageUrl: string;
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
 * API からスケジュールを取得
 */
async function fetchSchedule(): Promise<HoloSchedule> {
  const response = await fetch(HOLO_API);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * アイコン画像をダウンロード
 */
async function downloadIcon(url: string, filename: string): Promise<void> {
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
  return `${name}.jpg`;
}

/**
 * channels.json の「未分類」グループに追加
 */
function addToNewcomersGroup(channels: ChannelNode, names: string[]): void {
  if (names.length === 0) return;

  // 最初のブランチ（ホロライブ）に追加
  const firstBranch = channels.children?.find(
    (child): child is ChannelNode => typeof child !== "string" && child.name === "ホロライブ",
  );

  if (!firstBranch || !firstBranch.children) {
    throw new Error("Branch node not found: ホロライブ");
  }

  // 先頭の「未分類」グループを探す
  const newcomersIndex = firstBranch.children.findIndex(
    (child): child is ChannelNode => typeof child !== "string" && child.name === "未分類",
  );

  if (newcomersIndex !== -1) {
    // 既存の「未分類」グループに追加
    const newcomers = firstBranch.children[newcomersIndex] as ChannelNode;
    newcomers.children = [...(newcomers.children ?? []), ...names];
  } else {
    // 「未分類」グループを先頭に作成
    firstBranch.children.unshift({
      name: "未分類",
      children: names,
    });
  }
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log("Fetching schedule from API...");

  // API からデータ取得
  const schedule = await fetchSchedule();

  // 全タレントを抽出
  const talentMap = new Map<string, HoloTalent>();

  for (const dateGroup of schedule.dateGroupList) {
    for (const video of dateGroup.videoList) {
      // メインタレント
      if (!talentMap.has(video.talent.name)) {
        talentMap.set(video.talent.name, video.talent);
      }
      // コラボタレント
      for (const collab of video.collaboTalents) {
        if (!talentMap.has(collab.name)) {
          talentMap.set(collab.name, collab);
        }
      }
    }
  }

  console.log(`Found ${talentMap.size} talents in schedule`);

  // 現在のデータを読み込み
  const [iconsJson, channelsJson] = await Promise.all([
    readFile(ICONS_PATH, "utf-8"),
    readFile(CHANNELS_PATH, "utf-8"),
  ]);

  const icons: IconMap = JSON.parse(iconsJson);
  const channels: ChannelNode = JSON.parse(channelsJson);

  const existingNames = new Set(Object.keys(icons));

  // 新規タレントを検出
  const newTalents: HoloTalent[] = [];
  for (const [name, talent] of talentMap) {
    if (!existingNames.has(name)) {
      newTalents.push(talent);
    }
  }

  if (newTalents.length === 0) {
    console.log("No new talents found.");
    return;
  }

  console.log(`Found ${newTalents.length} new talents`);

  // アイコンディレクトリ確認
  await mkdir(ICONS_DIR, { recursive: true });

  // 新規タレントを処理
  const newNames: string[] = [];

  for (const talent of newTalents) {
    const filename = toFilename(talent.name);

    console.log(`  Adding: ${talent.name}`);

    // icons.json に追加
    icons[talent.name] = `/${filename}`;

    // アイコンダウンロード
    await downloadIcon(talent.iconImageUrl, filename);

    newNames.push(talent.name);
  }

  // channels.json の「未分類」グループに追加
  addToNewcomersGroup(channels, newNames);

  // ファイル書き込み
  await Promise.all([
    writeFile(ICONS_PATH, JSON.stringify(icons, null, 2) + "\n"),
    writeFile(CHANNELS_PATH, JSON.stringify(channels, null, 2) + "\n"),
  ]);

  console.log("Update completed!");
  console.log(`  icons.json: ${Object.keys(icons).length} entries`);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
