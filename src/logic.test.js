import { describe, it, expect } from 'vitest';
import {
  getCategoryWinners, findRootCategory, filterEntries, getWinner,
  updateHistory, calculateCurrentPhase, addActionItem,
  buildActionItem, buildCSVContent, buildNavigationHistoryUpdate,
} from './logic';

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

  it('selects the entries with most votes in each category', () => {
    const entries = [
      { id: '1', category: 'liked', votes: 2, timestamp: { seconds: 100 } },
      { id: '2', category: 'liked', votes: 5, timestamp: { seconds: 110 } },
      { id: '3', category: 'lacked', votes: 3, timestamp: { seconds: 120 } },
    ];
    const winners = getCategoryWinners(entries);
    expect(winners['liked']).toEqual(['2']);
    expect(winners['lacked']).toEqual(['3']);
  });

  it('includes all tied entries in the array', () => {
    const entries = [
      { id: '1', category: 'liked', votes: 5, timestamp: { seconds: 100 } },
      { id: '2', category: 'liked', votes: 5, timestamp: { seconds: 90 } }, // Tie
    ];
    const winners = getCategoryWinners(entries);
    expect(winners['liked']).toEqual(expect.arrayContaining(['1', '2']));
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
      { id: 'cat2_v2', category: 'cat2', votes: 5, timestamp: { seconds: 25 } }, 
    ];
    const winners = getCategoryWinners(entries);
    expect(winners['cat1']).toEqual(['cat1_v2']);
    expect(winners['cat2']).toEqual(expect.arrayContaining(['cat2_v1', 'cat2_v2']));
  });

  it('handles entries with undefined votes and timestamps gracefully', () => {
    const entries = [
      { id: 'v1', category: 'liked' }, // undefined votes/timestamp
      { id: 'v2', category: 'liked', votes: 1 }, // undefined timestamp
      { id: 'v3', category: 'liked', votes: 1, timestamp: { seconds: 50 } }, // defined
    ];
    const winners = getCategoryWinners(entries);
    expect(winners['liked']).toEqual(expect.arrayContaining(['v2', 'v3']));
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

// ── NEW: Extracted pure helper tests ─────────────────────────────────────────

describe('buildActionItem', () => {
  const allEntries = [
    { id: 'root', category: 'lacked', parentId: null },
    { id: 'cause', category: null,    parentId: 'root' },
    { id: 'sol',   category: null,    parentId: 'cause' },
  ];

  it('returns null for a null entry', () => {
    expect(buildActionItem(null, [], [])).toBeNull();
  });

  it('builds a correct action item with root category resolved', () => {
    const entry    = allEntries[2]; // sol, grandchild of root
    const drillPath = [{ parentText: 'Root Topic', parentId: 'root', phase: 1 }];
    const item = buildActionItem(entry, drillPath, allEntries);
    expect(item.id).toBe('sol');
    expect(item.originalWhat).toBe(entry.text);
    expect(item.what).toBe(entry.text);
    expect(item.who).toBe('To be assigned');
    expect(item.when).toBe('TBD');
    expect(item.sourceAnchorText).toBe('Root Topic');
    expect(item.categoryId).toBe('lacked');
  });

  it('falls back to "Unbekannt" when drillPath is empty', () => {
    const item = buildActionItem(allEntries[2], [], allEntries);
    expect(item.sourceAnchorText).toBe('Unbekannt');
  });

  it('falls back to first CATEGORY id when root category cannot be resolved', () => {
    const orphan = { id: 'orphan', text: 'Orphan', parentId: 'no-parent' };
    const item = buildActionItem(orphan, [], [orphan]);
    // findRootCategory returns null for an orphan → fallback to CATEGORIES[0].id
    expect(item.categoryId).toBe('liked');
  });
});

describe('buildCSVContent', () => {
  it('returns null for null input', () => {
    expect(buildCSVContent(null)).toBeNull();
  });

  it('returns null for an empty array', () => {
    expect(buildCSVContent([])).toBeNull();
  });

  it('returns a CSV data-uri with a BOM header row', () => {
    const actions = [{ sourceAnchorText: 'Origin', what: 'Do X', who: 'Alice', when: '2026-04-01' }];
    const csv = buildCSVContent(actions);
    expect(csv).toContain('data:text/csv;charset=utf-8,');
    expect(csv).toContain('Origin,Action,Assignee,Due Date');
    expect(csv).toContain('"Do X"');
    expect(csv).toContain('"Alice"');
  });

  it('does NOT produce the literal string "null" for null field values', () => {
    const actions = [{ sourceAnchorText: null, what: null, who: null, when: null }];
    const csv = buildCSVContent(actions);
    expect(csv).not.toContain('"null"');
    // All fields should be empty strings
    expect(csv).toContain('""');
  });

  it('does NOT produce the literal string "undefined" for undefined field values', () => {
    const actions = [{ sourceAnchorText: undefined, what: undefined, who: undefined, when: undefined }];
    const csv = buildCSVContent(actions);
    expect(csv).not.toContain('"undefined"');
  });
});

describe('buildNavigationHistoryUpdate', () => {
  it('returns null when newFocusId is falsy', () => {
    expect(buildNavigationHistoryUpdate([], null, [{ parentId: 'x', parentText: 'X', phase: 1 }])).toBeNull();
  });

  it('returns null when newPath is empty', () => {
    expect(buildNavigationHistoryUpdate([], 'focusId', [])).toBeNull();
  });

  it('returns the updated history array when drill step is new', () => {
    const currentHistory = [];
    const newPath = [{ parentId: 'root', parentText: 'Root Topic', phase: 1 }];
    const result = buildNavigationHistoryUpdate(currentHistory, 'root', newPath);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('root');
    expect(result[0].text).toBe('Root Topic');
    expect(result[0].phase).toBe(1);
  });
});

// ── formatDate ────────────────────────────────────────────────────────────────
import { formatDate } from './logic';

describe('formatDate', () => {
  it('converts a Firestore-style Timestamp (with toDate()) to DD.MM.YYYY', () => {
    const ts = { toDate: () => new Date('2026-03-20') };
    expect(formatDate(ts)).toBe('20.03.2026');
  });

  it('converts a JS Date object to DD.MM.YYYY', () => {
    expect(formatDate(new Date('2026-01-05'))).toBe('05.01.2026');
  });

  it('converts an ISO date string to DD.MM.YYYY', () => {
    expect(formatDate('2026-12-31')).toBe('31.12.2026');
  });

  it('returns empty string for null/undefined input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});
