/**
 * timer.test.js — Unit tests for timer.js pure utilities.
 * TDD: These tests were written to specify the behaviour before implementation.
 */
import { describe, it, expect } from 'vitest';
import { formatTime, parseTimeInput, getRemainingSeconds } from '../../src/timer';

// ── formatTime ────────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats zero as 00:00:00', () => {
    expect(formatTime(0)).toBe('00:00:00');
  });

  it('formats 61 seconds as 00:01:01', () => {
    expect(formatTime(61)).toBe('00:01:01');
  });

  it('formats 3661 seconds as 01:01:01', () => {
    expect(formatTime(3661)).toBe('01:01:01');
  });

  it('formats 300 seconds (5 min) as 00:05:00', () => {
    expect(formatTime(300)).toBe('00:05:00');
  });

  it('formats 3600 seconds (1 hour) as 01:00:00', () => {
    expect(formatTime(3600)).toBe('01:00:00');
  });

  it('clamps negative input to 00:00:00', () => {
    expect(formatTime(-5)).toBe('00:00:00');
  });

  it('floors floating point input (truncates sub-second)', () => {
    expect(formatTime(61.9)).toBe('00:01:01');
  });
});

// ── parseTimeInput ────────────────────────────────────────────────────────────

describe('parseTimeInput', () => {
  it('parses "05:00" (MM:SS) → 300 seconds', () => {
    expect(parseTimeInput('05:00')).toBe(300);
  });

  it('parses "01:30" → 90 seconds', () => {
    expect(parseTimeInput('01:30')).toBe(90);
  });

  it('parses "00:00:30" (HH:MM:SS) → 30 seconds', () => {
    expect(parseTimeInput('00:00:30')).toBe(30);
  });

  it('parses "01:05:00" → 3900 seconds', () => {
    expect(parseTimeInput('01:05:00')).toBe(3900);
  });

  it('returns null for invalid string "abc"', () => {
    expect(parseTimeInput('abc')).toBeNull();
  });

  it('returns null for seconds >= 60 ("01:65")', () => {
    expect(parseTimeInput('01:65')).toBeNull();
  });

  it('returns null for minutes >= 60 ("01:60:00")', () => {
    expect(parseTimeInput('01:60:00')).toBeNull();
  });

  it('trims whitespace before parsing', () => {
    expect(parseTimeInput('  03:00  ')).toBe(180);
  });
});

// ── getRemainingSeconds ───────────────────────────────────────────────────────

describe('getRemainingSeconds', () => {
  it('returns 0 when timerState is null', () => {
    expect(getRemainingSeconds(null)).toBe(0);
  });

  it('returns duration when status is "reset"', () => {
    expect(getRemainingSeconds({ status: 'reset', duration: 300 })).toBe(300);
  });

  it('returns duration when status is "paused"', () => {
    expect(getRemainingSeconds({ status: 'paused', duration: 120 })).toBe(120);
  });

  it('calculates remaining from endTime when status is "active"', () => {
    const now = 1000000000000; // fixed reference point
    const endTime = now + 60000; // 60 seconds from now
    const state = { status: 'active', endTime, duration: 300 };
    expect(getRemainingSeconds(state, now)).toBe(60);
  });

  it('returns 0 when active timer has already expired', () => {
    const now = 1000000001000;
    const endTime = now - 5000; // ended 5 seconds ago
    const state = { status: 'active', endTime, duration: 300 };
    expect(getRemainingSeconds(state, now)).toBe(0);
  });

  it('countdown decrements correctly across ticks (drift-free)', () => {
    const startMs = 1000000000000;
    const endTime = startMs + 5000; // 5 seconds total
    const state = { status: 'active', endTime, duration: 5 };

    // Tick 0 — at start
    expect(getRemainingSeconds(state, startMs)).toBe(5);
    // Tick 1 — 1 second later
    expect(getRemainingSeconds(state, startMs + 1000)).toBe(4);
    // Tick 2 — 2 seconds later
    expect(getRemainingSeconds(state, startMs + 2000)).toBe(3);
    // Tick 5 — at endTime
    expect(getRemainingSeconds(state, startMs + 5000)).toBe(0);
    // Tick 6 — past end (clamp to 0)
    expect(getRemainingSeconds(state, startMs + 6000)).toBe(0);
  });
});
