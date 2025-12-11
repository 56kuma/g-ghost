# ConoHa VPS 2GBプラン デプロイ手順書

このドキュメントでは、ConoHa VPS 2GBプランを使用してGhost CMS + フロントエンドを公開する手順を説明します。

## 📋 前提条件

- ConoHa VPSアカウント
- 取得済みのドメイン
- ローカル環境: Windows（Git Bash または WSL）

## 💰 料金目安

- **ConoHa VPS 2GBプラン**: 月額1,485円（長期割引プランでさらに安く）
- **ドメイン**: 年額1,000円〜（既に取得済み）
- **SSL証明書**: 無料（Let's Encrypt）

**合計**: 月額約1,500円

---

## 🚀 デプロイ手順

### ステップ1: ConoHa VPS契約

1. [ConoHa VPS](https://www.conoha.jp/vps/) にアクセス
2. アカウント作成（既に持っている場合はログイン）
3. **VPS追加**をクリック

**推奨プラン:**
- **メモリ**: 2GB
- **CPU**: 3コア
- **SSD**: 100GB
- **料金**: 月額1,485円

---

### ステップ2: VPS作成（ConoHaコントロールパネル）

ConoHaコントロールパネルで以下を設定:

```
サービス: VPS
リージョン: 東京（または大阪）
イメージタイプ: OS
OS: Ubuntu
バージョン: 22.04
プラン: 2GB（メモリ）
rootパスワード: 強力なパスワードを設定（必ずメモ）
ネームタグ: ghost-blog（任意）
```

**重要: rootパスワードは必ず安全な場所にメモしてください！**

**追加**ボタンをクリックして、VPSの起動を待ちます（1〜2分）。

---

### ステップ3: IPアドレスの確認

1. ConoHaコントロールパネルで作成したVPSをクリック
2. **IPアドレス**を確認してメモ
   - 例: `160.251.xxx.xxx`
   - このIPアドレスは後で使用します

---

### ステップ4: ✅DNS設定（お名前.com など）

取得済みドメインのDNS設定画面で、以下のAレコードを追加:

**お名前.com の場合:**

1. お名前.comにログイン
2. **ドメイン設定** → **DNS設定/転送設定**
3. 対象ドメインを選択
4. **DNSレコード設定を利用する**

以下の2つのレコードを追加:

```
タイプ: A
ホスト名: (空欄または@)
VALUE: 160.251.xxx.xxx（ステップ3のIP）
TTL: 3600

タイプ: A
ホスト名: www
VALUE: 160.251.xxx.xxx（ステップ3のIP）
TTL: 3600
```

**他のレジストラでも同様の設定を行ってください。**

**注意: DNS伝播には数分〜数時間かかります（最大48時間）**

---

### ステップ5: ✅VPSに接続

WindowsのPowerShell、コマンドプロンプト、または Git Bash で:

```bash
# VPSに接続
ssh root@160.251.xxx.xxx
# (160.251.xxx.xxxは実際のIPアドレスに置き換え)

# パスワードを入力（ステップ2で設定したrootパスワード）
```

初回接続時に以下のメッセージが表示されます:
```
The authenticity of host '160.251.xxx.xxx' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

**yes** と入力してEnter。

接続成功すると、以下のようなプロンプトが表示されます:
```
root@xxx-xxx-xxx-xxx:~#
```

---

### ステップ6: セットアップスクリプト実行

VPS上で以下を実行（2つの方法があります）:

#### 方法A: 直接ファイルを作成して実行

```bash
# セットアップスクリプトを作成
nano setup-vps.sh
```

エディタが開いたら、ローカルの `setup-vps.sh` の内容を貼り付け:
- `Ctrl + O` で保存
- `Ctrl + X` で終了

```bash
# 実行権限を付与
chmod +x setup-vps.sh

# 実行（yourdomain.comは実際のドメインに置き換え）
./setup-vps.sh yourdomain.com
```

#### 方法B: Gitリポジトリからクローン（推奨）

```bash
# Gitリポジトリをクローン
git clone https://github.com/56kuma/g-ghost.git
cd g_ghost

# 実行権限を付与
chmod +x setup-vps.sh

# 実行（yourdomain.comは実際のドメインに置き換え）
./setup-vps.sh yourdomain.com
```

**このスクリプトが自動で実行する内容:**
1. システムアップデート
2. Docker のインストール
3. Docker Compose のインストール
4. Nginx のインストール
5. Certbot（Let's Encrypt）のインストール
6. ファイアウォール設定
7. 必要なディレクトリの作成

**所要時間: 5〜10分**

---

### ステップ7: 再ログイン

Dockerコマンドをsudoなしで使用できるようにするため、一度ログアウトして再ログインします:

```bash
# ログアウト
exit

# 再ログイン
ssh root@160.251.xxx.xxx
ssh conoha
```

---

### ✅ステップ8: SSL証明書取得

**重要: このステップはDNS設定（ステップ4）が伝播した後に実行してください！**

#### DNS伝播の確認

```bash
# VPS上で実行
nslookup yourdomain.com

# または
dig yourdomain.com
```

IPアドレスがVPSのIPと一致していることを確認。

#### SSL証明書の取得

```bash
# Let's EncryptでSSL証明書を取得
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

以下の質問に答えます:
```
Enter email address (used for urgent renewal and security notices):
→ あなたのメールアドレスを入力

Please read the Terms of Service...
→ A (Agree) を入力

Would you be willing to share your email address...
→ N (No) を入力
```

成功すると以下のメッセージが表示されます:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**証明書の取得に成功したら、VPSはそのままにしておいてください。**

---

### ステップ9: ローカルマシンでデプロイ準備

Windowsマシンのローカル環境（プロジェクトディレクトリ `D:\g_ghost`）で作業します。

Git Bash または WSL を起動して、プロジェクトディレクトリに移動:

```bash
cd /d/g_ghost
```

#### ✅1. 環境変数ファイルを作成

```bash
# .env.example を .env にコピー
cp .env.example .env
```

#### ✅2. .env ファイルを編集

エディタで `.env` を開いて以下を設定:

```env
# ドメイン設定（https://を忘れずに）
GHOST_URL=https://yourdomain.com

# データベース設定
DB_NAME=ghostdb
DB_USER=ghost
DB_PASSWORD=Gh0st_Str0ng_P@ssw0rd_2024
DB_ROOT_PASSWORD=R00t_Str0ng_P@ssw0rd_2024
```

**重要: パスワードは必ず強力なものに変更してください！**

**良いパスワードの例:**
- `Gh0st_Str0ng_P@ssw0rd_2024`
- `My$ecureDB2024!Ghost`
- 12文字以上、英数字+記号を含む

#### ✅3. TypeScriptをビルド

```bash
npm run build
```

成功すると `main.js` と `post.js` が更新されます。

#### ✅4. デプロイスクリプトに実行権限を付与

```bash
chmod +x deploy.sh
```

#### 5. デプロイ実行

```bash
# ファイルを変換
dos2unix deploy.sh

# デプロイ実行（IPアドレスは実際のVPSのIPに置き換え）
./deploy.sh conoha
```

**このスクリプトが自動で実行する内容:**
1. TypeScriptのビルド
2. Docker設定ファイルのアップロード
3. フロントエンドファイルのアップロード
4. Nginx設定ファイルのアップロード
5. Dockerコンテナの起動

**所要時間: 2〜3分**

成功すると以下のメッセージが表示されます:
```
=== デプロイ完了 ===
```

---

### ステップ10: Nginx設定（VPS上で）

再びVPSにSSH接続して、Nginx設定を適用します:

```bash
# VPSに接続（まだ接続していない場合）
ssh root@160.251.xxx.xxx
```

#### ✅1. Nginx設定ファイルを配置

```bash
# アップロードされた設定ファイルを移動
sudo mv /tmp/nginx-ghost.conf /etc/nginx/sites-available/yourdomain.com

# ドメイン名を実際のドメインに置き換え（以下のコマンドで一括置換）
# yourdomain.com を実際のドメインに置き換えてください
sudo sed -i 's/yourdomain.com/actual-domain.com/g' /etc/nginx/sites-available/yourdomain.com
```

**例:** ドメインが `myblog.com` の場合:
```bash
sudo sed -i 's/yourdomain.com/myblog.com/g' /etc/nginx/sites-available/yourdomain.com

# コマンドログ
sudo sed -i 's/yourdomain.com/masudaily.jp/g' /etc/nginx/sites-available/yourdomain.com
mv /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-available/masudaily.jp

```

#### ✅2. シンボリックリンクを作成

```bash
# sites-enabled にシンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/masudaily.jp /etc/nginx/sites-enabled/

# デフォルト設定を無効化
sudo rm /etc/nginx/sites-enabled/default
```

#### ✅3. Nginx設定をテスト

```bash
# 設定ファイルの構文チェック
sudo nginx -t

# ここでエラー発生
sudo certbot certonly --standalone -d masudaily.jp -d www.masudaily.jp

# きもはこれ
cannot load certificate "/etc/letsencrypt/live/myblog.com/fullchain.pem"
myblog.com のままになっています！ あなたのドメインは masudaily.jp なので、Nginx設定ファイ ルを修正する必要があります。

```

成功すると以下のメッセージが表示されます:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### ✅4. Nginxをリロード

```bash
# Nginxを再読み込み
sudo systemctl reload nginx

# ステータス確認
sudo systemctl status nginx
```

---

### ステップ11: Ghost初期設定

#### 1. Ghost管理画面にアクセス

ブラウザで以下のURLにアクセス:
```
https://yourdomain.com/ghost
# こっち
https://masudaily.jp/ghost
```

#### 2. 管理者アカウントを作成

初回アクセス時、以下の情報を入力:

```
Site title: あなたのブログ名（例: My Tech Blog）
Full name: あなたの名前
Email address: あなたのメールアドレス
Password: 強力なパスワード（12文字以上推奨）
```

**Create account & start publishing** をクリック。

#### 3. Content API Keyを取得

1. Ghost管理画面左メニューから **Settings** をクリック
2. **Integrations** をクリック
3. **Add custom integration** をクリック
4. 統合名を入力（例: `Blog Frontend`）
5. **Create** をクリック
6. **Content API Key** をコピー（後で使用）

例: `691bd2d288c7e2579ff1c4865a`

#### 4. main.ts と post.ts の設定を更新

ローカルマシンに戻って、以下のファイルを編集:

**main.ts（60行目付近）:**

```typescript
const config: GhostConfig = {
    url: 'https://yourdomain.com',  // あなたのドメイン
    key: '691bd2d288c7e2579ff1c4865a',  // ステップ11-3で取得したAPI Key
    version: 'v5.0'
};
```

**post.ts（同様の箇所）:**

```typescript
const config: GhostConfig = {
    url: 'https://yourdomain.com',  // あなたのドメイン
    key: '691bd2d288c7e2579ff1c4865a',  // ステップ11-3で取得したAPI Key
    version: 'v5.0'
};
```

#### 5. 再ビルド & 再デプロイ

Git Bash または WSL で:

```bash
# プロジェクトディレクトリに移動
cd /d/g_ghost

# 再ビルド
npm run build

# 再デプロイ
./deploy.sh 160.251.xxx.xxx root
```

---

## 🎉 完了！

これで、あなたのブログが公開されました！

### 確認方法

1. **フロントエンド**: `https://yourdomain.com` にアクセス
   - Ghost管理画面で投稿した記事が表示されます

2. **Ghost管理画面**: `https://yourdomain.com/ghost` にアクセス
   - 記事の投稿・編集ができます

3. **記事の投稿テスト**:
   - Ghost管理画面から新しい記事を投稿
   - フロントエンド（`https://yourdomain.com`）で表示されることを確認

---

## 📝 記事の投稿方法

1. `https://yourdomain.com/ghost` にログイン
2. **Posts** → **New post** をクリック
3. タイトルと本文を入力
4. 右上の **Publish** をクリック
5. フロントエンドで記事が表示されます

---

## 🔧 トラブルシューティング

### フロントエンドに記事が表示されない

**原因:** API Keyが正しく設定されていない

**対処法:**
1. `main.ts` と `post.ts` のAPI Keyを確認
2. 再ビルド & 再デプロイ
3. ブラウザのキャッシュをクリア（Ctrl + Shift + R）

### 502 Bad Gateway エラー

**原因:** Ghostコンテナが起動していない

**対処法:**

```bash
# VPSに接続
ssh root@160.251.xxx.xxx

# コンテナの状態を確認
docker ps

# Ghostが起動していない場合
cd /opt/ghost-blog
docker-compose up -d

# ログを確認
docker-compose logs -f ghost
```

### SSL証明書のエラー

**原因:** DNS設定が完了していない

**対処法:**
1. DNSが正しく設定されているか確認
2. 数時間待ってから再試行
3. SSL証明書を再取得:

```bash
sudo certbot delete --cert-name yourdomain.com
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

### メモリ不足でクラッシュする

**原因:** 2GBプランでも稀にメモリ不足になる場合があります

**対処法:**

```bash
# スワップファイルを作成
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📚 運用Tips

### バックアップ

定期的にバックアップを取得してください:

```bash
# VPSに接続
ssh root@160.251.xxx.xxx
cd /opt/ghost-blog

# Ghostコンテンツのバックアップ
docker-compose exec ghost tar czf /tmp/content-backup.tar.gz -C /var/lib/ghost content
docker cp ghost:/tmp/content-backup.tar.gz ./content-backup-$(date +%Y%m%d).tar.gz

# データベースのバックアップ
docker-compose exec db mysqldump -u ghost -p${DB_PASSWORD} ghostdb > backup-$(date +%Y%m%d).sql

# ローカルにダウンロード（ローカルマシンで実行）
scp root@160.251.xxx.xxx:/opt/ghost-blog/content-backup-*.tar.gz ./
scp root@160.251.xxx.xxx:/opt/ghost-blog/backup-*.sql ./
```

### SSL証明書の自動更新

Let's Encryptの証明書は90日で期限切れになりますが、Certbotが自動で更新します。

手動で更新する場合:

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

---

## ⚠️ セキュリティ注意事項

1. **パスワード管理**
   - `.env` ファイルは絶対にGitにコミットしない
   - rootパスワード、DBパスワードは強力なものを使用

2. **定期的な更新**
   - システムパッケージを定期的に更新
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **ファイアウォール**
   - UFWが有効になっていることを確認
   ```bash
   sudo ufw status
   ```

4. **バックアップ**
   - 週1回以上のバックアップを推奨

---

## 📞 サポート

問題が解決しない場合:

- [Ghost公式ドキュメント](https://ghost.org/docs/)
- [ConoHa VPSサポート](https://www.conoha.jp/vps/)
- [GitHub Issues](https://github.com/YOUR_REPO/g_ghost/issues)

---

**お疲れ様でした！楽しいブログライフを！** 🎉
