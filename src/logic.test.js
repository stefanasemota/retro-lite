import { describe, it, expect } from 'vitest';
import { getCategoryWinners, findRootCategory } from './logic';

describe('getCategoryWinners', () => {
  it('returns an empty object for empty entries', () => {
    expect(getCategoryWinners([])).toEqual({});
    expect(getCategoryWinners(null)).toEqual({});
  });

  it('selects the entry with most votes in each category', () => {
    const entries = [
      { id: '1', category: 'liked', votes: 2, timestamp: { seconds: 100 } },
      { id: '2', category: 'liked', votes: 5, timestamp: { seconds: 110 } },
      { id: '3', category: 'lacked', votes: 3, timestamp: { seconds: 120 } },
    ];
    const winners = getCategoryWinners(entries);
    expect(winners['liked'].id).toBe('2');
    expect(winners['lacked'].id).toBe('3');
  });

  it('breaks ties using timestamp (FIFO)', () => {
    const entries = [
      { id: '1', category: 'liked', votes: 5, timestamp: { seconds: 100 } },
      { id: '2', category: 'liked', votes: 5, timestamp: { seconds: 90 } }, // Older wins
    ];
    const winners = getCategoryWinners(entries);
    expect(winners['liked'].id).toBe('2');
  });

  it('ignores entries with zero votes', () => {
    const entries = [
      { id: '1', category: 'liked', votes: 0, timestamp: { seconds: 100 } },
    ];
    const winners = getCategoryWinners(entries);
    expect(winners['liked']).toBeUndefined();
  });

  it('handles multiple categories correctly', () => {
    const entries = [
      { id: 'cat1_v1', category: 'cat1', votes: 1, timestamp: { seconds: 10 } },
      { id: 'cat1_v2', category: 'cat1', votes: 2, timestamp: { seconds: 20 } },
      { id: 'cat2_v1', category: 'cat2', votes: 5, timestamp: { seconds: 30 } },
      { id: 'cat2_v2', category: 'cat2', votes: 5, timestamp: { seconds: 25 } }, // Winner for cat2 (FIFO)
    ];
    const winners = getCategoryWinners(entries);
    expect(winners['cat1'].id).toBe('cat1_v2');
    expect(winners['cat2'].id).toBe('cat2_v2');
  });
});

describe('findRootCategory', () => {
  it('finds the correct Phase 1 category by tracing back parents', () => {
    const allEntries = [
      { id: '1', category: 'liked', parentId: null },
      { id: '2', category: 'lacked', parentId: null },
      { id: '1-1', category: null, parentId: '1' },
      { id: '1-1-1', category: null, parentId: '1-1' },
    ];
    expect(findRootCategory(allEntries.find(e => e.id === '1-1-1'), allEntries)).toBe('liked');
  });

  it('returns null if entry is null', () => {
    expect(findRootCategory(null, [])).toBeNull();
  });

  it('returns own category if it is a root entry', () => {
    const entry = { id: '1', category: 'learned', parentId: null };
    expect(findRootCategory(entry, [entry])).toBe('learned');
  });
});
