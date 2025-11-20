# Ghost ブログ環境

Dockerを使用したGhostブログの開発環境です。

## 必要な環境

- Docker Desktop
- Docker Compose

## ディレクトリ構成

```
g_ghost/
├── docker-compose.yml  # Docker Compose設定
├── Dockerfile          # カスタムイメージ用（オプション）
├── .dockerignore       # Docker除外ファイル
└── README.md           # このファイル
```

## 起動方法

### 1. コンテナの起動

```bash
docker-compose up -d
```

`-d` オプションでバックグラウンドで起動します。

### 2. 起動確認

```bash
# ログを確認
docker-compose logs -f ghost

# コンテナの状態を確認
docker-compose ps
```

Ghostが正常に起動すると、以下のようなログが表示されます：
```
ghost | [2025-11-20 13:00:00] INFO Ghost is running in development...
ghost | [2025-11-20 13:00:00] INFO Listening on: 0.0.0.0:2368
ghost | [2025-11-20 13:00:00] INFO Url configured as: http://localhost:2368/
```

### 3. アクセス

- **ブログトップ**: http://localhost:2368
- **管理画面**: http://localhost:2368/ghost

初回アクセス時は、管理者アカウントの作成画面が表示されます。

## 初期設定

### 管理者アカウントの作成

1. http://localhost:2368/ghost にアクセス
2. 以下の情報を入力：
   - サイト名
   - 名前
   - メールアドレス
   - パスワード

### ブログの設定

管理画面から以下の設定が可能です：

- **Settings** → **General**: サイト名、説明、タイムゾーンなど
- **Settings** → **Design**: テーマの変更、ナビゲーション設定
- **Settings** → **Labs**: 実験的機能の有効化

## コンテナ操作

### コンテナの停止

```bash
docker-compose down
```

### コンテナの再起動

```bash
docker-compose restart
```

### データも削除して完全にクリーンアップ

```bash
docker-compose down -v
```

**注意**: `-v` オプションを使用すると、記事やアップロードした画像などすべてのデータが削除されます。

### コンテナ内に入る

```bash
# Ghostコンテナに入る
docker-compose exec ghost sh

# MySQLコンテナに入る
docker-compose exec db bash
```

## データの永続化

以下のDockerボリュームにデータが保存されます：

- `ghost_content`: Ghostのコンテンツ（記事、画像、テーマなど）
- `ghost_db`: MySQLデータベース

ボリュームを確認：
```bash
docker volume ls
```

## カスタマイズ

### テーマの追加

1. テーマファイルを `themes/` ディレクトリに配置
2. `Dockerfile` を編集してテーマをコピー：
```dockerfile
COPY --chown=node:node ./themes/custom-theme /var/lib/ghost/content/themes/custom-theme
```
3. `docker-compose.yml` でカスタムイメージを使用するように変更：
```yaml
ghost:
  build: .
  # image: ghost:5-alpine をコメントアウト
```

### 環境変数の変更

`docker-compose.yml` の `environment` セクションで設定を変更できます：

```yaml
environment:
  url: http://localhost:2368  # 本番環境ではドメイン名に変更
  NODE_ENV: development       # 本番環境では production に変更
```

### ポート番号の変更

デフォルトは `2368` ですが、変更する場合：

```yaml
ports:
  - "3000:2368"  # ホスト側のポートを3000に変更
```

その後、`url` も変更が必要です：
```yaml
environment:
  url: http://localhost:3000
```

## トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker-compose logs ghost
docker-compose logs db

# コンテナを再作成
docker-compose down
docker-compose up -d --force-recreate
```

### データベース接続エラー

MySQLコンテナが完全に起動するまで待ってから、Ghostを再起動：

```bash
docker-compose restart ghost
```

### ポートが既に使用されている

ポート2368が既に使用されている場合、`docker-compose.yml` でポート番号を変更してください。

### データをバックアップしたい

```bash
# コンテンツのバックアップ
docker-compose exec ghost tar czf /tmp/content-backup.tar.gz -C /var/lib/ghost content
docker cp ghost:/tmp/content-backup.tar.gz ./content-backup.tar.gz

# データベースのバックアップ
docker-compose exec db mysqldump -u ghost -pghostpassword ghostdb > backup.sql
```

## 本番環境への移行

本番環境で使用する場合は、以下を変更してください：

1. **環境変数の変更**:
```yaml
environment:
  url: https://yourdomain.com
  NODE_ENV: production
```

2. **パスワードの変更**:
```yaml
environment:
  database__connection__password: 強力なパスワード
  MYSQL_PASSWORD: 強力なパスワード
  MYSQL_ROOT_PASSWORD: 強力なパスワード
```

3. **リバースプロキシの設定** (nginx, Caddy など)

## 参考リンク

- [Ghost公式ドキュメント](https://ghost.org/docs/)
- [Ghost公式フォーラム](https://forum.ghost.org/)
- [Ghostテーママーケットプレイス](https://ghost.org/themes/)

## ライセンス

このDocker環境設定は自由に使用できます。Ghostのライセンスについては[公式サイト](https://ghost.org/)を参照してください。
