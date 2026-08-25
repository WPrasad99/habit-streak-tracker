# HabitStreak 🔥

A full-stack habit tracker that computes streaks using the user's **local calendar day**, not server time or raw UTC elapsed hours.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + React Router |
| Backend | Node.js + Express (ESM) |
| ORM | Prisma |
| Database | PostgreSQL |
| Timezone math | Luxon |
| Auth | bcrypt + JWT |

---

## Project Structure

```
habit-tracker/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Data model + DB-level unique constraint
│   ├── src/
│   │   ├── services/
│   │   │   ├── timezoneService.js  ← ALL date/TZ logic lives here
│   │   │   └── prismaClient.js
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.js         # POST /auth/register|login
│   │   │   ├── habits.js       # GET|POST /habits, GET|DELETE /habits/:id
│   │   │   └── checkins.js     # POST|GET /habits/:id/checkins
│   │   └── index.js            # Express app entry point
│   ├── tests/
│   │   └── timezoneService.test.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js       # Axios + JWT interceptor
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # LoginPage, HabitsPage, HabitDetailPage
│   │   ├── components/         # Navbar
│   │   ├── utils/timezones.js
│   │   ├── App.jsx             # Routes + providers
│   │   └── index.css           # Design system
│   └── .env.example
└── docker-compose.yml
```

---

## How Local-Day Logic Is Modeled

### The Core Problem

A naive implementation would compare UTC timestamps and divide by 86,400 seconds. This breaks near day boundaries: two check-ins at `22:00 UTC` and `02:00 UTC` the next day are 4 hours apart but count as *different* local days for a user in UTC+5:30.

### Our Solution

**`backend/src/services/timezoneService.js`** is the single, isolated module that owns all timezone/date logic. It uses [Luxon](https://moment.github.io/luxon/) for correct IANA timezone handling.

```
getLocalDate(utcInstant, timezone)   → "YYYY-MM-DD"
getTodayLocalDate(timezone)          → "YYYY-MM-DD"
isFutureLocalDate(date, timezone)    → boolean
parseDateToUTC(dateStr)              → Date (midnight UTC, for Prisma @db.Date)
computeStreaks(checkinLocalDates, timezone) → { currentStreak, longestStreak }
```

**No raw `new Date()` comparisons exist anywhere else in the backend.**

### Schema Design

```sql
check_ins (
  id          TEXT PRIMARY KEY,
  habit_id    TEXT REFERENCES habits(id),
  user_id     TEXT REFERENCES users(id),
  utc_instant TIMESTAMPTZ,   -- exact moment (audit trail)
  local_date  DATE,          -- precomputed local calendar date
  created_at  TIMESTAMPTZ,
  UNIQUE (habit_id, local_date)  -- DB-level enforcement
)
```

| Column | Purpose |
|--------|---------|
| `utc_instant` | Immutable audit trail — exact moment of check-in |
| `local_date` | Precomputed at write time; streak queries never re-derive TZ at read time |
| `UNIQUE(habit_id, local_date)` | Database-level race-condition safety net; app catches `P2002` → clean 409 |

### Worked Example (Asia/Kolkata, UTC+05:30)

| Check-in UTC | Local Date | Result |
|-------------|------------|--------|
| `2026-03-10T14:30Z` | `2026-03-10` | Streak = 1 |
| `2026-03-11T10:30Z` | `2026-03-11` | Streak = 2 |
| `2026-03-11T21:30Z` | `2026-03-12` *(03:00 local — crosses midnight!)* | Streak = 3 |
| `2026-03-12T17:30Z` | `2026-03-12` *(same as above)* | **409 Duplicate** — streak stays 3 ✅ |

---

## Setup & Running

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or use Docker)
- npm

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install

# Frontend
cd ../frontend
cp .env.example .env.local
npm install
```

### 2. Database setup

```bash
cd backend

# Apply migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### 3. Run in development

```bash
# Terminal 1 — backend (http://localhost:3001)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 4. Run tests

```bash
cd backend
npm test
```

### 5. Docker Compose (all-in-one)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- DB: localhost:5432

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | `{ email, password, timezone }` |
| POST | `/auth/login` | — | `{ email, password }` → `{ token, user }` |
| GET | `/habits` | ✓ | List habits with streaks |
| POST | `/habits` | ✓ | `{ name, description? }` |
| GET | `/habits/:id` | ✓ | Habit detail + check-in history |
| DELETE | `/habits/:id` | ✓ | Delete habit + all check-ins |
| POST | `/habits/:id/checkins` | ✓ | `{ date? }` — omit for today, include for backfill |
| GET | `/habits/:id/checkins` | ✓ | Paginated history (`?page=1&limit=30`) |

---

## Known Limitations / Deliberate Omissions

| Topic | Decision |
|-------|---------|
| **Timezone update** | Timezone is immutable after signup (MVP scope). Updating it retroactively would require re-deriving `local_date` for every check-in. |
| **Multi-timezone travel** | Out of scope per spec. A user who flies across datelines mid-streak will have their streak computed correctly *in their stored timezone*, not their physical location. |
| **Streak caching** | Streaks are recomputed on every `GET /habits` read. For hundreds of check-ins this is O(n) and fast enough; a caching layer would be premature optimisation for MVP scale. |
| **Pagination** | `GET /habits/:id/checkins` supports pagination. `GET /habits` returns all habits (reasonable for personal use). |
| **DST transitions** | Luxon handles DST correctly via IANA zone data. The stored `local_date` is derived at write time so historical dates are never affected by future DST rule changes. |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | Secret for signing JWTs — use a long random string |
| `PORT` | — | Defaults to `3001` |
| `CORS_ORIGIN` | — | Frontend origin, defaults to `http://localhost:5173` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | — | Backend URL, defaults to `http://localhost:3001` |
