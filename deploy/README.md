# تشغيل المشروع على سيرفر شخصي (بدون Docker)

هذه التعليمات لنشر التطبيق على سيرفر Ubuntu/Debian باستخدام **Node.js + systemd + Nginx** فقط.

---

## 1) رفع المشروع على GitHub

من داخل مجلد المشروع محلياً:

```bash
git init
git branch -M main
git remote add origin git@github.com:USERNAME/shifaa.git
git add .
git commit -m "initial commit"
git push -u origin main
```

> ملاحظة: ملف `.env` **مستبعد** من الرفع (موجود في `.gitignore`). ارفع فقط `.env.example`.

---

## 2) تجهيز السيرفر (لمرة واحدة)

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# (اختياري) Bun أسرع من npm
curl -fsSL https://bun.sh/install | bash
```

إنشاء المستخدم/المجلد وسحب المشروع:

```bash
sudo mkdir -p /var/www/shifaa
sudo chown $USER:$USER /var/www/shifaa
git clone https://github.com/USERNAME/shifaa.git /var/www/shifaa
cd /var/www/shifaa
cp .env.example .env
nano .env      # ضع القيم الحقيقية
```

---

## 3) البناء الأول

```bash
cd /var/www/shifaa
export NITRO_PRESET=node-server   # مهم: بناء لخادم Node بدلاً من Cloudflare
bun install    # أو: npm ci
bun run build  # أو: npm run build
```

المخرج يظهر في `.output/server/index.mjs`.

اختبار سريع:

```bash
node .output/server/index.mjs
# افتح http://SERVER_IP:3000
```

---

## 4) تشغيل دائم عبر systemd

```bash
sudo cp deploy/shifaa.service /etc/systemd/system/shifaa.service
sudo chown -R www-data:www-data /var/www/shifaa
sudo systemctl daemon-reload
sudo systemctl enable --now shifaa
sudo systemctl status shifaa
```

مشاهدة السجلات:

```bash
journalctl -u shifaa -f
```

---

## 5) Nginx + HTTPS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/shifaa
sudo ln -s /etc/nginx/sites-available/shifaa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# شهادة SSL مجانية
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shifaa.at -d www.shifaa.at
```

---

## 6) التحديث لاحقاً

بعد أي `git push` من Lovable أو من جهازك:

```bash
cd /var/www/shifaa
bash deploy/deploy.sh
```

السكربت يقوم بـ: `git pull` → تثبيت → بناء → إعادة تشغيل الخدمة.

---

## متغيرات البيئة المطلوبة

انظر `.env.example`. الأساسيات:

| المتغير | الوصف |
|---|---|
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | اتصال Supabase من الخادم |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الإدارة (سرّي) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | تُدمج وقت البناء للواجهة |
| `RESEND_API_KEY` | إرسال البريد |
| `PORT` | افتراضي 3000 |

---

## استكشاف الأخطاء

- **الخدمة لا تبدأ**: `journalctl -u shifaa -n 100`
- **404 عند التحديث**: تأكد أن Nginx يمرّر كل المسارات إلى `127.0.0.1:3000`.
- **`Missing Supabase env`**: تحقق من `.env` وأن `EnvironmentFile` في وحدة systemd يشير إليه.
- **بناء لـ Cloudflare بدل Node**: صدّر `NITRO_PRESET=node-server` قبل `bun run build`.
