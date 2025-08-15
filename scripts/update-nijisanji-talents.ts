#!/usr/bin/env bun

import { promises as fs } from "fs";
import path from "path";

// APIエンドポイント
const NIJISANJI_JP_API =
  "https://www.nijisanji.jp/api/livers?limit=300&orderKey=subscriber_count&order=asc&affiliation=nijisanji&locale=ja&includeAll=true";
const NIJISANJI_EN_API =
  "https://www.nijisanji.jp/api/livers?limit=300&orderKey=subscriber_count&order=asc&affiliation=nijisanjien&locale=ja&includeAll=true";

// 出力先パス
const OUTPUT_PATH = path.join(__dirname, "../src/services/nijisanji/livers.json");

// ライバー情報の型定義
interface ApiLiver {
  id: string;
  name: string;
  [key: string]: unknown; // その他のプロパティは無視
}

// 出力形式の型定義
interface SimplifiedLivers {
  [id: string]: {
    name: string;
  };
}

/**
 * APIからライバー情報を取得
 */
async function fetchLivers(url: string): Promise<ApiLiver[]> {
  console.log(`Fetching from: ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * ライバー情報を簡略化
 */
function simplifyLivers(livers: ApiLiver[]): SimplifiedLivers {
  const simplified: SimplifiedLivers = {};

  for (const liver of livers) {
    // IDと名前のみを抽出
    simplified[liver.id] = {
      name: liver.name,
    };
  }

  return simplified;
}

/**
 * JSONファイルを更新
 */
async function updateLiversJson(livers: SimplifiedLivers): Promise<void> {
  // 出力ディレクトリが存在することを確認
  const outputDir = path.dirname(OUTPUT_PATH);
  await fs.mkdir(outputDir, { recursive: true });

  // JSONファイルに書き込み（整形して出力）
  const jsonContent = JSON.stringify(livers, null, 2);
  await fs.writeFile(OUTPUT_PATH, jsonContent + "\n", "utf-8");

  console.log(`Updated: ${OUTPUT_PATH}`);
  console.log(`Total livers: ${Object.keys(livers).length}`);
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log("Starting Nijisanji talents update...");

    // にじさんじJPとENのデータを並列で取得
    const [jpLivers, enLivers] = await Promise.all([
      fetchLivers(NIJISANJI_JP_API),
      fetchLivers(NIJISANJI_EN_API),
    ]);

    console.log(`Fetched JP livers: ${jpLivers.length}`);
    console.log(`Fetched EN livers: ${enLivers.length}`);

    // データを結合
    const allLivers = [...jpLivers, ...enLivers];
    console.log(`Total livers fetched: ${allLivers.length}`);

    // データを簡略化
    const simplifiedLivers = simplifyLivers(allLivers);

    // JSONファイルを更新
    await updateLiversJson(simplifiedLivers);

    console.log("Update completed successfully!");
  } catch (error) {
    console.error("Error during update:", error);
    process.exit(1);
  }
}

// スクリプト実行
main();
