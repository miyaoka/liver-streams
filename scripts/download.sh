#!/bin/bash

# 引数チェック
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <json-file> <download-directory>"
  exit 1
fi

# 引数からJSONファイルのパスとダウンロードディレクトリを取得
json_file="$1"
download_dir="$2"

# JSONファイルが存在するかチェック
if [ ! -f "$json_file" ]; then
  echo "Error: JSON file '$json_file' not found."
  exit 1
fi

# ダウンロードディレクトリが存在するかチェック、なければ作成
if [ ! -d "$download_dir" ]; then
  echo "Directory '$download_dir' not found. Creating it."
  mkdir -p "$download_dir"
fi

# jqを使ってJSONファイルをパースし、keyとURLのペアを処理
cat "$json_file" | jq -r 'to_entries[] | "\(.key) \(.value)"' | while read -r key url; do
  # ダウンロード先のファイルパスを設定
  file_path="$download_dir/$key.jpg"
  
  # curlで画像をダウンロードして指定のディレクトリに保存
  echo "Downloading $url as $file_path"
  curl -o "$file_path" "$url"
done