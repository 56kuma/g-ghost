# 環境変数管理ガイド

このプロジェクトでは、開発環境と本番環境で異なる設定を管理するために、環境変数ファイルを分けています。

## 📁 環境変数ファイル一覧

| ファイル | 用途 | Gitにコミット |
|---------|------|-------------|
| `.env.example` | テンプレート（サンプル値） | ✅ する |
| `.env.development` | 開発環境用の設定 | ❌ しない |
| `.env.production` | 本番環境用の設定 | ❌ しない |
| `.env` | 実行時に使用される設定 | ❌ しない |

---

## 🖥️ 開発環境での使い方

### 初回セットアップ

```bash
# 1. 開発環境セットアップスクリプトを実行
chmod +x setup-dev.sh
./setup-dev.sh

# これにより以下が自動実行されます:
# - .env.development を .env にコピー
# - Dockerコンテナの起動
```

### 手動セットアップ（スクリプトを使わない場合）

```bash
# 1. .env.development を .env にコピー
cp .env.development .env

# 2. Dockerコンテナを起動
docker-compose up -d

# 3. Ghost管理画面にアクセス
# http://localhost:2368/ghost

# 4. Content API Key を取得して、main.ts と post.ts に設定
```

### main.ts と post.ts の設定（開発環境）

```typescript
// main.ts と post.ts の config を開発環境用に設定
// dev のコメントを解除、prod をコメントアウト

// prod
// const config: GhostConfig = {
//     url: 'https://masudaily.jp',
//     key: 'a7b90e53468acbbe51a0f3ab7d',
//     version: 'v5.0'
// };

// dev
const config: GhostConfig = {
    url: 'http://localhost:2368',
    key: '691bd2d288c7e2579ff1c4865a',  // ローカルのAPI Key
    version: 'v5.0'
};
```

### ビルドと確認

```bash
# TypeScriptをビルド
npm run build

# ブラウザで index.html を開いて確認
```

---

## 🌐 本番環境へのデプロイ

### 事前準備

1. **main.ts と post.ts を本番環境用に変更**

```typescript
// main.ts と post.ts の config を本番環境用に設定
// prod のコメントを解除、dev をコメントアウト

// prod
const config: GhostConfig = {
    url: 'https://masudaily.jp',
    key: 'a7b90e53468acbbe51a0f3ab7d',
    version: 'v5.0'
};

// dev
// const config: GhostConfig = {
//     url: 'http://localhost:2368',
//     key: '691bd2d288c7e2579ff1c4865a',
//     version: 'v5.0'
// };
```

2. **.env.production が存在することを確認**

```bash
# .env.production の存在を確認
ls -la .env.production

# 内容を確認（パスワードが正しいか）
cat .env.production
```

### デプロイ実行

```bash
# デプロイスクリプトを実行
# deploy.sh が自動的に .env.production を使用します
./deploy.sh conoha
```

**重要**: `deploy.sh` は自動的に `.env.production` をVPSにアップロードして `.env` として配置します。手動で `.env` を作成する必要はありません。

---

## 🔄 環境切り替えのクイックコマンド

### 開発環境に切り替え

```bash
# .env を開発環境用に切り替え
cp .env.development .env

# main.ts と post.ts の設定を開発環境用に変更
# （エディタで手動編集）

# ビルド
npm run build

# サーバー起動
npm run serve

```

### 本番環境に切り替え

```bash
# main.ts と post.ts の設定を本番環境用に変更
# （エディタで手動編集）

# ビルドとデプロイ
npm run build
./deploy.sh conoha
```

---

## 📝 .env ファイルの内容

### 開発環境用 (.env.development)

```env
GHOST_URL=http://localhost:2368
DB_NAME=ghostdb
DB_USER=ghost
DB_PASSWORD=dev_password_change_me
DB_ROOT_PASSWORD=dev_root_password_change_me
```

### 本番環境用 (.env.production)

```env
GHOST_URL=https://masudaily.jp
DB_NAME=ghostdb
DB_USER=ghost
DB_PASSWORD=本番用強力パスワード
DB_ROOT_PASSWORD=本番用強力ルートパスワード
```

---

## ⚠️ セキュリティ注意事項

1. **絶対にGitにコミットしてはいけないファイル**
   - `.env`
   - `.env.development`
   - `.env.production`

2. **パスワードの管理**
   - 本番環境のパスワードは必ず強力なものを使用
   - パスワードマネージャーで管理を推奨

3. **API Keyの取り扱い**
   - Ghost Content API Key は読み取り専用なので、比較的安全
   - ただし、プライベートリポジトリでの管理を推奨

---

## 🐛 トラブルシューティング

### デプロイ時に `.env.production が見つかりません` エラー

```bash
# .env.production が存在するか確認
ls -la .env.production

# 存在しない場合は、.env.example をコピーして作成
cp .env.example .env.production
# エディタで本番環境用の値に変更
```

### ローカルで Ghost に接続できない

```bash
# .env が開発環境用になっているか確認
cat .env

# Dockerコンテナが起動しているか確認
docker-compose ps

# 起動していない場合は起動
docker-compose up -d
```

### 本番環境で 404 エラー

```bash
# main.ts と post.ts が本番環境用設定になっているか確認
grep "url:" main.ts
grep "url:" post.ts

# https://masudaily.jp になっていれば OK
# http://localhost:2368 になっていたら、本番環境用に変更してビルド・デプロイ
```

---

## 📚 関連ドキュメント

- [CONOHA-DEPLOYMENT.md](./CONOHA-DEPLOYMENT.md) - 本番環境へのデプロイ手順
- [README.md](./README.md) - プロジェクト概要

---

**最終更新**: 2025年12月13日
