#!/bin/bash

# Ghost ブログデプロイスクリプト
# 使い方: ./deploy.sh [SSH_HOST]
# 例: ./deploy.sh conoha

set -e

SSH_HOST=${1:-conoha}
REMOTE_DIR="/opt/ghost-blog"

echo "=== Ghost ブログをデプロイ ==="
echo "VPS: $SSH_HOST"
echo "リモートディレクトリ: $REMOTE_DIR"
echo ""

# TypeScriptをビルド
echo "1. TypeScriptをビルド中..."
npm run build

# VPSにディレクトリを作成
echo "2. VPSにディレクトリを作成中..."
ssh $SSH_HOST "mkdir -p $REMOTE_DIR"
ssh $SSH_HOST "mkdir -p /var/www/blog"

# Dockerファイルをアップロード
echo "3. Docker設定ファイルをアップロード中..."
scp docker-compose.production.yml $SSH_HOST:$REMOTE_DIR/docker-compose.yml
scp .env $SSH_HOST:$REMOTE_DIR/.env

# フロントエンドファイルをアップロード
echo "4. フロントエンドファイルをアップロード中..."
scp index.html $SSH_HOST:/var/www/blog/
scp post.html $SSH_HOST:/var/www/blog/
scp styles.css $SSH_HOST:/var/www/blog/
scp post-styles.css $SSH_HOST:/var/www/blog/
scp main.js $SSH_HOST:/var/www/blog/
scp post.js $SSH_HOST:/var/www/blog/

# Nginx設定をアップロード
echo "5. Nginx設定をアップロード中..."
scp nginx.conf $SSH_HOST:/tmp/nginx-ghost.conf

# Dockerコンテナを再起動
echo "6. Dockerコンテナを起動/再起動中..."
ssh $SSH_HOST "cd $REMOTE_DIR && docker-compose down || true"
ssh $SSH_HOST "cd $REMOTE_DIR && docker-compose up -d"

echo ""
echo "=== デプロイ完了 ==="
echo ""
echo "次のステップ:"
echo "1. Nginx設定を適用:"
echo "   ssh $SSH_HOST"
echo "   sudo mv /tmp/nginx-ghost.conf /etc/nginx/sites-available/yourdomain.com"
echo "   sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "2. Ghost管理画面にアクセス:"
echo "   https://yourdomain.com/ghost"
echo ""
