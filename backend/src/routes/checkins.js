// src/routes/checkins.js
// POST /habits/:id/checkins  — log a check-in (today or backfill)
// GET  /habits/:id/checkins  — paginated check-in history

import { Router } from 'express';
import prisma from '../services/prismaClient.js';
import { authenticate } from '../middleware/auth.js';
import {
  getTodayLocalDate,
  getLocalDate,
  isFutureLocalDate,
  parseDateToUTC,
} from '../services/timezoneService.js';

// Router is mounted with mergeParams so :id is accessible
const router = Router({ mergeParams: true });
router.use(authenticate);

// ── POST /habits/:id/checkins ────────────────────────────────────────────────
// Body: { date?: "YYYY-MM-DD" }
//   Omit date → today's local date in user's timezone
//   Provide date → backfill; treated as the target local_date directly
//
// Validation order (per spec):
//   1. Habit must belong to authenticated user → 403
//   2. Resolve local_date
//   3. Reject if local_date > today → 400
//   4. Reject if local_date < habit.created_at's local date → 400
//   5. Reject if (habit_id, local_date) already exists → 409
//   6. DB unique constraint as final race-condition safety net → 409
router.post('/', async (req, res) => {
  const { id: habitId } = req.params;
  const { date } = req.body;

  // 1. Ownership check
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  // 2. Resolve local_date
  let localDateStr;
  if (date) {
    // Validate format: must be YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
    }
    localDateStr = date;
  } else {
    localDateStr = getTodayLocalDate(req.user.timezone);
  }

  // 3. Reject future dates
  if (isFutureLocalDate(localDateStr, req.user.timezone)) {
    return res.status(400).json({ error: 'Cannot log a future date' });
  }

  // 4. Reject dates before habit creation
  const habitCreatedLocalDate = getLocalDate(habit.createdAt, req.user.timezone);
  if (localDateStr < habitCreatedLocalDate) {
    return res.status(400).json({
      error: `Cannot log before habit was created (earliest: ${habitCreatedLocalDate})`,
    });
  }

  // 5. Explicit duplicate check (provides a cleaner error message than P2002)
  const existing = await prisma.checkIn.findUnique({
    where: {
      habitId_localDate: {
        habitId,
        localDate: parseDateToUTC(localDateStr),
      },
    },
  });
  if (existing) {
    return res.status(409).json({ error: 'Already checked in for this day' });
  }

  // 6. Insert — DB unique constraint is the final race-condition safety net
  try {
    const utcInstant = new Date(); // exact moment of the request
    const checkIn = await prisma.checkIn.create({
      data: {
        habitId,
        userId: req.user.id,
        utcInstant,
        localDate: parseDateToUTC(localDateStr),
      },
    });

    return res.status(201).json({
      id: checkIn.id,
      habitId: checkIn.habitId,
      localDate: localDateStr,
      utcInstant: checkIn.utcInstant,
      createdAt: checkIn.createdAt,
    });
  } catch (err) {
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Already checked in for this day' });
    }
    throw err;
  }
});

// ── GET /habits/:id/checkins ─────────────────────────────────────────────────
// Returns paginated check-in history. Query params: page (1-based), limit (default 30)
router.get('/', async (req, res) => {
  const { id: habitId } = req.params;

  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
  const skip = (page - 1) * limit;

  const [total, checkIns] = await prisma.$transaction([
    prisma.checkIn.count({ where: { habitId } }),
    prisma.checkIn.findMany({
      where: { habitId },
      orderBy: { localDate: 'desc' },
      skip,
      take: limit,
      select: { id: true, localDate: true, utcInstant: true, createdAt: true },
    }),
  ]);

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    checkIns: checkIns.map(c => ({
      id: c.id,
      localDate: c.localDate.toISOString().slice(0, 10),
      utcInstant: c.utcInstant,
      createdAt: c.createdAt,
    })),
  });
});

export default router;
