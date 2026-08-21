// src/routes/auth.js
// POST /auth/register  — create user account
// POST /auth/login     — authenticate and return JWT

import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import prisma from '../services/prismaClient.js';

const router = Router();
const SALT_ROUNDS = 12;

// ── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password, timezone } = req.body;

  if (!email || !password || !timezone) {
    return res.status(400).json({ error: 'email, password, and timezone are required' });
  }

  // Validate that timezone is a recognised IANA zone
  const zone = DateTime.now().setZone(timezone);
  if (!zone.isValid) {
    return res.status(400).json({ error: `Invalid IANA timezone: "${timezone}"` });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { email: email.toLowerCase().trim(), passwordHash, timezone },
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    throw err;
  }
});

// ── POST /auth/login ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user);
  return res.json({ token, user: safeUser(user) });
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, timezone: user.timezone },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user) {
  return { id: user.id, email: user.email, timezone: user.timezone, createdAt: user.createdAt };
}

export default router;
