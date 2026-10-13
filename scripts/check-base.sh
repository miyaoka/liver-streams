#!/bin/sh
# 差分検査の比較元を出力する
set -eu

if [ -n "${CHECK_BASE:-}" ]; then
  echo "$CHECK_BASE"
  exit 0
fi

git merge-base HEAD origin/main
