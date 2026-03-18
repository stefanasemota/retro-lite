import { describe, it, expect } from 'vitest';
import { getCategoryWinners, findRootCategory, filterEntries, getWinner, updateHistory, calculateCurrentPhase, addActionItem } from './logic';

describe('addActionItem', () => {
  it('appends a new item to an existing array, returning a new array instance to preserve list integrity', () => {
    const original = [{ id: '1', what: 'A' }];
    const newItem = { id: '2', what: 'B' };
    const updated = addActionItem(original, newItem);
    
    expect(updated).toHaveLength(2);
    expect(updated[1]).toEqual(newItem);
    expect(original).toHaveLength(1);
    expect(updated).not.toBe(original);
  });
  
  it('returns an array with the new item if items is null or undefined', () => {
    const newItem = { id: '1', what: 'A' };
    expect(addActionItem(null, newItem)).toEqual([newItem]);
    expect(addActionItem(undefined, newItem)).toEqual([newItem]);
  });
});

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

  it('handles entries with undefined votes and timestamps gracefully', () => {
    const entries = [
      { id: 'v1', category: 'liked' }, // undefined votes/timestamp
      { id: 'v2', category: 'liked', votes: 1 }, // undefined timestamp
      { id: 'v3', category: 'liked', votes: 1, timestamp: { seconds: 50 } }, // defined
    ];
    const winners = getCategoryWinners(entries);
    // Since v2 has no timestamp (Infinity), v3 wins the tie breaker (50 < Infinity)
    expect(winners['liked'].id).toBe('v3');
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

  it('falls back to null if no category is found in the chain', () => {
    const allEntries = [
      { id: '1', parentId: null }, // no category
      { id: '1-1', parentId: '1' }
    ];
    expect(findRootCategory(allEntries[1], allEntries)).toBeNull();
  });

  it('returns null if entry is null', () => {
    expect(findRootCategory(null, [])).toBeNull();
  });

  it('returns own category if it is a root entry', () => {
    const entry = { id: '1', category: 'learned', parentId: null };
    expect(findRootCategory(entry, [entry])).toBe('learned');
  });
});

describe('filterEntries', () => {
  it('filters by focusId when focusId is truthy', () => {
    const entries = [
      { id: '1', parentId: null },
      { id: '2', parentId: 'A' },
      { id: '3', parentId: 'B' },
      { id: '4', parentId: 'A' },
    ];
    expect(filterEntries(entries, 'A')).toEqual([
      { id: '2', parentId: 'A' },
      { id: '4', parentId: 'A' },
    ]);
  });

  it('returns entries with no parentId when focusId is falsy', () => {
    const entries = [
      { id: '1', parentId: null },
      { id: '2', parentId: 'A' },
      { id: '3', parentId: undefined },
    ];
    expect(filterEntries(entries, null)).toEqual([
      { id: '1', parentId: null },
      { id: '3', parentId: undefined },
    ]);
  });
});

describe('getWinner', () => {
  it('returns null for empty or null entries', () => {
    expect(getWinner([])).toBeNull();
    expect(getWinner(null)).toBeNull();
  });

  it('returns null if there are no winners (e.g. 0 votes)', () => {
    const entries = [{ id: '1', category: 'liked', votes: 0 }];
    expect(getWinner(entries)).toBeNull();
  });

  it('selects the absolute winner among all categories', () => {
    const entries = [
      { id: '1', category: 'liked', votes: 2, timestamp: { seconds: 100 } },
      { id: '2', category: 'liked', votes: 5, timestamp: { seconds: 110 } },
      { id: '3', category: 'lacked', votes: 10, timestamp: { seconds: 120 } },
    ];
    const winner = getWinner(entries);
    expect(winner.id).toBe('3');
  });

  it('handles entries with undefined votes and timestamps seamlessly', () => {
    const entries = [
      { id: '1', category: 'liked' }, // no votes, no timestamp
      { id: '2', category: 'liked', votes: 1 }, 
    ];
    const winner = getWinner(entries);
    // Should fall back to 0 votes, so 1 vote wins
    expect(winner.id).toBe('2');
  });

  it('breaks ties between different categories using timestamp', () => {
    const entries = [
      { id: '1', category: 'liked', votes: 5, timestamp: { seconds: 120 } },
      { id: '2', category: 'lacked', votes: 5, timestamp: { seconds: 100 } }, // Older wins
    ];
    const winner = getWinner(entries);
    expect(winner.id).toBe('2');
  });
});

describe('updateHistory', () => {
  it('returns currentHistory if nextItem is null or has no id', () => {
    const hist = [{ id: '1' }];
    expect(updateHistory(hist, null)).toEqual(hist);
    expect(updateHistory(hist, { text: 'no id' })).toEqual(hist);
  });

  it('returns empty array if currentHistory is falsy and nextItem is invalid', () => {
    expect(updateHistory(null, null)).toEqual([]);
  });

  it('does not add duplicate items based on id', () => {
    const hist = [{ id: '1', text: 'A' }];
    const nextItem = { id: '1', text: 'B', phase: 2 };
    expect(updateHistory(hist, nextItem)).toEqual(hist);
  });

  it('adds new items to the history', () => {
    const hist = [{ id: '1', text: 'A' }];
    const nextItem = { id: '2', text: 'B' };
    expect(updateHistory(hist, nextItem)).toEqual([
      { id: '1', text: 'A' },
      { id: '2', text: 'B' }
    ]);
  });
});

describe('calculateCurrentPhase', () => {
  it('returns 1 if drillPath is falsy or empty', () => {
    expect(calculateCurrentPhase(null)).toBe(1);
    expect(calculateCurrentPhase([])).toBe(1);
  });

  it('returns drillPath.length + 1', () => {
    expect(calculateCurrentPhase([{}])).toBe(2);
    expect(calculateCurrentPhase([{}, {}])).toBe(3);
  });

  it('caps at phase 4', () => {
    expect(calculateCurrentPhase([{}, {}, {}])).toBe(4);
    expect(calculateCurrentPhase([{}, {}, {}, {}])).toBe(4); // Even if longer
  });
});
