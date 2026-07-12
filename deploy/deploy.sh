#!/usr/bin/env bash
# نشر المشروع على سيرفر شخصي (Ubuntu/Debian) — بدون Docker
# الاستعمال:  bash deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/shifaa}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

echo "==> سحب آخر تحديثات من GitHub"
git pull origin "$BRANCH"

echo "==> تثبيت الاعتماديات"
if command -v bun >/dev/null 2>&1; then
  bun install --frozen-lockfile
else
  npm ci
fi

echo "==> بناء المشروع لسيرفر Node"
export NITRO_PRESET=node-server
if command -v bun >/dev/null 2>&1; then
  bun run build
else
  npm run build
fi

echo "==> إعادة تشغيل الخدمة"
sudo systemctl restart shifaa

echo "✔ تم النشر بنجاح — http://127.0.0.1:${PORT:-3000}"
