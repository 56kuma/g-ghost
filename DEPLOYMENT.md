# Ghost ブログ VPSデプロイ手順書

このドキュメントでは、Ghost CMS + フロントエンドをVPSで公開する手順を説明します。

## 📋 前提条件

- VPS（Ubuntu 22.04推奨、メモリ2GB以上）
- 取得済みのドメイン
- SSHでVPSにアクセスできること

## 🚀 デプロイ手順

### ステップ1: ドメインのDNS設定

ドメインのDNS設定で、以下のAレコードを追加してください：

```
タイプ: A
ホスト: @
値: VPSのIPアドレス
TTL: 3600

タイプ: A
ホスト: www
値: VPSのIPアドレス
TTL: 3600
```

DNS伝播には最大48時間かかる場合がありますが、通常は数分〜数時間で完了します。

### ステップ2: VPSにSSH接続

```bash
ssh root@YOUR_VPS_IP
# または
ssh ubuntu@YOUR_VPS_IP
```

### ステップ3: VPS初期セットアップ

VPS上で以下のコマンドを実行：

```bash
# セットアップスクリプトをダウンロード
wget https://raw.githubusercontent.com/YOUR_REPO/setup-vps.sh
# または
curl -O https://raw.githubusercontent.com/YOUR_REPO/setup-vps.sh

# 実行権限を付与
chmod +x setup-vps.sh

# スクリプトを実行（ドメイン名を指定）
./setup-vps.sh yourdomain.com
```

**手動でセットアップする場合:**

```bash
# システムアップデート
sudo apt update && sudo apt upgrade -y

# Docker のインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose のインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Nginx のインストール
sudo apt install -y nginx

# Certbot のインストール
sudo apt install -y certbot python3-certbot-nginx

# ファイアウォール設定
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# ディレクトリ作成
sudo mkdir -p /opt/ghost-blog
sudo mkdir -p /var/www/blog
sudo mkdir -p /var/www/certbot
sudo chown -R $USER:$USER /opt/ghost-blog
```

一度ログアウトして再ログインすると、Dockerコマンドがsudoなしで使えるようになります。

### ステップ4: SSL証明書の取得（Let's Encrypt）

**重要：DNS設定が伝播していることを確認してから実行してください。**

```bash
# DNS確認
nslookup yourdomain.com
# または
dig yourdomain.com

# SSL証明書取得
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

証明書は `/etc/letsencrypt/live/yourdomain.com/` に保存されます。

### ステップ5: ローカル環境の準備

ローカルマシン（Windowsマシン）で作業：

#### 1. 環境変数ファイルを作成

```bash
# .env.example を .env にコピー
cp .env.example .env
```

`.env` ファイルを編集：

```env
GHOST_URL=https://yourdomain.com
DB_NAME=ghostdb
DB_USER=ghost
DB_PASSWORD=your_strong_password_12345
DB_ROOT_PASSWORD=your_strong_root_password_67890
```

**重要：パスワードは必ず変更してください！**

#### 2. main.ts と post.ts の設定を更新

`main.ts` の設定を本番環境用に変更：

```typescript
const config: GhostConfig = {
    url: 'https://yourdomain.com',  // あなたのドメイン
    key: 'YOUR_CONTENT_API_KEY',    // 後で取得
    version: 'v5.0'
};
```

`post.ts` も同様に変更してください。

#### 3. TypeScriptをビルド

```bash
npm run build
```

### ステップ6: デプロイ実行

Windowsの場合、Git Bash または WSL から実行：

```bash
# デプロイスクリプトに実行権限を付与
chmod +x deploy.sh

# デプロイ実行
./deploy.sh YOUR_VPS_IP root
# または
./deploy.sh YOUR_VPS_IP ubuntu
```

### ステップ7: Nginx設定を適用

VPSにSSH接続して：

```bash
# Nginx設定ファイルを配置
sudo nano /etc/nginx/sites-available/yourdomain.com

# /tmp/nginx-ghost.conf の内容をコピーするか、
sudo mv /tmp/nginx-ghost.conf /etc/nginx/sites-available/yourdomain.com

# 設定ファイル内のドメイン名を変更（yourdomain.com を実際のドメインに）
sudo sed -i 's/yourdomain.com/actual-domain.com/g' /etc/nginx/sites-available/yourdomain.com

# シンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# デフォルト設定を無効化（オプション）
sudo rm /etc/nginx/sites-enabled/default

# 設定をテスト
sudo nginx -t

# Nginxをリロード
sudo systemctl reload nginx
```

### ステップ8: Ghost管理画面の初期設定

1. ブラウザで `https://yourdomain.com/ghost` にアクセス
2. 管理者アカウントを作成：
   - サイト名
   - 名前
   - メールアドレス
   - パスワード

### ステップ9: Content API Keyの取得

1. Ghost管理画面にログイン
2. **Settings** → **Integrations** → **Add custom integration**
3. 統合名を入力（例：Blog Frontend）
4. **Content API Key** をコピー

### ステップ10: フロントエンドのAPI設定を更新

#### 1. ローカルで main.ts を更新

```typescript
const config: GhostConfig = {
    url: 'https://yourdomain.com',
    key: 'コピーしたContent API Key',  // ここを更新
    version: 'v5.0'
};
```

`post.ts` も同様に更新。

#### 2. 再ビルドして再デプロイ

```bash
# ビルド
npm run build

# 再デプロイ
./deploy.sh YOUR_VPS_IP root
```

### ステップ11: 動作確認

1. `https://yourdomain.com` にアクセス → フロントエンドが表示される
2. `https://yourdomain.com/ghost` にアクセス → Ghost管理画面が表示される
3. Ghost管理画面で記事を投稿
4. フロントエンドで記事が表示されることを確認

## 🔧 トラブルシューティング

### Ghostコンテナが起動しない

```bash
# ログを確認
cd /opt/ghost-blog
docker-compose logs -f ghost

# コンテナを再起動
docker-compose restart ghost
```

### SSL証明書のエラー

```bash
# 証明書を再取得
sudo certbot delete --cert-name yourdomain.com
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

### Nginxの502 Bad Gateway

```bash
# Ghostが起動しているか確認
docker ps

# Ghostのログを確認
docker logs ghost

# Nginxのログを確認
sudo tail -f /var/log/nginx/ghost.error.log
```

### Content APIが動作しない

1. Ghost管理画面で **Settings** → **Integrations** を確認
2. Content API Keyが正しいか確認
3. Ghost URLが `https://yourdomain.com` になっているか確認（docker-compose.ymlの環境変数）

## 📝 運用Tips

### バックアップ

```bash
# Ghostコンテンツのバックアップ
cd /opt/ghost-blog
docker-compose exec ghost tar czf /tmp/content-backup.tar.gz -C /var/lib/ghost content
docker cp ghost:/tmp/content-backup.tar.gz ./content-backup-$(date +%Y%m%d).tar.gz

# データベースのバックアップ
docker-compose exec db mysqldump -u ghost -p ghostdb > backup-$(date +%Y%m%d).sql
```

### SSL証明書の自動更新

Certbotは自動更新用のcronジョブを設定しますが、手動で更新する場合：

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Ghostのアップデート

```bash
cd /opt/ghost-blog
docker-compose pull ghost
docker-compose up -d
```

### コンテナの再起動

```bash
cd /opt/ghost-blog
docker-compose restart
```

## 📚 参考リンク

- [Ghost公式ドキュメント](https://ghost.org/docs/)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [Nginx公式ドキュメント](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

## ⚠️ セキュリティ注意事項

1. `.env` ファイルには機密情報が含まれているため、絶対にGitにコミットしないでください
2. データベースのパスワードは強力なものを使用してください
3. 定期的にバックアップを取得してください
4. Ghostとシステムを最新の状態に保ってください
5. UFWファイアウォールを有効にしてください

---

何か問題が発生した場合は、各サービスのログを確認してください。
