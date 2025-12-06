#!/bin/bash

# Ghost ブログデプロイスクリプト
# 使い方: ./deploy.sh [VPS_IP] [SSH_USER]
# 例: ./deploy.sh 192.168.1.100 root

set -e

VPS_IP=$1
SSH_USER=${2:-root}
REMOTE_DIR="/opt/ghost-blog"

if [ -z "$VPS_IP" ]; then
    echo "使い方: ./deploy.sh [VPS_IP] [SSH_USER]"
    echo "例: ./deploy.sh 192.168.1.100 root"
    exit 1
fi

echo "=== Ghost ブログをデプロイ ==="
echo "VPS: $SSH_USER@$VPS_IP"
echo "リモートディレクトリ: $REMOTE_DIR"
echo ""

# TypeScriptをビルド
echo "1. TypeScriptをビルド中..."
npm run build

# VPSにディレクトリを作成
echo "2. VPSにディレクトリを作成中..."
ssh $SSH_USER@$VPS_IP "mkdir -p $REMOTE_DIR"
ssh $SSH_USER@$VPS_IP "mkdir -p /var/www/blog"

# Dockerファイルをアップロード
echo "3. Docker設定ファイルをアップロード中..."
scp docker-compose.production.yml $SSH_USER@$VPS_IP:$REMOTE_DIR/docker-compose.yml
scp .env $SSH_USER@$VPS_IP:$REMOTE_DIR/.env

# フロントエンドファイルをアップロード
echo "4. フロントエンドファイルをアップロード中..."
scp index.html $SSH_USER@$VPS_IP:/var/www/blog/
scp post.html $SSH_USER@$VPS_IP:/var/www/blog/
scp styles.css $SSH_USER@$VPS_IP:/var/www/blog/
scp post-styles.css $SSH_USER@$VPS_IP:/var/www/blog/
scp main.js $SSH_USER@$VPS_IP:/var/www/blog/
scp post.js $SSH_USER@$VPS_IP:/var/www/blog/

# Nginx設定をアップロード
echo "5. Nginx設定をアップロード中..."
scp nginx.conf $SSH_USER@$VPS_IP:/tmp/nginx-ghost.conf

# Dockerコンテナを再起動
echo "6. Dockerコンテナを起動/再起動中..."
ssh $SSH_USER@$VPS_IP "cd $REMOTE_DIR && docker-compose down || true"
ssh $SSH_USER@$VPS_IP "cd $REMOTE_DIR && docker-compose up -d"

echo ""
echo "=== デプロイ完了 ==="
echo ""
echo "次のステップ:"
echo "1. Nginx設定を適用:"
echo "   ssh $SSH_USER@$VPS_IP"
echo "   sudo mv /tmp/nginx-ghost.conf /etc/nginx/sites-available/yourdomain.com"
echo "   sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "2. Ghost管理画面にアクセス:"
echo "   https://yourdomain.com/ghost"
echo ""
