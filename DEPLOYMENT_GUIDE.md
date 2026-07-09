# 🚀 دليل النشر الكامل — الأمانة للتمويل
## ✅ خطة Spark المجانية كافية — لا تحتاج أي اشتراك مدفوع!

##  المتطلبات الأساسية

- حساب Google (Gmail)
- حساب GitHub (مجاني)
- حساب Vercel (مجاني)
- متصفح ويب فقط

---

##  المرحلة 1: إعداد Firebase (Email/Password — مجاني)

### 1.1 إنشاء مشروع Firebase
1. اذهب إلى https://console.firebase.google.com
2. اضغط "Add project" → اسم: `al-amanah-finance` → Create

### 1.2 تفعيل Email/Password Auth
1. Build → Authentication → Sign-in method
2. اضغط Email/Password → فعّله → Save
3. (Email link يبقى معطلاً)

### 1.3 الحصول على مفاتيح Firebase
1. ⚙️ Project settings → Your apps → Add app (Web)
2. اسم: `al-amanah-web` → Register
3. انسخ القيم الظاهرة (apiKey, authDomain, projectId, etc.)

---

##  المرحلة 2: Google Cloud Service Account

1. https://console.cloud.google.com → APIs & Services → Library
2. فعّل Google Sheets API و Google Drive API
3. APIs & Services → Credentials → Create Service Account
4. اسم: `al-amanah-service` → دور: Editor → Done
5. Keys → Add Key → JSON → حمّل الملف
6. افتح الملف وانسخ كل محتواه (JSON كامل، سطر واحد)

---

##  المرحلة 3: Google Sheet

1. sheets.google.com → Blank → اسم: `Al-Amanah Applications`
2. Share → أضف إيميل حساب الخدمة (Editor)
3. أنشئ 3 تبويبات: `Sheet1`, `Settings`, `Admins`
4. انسخ Sheet ID من الرابط (بين /d/ و /edit)

---

##  المرحلة 4: Google Drive (اختياري)

1. drive.google.com → مجلد جديد: `Al-Amanah Applications`
2. شاركه مع إيميل حساب الخدمة (Editor)
3. انسخ Folder ID من الرابط

---

##  المرحلة 5: SMTP Email (اختياري)

لإشعارات البريد:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=كلمة_مرور_التطبيق_16_حرف
SMTP_FROM=noreply@al-amanah.iq
```
(فعّل 2-Step Verification ثم أنشئ App Password)

---

##  المرحلة 6: رفع المشروع إلى GitHub

```bash
cd al-amanah-loan
git init && git add . && git commit -m "Production release"
git remote add origin https://github.com/YOUR_USER/al-amanah-loan.git
git push -u origin main
```

---

##  المرحلة 7: نشر على Vercel

1. vercel.com → سجل بـ GitHub → New Project
2. اختر المستودع → Import
3. أضف كل متغيرات البيئة (من .env.example):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GOOGLE_SERVICE_ACCOUNT_KEY={JSON كامل}
GOOGLE_SHEET_ID=...
GOOGLE_DRIVE_PARENT_FOLDER_ID=...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=كلمة_مرور_قوية
ADMIN_SESSION_SECRET=سلسلة_عشوائية_طويلة
SMTP_HOST=... (اختياري)
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
SMS_PROVIDER=... (اختياري)
SMS_API_KEY=...
SMS_SENDER_ID=...
```

4. Deploy → انتظر 2-3 دقائق

---

##  المرحلة 8: الاختبار بعد النشر

| الصفحة | الاختبار |
|--------|---------|
| `/register` | سجل بحساب جديد (بريد + كلمة مرور) → تأكد من وصول رابط التأكيد |
| `/login` | سجل دخول بالبريد المؤكد → يجب توجيهك لـ dashboard |
| `/forgot-password` | أدخل البريد → تأكد من وصول رابط التعيين |
| `/loan-application` | قدم طلب تجريبي → تأكد من ظهوره في Google Sheet |
| `/admin/login` | سجل دخول باسم admin → تأكد من ظهور لوحة التحكم |
| `/admin` | جرب الموافقة/رفض طلب → تأكد من تحديث الـ Sheet |

---

## 🔧 استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| المشروع لا يبني | تأكد من جميع متغيرات البيئة في Vercel |
| رابط التأكيد لا يصل | تحقق من مجلد Spam |
| Google Sheets فارغ | تأكد من صلاحية Editor لحساب الخدمة |
| خطأ 403 في API | تحقق من GOOGLE_SERVICE_ACCOUNT_KEY صحيح |
| تسجيل الدخول لا يعمل | تأكد من تأكيد البريد أولاً |

---

##  متغيرات البيئة — مرجع سريع

| المتغير | مطلوب؟ |
|---------|--------|
| NEXT_PUBLIC_FIREBASE_* (6) | ✅ نعم |
| GOOGLE_SERVICE_ACCOUNT_KEY | ✅ نعم |
| GOOGLE_SHEET_ID | ✅ نعم |
| GOOGLE_DRIVE_PARENT_FOLDER_ID | ❌ لا |
| ADMIN_USERNAME | ✅ نعم |
| ADMIN_PASSWORD | ✅ نعم |
| ADMIN_SESSION_SECRET | ✅ نعم |
| SMTP_* (5) | ❌ لا |
| SMS_* (3) | ❌ لا |

---

**تم النشر بنجاح! 🎉**
