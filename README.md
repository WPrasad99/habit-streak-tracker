# HabitStreak Tracker 🚀

![HabitStreak Banner](https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=2500&auto=format&fit=crop)

> A premium, beautifully designed SaaS application to track your habits, build unbreakable consistency, and visualize your daily progress.

**Live Demo (Frontend):** [https://habit-streak-tracker-kappa.vercel.app/](https://habit-streak-tracker-kappa.vercel.app/)

---

## 🎯 The Problem We Are Solving

Building good habits is fundamentally difficult because progress is invisible in the short term. People struggle with consistency because they lack a visual, rewarding system that holds them accountable and celebrates small wins. 

**HabitStreak solves this by providing:**
1. **Visual Accountability:** A beautiful GitHub-style contribution heatmap and progress rings that make your consistency visual.
2. **Frictionless Tracking:** An ultra-fast, real-time dashboard where logging a habit takes less than a second.
3. **Timezone Accuracy:** True UTC database storage with local-time resolution, ensuring your streaks never incorrectly break when you travel.

---

## 🏗️ High-Level Architecture

HabitStreak is built using a modern, decoupled full-stack architecture. 

```mermaid
graph TD
    subgraph Client [Frontend - Vercel]
        UI[React + Vite UI]
        State[Context API + State]
        Axios[Axios API Client]
    end

    subgraph Server [Backend - Render]
        Express[Node.js + Express API]
        Auth[JWT Authentication]
        Prisma[Prisma ORM]
    end

    subgraph Database [Database - Supabase]
        Postgres[(PostgreSQL via Connection Pooler)]
    end

    UI --> State
    State --> Axios
    Axios -- "JSON / HTTPS" --> Express
    Express --> Auth
    Express --> Prisma
    Prisma -- "TCP (port 6543)" --> Postgres
```

### Tech Stack
- **Frontend:** React.js, Vite, Vanilla CSS (Glassmorphism UI)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT) & bcrypt

---

## 🗄️ Entity-Relationship (ER) Diagram

The database is normalized and designed for fast, time-series querying of habit check-ins.

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string password_hash
        string timezone
        datetime created_at
    }
    
    HABIT {
        string id PK
        string user_id FK
        string name
        string description
        datetime created_at
    }
    
    CHECK_IN {
        string id PK
        string habit_id FK
        string user_id FK
        datetime utc_instant "Immutable audit trail"
        date local_date "Indexed for streak logic"
        datetime created_at
    }

    USER ||--o{ HABIT : creates
    USER ||--o{ CHECK_IN : performs
    HABIT ||--o{ CHECK_IN : has
```

---

## 🔄 Data Flow Diagram (DFD)

This diagram illustrates how data flows when a user marks a habit as "complete" for the day.

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant UI as React UI
    participant API as Express Server
    participant DB as PostgreSQL

    User->>UI: Clicks "Complete Habit" checkbox
    UI->>UI: Optimistically update UI state (green check)
    UI->>API: POST /api/checkins { habitId, date }
    
    API->>API: Verify JWT Token
    API->>DB: Check if Check-In exists for Local Date
    
    alt Check-In Exists
        DB-->>API: Return Conflict
        API-->>UI: 409 Conflict (Already Checked In)
    else New Check-In
        API->>DB: INSERT INTO check_ins (utc_instant, local_date)
        DB-->>API: Success
        API-->>UI: 201 Created (CheckIn Data)
    end
```

---

## 🚀 Local Development Setup

Want to run HabitStreak locally? Follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/WPrasad99/habit-streak-tracker.git
cd habit-streak-tracker
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` folder:
  ```env
  DATABASE_URL="postgresql://postgres:[PASSWORD]@[POOLER-HOST]:6543/postgres?pgbouncer=true"
  JWT_SECRET="your-secret-key"
  PORT=3000
  ```
- Push the database schema:
  ```bash
  npx prisma db push
  ```
- Start the server:
  ```bash
  npm start
  ```

### 3. Setup the Frontend
```bash
cd ../frontend
npm install
```
- Create a `.env.local` file in the `frontend` folder:
  ```env
  VITE_API_URL="http://localhost:3000/api"
  ```
- Start the development server:
  ```bash
  npm run dev
  ```

Visit `http://localhost:5173` to view the app!

---
*Built with ❤️ for building better habits.*
