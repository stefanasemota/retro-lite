import { describe, it, expect } from 'vitest';
import { getWinner, updateHistory, calculateCurrentPhase } from '../../src/logic';

describe('Retro-Lite Logic - Unit Tests', () => {

  describe('getWinner', () => {
    it('should return null if entries is empty', () => {
      expect(getWinner([])).toBeNull();
    });

    it('should return the entry with the most votes', () => {
      const entries = [
        { id: '1', votes: 2, timestamp: { seconds: 100 } },
        { id: '2', votes: 5, timestamp: { seconds: 101 } },
        { id: '3', votes: 3, timestamp: { seconds: 102 } }
      ];
      expect(getWinner(entries).id).toBe('2');
    });

    it('should use FIFO (older timestamp) as a tie-breaker', () => {
      const entries = [
        { id: 'old', votes: 5, timestamp: { seconds: 1000 } },
        { id: 'new', votes: 5, timestamp: { seconds: 2000 } }
      ];
      expect(getWinner(entries).id).toBe('old');
    });

    it('should return null if no entry has votes > 0', () => {
      const entries = [
        { id: '1', votes: 0, timestamp: { seconds: 100 } }
      ];
      expect(getWinner(entries)).toBeNull();
    });
  });

  describe('updateHistory', () => {
    it('should add a new item to history', () => {
      const history = [{ id: '1', text: 'Prev' }];
      const next = { id: '2', text: 'Next' };
      const updated = updateHistory(history, next);
      expect(updated).toHaveLength(2);
      expect(updated[1].id).toBe('2');
    });

    it('should not add duplicate IDs to history', () => {
      const history = [{ id: '1', text: 'Existing' }];
      const next = { id: '1', text: 'Duplicate' };
      const updated = updateHistory(history, next);
      expect(updated).toHaveLength(1);
    });

    it('should return current history if next item is invalid', () => {
      const history = [{ id: '1' }];
      expect(updateHistory(history, null)).toEqual(history);
      expect(updateHistory(history, {})).toEqual(history);
    });
  });

  describe('calculateCurrentPhase', () => {
    it('should return Phase 1 for empty path', () => {
      expect(calculateCurrentPhase([])).toBe(1);
    });

    it('should return Phase 2 for 1 item in path', () => {
      expect(calculateCurrentPhase([{ id: 'x' }])).toBe(2);
    });

    it('should return Phase 3 for 2 items in path', () => {
      expect(calculateCurrentPhase([{ id: 'x' }, { id: 'y' }])).toBe(3);
    });

    it('should return Phase 4 for 3 or more items', () => {
      expect(calculateCurrentPhase([{ id: '1' }, { id: '2' }, { id: '3' }])).toBe(4);
      expect(calculateCurrentPhase([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }])).toBe(4);
    });

    it('should return 1 for null input', () => {
      expect(calculateCurrentPhase(null)).toBe(1);
    });
  });

});
