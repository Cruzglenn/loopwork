# Loopwork HRIS — Project Progress & Status Report
**Date:** August 7, 2026  
**Repository:** `Cruzglenn/loopwork`  
**Branch:** `main`  
**Environment:** Vercel (Production / Preview)

---

## 🚀 Executive Summary

Today we accomplished major visual, functional, and structural improvements to the **Loopwork HRIS** application. We resolved critical navigation layout issues, replaced hardcoded fallback salaries, localized all currency and formatting to Philippine Peso (PHP / ₱), embedded full TrueType font support for PDF payslips, seeded realistic Filipino employee data into Supabase/Prisma, and optimized mobile responsiveness across loading states.

All updates have been tested, built via Next.js 15, committed, and pushed directly to `origin/main` to trigger automated deployment on Vercel.

---

## 🛠️ Detailed List of Today's Accomplishments

### 1. 📐 Sidebar Navigation Dropping & Viewport Shift Fix
- **Issue:** Navigating to "My Profile" (`/employees/[id]`) or viewing the dashboard on smaller viewports caused the main navigation sidebar (`Dashboard`, `My profile`, `Employees`, etc.) to shift downward or leave a blank whitespace above the navigation links.
- **Root Cause:** Sticky positioning with top padding (`pt-[2.375rem]`) and unbounded outer container height allowed page content scrollbars to push the fixed sidebar structure.
- **Solution:**
  - Standardized the root HRIS layout container (`src/app/(hris)/layout.tsx`) into a fixed full-viewport app shell (`flex h-screen w-screen flex-col overflow-hidden bg-background`).
  - Set `<MainNavigation>` positioning to `relative h-full` within a flex container, locking the sidebar in place across all routes.
  - Converted the main content wrapper into an independent scrollable pane (`flex-1 overflow-y-auto`).
  - Removed artificial top padding in `navbar.tsx` (`pt-2`).

### 2. 🇵🇭 Complete Philippine Peso (PHP / ₱) Localisation
- **Issue:** Payroll tables, salary forms, employee profiles, dashboard metrics, and PDF payslips previously displayed USD (`$`) currency symbols.
- **Solution:**
  - Converted all monetary references across UI components, summary cards, and database queries to Philippine Peso (`₱` / `PHP`).
  - Updated seed scripts and default repository fallbacks to realistic PHP monthly salaries (`₱48,000` to `₱95,000`).

### 3. 📄 PDF Payslip Font Embedding & Native Peso Sign (`₱`) Fix
- **Issue:** Generating PDF payslips rendered `+ -` or missing character glyphs instead of the Peso symbol (`₱`).
- **Root Cause:** PDFKit's default Type1 fonts (`Helvetica`, `Helvetica-Bold`) only support 8-bit WinAnsi (ASCII) encoding, which lacks the Unicode character `₱` (U+20B1).
- **Solution:**
  - Downloaded and embedded full **Roboto TTF fonts** (`Roboto-Regular.ttf`, `Roboto-Bold.ttf`, `Roboto-Italic.ttf`, `Roboto-BoldItalic.ttf`) inside `src/shared/assets/fonts/`.
  - Registered Roboto fonts in `payslip-pdf-builder.ts` for native UTF-8 Unicode rendering of the `₱` symbol across all line items (`₱47,500.00`, `₱43,875.00`).
  - Removed confusing `+` and `-` signs from allowance and deduction lines.

### 4. ✍️ Cursive Employee Signature Integration
- **Enhancement:** Added the employee's cursive signature to the bottom of generated PDF payslips.
- **Implementation:**
  - Embedded **`Allura-Regular.ttf`** font into `src/shared/assets/fonts/Allura-Regular.ttf`.
  - Registered `FONTS.signature` in `payslip-pdf-builder.ts` to render the employee's name in elegant cursive script (e.g., *Gabriel Aquino*) at the bottom right of the PDF payslip without underline strokes or "Employee Signature" text boxes.

### 5. ⚙️ Payroll Engine & Base Salary Logic Optimization
- **Issue:** Generating payroll for employees without a configured base salary defaulted to a hardcoded `3000` fallback salary.
- **Solution:**
  - Updated `generate-payroll-run.use-case.ts` to check `employee.salaryConfig?.baseSalary`.
  - Unconfigured employees now output `₱0.00` gross/net pay with an explicit `"No Salary Configured"` line item, preventing accidental payout calculations.

### 6. 👥 Realistic Filipino Employee Database Seeding
- **Data Update:** Replaced placeholder user records with 8 realistic, professional Filipino dummy employees in `src/api/hris/prisma/seed.ts`:
  1. **Juan dela Cruz** (Software Engineering Lead — ₱95,000/mo)
  2. **Maria Santos** (HR Operations Manager — ₱75,000/mo)
  3. **Jose Reyes** (Senior UI/UX Designer — ₱68,000/mo)
  4. **Mark Bautista** (Full Stack Developer — ₱58,000/mo)
  5. **Angela Garcia** (QA Automation Engineer — ₱52,000/mo)
  6. **Ramon Mendoza** (DevOps Engineer — ₱72,000/mo)
  7. **Patricia Ramos** (Product Specialist — ₱48,000/mo)
  8. **Gabriel Aquino** (Senior Backend Developer — ₱82,000/mo)

### 7. 🔑 User-Friendly Authentication Error Messaging
- **UX Improvement:** Replaced raw internal developer key `errorMessages.auth.invalidCredentials` on failed sign-in attempts with concise, user-friendly feedback: `"Invalid email or password"`.

### 8. 📱 Mobile-Responsive Skeleton Loading States
- **UX Improvement:** Redesigned route loading skeletons (`loading.tsx`) across employee profiles and company pages.
- **Key Enhancements:** Responsive card padding (`p-3.5 sm:p-6`), avatar scaling (`size-14 sm:size-16`), horizontal tab scrolling with non-stretching pills (`shrink-0`), and fluid grid column layouts.

---

## 🌐 Vercel Deployment Status

- **Status:** **Active & Operational**
- **Branch:** `main`
- **Build Verification:** Next.js 15 production build compiled successfully (`✓ Compiled successfully in 8.7s`).
- **Assets Bundling:** Embedded TrueType font files (`Roboto-*.ttf`, `Allura-Regular.ttf`) are bundled directly within `src/shared/assets/fonts/`, ensuring full cross-platform compatibility on Vercel's Linux serverless environment.
- **Database & Prisma:** Connected to Supabase PostgreSQL database using Prisma Client v5.22 with Prisma Field Encryption (`fieldEncryptionExtension`).

---

## 📊 System Readiness & Status Evaluation

### Current Status: 🟡 **85% - 90% Ready (Internal Beta / Testing Stage)**

#### ✅ What is Ready for Production/Testing:
- [x] **HR Admin Portal:** Full navigation, company settings, employee list management, and document categories.
- [x] **Employee Profiles:** General details, salary configuration, equipment assignment, and leave management.
- [x] **Payroll Engine & PDF Generation:** Payroll run calculation and instant download of PDF payslips formatted in PHP (`₱`) with cursive signatures.
- [x] **Authentication & Role-Based Access:** Sign-in, sign-out, session handling, and invalid credential error handling.
- [x] **Responsive Layout:** Tested on desktop, tablet, and mobile viewports (<640px).

#### ⏳ Pending Items Required Before Full Employee Onboarding:
1. **BIR / Official Statutory Deductions Integration:**
   - *Current:* Applies flat 10% withholding tax and 5% health insurance.
   - *Required:* Connect official Philippine BIR Tax Tables (TRAIN Law), SSS, PhilHealth, and Pag-IBIG contribution brackets for official payroll compliance.
2. **Automated Payslip Email Delivery:**
   - *Current:* Admins download PDF payslips manually.
   - *Required:* Integrate transactional email service (Resend / SendGrid) to automatically email PDF payslips to employees when a payroll run is approved.
3. **Employee Self-Service (ESS) Permission Scoping:**
   - *Current:* Admins have full access.
   - *Required:* Fine-tune self-service policies so regular employees can only view their own profile, payslips, and submit leave requests.
4. **Production SMTP Email Verification:**
   - *Required:* Verify production SMTP server configuration for forgot password and email notification tokens.

---

## 📝 Summary of Recent Commits
- `2729c5f` — `docs: remove outdated screenshot assets from docs/assets`
- `87f037a` — `feat: render employee cursive signature using Allura TTF font on PDF payslips`
- `f339ad1` — `fix: embed full Roboto TTF font for native Philippine Peso sign (₱) in PDF payslips`
- `1aa00c1` — `fix: shorten login error message and make profile loading skeleton mobile responsive`
- `ff8f54d` — `fix: handle isRedirectError and ensure me.id in profile view`
- `2ba4f09` — `fix: sanitize PRISMA_FIELD_ENCRYPTION_KEY quotes and whitespace`
