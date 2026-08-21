// src/routes/habits.js
// GET  /habits          — list all habits for authenticated user (with streaks)
// POST /habits          — create a new habit
// GET  /habits/:id      — get habit detail + full check-in history
// DELETE /habits/:id    — delete habit

import { Router } from 'express';
import prisma from '../services/prismaClient.js';
import { authenticate } from '../middleware/auth.js';
import { computeStreaks, getTodayLocalDate, getLocalDate } from '../services/timezoneService.js';

const router = Router();
router.use(authenticate);

// ── GET /habits ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'asc' },
    include: { checkIns: { select: { localDate: true } } },
  });

  const todayLocal = getTodayLocalDate(req.user.timezone);

  const result = habits.map(habit => {
    const dateStrings = habit.checkIns.map(c => toDateString(c.localDate));
    const { currentStreak, longestStreak } = computeStreaks(dateStrings, req.user.timezone);
    const checkedInToday = dateStrings.includes(todayLocal);

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      createdAt: habit.createdAt,
      currentStreak,
      longestStreak,
      checkedInToday,
      checkIns: dateStrings,
    };
  });

  res.json(result);
});

// ── POST /habits ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const habit = await prisma.habit.create({
    data: {
      userId: req.user.id,
      name: name.trim(),
      description: description?.trim() || null,
    },
  });

  res.status(201).json({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    createdAt: habit.createdAt,
    currentStreak: 0,
    longestStreak: 0,
    checkedInToday: false,
  });
});

// ── GET /habits/:id ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const habit = await prisma.habit.findUnique({
    where: { id: req.params.id },
    include: {
      checkIns: {
        select: { id: true, localDate: true, utcInstant: true, createdAt: true },
        orderBy: { localDate: 'desc' },
      },
    },
  });

  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const dateStrings = habit.checkIns.map(c => toDateString(c.localDate));
  const { currentStreak, longestStreak } = computeStreaks(dateStrings, req.user.timezone);
  const todayLocal = getTodayLocalDate(req.user.timezone);

  res.json({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    createdAt: habit.createdAt,
    currentStreak,
    longestStreak,
    checkedInToday: dateStrings.includes(todayLocal),
    checkIns: habit.checkIns.map(c => ({
      id: c.id,
      localDate: toDateString(c.localDate),
      utcInstant: c.utcInstant,
      createdAt: c.createdAt,
    })),
  });
});

// ── DELETE /habits/:id ───────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const habit = await prisma.habit.findUnique({ where: { id: req.params.id } });

  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  if (habit.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  await prisma.habit.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ── Helper ───────────────────────────────────────────────────────────────────
// Prisma returns @db.Date columns as JS Date objects set to midnight UTC.
// Extract just the "YYYY-MM-DD" portion so streak logic works with plain strings.
function toDateString(jsDate) {
  return jsDate.toISOString().slice(0, 10);
}

export default router;
