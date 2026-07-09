# 🎯 دليل الحصول على متغيرات البيئة — خطوة بخطوة

> سيأخذك هذا الدليل خطوة بخطوة للحصول على قيمة كل متغير بيئة مطلوب.
> الوقت الإجمالي: **45 دقيقة فقط** — مرة واحدة.

---

## ═══ قبل أن تبدأ ═══

افتح هذه الروابط في تبويبات منفصلة لتوفير الوقت:

| الرابط | الغرض |
|--------|--------|
| https://console.firebase.google.com | Firebase |
| https://console.cloud.google.com | Google Cloud |
| https://sheets.google.com | Google Sheets |
| https://drive.google.com | Google Drive |

ستحتاج أيضاً إلى **مفكرة** (أو ملف نصي) لنسخ القيم فيه.

---

## ═══ الجزء 1: مفاتيح Firebase الستة (20 دقيقة) ═══

### الخطوة 1.1: إنشاء مشروع Firebase

1. افتح https://console.firebase.google.com
2. اضغط على الزر الأزرق الكبير: **"Create a project"** (أو "Add project")
3. في حقل **"Project name"** اكتب:
   ```
   al-amanah-finance
   ```
4. اترك باقي الإعدادات كما هي. اضغط **"Continue"**
5. في شاشة Google Analytics: اتركها مفعلة (أو عطلها، لا يهم). اضغط **"Continue"**
6. اختر حساب Google Analytics الافتراضي. اضغط **"Create project"**
7. انتظر 30-60 ثانية حتى ينتهي الإنشاء. اضغط **"Continue"**

---

### الخطوة 1.2: تفعيل Email/Password Authentication

1. في القائمة اليسرى، اضغط على **"Build"** ثم **"Authentication"**
2. اضغط على زر **"Get started"**
3. اختر تبويب **"Sign-in method"** (في الأعلى)
4. اضغط على صف **"Email/Password"**
5. فعّل المفتاح إلى الوضع **"Enabled"**
6. اضغط **"Save"**

---

### الخطوة 1.3: تسجيل تطبيق الويب (Web App)

1. في أعلى يسار الصفحة، اضغط على أيقونة ⚙️ **(الترس)**
2. اختر **"Project settings"**
3. انتقل للأسفل إلى قسم **"Your apps"**
4. اضغط على زر **"Web"** (الأيقونة `</>`)
5. في حقل **"App nickname"** اكتب:
   ```
   al-amanah-web
   ```
6. **لا** تفعل "Firebase Hosting"
7. اضغط **"Register app"**

---

### الخطوة 1.4: نسخ المتغيرات

بعد التسجيل، ستظهر شاشة فيها كود JavaScript. انسخ القيم الستة التالية:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",              // ← انسخ هذا
  authDomain: "al-amanah-finance.firebaseapp.com",  // ← انسخ هذا
  projectId: "al-amanah-finance",    // ← انسخ هذا
  storageBucket: "al-amanah-finance.appspot.com",   // ← انسخ هذا
  messagingSenderId: "123456789012", // ← انسخ هذا
  appId: "1:123:web:abc..."         // ← انسخ هذا
};
```

> إذا أغلقت الشاشة بالخطأ: Project Settings → Your apps ← اضغط على اسم التطبيق `al-amanah-web` ← ستظهر القيم

**اكتبها في مفكرتك بهذا الشكل:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD... (القيمة الفعلية التي نسختها)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=al-amanah-finance.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=al-amanah-finance
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=al-amanah-finance.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## ═══ الجزء 2: حساب خدمة Google Cloud (10 دقائق) ═══

### الخطوة 2.1: فتح Google Cloud Console

1. افتح https://console.cloud.google.com
2. في أعلى الشاشة، بجانب شعار Google Cloud، اضغط على اسم المشروع الحالي
3. في النافذة المنبثقة، اضغط **"NEW PROJECT"**
4. اسم المشروع: `al-amanah-gcloud`
5. اضغط **"CREATE"**

---

### الخطوة 2.2: تفعيل Google Sheets API

1. في شريط البحث في الأعلى، اكتب `Google Sheets API`
2. اضغط على **"Google Sheets API"** في النتائج
3. اضغط على زر **"ENABLE"** (الأزرق)
4. انتظر 5 ثوانٍ

---

### الخطوة 2.3: تفعيل Google Drive API

1. ارجع لشريط البحث، اكتب `Google Drive API`
2. اضغط على **"Google Drive API"** في النتائج
3. اضغط على زر **"ENABLE"**

---

### الخطوة 2.4: إنشاء Service Account

1. من القائمة اليسرى ← **"APIs & Services"** ← **"Credentials"**
2. في الأعلى، اضغط **"+ CREATE CREDENTIALS"** ← اختر **"Service account"**
3. في حقل **"Service account name"** اكتب:
   ```
   al-amanah-service
   ```
4. في حقل **"Service account ID"** سيظهر تلقائياً — اتركه
5. اضغط **"CREATE AND CONTINUE"**
6. في شاشة "Role"، اختر من القائمة المنسدلة: **"Basic"** ← **"Editor"**
7. اضغط **"CONTINUE"**
8. اضغط **"DONE"**

---

### الخطوة 2.5: تحميل مفتاح JSON

1. في قائمة حسابات الخدمة، اضغط على **`al-amanah-service@...iam.gserviceaccount.com`**
2. اختر تبويب **"KEYS"** (في الأعلى)
3. اضغط **"ADD KEY"** ← **"Create new key"**
4. اختر **"JSON"** ← اضغط **"CREATE"**
5. سيتم تحميل ملف `.json` إلى جهازك
6. افتح الملف المحمّل (بأي محرر نصوص)
7. **انسخ كل المحتوى** — من `{` إلى `}` — واجعله **سطراً واحداً** (أزل أي فواصل أسطر)

> إذا كان عندك Android ولا تستطيع فتح JSON، استخدم تطبيق "QuickEdit" المجاني لفتحه.

**القيمة النهائية** — تبدو هكذا (لكن أطول بكثير مع قيمك الحقيقية):
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"al-amanah-gcloud","private_key_id":"abc123def456","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----\n","client_email":"al-amanah-service@al-amanah-gcloud.iam.gserviceaccount.com","client_id":"123456789012345678901","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/al-amanah-service%40al-amanah-gcloud.iam.gserviceaccount.com"}
```

---

## ═══ الجزء 3: Google Sheets (5 دقائق) ═══

### الخطوة 3.1: إنشاء Google Sheet

1. افتح https://sheets.google.com
2. اضغط على **"+ Blank"** (المربع الفارغ)
3. سيتم إنشاء Sheet جديد

---

### الخطوة 3.2: مشاركته مع حساب الخدمة

1. اضغط على زر **"Share"** (أخضر، أعلى اليمين)
2. في حقل **"Add people and groups"**، الصق إيميل حساب الخدمة الذي حصلت عليه في الجزء 2.5
   - الإيميل موجود في ملف JSON تحت `client_email`
   - شكله: `al-amanah-service@al-amanah-gcloud.iam.gserviceaccount.com`
3. على اليمين، تأكد من الصلاحية: **"Editor"**
4. ألغِ تحديد مربع "Notify people"
5. اضغط **"Share"**

---

### الخطوة 3.3: نسخ Sheet ID

1. انظر إلى شريط العنوان في المتصفح:
   ```
   https://docs.google.com/spreadsheets/d/1B2n3AbC4dEf5GhIjKlMnOpQrStUvWxYz/edit
   ```
2. انسخ الجزء الطويل بين `/d/` و `/edit`:
   ```
   1B2n3AbC4dEf5GhIjKlMnOpQrStUvWxYz
   ```

**القيمة:**
```
GOOGLE_SHEET_ID=1B2n3AbC4dEf5GhIjKlMnOpQrStUvWxYz
```
(طبعاً مع المعرف الفعلي الخاص بك)

---

### الخطوة 3.4: تهيئة تبويبات الـ Sheet

1. في الأسفل، اضغط على **"+"** لإنشاء تبويب جديد
2. سمّه: `Settings`
3. اضغط على **"+"** مرة أخرى
4. سمّه: `Admins`
5. الآن لديك 3 تبويبات: `Sheet1` (الافتراضي) + `Settings` + `Admins`

---

## ═══ الجزء 4: بيانات المدير (دقيقتان) ═══

### الخطوة 4.1: اسم المستخدم وكلمة المرور

اختر قيماً قوية:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=K9#mP2$vL7@xQ4!
```

> ⚠️ غيّر `K9#mP2$vL7@xQ4!` إلى كلمة مرور قوية من اختيارك.

---

### الخطوة 4.2: مفتاح الجلسة

لقد ولّدت لك مفتاحاً عشوائياً آمناً:

```
ADMIN_SESSION_SECRET=9959e38212a4d7abd779ee0bb72ca3540879352f5ce93b12f024382fb78cc178
```

> هذا المفتاح فريد وآمن. استخدمه كما هو.

---

## ═══ الجزء 5: تجميع كل المتغيرات ═══

الآن لديك كل القيم. اجمعها في قائمة واحدة:

```bash
# ── Firebase (6 متغيرات — من الخطوة 1.4) ──
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD... (قيمتك من Firebase)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=al-amanah-finance.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=al-amanah-finance
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=al-amanah-finance.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# ── Google Service Account (من الخطوة 2.5) ──
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# ── Google Sheets (من الخطوة 3.3) ──
GOOGLE_SHEET_ID=1B2n3AbC4dEf5GhIjKlMnOpQrStUvWxYz

# ── Admin (من الخطوة 4.1 و 4.2) ──
ADMIN_USERNAME=admin
ADMIN_PASSWORD=K9#mP2$vL7@xQ4!
ADMIN_SESSION_SECRET=9959e38212a4d7abd779ee0bb72ca3540879352f5ce93b12f024382fb78cc178
```

---

## ═══ الجزء 6: إضافتها إلى Netlify ═══

1. افتح https://app.netlify.com ← اختر موقعك
2. من القائمة اليسرى ← **"Site configuration"**
3. اختر **"Environment variables"**
4. لكل متغير أعلاه:
   - اضغط **"Add a variable"**
   - الصق اسم المتغير في الحقل الأول (مثلاً `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - الصق قيمته في الحقل الثاني
   - اضغط **"Create variable"**
5. بعد إضافة الـ 11 متغيراً، اذهب إلى **"Deploys"**
6. اضغط **"Trigger deploy"** ← **"Clear cache and deploy site"**
7. انتظر 2-3 دقائق

---

## ═══ بعد النشر — اختبار ═══

| الصفحة | كيف تختبر |
|--------|----------|
| `/` | تفتح وتعرض الصفحة الرئيسية |
| `/register` | تسجل بحساب جديد — يصل رابط تأكيد لبريدك |
| `/login` | تسجل دخول بعد التأكيد |
| `/loan-application` | تقدم طلباً تجريبياً |
| `/admin/login` | تسجل دخول بـ `admin` وكلمة المرور التي اخترتها |

---

## ═══ ملخص سريع ═══

| # | المتغير | من أين تحصل عليه |
|---|---------|-----------------|
| 1 | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase → Project Settings → Web App |
| 2 | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase → Project Settings → Web App |
| 3 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase → Project Settings → Web App |
| 4 | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase → Project Settings → Web App |
| 5 | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase → Project Settings → Web App |
| 6 | `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase → Project Settings → Web App |
| 7 | `GOOGLE_SERVICE_ACCOUNT_KEY` | Google Cloud → Service Account → JSON Key |
| 8 | `GOOGLE_SHEET_ID` | رابط Google Sheet بين `/d/` و `/edit` |
| 9 | `ADMIN_USERNAME` | تختاره بنفسك |
| 10 | `ADMIN_PASSWORD` | تختاره بنفسك |
| 11 | `ADMIN_SESSION_SECRET` | `9959e38212a4d7abd779ee0bb72ca3540879352f5ce93b12f024382fb78cc178` |
