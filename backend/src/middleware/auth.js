// src/middleware/auth.js
// JWT authentication middleware. Attaches req.user = { id, email, timezone }

import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload contains: { userId, email, timezone }
    req.user = {
      id: payload.userId,
      email: payload.email,
      timezone: payload.timezone,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
