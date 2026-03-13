# Pumpline

A marketplace connecting homeowners with septic service providers. Features verified work history, transparent pricing, neighbor reviews, property-level maintenance tracking, and a county-by-county growth strategy.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, React Compiler)
- **Language:** TypeScript 5
- **Database:** PostgreSQL with Prisma 7
- **Auth:** NextAuth v4 (credentials provider, JWT strategy)
- **UI:** shadcn/ui on base-ui, Tailwind CSS 4, Lucide icons
- **File Uploads:** UploadThing
- **Validation:** Zod 4

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a remote connection string)

### Installation

```bash
cd pumpline
npm install
```

### Environment Variables

Create a `.env` file in the `pumpline/` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pumpline?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-to-a-random-secret-in-production
UPLOADTHING_TOKEN=your-uploadthing-token
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
pumpline/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login & registration pages
│   │   ├── api/             # REST API routes
│   │   ├── dashboard/       # Protected dashboard (role-based)
│   │   ├── providers/[slug] # Public provider profiles
│   │   ├── search/          # Provider search + filters
│   │   ├── about/           # How it works
│   │   ├── page.tsx         # Homepage
│   │   ├── error.tsx        # Global error boundary
│   │   └── not-found.tsx    # 404 page
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── dashboard/       # Sidebar, layout components
│   │   ├── providers/       # Search filters, provider cards
│   │   ├── bookings/        # Booking form
│   │   └── reviews/         # Review form
│   ├── generated/prisma/    # Generated Prisma client
│   └── lib/
│       ├── auth.ts          # NextAuth configuration
│       ├── db.ts            # Prisma client singleton
│       ├── utils.ts         # Utility functions
│       └── validators.ts    # Zod schemas
├── middleware.ts             # Route protection & role enforcement
├── next.config.ts
├── package.json
└── tsconfig.json
```

## User Roles

| Role | Access |
|------|--------|
| **Homeowner** | Search providers, book services, manage properties, track maintenance, leave reviews |
| **Provider** | Manage profile, services, pricing, respond to bookings, build review portfolio |
| **Admin** | Manage users, providers, bookings, moderate reviews, platform settings |

## Pages

### Public

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, trust signals, how it works |
| `/about` | How Pumpline works for homeowners and providers |
| `/search` | Search providers by zip code, service type, rating |
| `/providers/[slug]` | Public provider profile with reviews, photos, booking |

### Authentication

| Route | Description |
|-------|-------------|
| `/login` | Email/password login |
| `/register` | Homeowner registration |
| `/register/provider` | 3-step provider registration |

### Homeowner Dashboard

| Route | Description |
|-------|-------------|
| `/dashboard/homeowner` | Overview with stats, recent bookings, maintenance alerts |
| `/dashboard/homeowner/properties` | Property list with maintenance status |
| `/dashboard/homeowner/properties/new` | Add a new property |
| `/dashboard/homeowner/properties/[id]` | Property detail with service history timeline |
| `/dashboard/homeowner/bookings` | All bookings with status filters |
| `/dashboard/homeowner/bookings/[id]` | Booking detail with status timeline and review |

### Provider Dashboard

| Route | Description |
|-------|-------------|
| `/dashboard/provider` | Overview with stats, pending bookings, reviews |
| `/dashboard/provider/bookings` | Manage bookings (accept/decline/complete) |
| `/dashboard/provider/services` | Manage service offerings and pricing |
| `/dashboard/provider/profile` | Edit business profile |

### Admin Dashboard

| Route | Description |
|-------|-------------|
| `/dashboard/admin` | Platform stats overview |
| `/dashboard/admin/users` | User management with role controls |
| `/dashboard/admin/providers` | Provider verification and moderation |
| `/dashboard/admin/providers/[id]` | Provider detail |
| `/dashboard/admin/bookings` | All bookings table |
| `/dashboard/admin/reviews` | Review moderation (publish/unpublish) |
| `/dashboard/admin/settings` | Platform configuration |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/providers` | Search/list providers |
| GET | `/api/service-types` | List available service types |
| GET/POST | `/api/bookings` | List or create bookings |
| GET/PATCH/DELETE | `/api/bookings/[id]` | Manage a booking |
| GET/POST | `/api/properties` | List or create properties |
| GET/PATCH/DELETE | `/api/properties/[id]` | Manage a property |
| GET | `/api/properties/[id]/records` | Property service records |
| GET | `/api/reviews` | List reviews |
| POST | `/api/register` | Homeowner registration |
| POST | `/api/register/provider` | Provider registration |

## Database Models

- **User** — Accounts with role-based access (Homeowner / Provider / Admin)
- **Provider** — Business profile, verification status, service areas
- **ServiceType** — Catalog of septic services (pumping, inspection, etc.)
- **ProviderService** — Links providers to services with min/max pricing
- **ServiceArea** — Zip-code-based service coverage
- **Availability** — Provider schedule by day of week
- **Property** — Homeowner properties with septic system details
- **ServiceRecord** — Maintenance history timeline per property
- **Booking** — Service requests with status workflow (Pending -> Confirmed -> In Progress -> Completed)
- **Review** — Ratings and comments tied to completed bookings
- **Photo** — Images for provider portfolios and completed jobs

## Route Protection

Middleware enforces role-based access:

- `/dashboard/homeowner/*` — Homeowner only
- `/dashboard/provider/*` — Provider only
- `/dashboard/admin/*` — Admin only
- Authenticated users are redirected away from login/register pages
- Unauthenticated users are redirected to `/login` when accessing protected routes

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database |
