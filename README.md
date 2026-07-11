# الأمانة للتمويل — Al-Amanah Finance

<div dir="rtl">

منصة تمويل كاملة باللغة العربية (RTL) مبنية بتقنيات حديثة. نظام متكامل لتقديم طلبات القروض، إدارة العملاء، ولوحة تحكم إدارية احترافية.

</div>

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **⚠️ Before production use**, copy `.env.example` to `.env.local` and fill in all required values. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

---

## 📊 Project Overview

| Metric | Value |
|--------|-------|
| Source files | 74 |
| Pages | 16 |
| API routes | 12 |
| Total routes | 29 |
| TypeScript strict | ✅ |
| Build output | 31MB |
| Architecture | Next.js 16 App Router + RTL |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS 4** |
| Animations | **Framer Motion** |
| Icons | **Lucide React** |
| Auth (User) | **Firebase Email/Password + Verification** |
| Auth (Admin) | **HMAC-signed cookies** (SHA-256) |
| Database | **Google Sheets** (REST API) |
| File Storage | **Google Drive** (REST API) |
| Export | **ExcelJS** + **jsPDF** |
| Email | **Nodemailer** |
| Deployment | **Vercel** (zero-config) |

---

## 📁 Project Structure

```
al-amanah-loan/
│
├── src/
│   ├── app/                          # Next.js App Router pages & API
│   │   ├── page.tsx                  # 🏠 Homepage
│   │   ├── layout.tsx                # RTL root layout + Providers
│   │   ├── globals.css               # Premium theme (gold + navy)
│   │   │
│   │   ├── about/                    # About page
│   │   ├── loan-conditions/          # Loan conditions
│   │   ├── required-documents/       # Required documents
│   │   ├── faq/                      # FAQ page
│   │   ├── contact/                  # Contact form
│   │   │
│   │   ├── login/                    # 🔐 Email login
│   │   ├── register/                 # 📝 Email registration
│   │   ├── forgot-password/          # 🔑 Password reset
│   │   ├── profile/                  # 👤 User profile
│   │   ├── dashboard/                # 📊 User dashboard
│   │   │
│   │   ├── loan-application/         # 📋 5-step application form
│   │   │   └── success/              # 🎉 Success page (confetti)
│   │   ├── applications/             # 📑 Application tracking
│   │   │
│   │   ├── admin/                    # 🛡️ Admin panel
│   │   │   ├── login/                # Admin login
│   │   │   ├── page.tsx              # Main dashboard (stats, charts, apps)
│   │   │   └── settings/             # ⚙️ CMS settings page
│   │   │
│   │   └── api/                      # API routes (server-side)
│   │       ├── applications/         # CRUD applications → Google Sheets
│   │       └── admin/                # Admin endpoints
│   │           ├── login/            # Auth
│   │           ├── logout/           # Auth
│   │           ├── me/               # Session check
│   │           ├── stats/            # Analytics
│   │           ├── activities/       # Audit log
│   │           ├── backup/           # Sheet backup
│   │           ├── export/excel/     # Excel export
│   │           ├── export/pdf/       # PDF export
│   │           ├── settings/         # CMS CRUD
│   │           └── applications/[id]/ # Single app + status updates
│   │
│   ├── components/
│   │   ├── layout/                   # Header, Footer, Providers
│   │   ├── sections/                 # Page sections (Hero, Features, CTA, etc.)
│   │   └── ui/                       # Reusable UI components (14 files)
│   │
│   ├── context/
│   │   └── AuthContext.tsx           # Firebase auth state (React Context)
│   │
│   ├── data/
│   │   └── site.ts                   # Site config, nav, loan types, FAQs
│   │
│   ├── hooks/
│   │   └── useAuth.ts               # Auth hook
│   │
│   └── lib/
│       ├── utils.ts                  # cn() helper
│       ├── validators.ts             # All form validators (Iraq-specific)
│       ├── api-service.ts            # Client-side API fetch wrapper
│       ├── rate-limit.ts             # In-memory rate limiter
│       │
│       ├── firebase/
│       │   ├── config.ts             # Firebase init + auth singleton
│       │   └── auth.ts               # Email/Password auth + verification
│       │
│       ├── google/
│       │   ├── config.ts             # JWT auth + REST helper
│       │   ├── sheets.ts             # All Sheets operations (23 columns)
│       │   └── drive.ts              # Folder creation + file upload
│       │
│       ├── admin/
│       │   ├── roles.ts              # 3 roles, permissions, HMAC sessions
│       │   └── audit-log.ts          # Full audit trail
│       │
│       └── services/
│           ├── settings.ts           # CMS: site settings CRUD → Sheets
│           ├── email.ts              # Nodemailer with Arabic HTML templates
│           ├── sms.ts                # Multi-provider Iraqi SMS (4 providers)
│           ├── export-excel.ts       # Excel export (ExcelJS)
│           └── export-pdf.ts         # PDF export (jsPDF)
│
├── .env.example                      # Template for all env variables
├── .env.local                        # Your actual secrets (gitignored)
├── DEPLOYMENT_GUIDE.md               # 9-step deployment guide
├── next.config.ts                    # Security headers
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript config
```

---

## 🔐 Authentication

### User Auth (Firebase Email/Password + Verification)

```
User fills email + password + name
        │
        ▼
   Firebase creates account
        │
        ▼
   Verification email sent to inbox
        │
        ▼
   User clicks verification link in email
        │
        ▼
   Account verified → User can now login
        │
        ▼
   Login → Redirect to /dashboard

Forgot Password:
   User enters email → Reset link sent → New password set
```

### Admin Auth (Cookie-based HMAC)

```
Admin enters username + password at /admin/login
        │
        ▼
   Verify against env vars OR Google Sheets "Admins" tab
        │
        ▼
   Create HMAC-SHA256 signed session cookie (8h expiry)
        │
        ▼
   Every API route verifies cookie → checks role permissions
```

### Admin Roles & Permissions

| Role | Manage Apps | Change Status | Edit Data | Settings | Backup | Export |
|------|:-----------:|:-------------:|:---------:|:--------:|:------:|:------:|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Reviewer** | View only | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📋 Application Form (5 Steps)

| Step | Fields | Validation |
|------|--------|------------|
| 1. Personal Info | Full name, mother's name, national ID, phone, province, city, address, DOB, marital status, children, emergency contact | Iraqi phone, national ID (10-14 digits), DOB (21-65 age) |
| 2. Employment | Employment type, employer, monthly salary | Min salary 500,000 IQD, max loan = 60× salary |
| 3. Loan Details | Purpose, amount, notes | Min 1,000,000 IQD, relationship to salary |
| 4. Documents | 6 document slots (drag-and-drop) | File type (JPG/PNG/PDF), max 10MB each |
| 5. Review | Full summary + agreement checkbox | Final confirmation |

---

## 📊 Google Sheets Structure

### Sheet1 — Applications (23 columns A-W)

| Col | Field | Col | Field |
|-----|-------|-----|-------|
| A | Application ID | M | Children count |
| B | Submission date | N | Emergency phone |
| C | Status | O | Employment type |
| D | Full name | P | Employer |
| E | Mother's name | Q | Monthly salary |
| F | National ID | R | Loan purpose |
| G | Phone | S | Loan amount |
| H | Province | T | Notes |
| I | City | U | Drive folder link |
| J | Address | V | Status note |
| K | Date of birth | W | Last updated |
| L | Marital status | | |

### Settings tab (CMS)
- `A`: key, `B`: value, `C`: Arabic label, `D`: type

### Admins tab (optional)
- `A`: username, `B`: password, `C`: role, `D`: display name, `E`: created

---

## 🔄 Data Flow

```
Browser → POST /api/applications (multipart/form-data)
              │
              ├─► 1. Validate form data
              ├─► 2. Create Google Drive folder
              ├─► 3. Upload each document file
              ├─► 4. Append row to Google Sheets
              └─► 5. Return JSON (success + applicationId)

Admin → PUT /api/admin/applications/[id]
              │
              ├─► Check role permissions
              ├─► Update cell(s) in Google Sheets
              ├─► Log audit entry
              ├─► Send email notification (if SMTP configured)
              └─► Send SMS notification (if SMS configured)
```

---

## 🛠️ Maintenance Guide

### Adding a New Page

1. Create `src/app/new-page/page.tsx`
2. Add link to `src/data/site.ts` → `navLinks` array
3. If it needs auth, wrap in `<AuthGuard>...</AuthGuard>`
4. If public, just render normally

### Adding a New API Endpoint

1. Create `src/app/api/new-endpoint/route.ts`
2. Export `GET`, `POST`, `PUT`, or `DELETE` functions
3. For admin-only: import `getAdminFromCookies` from `@/lib/admin/roles`
4. For public: no auth needed

### Adding a New Setting (CMS)

1. Add a default value in `src/lib/services/settings.ts` → `DEFAULT_SETTINGS`
2. Go to `/admin/settings` → find the field in the appropriate section
3. Or add new `field("key_name", "Arabic Label")` in `src/app/admin/settings/page.tsx`

### Updating Dependencies

```bash
npm outdated          # Check what's outdated
npm update            # Safe updates (minor/patch)
npm install xxx@latest # Major updates (test thoroughly)
npm run build         # Verify build
```

### Backup & Restore

- **Automatic**: Click "نسخ احتياطي" in admin sidebar → creates a dated copy tab in the same Sheet
- **Manual export**: Click Excel/PDF buttons in admin
- **Restore**: Copy data from backup tab back to Sheet1 in Google Sheets UI

### Common Tasks

| Task | Where |
|------|-------|
| Change site name | `/admin/settings` → عام |
| Update phone number | `/admin/settings` → الاتصال |
| Change hero text | `/admin/settings` → القسم الرئيسي |
| Update loan products | `/admin/settings` → منتجات التمويل |
| View applications | `/admin` → إدارة الطلبات |
| Approve/reject | Click application → action buttons |
| Export report | Admin sidebar → تصدير Excel/PDF |
| Add another admin | Add row to "Admins" tab in Google Sheets |

---

## 🔒 Security Checklist

- [x] Email/Password + Email Verification (Firebase — Spark/free plan)
- [x] Admin HMAC-signed sessions (SHA-256)
- [x] Role-based access control (3 roles)
- [x] Rate limiting on admin login (5 req/min)
- [x] Security headers (X-Frame, X-Content-Type, Referrer, Permissions)
- [x] All secrets in environment variables
- [x] Server-only Google credentials (never exposed to client)
- [x] File upload validation (type + size)
- [x] Iraqi phone number validation
- [x] `.env.local` in `.gitignore`
- [ ] Encrypt admin passwords in Sheets (hash function exists, ready to enable)

---

## 📦 Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| next | Framework | 16.2 |
| react | UI library | 19.2 |
| firebase | Email auth | 12.x |
| framer-motion | Animations | 12.x |
| tailwindcss | Styling | 4.x |
| google-auth-library | Google API auth | 10.x |
| exceljs | Excel export | 4.x |
| jspdf + jspdf-autotable | PDF export | 4.x + 5.x |
| nodemailer | Email sending | 9.x |
| lucide-react | Icons | 1.x |
| clsx + tailwind-merge + cva | Utility styling | latest |

---

## 🌐 Deployment

Full step-by-step guide: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** (9 stages, beginner-friendly)

Quick Vercel deploy:

```bash
# 1. Push to GitHub
git add . && git commit -m "Production ready" && git push

# 2. Import project on vercel.com

# 3. Add all env vars from .env.example

# 4. Deploy!
```

---

## 📄 License

Private — All rights reserved. This project is built for **Al-Amanah Finance (الأمانة للتمويل)**.

---

## 🤝 Support

For questions about deployment, customization, or maintenance:

- 📧 Email: info@al-amanah.iq
- 📞 Phone: +964 780 123 4567
- 🌐 Website: (your deployed URL)

---

<div dir="rtl" align="center">

**بُني بكل فخر في العراق 🇮🇶**

</div>
