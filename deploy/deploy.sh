#!/usr/bin/env bash
# نشر Content Hub محليًا على Ubuntu/Debian بدون Docker أو Supabase.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/shifaa}"
DATA_DIR="${DATA_DIR:-/var/lib/shifaa}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  echo "خطأ: ملف $APP_DIR/.env غير موجود. انسخ .env.example واضبط القيم السرية أولًا." >&2
  exit 1
fi

echo "==> سحب آخر تحديثات GitHub"
git pull --ff-only origin "$BRANCH"

echo "==> تثبيت الاعتماديات من package-lock.json"
npm ci

echo "==> بناء إصدار Node"
NITRO_PRESET=node-server npm run build

echo "==> تجهيز تخزين SQLite المحلي"
sudo install -d -o www-data -g www-data -m 700 "$DATA_DIR"
sudo chown root:www-data .env
sudo chmod 640 .env

echo "==> إعادة تشغيل الخدمة"
sudo systemctl restart shifaa
sudo systemctl --no-pager --full status shifaa

echo "تم النشر بنجاح على http://127.0.0.1:${PORT:-3000}"
