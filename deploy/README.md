# تشغيل Content Hub محليًا على خادم شخصي

يعمل التطبيق باستخدام **Node.js وSQLite وsystemd وNginx** فقط. لا يحتاج إلى Supabase أو أي قاعدة بيانات سحابية. تُخزَّن الحسابات والجلسات ورموز استعادة كلمة المرور وسجل الأمان وأسرار التطبيق في ملف SQLite محلي واحد، بينما يُستخدم Resend كبوابة إرسال بريد فقط.

## 1. تجهيز الخادم

ثبّت Node.js 22 وGit وNginx، ثم انسخ المشروع إلى `/var/www/shifaa`:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo mkdir -p /var/www/shifaa /var/lib/shifaa
sudo chown "$USER":"$USER" /var/www/shifaa
sudo chown www-data:www-data /var/lib/shifaa
sudo chmod 700 /var/lib/shifaa
git clone https://github.com/USERNAME/content-hub.git /var/www/shifaa
cd /var/www/shifaa
cp .env.example .env
nano .env
```

يجب أن يحتوي `.env` على بريد المدير الأول وكلمة مرور قوية ومفتاح ثابت لتشفير أسرار التطبيق. لا ترفع ملف `.env` إلى GitHub.

## 2. متغيرات البيئة

| المتغير | الغرض |
|---|---|
| `LOCAL_DB_PATH` | المسار الدائم لملف SQLite، ويفضّل `/var/lib/shifaa/content-hub.sqlite` |
| `ADMIN_EMAIL` | بريد المدير الذي يُنشأ مرة واحدة عندما تكون القاعدة فارغة |
| `ADMIN_PASSWORD` | كلمة مرور المدير الأول، 10 محارف على الأقل |
| `APP_SECRETS_KEY` | مفتاح طويل وثابت لتشفير أسرار التطبيق داخل SQLite |
| `RESEND_API_KEY` | إرسال رسائل استعادة كلمة المرور والتنبيهات فقط |
| `RESEND_FROM_EMAIL` | عنوان المرسل الموثق في Resend |
| `OPENAI_API_KEY` | اختياري؛ يمكن أيضًا حفظه مشفّرًا من لوحة الإدارة |
| `HOST` و`PORT` | عنوان الاستماع والمنفذ، والقيمتان المعتادتان `0.0.0.0` و`3000` |

> تغيير `APP_SECRETS_KEY` بعد حفظ أسرار من لوحة الإدارة يمنع فك تشفير القيم القديمة. احتفظ به في مدير أسرار أو نسخة احتياطية آمنة.

## 3. البناء الأول

```bash
cd /var/www/shifaa
npm ci
NITRO_PRESET=node-server npm run build
sudo chown -R www-data:www-data /var/www/shifaa
sudo chown -R www-data:www-data /var/lib/shifaa
```

اختبر التطبيق قبل تفعيل الخدمة:

```bash
sudo -u www-data env $(grep -v '^#' .env | xargs) node .output/server/index.mjs
```

عند أول إقلاع، ينشئ التطبيق قاعدة SQLite والمدير المحدد في `.env`. بعد ذلك تصبح قاعدة البيانات المصدر الوحيد للحسابات، ولن يؤدي تغيير `ADMIN_EMAIL` أو `ADMIN_PASSWORD` إلى تعديل المدير الموجود.

## 4. التشغيل الدائم عبر systemd

```bash
sudo cp deploy/shifaa.service /etc/systemd/system/shifaa.service
sudo systemctl daemon-reload
sudo systemctl enable --now shifaa
sudo systemctl status shifaa
```

يمكن متابعة السجلات بالأمر:

```bash
journalctl -u shifaa -f
```

## 5. Nginx وHTTPS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/shifaa
sudo ln -sf /etc/nginx/sites-available/shifaa /etc/nginx/sites-enabled/shifaa
sudo nginx -t && sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shifaa.at -d www.shifaa.at
```

## 6. التحديثات اللاحقة

```bash
cd /var/www/shifaa
bash deploy/deploy.sh
```

يبني السكربت إصدارًا جديدًا ثم يعيد تشغيل الخدمة. ملف SQLite خارج مجلد Git، لذلك لا يتأثر بالسحب أو البناء.

## 7. النسخ الاحتياطي

أوقف الكتابة مؤقتًا أو استخدم أمر النسخ الاحتياطي المدمج في SQLite. أبسط نسخة متسقة أثناء نافذة صيانة قصيرة:

```bash
sudo systemctl stop shifaa
sudo cp /var/lib/shifaa/content-hub.sqlite "/var/backups/content-hub-$(date +%F-%H%M).sqlite"
sudo systemctl start shifaa
```

احتفظ أيضًا بنسخة آمنة من `.env`، ولا سيما `APP_SECRETS_KEY`. استعادة ملف القاعدة دون مفتاح التشفير الصحيح ستعيد الحسابات، لكنها لن تسمح بفك أسرار التطبيق المخزنة.

## استكشاف الأخطاء

| المشكلة | الإجراء |
|---|---|
| الخدمة لا تبدأ | افحص `journalctl -u shifaa -n 100 --no-pager` |
| خطأ صلاحية SQLite | طبّق `sudo chown -R www-data:www-data /var/lib/shifaa` و`sudo chmod 700 /var/lib/shifaa` |
| لا يمكن إنشاء المدير الأول | تأكد من ضبط `ADMIN_EMAIL` و`ADMIN_PASSWORD` وأن كلمة المرور لا تقل عن 10 محارف |
| لا تصل رسالة الاستعادة | تحقق من `RESEND_API_KEY` ومن توثيق نطاق `RESEND_FROM_EMAIL` |
| فشل فك سر محفوظ | أعد القيمة الأصلية لـ`APP_SECRETS_KEY` ثم أعد تشغيل الخدمة |
