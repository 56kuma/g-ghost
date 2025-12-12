#!/bin/bash

# 開発環境 Ghost リセットスクリプト
# 使い方: ./reset-dev.sh

set -e

echo "=== Ghost 開発環境をリセット ==="
echo ""
echo "警告: このスクリプトは以下を削除します:"
echo "  - すべての記事とコンテンツ"
echo "  - Ghost管理者アカウント"
echo "  - データベース"
echo ""
read -p "続行しますか? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "キャンセルしました"
    exit 0
fi

echo ""
echo "1. Dockerコンテナを停止中..."
docker-compose down

echo ""
echo "2. Dockerボリュームを削除中..."
docker-compose down -v

echo ""
echo "3. 残っているボリュームを確認..."
docker volume ls | grep ghost || true

echo ""
echo "4. .env ファイルを開発環境用に設定..."
if [ -f .env.development ]; then
    cp .env.development .env
    echo "   .env.development を .env にコピーしました"
else
    echo "   エラー: .env.development が見つかりません"
    exit 1
fi

echo ""
echo "5. Dockerコンテナを起動中..."
docker-compose up -d

echo ""
echo "6. Ghost起動を待機中（30秒）..."
sleep 30

echo ""
echo "=== リセット完了 ==="
echo ""
echo "次のステップ:"
echo "1. Ghost管理画面にアクセス:"
echo "   http://localhost:2368/ghost"
echo ""
echo "2. 新しい管理者アカウントを作成"
echo ""
echo "3. Settings → Integrations → Add custom integration"
echo "   統合名: Blog Frontend"
echo "   Content API Key をコピー"
echo ""
echo "4. main.ts と post.ts の開発環境用 API Key を更新:"
echo "   key: '新しいAPI Key'"
echo ""
echo "5. ビルドして確認:"
echo "   npm run build"
echo ""
echo "コンテナのログを確認する場合:"
echo "   docker-compose logs -f ghost"
echo ""
