# Loopwork

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Loopwork** is a modern, open-source HRIS (Human Resource Information System) & Payroll management platform built with Next.js 15 (App Router), TypeScript, Prisma, and PostgreSQL. Designed for mid-sized teams to manage employee onboarding, attendance tracking, automated payroll runs, PDF payslips, absence management, equipment inventory, and role-based permissions.

---

## Features

- 👥 **Employee Management** — Complete profiles, onboarding, employment history, skills, education, and document attachments.
- ⏱️ **Attendance System** — 1-click Clock In / Clock Out, Break tracking (Lunch, Short break), daily/weekly work duration logs, and real-time company attendance dashboard.
- 💰 **Payroll Management** — Automated payroll run generation based on worked attendance hours, overtime, gross/net pay calculation, tax & statutory deductions, and 1-click PDF Payslip export (built with PDFKit).
- 🏖️ **Absence Management** — Leave requests, approval workflows, availability calendar, and iCal calendar export.
- 📁 **Document Management** — File upload, document categories, tracking expiration dates, and employee assignment.
- 💻 **Equipment Tracking** — Inventory, employee assignments, changelogs, and status tracking.
- 🎁 **Benefits Administration** — Create custom benefit plans and assign them to employees.
- 🔐 **Granular RBAC System** — Flexible Role-Based Access Control per resource and action (`VIEW`, `CREATE`, `EDIT`, `DELETE`, `ASSIGN`, `EXPORT`).
- 📄 **PDF Exporting** — Generate official PDF Payslips and Employee CVs on demand.
- 🔒 **Field-Level Encryption** — Sensitive employee details encrypted at the database level via Prisma field-level encryption.

---

## Quick Start & Setup Guide

### Prerequisites

- **Node.js** (v20+ recommended)
- **npm** or **yarn**
- **PostgreSQL 16** with PostGIS extension (or Docker & Docker Compose)

### Installation Steps

```bash
# 1. Clone your repository
git clone https://github.com/Cruzglenn/loopwork.git
cd loopwork

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.dist .env
```

Edit your `.env` file and set the required secrets:

- `PRISMA_FIELD_ENCRYPTION_KEY` — generate at [cloak.47ng.com](https://cloak.47ng.com/)
- `JWT_SECRET` — generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(128).toString('hex'))"
  ```
- `DATABASE_URL` — set your PostgreSQL connection string:
  ```env
  DATABASE_URL="postgresql://loopwork:password@localhost:5432/loopwork?schema=public"
  ```

### Database Setup & Seeding

```bash
# 1. Generate Prisma client
npm run prisma:generate

# 2. Deploy database migrations
npm run prisma:migrate:deploy

# 3. Seed default organization and system roles
npm run prisma:seed

# 4. Create your primary Admin account
npx tsx -r ./polyfill.cjs src/api/hris/scripts/create-owner.ts admin@example.com YourPassword123 Admin User

# 5. Create your organization
npx tsx -r ./polyfill.cjs src/api/hris/scripts/create-organization.ts "My Company Name"

# 6. (Optional) Load demo fixture data (50+ employees, attendance logs, equipment)
npm run fixtures:load
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your admin credentials.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router), React 18, TypeScript |
| **Database** | PostgreSQL 16 with PostGIS extension |
| **ORM** | Prisma 5 with field-level encryption |
| **Authentication** | JWT with granular role-based access control (RBAC) |
| **UI Components** | Tailwind CSS, React Aria Components |
| **Validation** | Zod |
| **PDF Generation** | PDFKit (server-side stream rendering) |
| **Logging** | Pino |
| **Architecture** | Clean Architecture, Repository Pattern, Use Case Pattern |

---

## Project Structure

```
loopwork/
├── src/
│   ├── api/hris/                    # Backend API (Clean Architecture)
│   │   ├── prisma/                  # Schema files, migrations, seed
│   │   ├── authentication/          # Auth domain
│   │   ├── authorization/           # RBAC & permission checking
│   │   ├── employees/               # Employee management
│   │   ├── attendance/              # Attendance & Clock In/Out domain
│   │   ├── payroll/                 # Payroll & Payslips domain
│   │   ├── company/                 # Company settings
│   │   ├── absences/                # Leave & absence management
│   │   ├── benefits/                # Employee benefits
│   │   ├── documents/               # Document tracking
│   │   ├── feedback/                # Performance feedback
│   │   └── resources/               # Skills & equipment
│   │
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Sign-in & password recovery
│   │   ├── (hris)/                  # Protected HRIS dashboard & feature pages
│   │   └── api/                     # PDF download API route handlers
│   │
│   ├── lib/ui/                      # Reusable UI component library (@/lib/ui)
│   └── shared/                      # Constants, types, utils, services
│
├── messages/                        # i18n translation files (en.json, pl.json)
├── docker-compose.yml               # PostgreSQL + Mailcatcher dev services
└── package.json
```

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build Next.js app for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint + TypeScript check |
| `npm run fix` | Auto-fix lint issues |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate:deploy` | Apply database migrations |
| `npm run prisma:seed` | Seed default organization & OWNER role |
| `npm run fixtures:load` | Load demo fixture data (50+ employees) |
| `npm run nuke` | Clean reinstall (`.next`, `node_modules`) |

---

## License

Distributed under the MIT License.
