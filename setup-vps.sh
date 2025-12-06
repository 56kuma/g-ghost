#!/bin/bash

# VPS初期セットアップスクリプト
# Ubuntu 22.04用
# このスクリプトをVPS上で実行してください

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "使い方: ./setup-vps.sh yourdomain.com"
    exit 1
fi

echo "=== VPS初期セットアップ開始 ==="
echo "ドメイン: $DOMAIN"
echo ""

# システムアップデート
echo "1. システムをアップデート中..."
sudo apt update && sudo apt upgrade -y

# 必要なパッケージをインストール
echo "2. 必要なパッケージをインストール中..."
sudo apt install -y curl wget git vim ufw

# Dockerのインストール
echo "3. Dockerをインストール中..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker インストール完了"
else
    echo "Docker は既にインストールされています"
fi

# Docker Composeのインストール
echo "4. Docker Composeをインストール中..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose インストール完了"
else
    echo "Docker Compose は既にインストールされています"
fi

# Nginxのインストール
echo "5. Nginxをインストール中..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    echo "Nginx インストール完了"
else
    echo "Nginx は既にインストールされています"
fi

# Certbotのインストール（Let's Encrypt用）
echo "6. Certbot（Let's Encrypt）をインストール中..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    echo "Certbot インストール完了"
else
    echo "Certbot は既にインストールされています"
fi

# ファイアウォール設定
echo "7. ファイアウォールを設定中..."
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw status

# ディレクトリ作成
echo "8. 必要なディレクトリを作成中..."
sudo mkdir -p /opt/ghost-blog
sudo mkdir -p /var/www/blog
sudo mkdir -p /var/www/certbot
sudo chown -R $USER:$USER /opt/ghost-blog
sudo chown -R www-data:www-data /var/www/blog
sudo chown -R www-data:www-data /var/www/certbot

echo ""
echo "=== セットアップ完了 ==="
echo ""
echo "次のステップ:"
echo "1. DNS設定:"
echo "   Aレコード: $DOMAIN -> このVPSのIPアドレス"
echo "   Aレコード: www.$DOMAIN -> このVPSのIPアドレス"
echo ""
echo "2. SSL証明書の取得（DNSが伝播した後）:"
echo "   sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "3. ローカルマシンから.envファイルを作成:"
echo "   .env.exampleを参考に、GHOST_URL=$DOMAIN を設定"
echo ""
echo "4. デプロイスクリプトを実行:"
echo "   ローカルマシンで: ./deploy.sh $(curl -s ifconfig.me) $(whoami)"
echo ""
echo "注意: 一度ログアウトして再ログインすると、Dockerコマンドがsudoなしで使えます"
echo ""
