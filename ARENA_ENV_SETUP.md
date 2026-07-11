# 🔧 إعداد Google Sheets & Drive في Arena — دليل كامل

تم تحديث المشروع الآن ليدعم **3 طرق** لإضافة المفاتيح في Arena، حتى لو لم تجد صفحة Environment Variables.

---

## ✅ الطريقة 1: رفع الملفات مباشرة (موصى بها في Arena - الأسهل)

هذه الطريقة **لا تحتاج** صفحة Environment Variables. فقط ارفع الملفات.

### الخطوات:

#### 1. ارفع ملف Service Account JSON
- في Arena، في الشريط الجانبي للملفات (File Explorer)، اضغط **Upload** أو اسحب الملف
- الملف الذي حملته من Google Cloud (مثلاً `al-amanah-xxxx.json`)
- **أعد تسميته** إلى: `google-service-account.json`
- يجب أن يكون المسار النهائي:
  ```
  /home/user/al-amanah-loan/google-service-account.json
  ```
  أو ببساطة في جذر المشروع `al-amanah-loan/`

**الملفات المقبولة (أي واحد منها):**
- `google-service-account.json` ← **موصى به**
- `service-account.json`
- `google-credentials.json`
- `al-amanah-service-account.json`

#### 2. أنشئ ملف معرف الشيت
- أنشئ ملف جديد في جذر المشروع باسم: `google-sheet-id.txt`
- محتوى الملف هو **معرف الشيت فقط** أو الرابط الكامل (كلاهما يعمل):

**الخيار أ - المعرف فقط (موصى به):**
```
1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

**الخيار ب - الرابط الكامل (سيتم استخراج المعرف تلقائياً):**
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
```

**كيف تحصل على المعرف؟**
- افتح الشيت في المتصفح
- الرابط يكون: `https://docs.google.com/spreadsheets/d/1AbC...XyZ/edit`
- انسخ الجزء بين `/d/` و `/edit` → هذا هو المعرف

#### 3. (اختياري) ملف مجلد Drive
- إذا كنت تريد حفظ المستندات في مجلد محدد، أنشئ: `google-drive-folder-id.txt`
- ضع فيه معرف المجلد أو رابطه
- إذا لم تنشئه، سيتم إنشاء مجلد جديد لكل طلب تلقائياً

#### 4. اختبر الإعداد
- افتح في المتصفح:
  ```
  /api/debug/google-config
  ```
- يجب أن ترى:
  ```json
  {
    "canLoadServiceAccount": true,
    "canLoadSheetId": true,
    "instructions": {
      "serviceAccount": "✅ Service account key found and valid",
      "sheetId": "✅ Sheet ID found"
    }
  }
  ```
- إذا رأيت ✅، جرب تقديم طلب في `/loan-application`

---

## 🔐 الطريقة 2: متغيرات البيئة (Environment Variables) في Arena

إذا كانت Arena توفر صفحة **Environment Variables** أو **Secrets**:

### أين تجدها؟

ابحث في واجهة Arena عن أحد هذه الأماكن:

1. **Project Settings** (أيقونة الترس ⚙️ في الشريط الجانبي)
2. **Settings > Environment Variables**
3. **Secrets** أو **Env** في القائمة الجانبية
4. **Deployment Settings**
5. **Variables** في أعلى الصفحة

> **ملاحظة:** في بعض إصدارات Arena، يُسمى **"Environment"** أو **"Config"** أو **"Secrets"**

### ماذا تضيف؟

| اسم المتغير | القيمة | مثال | مطلوب؟ |
|---|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | محتوى ملف JSON **كاملاً في سطر واحد** | `{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}` | ✅ نعم |
| `GOOGLE_SHEET_ID` | معرف الشيت | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` | ✅ نعم |
| `GOOGLE_DRIVE_PARENT_FOLDER_ID` | معرف مجلد Drive (اختياري) | `1a2B3c4D...` | ❌ اختياري |
| `ADMIN_USERNAME` | اسم مدير | `admin` | ✅ للوحة التحكم |
| `ADMIN_PASSWORD` | كلمة مرور قوية | `...` | ✅ |
| `ADMIN_SESSION_SECRET` | نص عشوائي طويل (32+ حرف) | `random-32-chars...` | ✅ |

### كيف تحول JSON إلى سطر واحد؟

ملف Service Account الأصلي يكون منسقاً بعدة أسطر. تحتاج لضغطه:

**الطريقة السهلة (في Linux/Mac):**
```bash
cat your-service-account.json | jq -c .
```
سيطبع JSON في سطر واحد، انسخه.

**أو يدوياً:**
- افتح الملف في محرر نصوص
- انسخ كل المحتوى
- الصقه في متغير البيئة
- تأكد أن `private_key` يحتوي على `\n` وليس أسطر حقيقية

**مهم:** إذا كان المتغير لا يقبل أسطر جديدة، تأكد أن `\n` موجودة في `private_key` كـ `\n` وليس سطر فعلي.

---

## 📝 الطريقة 3: ملف .env.local (يعمل في التطوير المحلي)

أنشئ ملف `.env.local` في جذر المشروع `al-amanah-loan/`:

```env
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...==\n-----END PRIVATE KEY-----\n","client_email":"your-service@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_DRIVE_PARENT_FOLDER_ID=1a2b3c4d5e6f...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongPassword
ADMIN_SESSION_SECRET=change-this-to-random-32-chars-min
```

**ملاحظات:**
- `.env.local` موجود في `.gitignore`، لن يتم رفعه إلى GitHub (آمن)
- في Arena، قد تحتاج لإعادة تشغيل الخادم بعد إنشائه: `npm run dev`
- تأكد أن JSON في سطر واحد

---

## 🔑 خطوات إعداد Google Cloud (تأكد منها)

بما أنك أنشأت Service Account وفعّلت الـ APIs، تأكد من هذه الخطوات الأخيرة:

### 1. تفعيل APIs
- اذهب إلى: https://console.cloud.google.com > APIs & Services > Library
- تأكد من تفعيل:
  - ✅ Google Sheets API
  - ✅ Google Drive API

### 2. مشاركة الشيت مع Service Account
- افتح Google Sheet الخاص بك
- اضغط Share
- أضف البريد الإلكتروني الموجود في ملف JSON تحت `client_email`
  - مثال: `al-amanah-service@your-project-123456.iam.gserviceaccount.com`
- أعطه صلاحية **Editor**
- اضغط Send (لا تحتاج لإرسال إشعار)

### 3. مشاركة مجلد Drive (إذا تستخدمه)
- افتح Google Drive > المجلد الذي أنشأته
- Share > أضف نفس `client_email` > Editor

### 4. إعداد الشيت
- الصف الأول سيتم إنشاؤه تلقائياً عند أول طلب (23 عمود)
- لا تحتاج لإنشاء أعمدة يدوياً

---

## 🧪 كيف تختبر أن كل شيء يعمل؟

### 1. تحقق من الإعداد:
افتح:
```
https://your-arena-app.com/api/debug/google-config
```
أو محلياً:
```
http://localhost:3000/api/debug/google-config
```

يجب أن ترى `canLoadServiceAccount: true` و `canLoadSheetId: true`

### 2. جرب تقديم طلب:
- اذهب إلى `/loan-application`
- املأ جميع الحقول (استخدم بيانات وهمية صالحة)
- ارفع 5 ملفات مطلوبة (يمكن استخدام نفس الصورة 5 مرات للاختبار)
- اضغط تقديم

### 3. تحقق من النتائج:
- يجب أن تذهب إلى `/loan-application/success?id=LOAN-...`
- افتح Google Sheet → يجب أن ترى صف جديد في الأسفل
- افتح Google Drive → يجب أن ترى مجلد جديد باسم مقدم الطلب

### 4. إذا فشل:
- افتح تبويب Network في DevTools → انظر استجابة `/api/applications`
- الآن الرسائل أصبحت مفصلة (ليست عامة) — ستظهر السبب الحقيقي
- مثال: `فشل حفظه في Google Sheets: ...` أو `Drive folder creation failed: ...`

---

## ❓ أسئلة شائعة - Arena

**س: أين صفحة Environment Variables في Arena؟**
ج: في بعض إصدارات Arena، لا توجد صفحة منفصلة. الطريقة الأسهل هي **رفع الملفات مباشرة** (الطريقة 1 أعلاه) لأن المشروع الآن يدعمها. إذا وجدت Settings > Environment، استخدم الطريقة 2.

**س: هل .env.local يعمل في Arena؟**
ج: نعم، إذا أنشأته في `/home/user/al-amanah-loan/.env.local` وأعدت تشغيل الخادم، سيعمل. لكن رفع ملف JSON مباشر أسهل.

**س: ماذا لو رفعت الملف لكنه لا يزال يقول "غير موجود"؟**
ج: تأكد من:
- اسم الملف **بالضبط** `google-service-account.json` (أحرف صغيرة، شرطة)
- الملف في جذر المشروع `al-amanah-loan/` وليس في مجلد فرعي
- محتوى الملف JSON صالح (جرب فتحه في https://jsonlint.com)
- أعد تشغيل الخادم: `npm run dev` أو أعد بناء: `npm run build`

**س: هل أحتاج لإضافة GOOGLE_SHEET_ID في كل مرة؟**
ج: نعم، إما كمتغير بيئة أو كملف `google-sheet-id.txt`. الطريقة الأسهل: أنشئ ملف نصي.

---

## 📦 الملفات المدعومة الآن (بعد التحديث)

المشروع الآن يبحث تلقائياً عن:

**Service Account (أي واحد):**
- `GOOGLE_SERVICE_ACCOUNT_KEY` env var (JSON string)
- `google-service-account.json`
- `service-account.json`
- `google-credentials.json`
- `al-amanah-service-account.json`

**Sheet ID:**
- `GOOGLE_SHEET_ID` env var
- `google-sheet-id.txt` (معرف أو رابط)
- `sheet-id.txt`

**Drive Folder (اختياري):**
- `GOOGLE_DRIVE_PARENT_FOLDER_ID` env var
- `google-drive-folder-id.txt`

جميعها في جذر المشروع.

---

## 🚀 بعد الإعداد

- احذف ملفات الاختبار إذا أردت (لكن اترك ملفات الـ config)
- لا ترفع `google-service-account.json` إلى GitHub (هو في `.gitignore` الآن؟ تحقق)
- في الإنتاج (Vercel/Netlify)، استخدم Environment Variables وليس الملفات

تم إنشاء نقطة فحص: `/api/debug/google-config` لتشخيص الإعداد في أي وقت.

