#!/bin/bash

# 開発環境セットアップスクリプト
# 使い方: ./setup-dev.sh

set -e

echo "=== Ghost ブログ 開発環境セットアップ ==="
echo ""

# .env.development が存在するか確認
if [ ! -f .env.development ]; then
    echo "エラー: .env.development ファイルが見つかりません"
    echo ".env.example をコピーして .env.development を作成してください"
    exit 1
fi

# .env ファイルを作成（開発環境用）
echo "1. 開発環境用の .env ファイルを作成中..."
cp .env.development .env
echo "   .env.development を .env にコピーしました"
echo ""

# Dockerコンテナを起動
echo "2. Dockerコンテナを起動中..."
docker-compose up -d
echo ""

echo "=== セットアップ完了 ==="
echo ""
echo "次のステップ:"
echo "1. Ghost管理画面にアクセス:"
echo "   http://localhost:2368/ghost"
echo ""
echo "2. 管理者アカウントを作成"
echo ""
echo "3. Settings → Integrations → Add custom integration"
echo "   統合名: Blog Frontend"
echo "   Content API Key をコピー"
echo ""
echo "4. main.ts と post.ts の開発環境用 API Key を更新"
echo ""
echo "5. ビルドして確認:"
echo "   npm run build"
echo "   ブラウザで index.html を開く"
echo ""
