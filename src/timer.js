/**
 * timer.js — Pure timer utility functions for the Facilitator Timer.
 * All functions are side-effect-free and fully unit-testable.
 */

/**
 * formatTime — Converts a total-seconds count to HH:MM:SS string.
 * @param {number} totalSeconds - Non-negative integer
 * @returns {string} e.g. 3661 → "01:01:01"
 */
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return [hh, mm, ss].map(n => String(n).padStart(2, '0')).join(':');
}

/**
 * parseTimeInput — Converts a "MM:SS" or "HH:MM:SS" input string to seconds.
 * Returns null if the format is invalid.
 * @param {string} input
 * @returns {number|null}
 */
export function parseTimeInput(input) {
  const parts = input.trim().split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) {
    const [mm, ss] = parts;
    if (ss >= 60) return null;
    return mm * 60 + ss;
  }
  if (parts.length === 3) {
    const [hh, mm, ss] = parts;
    if (mm >= 60 || ss >= 60) return null;
    return hh * 3600 + mm * 60 + ss;
  }
  return null;
}

/**
 * getRemainingSeconds — Drift-free remaining time calculation.
 * Uses the absolute server endTime instead of local interval arithmetic.
 * @param {object} timerState  - { status, endTime (ms), duration (s) }
 * @param {number} nowMs       - Current timestamp in milliseconds (injectable for testing)
 * @returns {number}           - Remaining seconds (≥ 0)
 */
export function getRemainingSeconds(timerState, nowMs = Date.now()) {
  if (!timerState) return 0;
  if (timerState.status === 'active' && timerState.endTime) {
    return Math.max(0, Math.ceil((timerState.endTime - nowMs) / 1000));
  }
  // paused or reset — return stored remaining duration
  return timerState.duration ?? 0;
}
