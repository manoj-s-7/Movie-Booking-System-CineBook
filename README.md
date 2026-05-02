# 🎬 CineBook — Full-Stack Movie Booking System

A dark-themed, cinema-quality movie booking platform built with **Next.js 14**, **Node/Express**, and **MySQL**, powered by the **TMDB API** for live movie data.

---

## 📋 Prerequisites

Make sure the following are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/ |
| npm | (comes with Node) | — |

You will also need a **free TMDB API key**:
👉 https://www.themoviedb.org/settings/api (sign up → Settings → API → Create)

---

## 🚀 Setup in 4 Steps

### Step 1 — Create the Database

Open a terminal and run:

```bash
mysql -u root -p < backend/config/init.sql
```

> Enter your MySQL root password when prompted.  
> This creates the `cinebook` database with all required tables and seeds 5 sample theaters.

---

### Step 2 — Configure the Backend

```bash
cd backend
```

Rename the example env file:
```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Open `backend/.env` and fill in **only these two values**:

```env
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
TMDB_API_KEY=YOUR_TMDB_API_KEY
```

Everything else (port, DB name, JWT secret, TMDB URL) is already set and works out of the box.

---

### Step 3 — Configure the Frontend

```bash
cd ../frontend
```

Rename the example env file:
```bash
# Windows
copy .env.local.example .env.local

# Mac / Linux
cp .env.local.example .env.local
```

No changes needed — the defaults point to `http://localhost:5000` which is where the backend runs.

---

### Step 4 — Install & Run

Open **two terminals** side by side:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```
✅ Backend runs at: http://localhost:5000

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
✅ App runs at: http://localhost:3000

---

## 🗂️ Project Structure

```
cinebook/
├── backend/
│   ├── config/
│   │   ├── db.js          # MySQL connection pool
│   │   └── init.sql       # Database schema + seed data
│   ├── controllers/       # Route logic
│   ├── middleware/        # JWT auth guard
│   ├── routes/            # Express route definitions
│   ├── server.js          # Entry point
│   ├── .env.example       # ← Fill this in (rename to .env)
│   └── package.json
│
└── frontend/
    ├── app/               # Next.js 14 App Router pages
    │   ├── booking/       # Seat selection
    │   ├── bookings/      # My Bookings (view + cancel)
    │   ├── movies/        # Browse & movie detail
    │   ├── payment/       # Checkout + success
    │   ├── login/
    │   ├── register/
    │   └── profile/
    ├── .env.local.example # ← Rename to .env.local (no edits needed)
    └── package.json
```

---

## ✨ Features

- 🎥 Live movie data from TMDB (Now Playing, Popular, Upcoming, Top Rated)
- 🔍 Movie search & genre filtering
- 🎭 Interactive seat map (100 seats auto-generated per show — Standard / Premium / Recliner)
- 💳 3-step booking flow: Seats → Payment → Confirmation
- 🎫 My Bookings page with cancel support
- 👤 User auth (JWT, register/login)
- 📱 Fully responsive dark UI

---

## 🌐 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/movies/now-playing
GET    /api/movies/popular
GET    /api/movies/upcoming
GET    /api/movies/top-rated
GET    /api/movies/search?q=
GET    /api/movies/:tmdbId/details
GET    /api/movies/:tmdbId/showtimes?date=

GET    /api/bookings/seats/:showtimeId
POST   /api/bookings               (auth required)
GET    /api/bookings/my            (auth required)
PATCH  /api/bookings/:id/cancel    (auth required)
```

---

## 📝 Notes

- Showtimes are **auto-generated** when a movie is first viewed (no manual seeding needed)
- Seats are **auto-generated** (10 rows × 10 seats) on first seat selection
- TMDB movies are **cached in MySQL** on first access for faster subsequent loads
- Seat pricing: Standard ₹250 · Premium ₹325 · Recliner ₹450 (based on showtime base price)
- The `.env` and `.env.local` files are **not included** in the zip — you create them from the `.example` files
