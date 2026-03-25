#!/bin/bash
# MongoDB 数据导入脚本
# 用法: bash data/import-db.sh [mongodb_uri]
# 示例: bash data/import-db.sh mongodb://localhost:27017/bupt_ip_news

DB_URI="${1:-mongodb://localhost:27017/bupt_ip_news}"
DB_NAME=$(echo "$DB_URI" | grep -oP '[^/]+$')
DATA_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================="
echo "  BUPT IP News 数据库导入"
echo "========================================="
echo "数据库: $DB_URI"
echo "数据目录: $DATA_DIR"
echo ""

# 导入顺序: users → news → chathistories → lawdocs
collections=("users" "news" "chathistories" "lawdocs")

for col in "${collections[@]}"; do
  file="$DATA_DIR/bupt_ip_news.${col}.json"
  if [ -f "$file" ]; then
    echo "正在导入 ${col}..."
    mongoimport --uri "$DB_URI" \
      --collection "$col" \
      --file "$file" \
      --jsonArray \
      --drop
    echo "  ✓ ${col} 导入完成"
  else
    echo "  ✗ 文件不存在: $file"
  fi
done

echo ""
echo "========================================="
echo "  导入完成！"
echo "========================================="
