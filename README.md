# Luxe Salon Platform

A premium, production-ready salon booking platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## Architecture

```
├── prisma/
│   ├── schema.prisma          # Database schema (17 models)
│   └── seed.ts                # Seed data with demo accounts
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with fonts & metadata
│   │   ├── globals.css        # Tailwind + CSS variables
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About Us
│   │   ├── services/          # Services listing
│   │   ├── pricing/           # Pricing menu
│   │   ├── team/              # Meet the Team
│   │   ├── gallery/           # Before & After gallery
│   │   ├── testimonials/      # Client reviews
│   │   ├── contact/           # Contact form
│   │   ├── faq/               # FAQ accordion
│   │   ├── blog/              # Blog listing
│   │   ├── login/             # Auth (login/register)
│   │   ├── register/          # Registration
│   │   ├── booking/           # Multi-step booking flow
│   │   ├── customer/          # Customer dashboard
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   └── profile/
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   ├── services/
│   │   │   ├── stylists/
│   │   │   ├── customers/
│   │   │   ├── inventory/
│   │   │   ├── payments/
│   │   │   ├── reports/
│   │   │   └── notifications/
│   │   ├── staff/             # Staff portal
│   │   │   ├── dashboard/
│   │   │   ├── schedule/
│   │   │   ├── appointments/
│   │   │   ├── clients/
│   │   │   └── commissions/
│   │   └── api/               # API routes
│   │       ├── auth/
│   │       ├── services/
│   │       ├── appointments/
│   │       ├── customers/
│   │       └── payments/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Navbar, Footer, Sidebar
│   │   ├── booking/           # Booking flow components
│   │   ├── dashboard/         # Dashboard widgets
│   │   └── shared/            # Reusable components
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # JWT, bcrypt, RBAC
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (jose), bcryptjs |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Payments | Stripe |
| Email | Nodemailer |
| SMS | Twilio |
| Storage | Cloudinary |
| Calendar | FullCalendar |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone and install
cd salon-platform
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Set up database
npx prisma generate
npx prisma db push
npm run db:seed

# Start development
npm run dev
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@luxesalon.com | password123 |
| Manager | manager@luxesalon.com | password123 |
| Receptionist | reception@luxesalon.com | password123 |
| Stylist | sophia@luxesalon.com | password123 |
| Customer | emma@example.com | password123 |

## Features

### Customer Website
- Home page with hero, services, team, reviews, gallery, memberships, offers
- About, Services, Pricing, Team, Gallery, Testimonials, Contact, FAQ, Blog pages
- Multi-step booking flow (service → stylist → date → time → details → confirm)
- Customer dashboard with appointments, profile, membership, billing

### Admin Dashboard
- Revenue overview, appointment stats, occupancy rate
- Calendar view (day/week/month) with drag-and-drop
- Service, stylist, customer, inventory management
- Payment tracking, coupon management, reports & analytics
- Notification system (email, SMS, WhatsApp, in-app)

### Staff Portal
- Daily schedule with check-in/notes
- Client profiles with appointment history
- Performance metrics and commission tracking
- Availability management and leave requests

## Database Schema

17 models with full relationships:

- **User** — Authentication and roles
- **Customer** — Client profiles, loyalty, referrals
- **Stylist** — Profiles, specialties, commissions
- **Category / Service / ServicePackage** — Service catalog
- **Appointment / AppointmentService** — Bookings
- **Payment** — Billing and invoicing
- **Review** — Client feedback
- **Coupon / MembershipPlan / CustomerMembership** — Promotions
- **Availability / LeaveRequest / BlockedDate** — Scheduling
- **Notification** — Multi-channel alerts
- **InventoryItem / InventoryUsage** — Stock tracking
- **AuditLog / WaitlistEntry** — Operations

## API Endpoints

### Auth
- `POST /api/auth/login` — Authenticate user
- `POST /api/auth/register` — Create account

### Appointments
- `GET /api/appointments` — List with filters & pagination
- `POST /api/appointments` — Create booking
- `GET /api/appointments/[id]` — Get details
- `PATCH /api/appointments/[id]` — Update status/reschedule
- `DELETE /api/appointments/[id]` — Soft delete

### Services
- `GET /api/services` — List with category filter
- `POST /api/services` — Create (admin only)

## Security

- Password hashing with bcrypt (12 rounds)
- JWT tokens with expiration
- Role-based access control (5 roles)
- Input validation with Zod
- CSRF protection via Next.js
- Rate limiting middleware
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escaping)
- Soft deletes for data retention

## Deployment

### Frontend → Vercel
```bash
npm run build
vercel deploy
```

### Database → Supabase or Neon
```bash
# Supabase
DATABASE_URL="postgresql://..."

# Neon
DATABASE_URL="postgresql://..."
```

### Backend → Render or Railway
For separate API deployment, or use Next.js API routes on Vercel.

### Environment Variables
Set all variables from `.env.example` in your hosting platform.

## Performance

- Server-side rendering for SEO
- Image optimization (AVIF, WebP)
- Lazy loading for below-fold content
- Debounced search inputs
- Paginated API responses
- Static generation for marketing pages

## SEO

- Dynamic metadata per page
- Open Graph tags
- Structured data (LocalBusiness schema)
- XML sitemap
- Canonical URLs
- Optimized for: "best salon near me", "hair salon in [city]", "beauty salon appointments"

## License

MIT
