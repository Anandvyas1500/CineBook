# CineBook 🎬 | Full-Stack Movie Ticket Booking Platform

> A full-stack cinema ticketing web application featuring a dark "Midnight Marquee" UI with warm gold accents, real-time seat selection, multi-city multiplexes, server-side price calculation, atomic double-booking prevention, simulated payment adapter, QR pass confirmation, user profiles, and a protected administrator portal.

---

## 🌟 Key Features

### 🍿 Front-End Experience
- **Midnight Marquee Theme**: A near-black canvas with warm marquee-gold accents, Bebas Neue display type, paper-ticket passes with QR codes, and motion that respects `prefers-reduced-motion`.
- **City Selector**: Multi-city cinema listings across Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai, Pune, and Kolkata.
- **Movie Discovery**: Search by title, synopsis, or director; filter by genre, language, and screen format (IMAX, 3D, 4DX, 2D); sort by ratings or release dates.
- **Movie Detail & Trailer Player**: Embedded YouTube trailers, duration, censorship certification (`UA`, `A`, `U`), cast showcases with avatars, director metadata, and upcoming 7-day screening calendar.
- **Theatre & Showtimes Grouping**: Real-time availability indicator badges (*Available*, *Fast Filling*, *Almost Full*) and auditorium formats (*IMAX with Laser*, *Dolby Atmos*).
- **Interactive Tiered Seat Map**:
  - Curved cinema screen illustration (*"ALL EYES THIS WAY • CINEMA SCREEN"*).
  - Tiers: **VIP Recliner** (Top), **Premium** (Middle), and **Classic** (Front).
  - Visual states: Available, Selected (red glow), Booked / Sold Out (muted grey).
  - Max 10 seats per booking enforcement with live subtotal calculation.
- **Checkout & Price Breakdown**:
  - Itemized server-calculated ticket price, convenience fee, and 18% GST.
  - **Demo Payment Adapter**: Simulated UPI QR, simulated Test Card, and simulated NetBanking.
  - Zero sensitive financial credentials collected or stored.
- **Ticket Confirmation**:
  - Perforated digital admission pass with cinema stub cutout aesthetics.
  - Scannable QR code generated using SVG.
  - Integrated browser print styling (`window.print()`).
- **User Dashboard & Bookings History**: View active and past tickets, cancel bookings with automatic seat release, update profile, and change password.
- **Protected Administrator Control Panel**:
  - Box office metrics: Total Bookings, Total Revenue, Active Movies, Multiplex Halls.
  - Add, edit, or deactivate movies.
  - Add theatres and screens.
  - Schedule new movie screenings with customized tier pricing.
  - Real-time audit log of all bookings across the platform.

---

### 🛡️ Backend & Security Highlights
- **Server-Authoritative Pricing**: Seat prices, convenience fees, and taxes are strictly calculated and enforced on the server. Client-submitted prices are ignored.
- **Atomic Double-Booking Prevention**: Uses MongoDB atomic conditional update (`$nin` on `occupiedSeats` and `$push`) to prevent race conditions during simultaneous booking requests.
- **Resilient Database Layer**: Configured for standard MongoDB URI; automatically boots an in-memory MongoDB server in development mode if no local database is running.
- **Authentication & Roles**: Passwords securely hashed with `bcryptjs` (salt rounds: 10), signed JWT Bearer tokens, role-based authorization middleware (`user` vs `admin`).
- **Zero Sensitive Data Storage**: Payment gateway strictly operates in Demo Mode; never collects card numbers, CVV, or UPI PINs.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router v6, Lucide React, QRCode SVG, Canvas Confetti |
| **Backend** | Node.js, Express 4, Mongoose 8, JWT, Bcryptjs, Express-Validator, Morgan |
| **Database** | MongoDB / Mongoose (with embedded `mongodb-memory-server` dev fallback) |
| **Testing** | Jest, Supertest (14 integration tests covering Auth, Availability, Concurrency, and Cancellation) |


---

## 📁 Repository Structure

```text
d:\My projects\CineBook\
├── frontend\                # React 18 + Vite Frontend
│   ├── src\
│   │   ├── components\      # Reusable UI components
│   │   │   ├── common\      # Navbar, Logo, Footer, AuthForm/AuthModal, ProtectedRoute, TrailerModal, Loader, EmptyState
│   │   │   ├── ui\          # Modal, PosterImage
│   │   │   ├── movie\       # MovieCard, MovieFilter, HeroBanner
│   │   │   ├── booking\     # DateSelector, ShowtimeCard, SeatGrid, PriceSummary
│   │   │   └── ticket\      # DigitalTicket (with perforation & QR)
│   │   ├── context\         # AuthContext, CityContext, BookingContext, UiContext (toasts + confirm dialogs)
│   │   ├── pages\           # Route views (Home, Movies, Detail, Booking, Admin)
│   │   ├── services\        # Universal API client and backend adapters
│   │   ├── App.jsx          # Routing & ScrollToTop
│   │   ├── main.jsx         # React DOM mount
│   │   └── index.css        # Design tokens, components & print rules
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── .env.example
│
├── backend\                 # Express + Node.js Backend API
│   ├── src\
│   │   ├── config\          # Database connector with auto-memory fallback & config
│   │   ├── controllers\     # Auth, Movie, Theatre, Show, Booking, Admin controllers
│   │   ├── middleware\      # JWT protect, Role authorize, Error & Validation handlers
│   │   ├── models\          # User, Movie, Theatre, Screen, Show, Booking, Payment
│   │   ├── routes\          # Express REST API routes
│   │   ├── services\        # BookingService, PricingService, DemoPaymentAdapter
│   │   ├── seed\            # 8 Blockbusters, 6 Theatres, Screenings & Seeder
│   │   ├── tests\           # Supertest & Jest test suites
│   │   └── server.js        # Express app entrypoint
│   ├── package.json
│   ├── jest.config.js
│   ├── .env
│   ├── .env.example
│   └── README.md
│
├── package.json             # Root monorepo orchestration scripts
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Beginner-Friendly Setup Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or later installed on your system.
- **NPM**: v9 or later.
- *(Optional)* **MongoDB**: If you have MongoDB installed locally or an Atlas connection URI, you can add it to `backend/.env`. **If not, don't worry!** CineBook has an automatic built-in memory server that starts immediately with zero setup required.

### 2. Quick Start (Run Both Server & Client Concurrently)

Open PowerShell or your command terminal in the `CineBook` directory:

```powershell
# Navigate into CineBook directory
cd "d:\My projects\CineBook"

# 1. Install dependencies for root, backend, and frontend
npm install
npm --prefix backend install
npm --prefix frontend install

# 2. Start the Backend and Frontend concurrently
npm run dev
```

- **Frontend Client**: Accessible at [http://localhost:5173](http://localhost:5173)
- **Backend API**: Accessible at [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded Demo Accounts

You can log in immediately using these pre-configured accounts (or click the **Instant Demo Fill** button directly inside the login modal):

| Role | Email | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin@cinebook.com` | `Admin@123` | Full Admin Dashboard, Manage Movies, Theatres, Shows, Audit Logs |
| **Cinema Member** | `user@cinebook.com` | `User@123` | Book tickets, select seats, view profile, cancel bookings |

---

## 🧪 Running Automated Tests

CineBook includes 14 automated unit and integration tests using Jest and Supertest.

```powershell
# Run the complete backend test suite
cd "d:\My projects\CineBook\backend"
npm test
```

### Test Coverage Highlights:
1. **Authentication Suite (`auth.test.js`)**:
   - User registration and bcrypt password hashing.
   - Rejection of duplicate email registrations.
   - User login and JWT token generation.
   - Route protection for private `/api/auth/me`.
   - Role-based authorization guard blocking regular users from `/api/admin/stats`.
2. **Seat Availability Suite (`seatAvailability.test.js`)**:
   - Dynamic seat layout matrix generation by tier (VIP, Premium, Classic).
   - Verification of booked vs available seat state.
   - Server-side price calculation accuracy.
3. **Booking & Concurrency Suite (`booking.test.js`)**:
   - Atomic reservation of requested seats.
   - Safe rejection of already booked seats (409 Conflict).
   - **Simultaneous Race Condition Simulation**: Two concurrent requests attempting to book the same seat; guarantees exactly 1 success and 1 conflict with 0 double bookings.
   - Booking cancellation and atomic seat release back to the show.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create account `{ name, email, password, phone }`
- `POST /api/auth/login` - Login `{ email, password }` returns JWT token
- `GET /api/auth/me` - Get logged-in user profile (Bearer token)
- `PUT /api/auth/profile` - Update name and phone
- `PUT /api/auth/change-password` - Change account password

### Movies
- `GET /api/movies` - List movies with filters `?q=&genre=&language=&format=&sort=`
- `GET /api/movies/featured` - Get trending movies for carousel
- `GET /api/movies/:idOrSlug` - Get movie detail by ID or URL slug

### Theatres & Showtimes
- `GET /api/theatres/cities` - Get list of operating cities
- `GET /api/theatres` - Get theatres filtered by city `?city=`
- `GET /api/shows` - Get shows filtered by `?movieId=&city=&date=`
- `GET /api/shows/:id` - Get show layout matrix, tier pricing, and occupied seats
- `GET /api/shows/:id/availability` - Get real-time seat availability counts

### Bookings & Payments
- `POST /api/bookings/calculate-price` - Calculate verified server price for seats `{ showId, seats }`
- `POST /api/bookings` - Create booking with atomic seat lock `{ showId, seats, paymentMethod }`
- `GET /api/bookings/my` - Get logged-in user's booking history
- `GET /api/bookings/cancellation-rules` - Get official cinema cancellation rules and refund terms
- `GET /api/bookings/:refOrId` - Get booking confirmation details and digital pass
- `PUT /api/bookings/:id/cancel` - Cancel booking and atomically release seats


### Administrator Routes (Protected with Admin Role)
- `GET /api/admin/stats` - Box office metrics & recent bookings feed
- `POST /api/admin/movies` - Create movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Deactivate movie
- `POST /api/admin/theatres` - Create multiplex theatre
- `POST /api/admin/shows` - Schedule movie show with tier pricing
- `GET /api/admin/bookings` - Audit all system bookings

---

## 💳 Payment Simulation & Data Privacy Notice
CineBook features an internal simulated payment adapter.
- Never enter real payment information (credit card numbers, CVVs, or UPI PINs).
- The payment simulation adapter provides realistic checkout latency and returns cryptographically distinct transaction IDs labeled `isDemo: true`.
