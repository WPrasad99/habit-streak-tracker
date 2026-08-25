// src/index.js
// Express application entry point

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import habitsRouter from './routes/habits.js';
import checkinsRouter from './routes/checkins.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://habit-streak-tracker-kappa.vercel.app',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
const apiRouter = express.Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/habits', habitsRouter);
apiRouter.use('/habits/:id/checkins', checkinsRouter);

app.use('/api', apiRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Habit Tracker API listening on http://localhost:${PORT}`);
});

export default app;
