# 🎬 CineBook — Full Stack Movie Booking System

Dark-themed movie booking platform built with **Next.js 14**, **Node/Express**, and **MySQL**, powered by the **TMDB API** for live movie data.

---

## 🗂️ Project Structure
```
cinebook/
├── backend/          # Express API server
└── frontend/         # Next.js 14 app
```

---

## ⚙️ Setup Instructions

### 1. Database (MySQL)
```bash
mysql -u root -p3008 < backend/config/init.sql
```
This creates the `cinebook` database with all tables and seeds 5 Bangalore theaters.

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Edit `.env` — add your TMDB API key:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=3008
DB_NAME=cinebook
JWT_SECRET=cinebook_super_secret_jwt_key_2024
TMDB_API_KEY=YOUR_TMDB_KEY_HERE
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/original
```

Start the server:
```bash
npm run dev    # development (nodemon)
npm start      # production
```

Server runs at: **http://localhost:5000**

---

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_TMDB_IMAGE=https://image.tmdb.org/t/p
NEXT_PUBLIC_TMDB_API_KEY=YOUR_TMDB_KEY_HERE
```

Start Next.js:
```bash
npm run dev
```

App runs at: **http://localhost:3000**

---

## 🚀 Features

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero slider + movie rows |
| Movies | `/movies` | Browse, search, filter |
| Movie Detail | `/movies/[id]` | Info + showtimes picker |
| Booking | `/booking/[showtimeId]` | Seat selection + payment |
| My Bookings | `/bookings` | View/cancel bookings |
| Profile | `/profile` | User stats + info |
| Login | `/login` | JWT auth |
| Register | `/register` | Account creation |

### API Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/movies/now-playing
GET    /api/movies/popular
GET    /api/movies/upcoming
GET    /api/movies/top-rated
GET    /api/movies/genres
GET    /api/movies/search?q=
GET    /api/movies/:tmdbId/details
GET    /api/movies/:tmdbId/showtimes?date=

GET    /api/bookings/seats/:showtimeId
POST   /api/bookings               (auth required)
GET    /api/bookings/my            (auth required)
PATCH  /api/bookings/:id/cancel    (auth required)
```

### Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Zustand, Framer Motion, React Hot Toast
- **Backend**: Node.js, Express, MySQL2, JWT, bcryptjs
- **Data**: TMDB API (movies), MySQL (users, bookings, theaters, showtimes)
- **Auth**: JWT tokens stored in localStorage

---

## 🎨 UI Design
- Deep dark purple/navy cinema theme
- Bebas Neue display font
- Glass morphism cards
- Animated hero slider
- Interactive seat map (100 seats per show, auto-generated)
- 3-step booking flow: Seats → Payment → Confirmation

---

## 📝 Notes
- Showtimes are auto-generated when a movie is first booked (no manual seeding required)
- Seats are auto-generated (10 rows × 10 seats) on first seat selection
- TMDB movies are cached in MySQL on first access
- Seat pricing: Standard ₹250, Premium ₹325, Recliner ₹450 (based on showtime price)
