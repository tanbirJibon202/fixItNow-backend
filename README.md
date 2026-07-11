# FixItNow 🔧

**Your Trusted Home Service Platform** — a backend REST API for a home services marketplace where customers book qualified technicians (plumbing, electrical, cleaning, painting, etc.), pay online, and leave reviews.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| Database | PostgreSQL |
| ORM | Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| Auth | JWT (access + refresh tokens, httpOnly cookies) |
| Validation | Zod |
| Payments | Stripe (Checkout Sessions + Webhooks) |
| Password hashing | bcryptjs |

---

## Roles

| Role | Can do |
|---|---|
| **Customer** | Browse services/technicians, book, pay, track bookings, cancel, review |
| **Technician** | Create profile, manage services & availability, accept/decline bookings, update job status |
| **Admin** | Manage users (ban/unban), view all bookings, manage categories |

Customers and technicians self-register via `/api/auth/register`. Admin accounts are **not** self-registrable — they're created only via the seed script, for security.

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — any random strings
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — from your [Stripe dashboard](https://dashboard.stripe.com/test/apikeys)
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (optional) — customize the seeded admin login; falls back to demo defaults if unset

### 3. Run migrations
```bash
npx prisma migrate deploy
```

### 4. Seed demo data
```bash
npm run seed
```
This creates a demo admin, a sample technician (with one service), a sample customer, and 4 categories (Plumbing, Electrical, Cleaning, Painting).

### 5. Start the server
```bash
npm run dev
```
Server runs at `http://localhost:5000`.

### 6. (Optional) Test Stripe webhooks locally
```bash
npm run stripe:webhook
```
Requires the [Stripe CLI](https://stripe.com/docs/stripe-cli) to be installed and logged in.

---

## API Overview

Full request/response examples are in the Postman collection: [`fixitnow-backend.postman_collection.json`](./fixitnow-backend.postman_collection.json) — import it into Postman and run `login` first (cookie-based auth is picked up automatically for subsequent requests).

| Module | Base path |
|---|---|
| Auth | `/api/auth` |
| Categories | `/api/categories`, `/api/admin/categories` |
| Services | `/api/services` |
| Technicians | `/api/technicians`, `/api/technician` |
| Bookings | `/api/bookings` |
| Payments | `/api/payments` |
| Reviews | `/api/reviews` |
| Admin | `/api/admin` |

### Booking lifecycle
```
REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED
     └────────┴──────────┘
   (customer can cancel any time before IN_PROGRESS)
     └── DECLINED (technician)
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fixitnow.com` | `Admin@123` |
| Technician | `technician@fixitnow.com` | `Technician@123` |
| Customer | `customer@fixitnow.com` | `Customer@123` |

(Created by `npm run seed`. Override via `SEED_*` env vars for a private deploy.)

---

## Project Structure
```
src/
  modules/        # one folder per feature: controller, service, route, validation
  middlewares/     # auth, error handling, request validation
  lib/             # prisma client, stripe client
  utils/           # jwt, catchAsync, sendResponse
  config/          # env config loader
prisma/
  schema/          # split Prisma schema files
  seed.ts          # demo data seeder
```
