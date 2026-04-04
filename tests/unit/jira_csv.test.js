/**
 * jira_csv.test.js — TDD unit tests for buildJiraCSV.
 * These tests specify the contract BEFORE implementation.
 */
import { describe, it, expect } from 'vitest';
import { buildJiraCSV } from '../../src/logic';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const sampleActions = [
  {
    id: 'a1',
    what: 'Deploy caching layer to production',
    originalWhat: 'Deploy caching layer to production',
    sourceAnchorText: 'Slow API responses in Phase 2',
    who: 'Stefan',
    when: '2026-04-15',
  },
  {
    id: 'a2',
    what: 'Review, refactor, and merge the auth module',  // contains commas
    originalWhat: 'Review, refactor, and merge the auth module',
    sourceAnchorText: 'Auth module was flagged twice',
    who: 'To be assigned',
    when: 'TBD',
  },
  {
    id: 'a3',
    what: 'She said "fix it now"',  // contains double-quotes
    originalWhat: 'She said "fix it now"',
    sourceAnchorText: 'Communication breakdown',
    who: 'Anna',
    when: '2026-04-20',
  },
];

// ── buildJiraCSV — structure ──────────────────────────────────────────────────

describe('buildJiraCSV — structure', () => {
  it('returns null for empty actions array', () => {
    expect(buildJiraCSV([])).toBeNull();
    expect(buildJiraCSV(null)).toBeNull();
  });

  it('returns a string starting with data:text/csv URI prefix', () => {
    const result = buildJiraCSV(sampleActions, 'Team A', '04.04.2026');
    expect(result).toMatch(/^data:text\/csv;charset=utf-8,/);
  });

  it('BDD-S3: contains exactly 4 rows (1 header + 3 items) for 3 actions', () => {
    const result = buildJiraCSV(sampleActions, 'Team A', '04.04.2026');
    // Strip the data URI prefix and BOM before counting rows
    const csv = decodeURIComponent(result.replace('data:text/csv;charset=utf-8,', ''))
      .replace(/^\uFEFF/, '');
    const rows = csv.split('\n');
    expect(rows).toHaveLength(4); // 1 header + 3 data rows
  });

  it('first row is the Jira/ClickUp column headers', () => {
    const result = buildJiraCSV(sampleActions, 'Team A', '04.04.2026');
    const csv = decodeURIComponent(result.replace('data:text/csv;charset=utf-8,', ''))
      .replace(/^\uFEFF/, '');
    const header = csv.split('\n')[0];
    expect(header).toBe('Summary,Description,Issue Type,Priority,Labels');
  });

  it('Issue Type is hardcoded to "Story"', () => {
    const result = buildJiraCSV([sampleActions[0]], 'Team A', '04.04.2026');
    expect(result).toContain('"Story"');
  });

  it('Priority is hardcoded to "Medium"', () => {
    const result = buildJiraCSV([sampleActions[0]], 'Team A', '04.04.2026');
    expect(result).toContain('"Medium"');
  });

  it('Labels is hardcoded to "retro-lite"', () => {
    const result = buildJiraCSV([sampleActions[0]], 'Team A', '04.04.2026');
    expect(result).toContain('"retro-lite"');
  });
});

// ── buildJiraCSV — Summary column (comma escaping) ───────────────────────────

describe('buildJiraCSV — RFC-4180 comma escaping', () => {
  it('TDD: a Massnahme with a comma is quoted so it stays as one CSV cell', () => {
    const result = buildJiraCSV(
      [{ id: 'x', what: 'Review, refactor, and merge', sourceAnchorText: 'x' }],
      'Team A', '04.04.2026'
    );
    const csv = decodeURIComponent(result.replace('data:text/csv;charset=utf-8,', ''))
      .replace(/^\uFEFF/, '');
    const dataRow = csv.split('\n')[1];
    // Summary cell must be double-quoted (so the commas inside are not column separators)
    expect(dataRow).toMatch(/^"Review, refactor, and merge",/);
  });

  it('TDD: internal double-quotes in Summary are escaped as ""', () => {
    const result = buildJiraCSV(
      [{ id: 'x', what: 'She said "fix it now"', sourceAnchorText: 'x' }],
      'Team A', '04.04.2026'
    );
    const csv = decodeURIComponent(result.replace('data:text/csv;charset=utf-8,', ''))
      .replace(/^\uFEFF/, '');
    const dataRow = csv.split('\n')[1];
    // Internal quotes must be doubled: "She said ""fix it now"""
    expect(dataRow).toMatch(/^"She said ""fix it now""/);
  });
});

// ── buildJiraCSV — Description column ────────────────────────────────────────

describe('buildJiraCSV — Description field', () => {
  it('Description includes the retro date', () => {
    const result = buildJiraCSV([sampleActions[0]], 'Team A', '04.04.2026');
    expect(result).toContain('04.04.2026');
  });

  it('Description includes the session/team name', () => {
    const result = buildJiraCSV([sampleActions[0]], 'Scrum Team Alpha', '04.04.2026');
    expect(result).toContain('Scrum Team Alpha');
  });

  it('Description includes "Retro-Lite" attribution', () => {
    const result = buildJiraCSV([sampleActions[0]], 'Team A', '04.04.2026');
    expect(result).toContain('Retro-Lite');
  });

  it('Description includes the source anchor text (context trail)', () => {
    const result = buildJiraCSV([sampleActions[0]], 'Team A', '04.04.2026');
    expect(result).toContain('Slow API responses in Phase 2');
  });

  it('uses fallback "Retro-Lite" when sessionName is not provided', () => {
    const result = buildJiraCSV([sampleActions[0]]);
    expect(result).toContain('Retro-Lite');
  });

  it('uses what field; falls back to originalWhat if what is missing', () => {
    const action = { id: 'y', originalWhat: 'Fallback text', sourceAnchorText: 'x' };
    const result = buildJiraCSV([action], 'Team A', '04.04.2026');
    expect(result).toContain('Fallback text');
  });
});
