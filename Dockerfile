FROM ghost:5-alpine

# カスタマイズが必要な場合はここに追加
# 例: テーマやプラグインの追加
# COPY --chown=node:node ./themes/custom-theme /var/lib/ghost/content/themes/custom-theme

# 作業ディレクトリ
WORKDIR /var/lib/ghost

# ポート公開
EXPOSE 2368

# デフォルトコマンド（公式イメージのものを使用）
CMD ["node", "current/index.js"]
