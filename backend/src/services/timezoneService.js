// src/services/timezoneService.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for ALL timezone / date logic in this application.
// Uses Luxon. No raw `new Date()` comparisons should exist anywhere else.
// ─────────────────────────────────────────────────────────────────────────────

import { DateTime } from 'luxon';

/**
 * Convert a UTC instant (JS Date or ISO string) to the habit-owner's local
 * calendar date as a plain "YYYY-MM-DD" string.
 *
 * Example: getLocalDate("2026-03-11T21:30:00Z", "Asia/Kolkata") → "2026-03-12"
 *
 * @param {Date|string} utcInstant
 * @param {string}      timezone   IANA timezone, e.g. "Asia/Kolkata"
 * @returns {string}  "YYYY-MM-DD"
 */
export function getLocalDate(utcInstant, timezone) {
  return DateTime.fromJSDate(new Date(utcInstant), { zone: 'utc' })
    .setZone(timezone)
    .toISODate(); // always "YYYY-MM-DD"
}

/**
 * Return today's calendar date in the given IANA timezone as "YYYY-MM-DD".
 *
 * @param {string} timezone
 * @returns {string}  "YYYY-MM-DD"
 */
export function getTodayLocalDate(timezone) {
  return DateTime.now().setZone(timezone).toISODate();
}

/**
 * Return true if the given date string is strictly AFTER today in the given
 * timezone (i.e., it is a future date).
 *
 * @param {string} date      "YYYY-MM-DD"
 * @param {string} timezone
 * @returns {boolean}
 */
export function isFutureLocalDate(date, timezone) {
  const today = DateTime.now().setZone(timezone).startOf('day');
  const target = DateTime.fromISO(date, { zone: timezone }).startOf('day');
  return target > today;
}

/**
 * Parse a "YYYY-MM-DD" string into a JS Date at midnight UTC, suitable for
 * storing in Prisma's @db.Date column.
 *
 * Why midnight UTC? node-postgres interprets bare JS Date objects using the
 * Node process's local TZ, which can silently shift the stored date by one
 * day. Pinning to UTC midnight prevents that.
 *
 * @param {string} dateStr  "YYYY-MM-DD"
 * @returns {Date}
 */
export function parseDateToUTC(dateStr) {
  return DateTime.fromISO(dateStr, { zone: 'utc' }).toJSDate();
}

/**
 * Server-side streak computation. All inputs are "YYYY-MM-DD" strings.
 * The frontend MUST treat streak numbers as read-only values from the API —
 * never replicate this logic client-side.
 *
 * Algorithm (O(n log n)):
 *  currentStreak  — consecutive days ending at today (or yesterday if today
 *                   has no check-in yet), walking backwards.
 *  longestStreak  — longest run of consecutive days across ALL check-ins,
 *                   walking forwards.
 *
 * @param {string[]} checkinLocalDates  Array of "YYYY-MM-DD" strings
 * @param {string}   timezone           User's IANA timezone (used to get today)
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
export function computeStreaks(checkinLocalDates, timezone) {
  if (!checkinLocalDates || checkinLocalDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const todayStr = getTodayLocalDate(timezone);
  const today = DateTime.fromISO(todayStr, { zone: timezone }).startOf('day');

  // Deduplicate and parse into Luxon DateTimes, sort descending
  const unique = [...new Set(checkinLocalDates)];
  const sorted = unique
    .map(d => DateTime.fromISO(d, { zone: timezone }).startOf('day'))
    .sort((a, b) => b.toMillis() - a.toMillis()); // descending

  // ── Current streak ──────────────────────────────────────────────────────────
  // Walk backwards from today (or yesterday if today is missing) and count
  // how many consecutive days have a check-in.
  let currentStreak = 0;
  let cursor = today;

  const hasToday = sorted.some(d => d.hasSame(today, 'day'));
  if (!hasToday) {
    // Allow streak to remain alive even if today hasn't been checked in yet
    cursor = today.minus({ days: 1 });
  }

  for (const date of sorted) {
    if (date.hasSame(cursor, 'day')) {
      currentStreak++;
      cursor = cursor.minus({ days: 1 });
    } else if (date < cursor) {
      break; // gap found — streak is over
    }
    // date > cursor means duplicates that slipped through; skip silently
  }

  // ── Longest streak ──────────────────────────────────────────────────────────
  // Walk ascending and count the longest run of consecutive days.
  const ascending = [...sorted].sort((a, b) => a.toMillis() - b.toMillis());
  let longestStreak = 0;
  let runningStreak = 0;
  let prev = null;

  for (const date of ascending) {
    if (prev === null || date.hasSame(prev.plus({ days: 1 }), 'day')) {
      runningStreak++;
    } else {
      runningStreak = 1;
    }
    if (runningStreak > longestStreak) longestStreak = runningStreak;
    prev = date;
  }

  return { currentStreak, longestStreak };
}
