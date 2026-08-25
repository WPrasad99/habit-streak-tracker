// tests/timezoneService.test.js
// Tests for the streak algorithm in timezoneService.js.
// Includes the exact worked example from the spec (Asia/Kolkata, UTC+05:30).

import { DateTime } from 'luxon';
import {
  getLocalDate,
  getTodayLocalDate,
  isFutureLocalDate,
  computeStreaks,
} from '../src/services/timezoneService.js';

const TZ = 'Asia/Kolkata'; // UTC+05:30

// ── getLocalDate ──────────────────────────────────────────────────────────────
describe('getLocalDate', () => {
  test('converts UTC to next local day when offset crosses midnight', () => {
    // 2026-03-11T21:30Z → 21:30 + 5:30 = 03:00 local on 2026-03-12
    expect(getLocalDate('2026-03-11T21:30:00.000Z', TZ)).toBe('2026-03-12');
  });

  test('stays on same day when offset does not cross midnight', () => {
    // 2026-03-10T14:30Z → 20:00 local on 2026-03-10
    expect(getLocalDate('2026-03-10T14:30:00.000Z', TZ)).toBe('2026-03-10');
  });

  test('works across year boundaries', () => {
    // 2025-12-31T22:00Z → 03:30 local on 2026-01-01
    expect(getLocalDate('2025-12-31T22:00:00.000Z', TZ)).toBe('2026-01-01');
  });

  test('accepts a JS Date object', () => {
    const d = new Date('2026-03-11T21:30:00.000Z');
    expect(getLocalDate(d, TZ)).toBe('2026-03-12');
  });
});

// ── isFutureLocalDate ─────────────────────────────────────────────────────────
describe('isFutureLocalDate', () => {
  test('returns false for today', () => {
    const today = getTodayLocalDate(TZ);
    expect(isFutureLocalDate(today, TZ)).toBe(false);
  });

  test('returns false for a past date', () => {
    expect(isFutureLocalDate('2000-01-01', TZ)).toBe(false);
  });

  test('returns true for a future date', () => {
    expect(isFutureLocalDate('2099-12-31', TZ)).toBe(true);
  });
});

// ── computeStreaks — edge cases ────────────────────────────────────────────────
describe('computeStreaks — edge cases', () => {
  test('empty history → both streaks 0', () => {
    expect(computeStreaks([], TZ)).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  test('null/undefined input → both streaks 0', () => {
    expect(computeStreaks(null, TZ)).toEqual({ currentStreak: 0, longestStreak: 0 });
    expect(computeStreaks(undefined, TZ)).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  test('single check-in today → currentStreak 1, longestStreak 1', () => {
    const today = getTodayLocalDate(TZ);
    expect(computeStreaks([today], TZ)).toEqual({ currentStreak: 1, longestStreak: 1 });
  });

  test('single check-in yesterday → currentStreak 1 (grace day), longestStreak 1', () => {
    const yesterday = DateTime.now().setZone(TZ).minus({ days: 1 }).toISODate();
    expect(computeStreaks([yesterday], TZ)).toEqual({ currentStreak: 1, longestStreak: 1 });
  });

  test('single check-in two days ago → currentStreak 0 (gap), longestStreak 1', () => {
    const twoDaysAgo = DateTime.now().setZone(TZ).minus({ days: 2 }).toISODate();
    expect(computeStreaks([twoDaysAgo], TZ)).toEqual({ currentStreak: 0, longestStreak: 1 });
  });

  test('gap in middle: days 1,2,4,5 → longestStreak 2', () => {
    const dates = ['2024-01-01', '2024-01-02', '2024-01-04', '2024-01-05'];
    const { longestStreak } = computeStreaks(dates, TZ);
    expect(longestStreak).toBe(2);
  });

  test('five consecutive days → longestStreak 5', () => {
    const dates = ['2024-06-01', '2024-06-02', '2024-06-03', '2024-06-04', '2024-06-05'];
    const { longestStreak } = computeStreaks(dates, TZ);
    expect(longestStreak).toBe(5);
  });

  test('duplicate dates are handled gracefully (idempotent)', () => {
    const today = getTodayLocalDate(TZ);
    expect(computeStreaks([today, today, today], TZ)).toEqual({
      currentStreak: 1,
      longestStreak: 1,
    });
  });

  test('backfill bridging a gap: [day1, day3] + day2 backfill → longestStreak 3', () => {
    // Day2 is in the past so won't affect currentStreak from today
    const dates = ['2024-02-01', '2024-02-02', '2024-02-03'];
    const { longestStreak } = computeStreaks(dates, TZ);
    expect(longestStreak).toBe(3);
  });
});

// ── SPEC WORKED EXAMPLE (must match exactly) ──────────────────────────────────
// Asia/Kolkata = UTC+05:30
//
// A: 2026-03-10T14:30Z → +05:30 → 20:00 local → local_date 2026-03-10  ✓
// B: 2026-03-11T10:30Z → +05:30 → 16:00 local → local_date 2026-03-11  ✓
// C: 2026-03-11T21:30Z → +05:30 → 03:00 local NEXT DAY → 2026-03-12    ✓
// D: 2026-03-12T17:30Z → +05:30 → 23:00 local → local_date 2026-03-12  ← SAME AS C → rejected
//
// After A, B, C stored; D rejected as duplicate:
//   longestStreak = 3 (dates 10, 11, 12 are consecutive)
//   currentStreak = 3 if "today" = 2026-03-12 (that's in the past now,
//                   so this test asserts longestStreak only since currentStreak
//                   depends on the real-world current date)
describe('Spec worked example — Asia/Kolkata (UTC+05:30)', () => {
  const checkInUTCs = [
    '2026-03-10T14:30:00.000Z', // A
    '2026-03-11T10:30:00.000Z', // B
    '2026-03-11T21:30:00.000Z', // C — crosses midnight in IST
    '2026-03-12T17:30:00.000Z', // D — same local date as C
  ];

  test('A → local date 2026-03-10', () => {
    expect(getLocalDate(checkInUTCs[0], TZ)).toBe('2026-03-10');
  });

  test('B → local date 2026-03-11', () => {
    expect(getLocalDate(checkInUTCs[1], TZ)).toBe('2026-03-11');
  });

  test('C → local date 2026-03-12 (crosses midnight in IST)', () => {
    expect(getLocalDate(checkInUTCs[2], TZ)).toBe('2026-03-12');
  });

  test('D → local date 2026-03-12 — same as C, so it is a duplicate', () => {
    const localC = getLocalDate(checkInUTCs[2], TZ);
    const localD = getLocalDate(checkInUTCs[3], TZ);
    expect(localD).toBe(localC); // confirms duplicate detection is correct
  });

  test('stored dates (A, B, C) are three consecutive days', () => {
    const stored = [
      getLocalDate(checkInUTCs[0], TZ), // 2026-03-10
      getLocalDate(checkInUTCs[1], TZ), // 2026-03-11
      getLocalDate(checkInUTCs[2], TZ), // 2026-03-12
    ];
    expect(stored).toEqual(['2026-03-10', '2026-03-11', '2026-03-12']);
  });

  test('longestStreak after A+B+C = 3 (D rejected)', () => {
    const stored = [
      getLocalDate(checkInUTCs[0], TZ),
      getLocalDate(checkInUTCs[1], TZ),
      getLocalDate(checkInUTCs[2], TZ),
      // D is NOT stored (duplicate rejected)
    ];
    const { longestStreak } = computeStreaks(stored, TZ);
    expect(longestStreak).toBe(3);
  });

  test('if D were (wrongly) stored, longestStreak is still 3 (deduplication)', () => {
    const withDuplicate = [
      getLocalDate(checkInUTCs[0], TZ),
      getLocalDate(checkInUTCs[1], TZ),
      getLocalDate(checkInUTCs[2], TZ),
      getLocalDate(checkInUTCs[3], TZ), // same as C
    ];
    const { longestStreak } = computeStreaks(withDuplicate, TZ);
    expect(longestStreak).toBe(3); // still 3 because dedup handles it
  });
});
