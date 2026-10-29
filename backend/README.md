# CineBook Backend API 🎬 | Express & Node.js Server

This is the Express.js and Node.js backend for the CineBook movie ticket booking platform, backed by MongoDB and Mongoose.

---

## 🚀 Beginner-Friendly Setup & Execution

### 1. Prerequisites
- **Node.js**: Version 18.0.0 or higher.
- **NPM**: Version 9.0.0 or higher.
- *(Optional)* **MongoDB**: Local MongoDB or MongoDB Atlas.
  > **Zero Setup Mode**: If you do not have MongoDB running, the server automatically starts an in-memory MongoDB in development mode!

### 2. Installation
Open your terminal in the `backend` directory:
```powershell
cd "d:\My projects\CineBook\backend"
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` (already done by default):
```powershell
cp .env.example .env
```

### 4. Seed the Database
Populate the database with 8 blockbuster movies, 6 multiplex theatres, auditoriums, and 240 scheduled screenings:
```powershell
npm run seed
```

### 5. Start the Server
- **Development Mode** (with automatic reload via nodemon):
  ```powershell
  npm run dev
  ```
- **Production Mode**:
  ```powershell
  npm start
  ```
- **Run Automated Tests**:
  ```powershell
  npm test
  ```

Server will be running at: **`http://localhost:5000`**  
Health Check Endpoint: **`http://localhost:5000/api/health`**

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin@cinebook.com` | `Admin@123` | Full Admin Dashboard, Manage Movies, Theatres, Shows, Audit Logs |
| **Member** | `user@cinebook.com` | `User@123` | Book tickets, view profile, cancel bookings |

---

## 🔒 Concurrency & Double-Booking Prevention: Atomic Updates vs Replica Set Transactions

A critical requirement of cinema ticketing platforms is that **two simultaneous requests cannot book the same seat twice**.

### 1. MongoDB Atomic Conditional Updates (Our Primary Engine)
In CineBook, each `Show` document contains an `occupiedSeats: [String]` array. When a user requests seats (e.g. `['B1', 'B2']`), the server executes an **atomic conditional update**:

```javascript
const updatedShow = await Show.findOneAndUpdate(
  {
    _id: showId,
    occupiedSeats: { $nin: requestedSeats } // Only matches if NONE of the requested seats are in occupiedSeats
  },
  {
    $push: { occupiedSeats: { $each: requestedSeats } } // Atomically pushes the seats
  },
  { new: true }
);
```

#### Why This Is Superior & Deployment-Agile:
- **100% Concurrency Safe**: In MongoDB, write operations on a single document are atomic at the document level. If 10 requests try to claim seat `B1` at the exact same millisecond, MongoDB serializes the document lock. Exactly ONE request finds `B1` not in `occupiedSeats` and succeeds; the other 9 find that `B1` is already in `occupiedSeats`, matching zero documents and returning `null`.
- **Works on All MongoDB Deployments**: Works on standalone local MongoDB instances, Docker containers, in-memory servers (`mongodb-memory-server`), and replica sets without configuration friction.

### 2. Multi-Document Transactions & The Replica Set Requirement
- MongoDB supports multi-document transactions using `session.startTransaction()`.
- **Replica Set Requirement**: Multi-document transactions in MongoDB **strictly require a Replica Set** (or Sharded Cluster). Running `session.startTransaction()` on a standalone MongoDB instance throws a runtime error:
  `MongoServerError: Transaction numbers are only allowed on a replica set member or mongos`.
- Because local developer laptops often run standalone MongoDB without replica set replica peers configured, CineBook uses single-document atomic locking as the core concurrency engine, ensuring that zero double-bookings occur regardless of the MongoDB environment.

---

## 📖 Comprehensive REST API Documentation

### 1. Health & Diagnostics
#### `GET /api/health`
- **Access**: Public
- **Description**: Returns server online status, environment mode, payment mode, and timestamp.
- **Response `200 OK`**:
  ```json
  {
    "status": "online",
    "app": "CineBook API",
    "environment": "development",
    "paymentMode": "DEMO",
    "timestamp": "2026-10-19T17:05:00.000Z"
  }
  ```

---

### 2. Authentication & User Management
#### `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new user with bcrypt-hashed password (10 salt rounds) and returns a signed JWT.
- **Validation**:
  - `name`: Non-empty string
  - `email`: Valid email format (unique in database)
  - `password`: Minimum 6 characters
  - `phone`: Optional string
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123",
    "phone": "+91 9876543210"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Account registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "67138...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "phone": "+91 9876543210"
    }
  }
  ```

#### `POST /api/auth/login`
- **Access**: Public
- **Description**: Verifies credentials and returns a signed JWT.
- **Request Body**:
  ```json
  {
    "email": "user@cinebook.com",
    "password": "User@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { ... }
  }
  ```

#### `GET /api/auth/me`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Description**: Retrieves profile data for the authenticated user.
- **Response `200 OK`**: Returns user profile without password.

#### `PUT /api/auth/profile`
- **Access**: Private
- **Description**: Updates user's display name and phone number.
- **Request Body**: `{ "name": "New Name", "phone": "+91 9999999999" }`

#### `PUT /api/auth/change-password`
- **Access**: Private
- **Description**: Changes password after verifying the existing password.
- **Request Body**: `{ "currentPassword": "OldPassword", "newPassword": "NewPassword123" }`

---

### 3. Movies
#### `GET /api/movies`
- **Access**: Public
- **Query Parameters**:
  - `q`: Search title, synopsis, or director
  - `genre`: Filter by genre (e.g. `Sci-Fi`, `Action`)
  - `language`: Filter by language (e.g. `English`, `Hindi`)
  - `format`: Filter by screen format (e.g. `IMAX 3D`, `4DX`, `2D`)
  - `sort`: `rating` | `newest` | `title`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 8,
    "movies": [ ... ]
  }
  ```

#### `GET /api/movies/featured`
- **Access**: Public
- **Description**: Returns featured and top-rated movies for the homepage hero carousel.

#### `GET /api/movies/:idOrSlug`
- **Access**: Public
- **Description**: Fetches single movie by MongoDB ObjectId or URL slug (e.g. `dune-part-two`).

---

### 4. Cities, Theatres & Shows
#### `GET /api/theatres/cities`
- **Access**: Public
- **Description**: Returns unique list of cities where CineBook operates.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "cities": ["Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata"]
  }
  ```

#### `GET /api/theatres`
- **Access**: Public
- **Query Parameters**: `city` (e.g. `?city=Mumbai`)

#### `GET /api/theatres/:id`
- **Access**: Public
- **Description**: Returns theatre with all its associated screens and sound equipment.

#### `GET /api/shows`
- **Access**: Public
- **Query Parameters**: `movieId`, `theatreId`, `city`, `date` (`YYYY-MM-DD`)
- **Description**: Returns showtimes grouped by theatre with availability indicator status (*Available*, *Fast Filling*, *Almost Full*).

#### `GET /api/shows/:id`
- **Access**: Public
- **Description**: Returns show metadata along with the full interactive seat matrix, rows, seat numbers, aisle gaps, tier pricing (`classic`, `premium`, `vip`), and currently `occupiedSeats`.

#### `GET /api/shows/:id/availability`
- **Access**: Public
- **Description**: Returns quick real-time seat availability counts (`occupiedSeats`, `occupiedCount`, `availableCount`, `totalSeats`, `isSoldOut`).

---


### 5. Bookings & Payments
#### `POST /api/bookings/calculate-price`
- **Access**: Public / Private
- **Description**: Server-side price calculation. Never trusts client prices.
- **Request Body**:
  ```json
  {
    "showId": "671380...",
    "seats": ["A1", "A2"]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "pricing": {
      "seatCount": 2,
      "seats": [
        { "seatId": "A1", "tier": "VIP", "price": 450 },
        { "seatId": "A2", "tier": "VIP", "price": 450 }
      ],
      "baseAmount": 900,
      "convenienceFee": 60,
      "taxAmount": 11,
      "totalAmount": 971,
      "currency": "INR"
    }
  }
  ```

#### `POST /api/bookings`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Description**: Reserves seats with atomic race condition protection, processes payment via Demo Adapter, and creates verified ticket record.
- **Request Body**:
  ```json
  {
    "showId": "671380...",
    "seats": ["A3", "A4"],
    "paymentMethod": "DEMO_UPI"
  }
  ```
- **Response `201 Created`**: Returns confirmed booking with `bookingReference` (e.g. `CNB-8F4K-9281`) and QR code data.
- **Conflict Error `409 Conflict`**: Returned if any selected seat is already reserved by another user.

#### `GET /api/bookings/my`
- **Access**: Private
- **Description**: Returns all past and upcoming bookings for the authenticated user.

#### `GET /api/bookings/:refOrId`
- **Access**: Private
- **Description**: Fetches digital pass by booking reference code or MongoDB ID.

#### `GET /api/bookings/cancellation-rules`
- **Access**: Public
- **Description**: Returns official cinema cancellation window (before showtime) and 100% base price refund policy.

#### `PUT /api/bookings/:id/cancel`
- **Access**: Private
- **Description**: Cancels booking, releases seats atomically from the show, and sets payment status to `REFUNDED`. Rejects cancellations for past screenings.

---

### 6. Protected Administrator Routes
All routes below require `role: 'admin'`.

- `GET /api/admin/stats` - Overall box office metrics (Revenue, Bookings, Active Movies, Recent Bookings).
- `POST /api/admin/movies` - Add new movie with title, synopsis, poster, backdrop, duration, and formats.
- `PUT /api/admin/movies/:id` - Update existing movie.
- `DELETE /api/admin/movies/:id` - Deactivate movie from public catalog.
- `POST /api/admin/theatres` - Add new multiplex theatre with city and amenities.
- `POST /api/admin/screens` - Add new screen to theatre with seat layout.
- `POST /api/admin/shows` - Schedule movie show with date, time, and custom tier pricing.
- `DELETE /api/admin/shows/:id` - Remove or cancel scheduled show.
- `GET /api/admin/bookings` - System-wide audit log of all bookings with status filter.
