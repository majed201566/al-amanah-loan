# 📤 رفع المشروع إلى GitHub — دليل سريع

## الطريقة 1: استخدام هذا الملف المضغوط (موصى بها)

```bash
# 1. فك الضغط
unzip al-amanah-loan-github.zip
cd al-amanah-loan

# 2. المشروع يحتوي مسبقاً على Git commit جاهز
#    تحتاج فقط لإضافة المستودع البعيد والرفع:

git remote add origin https://github.com/your-username/al-amanah-loan.git
git push -u origin main

# 3. انتقل إلى GitHub وتأكد من رفع كل الملفات
```

---

## الطريقة 2: الرفع اليدوي عبر واجهة GitHub

1. اذهب إلى https://github.com/new
2. أنشئ مستودعاً جديداً باسم `al-amanah-loan`
3. **لا** تضف README أو .gitignore أو license
4. بعد إنشاء المستودع، اسحب ملفات المشروع وأفلتها في المتصفح
5. اضغط "Commit changes"

---

## بعد الرفع إلى GitHub

```bash
# 4. اذهب إلى Vercel
#    https://vercel.com → New Project → استورد المستودع

# 5. أضف متغيرات البيئة (من .env.example)

# 6. اضغط Deploy!
```

---

## متغيرات البيئة المطلوبة في Vercel

انسخ هذه من `.env.example` بعد ملئها:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
GOOGLE_SERVICE_ACCOUNT_KEY
GOOGLE_SHEET_ID
GOOGLE_DRIVE_PARENT_FOLDER_ID
ADMIN_USERNAME
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
SMS_PROVIDER
SMS_API_KEY
SMS_SENDER_ID
```

---

## هيكل المستودع بعد الرفع

```
al-amanah-loan/
├── src/           ← 75 ملف مصدري
├── public/        ← أيقونات
├── README.md      ← توثيق كامل (390 سطر)
├── DEPLOYMENT_GUIDE.md  ← دليل النشر (158 سطر)
├── .env.example   ← قالب المتغيرات
├── .env.local     ← نسخة آمنة (قيم وهمية)
├── .gitignore     ← يحمي الأسرار
├── package.json   ← 14 حزمة + 9 أدوات تطوير
├── next.config.ts ← إعدادات الأمان
├── tsconfig.json  ← TypeScript strict
└── eslint.config.mjs
```
