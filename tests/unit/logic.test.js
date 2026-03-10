import { describe, it, expect } from 'vitest';
import { getWinner, filterEntries } from '../../src/components';

describe('Retro Logic Audit', () => {
  
  describe('getWinner', () => {
    it('should return null for empty entries', () => {
      expect(getWinner([])).toBeNull();
    });

    it('should return null if no entry has votes > 0', () => {
      const entries = [
        { id: '1', votes: 0, timestamp: { seconds: 100 } },
        { id: '2', votes: 0, timestamp: { seconds: 200 } },
      ];
      expect(getWinner(entries)).toBeNull();
    });

    it('should identify the clear winner by highest votes', () => {
      const entries = [
        { id: '1', votes: 5, timestamp: { seconds: 100 } },
        { id: '2', votes: 10, timestamp: { seconds: 200 } },
        { id: '3', votes: 2, timestamp: { seconds: 300 } },
      ];
      expect(getWinner(entries).id).toBe('2');
    });

    it('should break ties using timestamp (older wins/stable FIFO)', () => {
      const entries = [
        { id: 'new', votes: 10, timestamp: { seconds: 500 } },
        { id: 'old', votes: 10, timestamp: { seconds: 100 } }, // Older timestamp
        { id: 'mid', votes: 10, timestamp: { seconds: 300 } },
      ];
      const winner = getWinner(entries);
      expect(winner.id).toBe('old');
    });
  });

  describe('filterEntries', () => {
    const mockEntries = [
      { id: 'e1', parentId: null, text: 'Root 1' },
      { id: 'e2', parentId: null, text: 'Root 2' },
      { id: 'e3', parentId: 'e2', text: 'Child of 2' },
      { id: 'e4', parentId: 'e3', text: 'Grandchild of 2' },
    ];

    it('should filter root entries when focusId is null', () => {
      const filtered = filterEntries(mockEntries, null);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.parentId === null)).toBe(true);
    });

    it('should filter child entries correctly based on focusId', () => {
      const filtered = filterEntries(mockEntries, 'e2');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('e3');
    });

    it('should return empty array if no children match focusId', () => {
      const filtered = filterEntries(mockEntries, 'non-existent');
      expect(filtered).toHaveLength(0);
    });
  });

});
