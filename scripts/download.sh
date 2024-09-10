#!/bin/bash



# 引数チェック
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <json-file>"
  exit 1
fi

# 引数からJSONファイルのパスを取得
json_file="$1"

# JSONファイルが存在するかチェック
if [ ! -f "$json_file" ]; then
  echo "Error: JSON file '$json_file' not found."
  exit 1
fi

# jqを使ってJSONファイルをパースし、keyとURLのペアを処理
cat "$json_file" | jq -r 'to_entries[] | "\(.key) \(.value)"' | while read -r key url; do
  # curlで画像をダウンロードしてkeyの名前で保存
  echo "Downloading $url as $key.jpg"
  curl -o "$key.jpg" "$url"
done