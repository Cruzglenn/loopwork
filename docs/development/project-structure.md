# Project Structure

## Root Directory

```
loopwork/
├── src/                         # Application source code
├── messages/                    # i18n translation files (en.json, pl.json)
├── public/                      # Static assets (images, icons)
├── docs/                        # Project documentation
├── .github/                     # GitHub templates and CI workflows
├── .claude/                     # Claude Code guidelines
├── docker-compose.yml           # Dev services (PostgreSQL, Mailcatcher)
├── Dockerfile                   # Production container build
├── Dockerfile.postgis           # PostgreSQL with PostGIS
├── package.json                 # Dependencies and scripts
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── .eslintrc.json               # ESLint rules
├── lefthook.yml                 # Git hooks configuration
└── .env.dist                    # Environment variable template
```

## Source Code (`src/`)

### API Layer (`src/api/hris/`)

The backend, organized by domain with Clean Architecture:

```
src/api/hris/
├── index.ts                     # API entry point, instantiateHrisApi()
├── prisma/
│   ├── schema/                  # Prisma schema files (*.prisma)
│   ├── migrations/              # Database migrations
│   ├── client.ts                # Singleton Prisma client
│   └── seed.ts                  # Database seeding script
├── authentication/              # Login, JWT tokens, password management
├── authorization/               # RBAC system, permission checking
├── employees/                   # Employee CRUD, profiles, skills
├── company/                     # Company info, organization settings
├── absences/                    # Leave requests, policies, availability
├── benefits/                    # Benefit plans and assignments
├── documents/                   # Document upload, categories, tracking
├── feedback/                    # Performance feedback sessions
├── resources/                   # Skills, equipment, dictionaries
├── settings/                    # Application-level settings
└── scripts/                     # CLI scripts (create-owner, fixtures)
```

Each domain follows the same internal structure:

```
[domain]/
├── model/
│   ├── dtos/                    # TypeScript data transfer objects
│   ├── repositories/            # Repository type definitions
│   ├── use-cases/               # Business logic (curried functions)
│   └── acl/                     # Cross-domain interface types
├── infrastructure/
│   ├── controllers/             # Wire up repos + use cases + auth
│   ├── database/
│   │   ├── repositories/        # Prisma implementations
│   │   └── queries/             # Read-only query functions
│   └── acl/                     # Cross-domain implementations
├── errors.ts                    # Error message constants
└── index.ts                     # Public exports
```

### App Layer (`src/app/`)

Next.js App Router with route groups:

```
src/app/
├── (auth)/                      # Public authentication routes
│   ├── sign-in/
│   ├── forgot-password/
│   └── change-password/
├── (hris)/                      # Protected HRIS routes (requires auth)
│   ├── dashboard/
│   ├── employees/
│   │   ├── [id]/
│   │   │   ├── general/
│   │   │   ├── skills/
│   │   │   ├── absence/
│   │   │   ├── earnings/
│   │   │   ├── documents/
│   │   │   ├── equipment/
│   │   │   ├── benefits/
│   │   │   └── feedback/
│   │   ├── create/
│   │   └── dictionaries/
│   ├── company/
│   │   ├── general/
│   │   ├── absences/
│   │   ├── equipment/
│   │   ├── documents/
│   │   └── benefits/
│   ├── settings/
│   │   ├── general/
│   │   ├── change-password/
│   │   ├── roles/
│   │   └── danger/
│   ├── _actions/                # Shared server actions
│   ├── _components/             # Shared HRIS components
│   └── _schema/                 # Shared Zod schemas
├── (public)/                    # Public pages
├── api/                         # API routes
│   ├── calendar/                # iCal export
│   ├── documents/               # Document download
│   ├── download-cv/             # CV PDF generation
│   └── photos/                  # Photo serving
├── globals.css                  # Global styles
└── layout.tsx                   # Root layout
```

Convention: directories prefixed with `_` are private (not routed by Next.js).

### Shared Code (`src/shared/`)

```
src/shared/
├── constants/                   # Routes, search param keys, app constants
├── errors/                      # ApiError class, handleActionError()
├── schemas/                     # Common Zod schemas (pagination, etc.)
├── service/
│   ├── email/                   # Nodemailer client
│   ├── locale/                  # i18n utilities
│   ├── pino/                    # Logger configuration
│   ├── file/                    # File upload/download
│   └── templates/               # Email template service
├── types/                       # CUID, Nullable, Paginated, etc.
└── utils/                       # getEnv, date helpers, string utils
```

### UI Library (`src/lib/ui/`)

```
src/lib/ui/
├── components/                  # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── modal.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── form.tsx
│   ├── navigation/
│   └── ...
├── hooks/                       # Custom React hooks
└── icons/                       # SVG icon components
```

### Templates (`src/templates/`)

```
src/templates/
├── emails/
│   ├── en/                      # English email templates
│   ├── pl/                      # Polish email templates
│   ├── utils.ts                 # HTML email wrapper
│   └── index.ts                 # Template registry
└── pdf/
    └── cv/                      # CV PDF template
```

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript config with `@/` path alias |
| `.eslintrc.json` | ESLint rules (Next.js + Prettier + Tailwind + TypeScript) |
| `tailwind.config.ts` | Tailwind theme, custom colors, plugins |
| `postcss.config.mjs` | PostCSS with Tailwind and autoprefixer |
| `next.config.mjs` | Next.js configuration |
| `lefthook.yml` | Pre-commit hooks (lint) |
| `.nvmrc` | Node.js version |
| `.prettierrc.json` | Prettier formatting rules |
