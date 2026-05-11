# Changelog

## [1.0.1] - 2026-04-08

### Added

**Admin Dashboard (`apps/admin`)**
- New admin panel built with React 19 + Vite + shadcn/ui
- Admin entity with separate `admins` table and JWT auth (email/password only)
- Dashboard with stats: total users, new users (7d), products, orders, pending orders, revenue
- Recent orders and recent users tables on dashboard
- Full CRUD for users with detail pages showing projects, tasks, and orders
- Full CRUD for products aligned with multi-size pricing schema (sizes, currency, stock)
- Orders management page with inline status updates (pending/confirmed/shipped/delivered/completed/cancelled)
- Order detail page with items, customer info, shipping, and status control
- Admins management page with role display and self-deletion protection
- Admin detail page with edit and account age
- Register Admin page (protected -- requires existing admin token)
- Seed script for super admin (`npm run seed:admin`)

**Client Store Refactor**
- Store is now the homepage (`/`) accessible without authentication
- Removed task management, projects, and plant identifier from client app
- Replaced sidebar layout with top navigation header (brand, Store, Cart, search, auth)
- Search bar integrated into the main navigation header
- Profile dropdown menu for authenticated users
- "Sign in" button for guest users
- Order success page now shows full order details (items, shipping, payment, status)
- Cart accessible without login; checkout requires authentication

**Backend**
- Admin auth module (`/api/admin/auth/login`, `/api/admin/auth/register`)
- Admin middleware with `adminId` + `role` JWT claims
- Admin CRUD endpoints for users, perfumes, orders, and admins
- `GET /api/orders/:id` endpoint for fetching individual orders
- `PUT /api/admin/orders/:id/status` for order status management
- Dashboard endpoint with revenue calculation and recent orders
- CORS updated to allow all localhost origins in development
- Admin entity registered in TypeORM DataSource

**Configuration**
- `.env`-based API URL configuration for both client and admin apps (`VITE_API_BASE_URL`)
- Dedicated ports: client on 5180, admin on 5181, backend on 3001
- Centralized API base URL via `api/client.ts` -- single source of truth
- Removed Vite proxy dependency -- all API calls go directly to backend
- Root `package.json` updated to run all three apps concurrently

### Fixed

- Removed hardcoded perfume data from `PerfumesController` (now fully DB-driven)
- Removed management portal UI (analytics, CRUD forms) from customer-facing store
- Removed edit/delete buttons from product cards in customer view
- Cleaned up duplicate `GoogleOAuthProvider` mounting
- Fixed order success page "View My Projects" button (removed, replaced with order details)

### Security Notes

- Admin registration requires existing admin JWT (no public registration)
- Admin cannot delete their own account
- Admin tokens include `role` claim for future role-based access control

## [1.0.0] - 2026-04-06

### Added

- Initial perfume store with DB-driven catalog (10 seeded perfumes)
- Multi-size pricing model (JSONB sizes with ml/price/stock)
- EGP currency support
- Full auth system: login, signup, Google OAuth, forgot/reset password
- User profiles with country, gender, birth date
- Shopping cart with checkout flow
- Order creation with SendGrid email confirmation
- Perfume CRUD endpoints (protected by auth middleware)
- Seed script for perfume catalog
