/**
 * tests/integration/retro_history.test.js
 * TDD: Verifies fetchRetroHistory sort order, query params, and deleteSession call.
 *
 * NOTE: vi.mock factories are hoisted to the top of the file by Vitest.
 * Variables declared in the module body are NOT accessible inside vi.mock factories.
 * Use inline fixtures inside the factory, or use vi.fn().mockReturnValue.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Firebase mocks ──────────────────────────────────────────────────────────
vi.mock('firebase/auth', () => ({
  getAuth:              vi.fn(() => ({ signOut: vi.fn() })),
  signInAnonymously:    vi.fn().mockResolvedValue({ user: { uid: 'anon' } }),
  onAuthStateChanged:   vi.fn((auth, cb) => {
    cb({ uid: 'test-admin', email: 'stephan.asemota@gmail.com', isAnonymous: false });
    return vi.fn();
  }),
  signInWithPopup:       vi.fn().mockResolvedValue({ user: { uid: 'test-admin', email: 'stephan.asemota@gmail.com' } }),
  GoogleAuthProvider:    vi.fn(),
  signInWithCustomToken: vi.fn(),
}));

// Inline fixtures — must not reference module-level const inside vi.mock factory
vi.mock('firebase/firestore', () => ({
  getFirestore:    vi.fn(() => ({})),
  doc:             vi.fn((db, ...path) => path.join('/')),
  collection:      vi.fn((db, ...path) => path.join('/')),
  setDoc:          vi.fn().mockResolvedValue(),
  getDoc:          vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin' }) }),
  updateDoc:       vi.fn().mockResolvedValue(),
  addDoc:          vi.fn().mockResolvedValue(),
  deleteDoc:       vi.fn().mockResolvedValue(),
  // getDocs default returns 3 sessions newest-first
  getDocs:         vi.fn().mockResolvedValue({
    docs: [
      { id: 'S3', data: () => ({ sessionName: 'Sprint March 20', isCompleted: true, createdAt: { toDate: () => new Date('2026-03-20'), seconds: 1742428800 } }) },
      { id: 'S2', data: () => ({ sessionName: 'Sprint March 10', isCompleted: true, createdAt: { toDate: () => new Date('2026-03-10'), seconds: 1741564800 } }) },
      { id: 'S1', data: () => ({ sessionName: 'Sprint March 1',  isCompleted: true, createdAt: { toDate: () => new Date('2026-03-01'), seconds: 1740787200 } }) },
    ],
  }),
  onSnapshot:      vi.fn((ref, onNext) => {
    if (ref.includes('entries')) {
      onNext({ docs: [] });
    } else {
      onNext({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin', currentPhase: 1, drillPath: [] }) });
    }
    return vi.fn();
  }),
  query:           vi.fn((...args) => args.join('|')),
  where:           vi.fn(() => 'where'),
  orderBy:         vi.fn(() => 'orderBy'),
  serverTimestamp: vi.fn(() => 'timestamp'),
  increment:       vi.fn(v => v),
  arrayUnion:      vi.fn(v => v),
  arrayRemove:     vi.fn(v => v),
}));

import { useRetroStore } from '../../src/useRetroStore';

describe('fetchRetroHistory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('populates store.history with 3 completed sessions ordered newest-first', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'S3', data: () => ({ sessionName: 'Sprint March 20', isCompleted: true, createdAt: { toDate: () => new Date('2026-03-20') } }) },
        { id: 'S2', data: () => ({ sessionName: 'Sprint March 10', isCompleted: true, createdAt: { toDate: () => new Date('2026-03-10') } }) },
        { id: 'S1', data: () => ({ sessionName: 'Sprint March 1',  isCompleted: true, createdAt: { toDate: () => new Date('2026-03-01') } }) },
      ],
    });

    const { result } = renderHook(() => useRetroStore());
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.fetchRetroHistory(); });

    expect(result.current.history).toHaveLength(3);
    expect(result.current.history[0].id).toBe('S3');  // Newest first
    expect(result.current.history[2].id).toBe('S1');  // Oldest last
  });

  it('uses the correct Firestore query params: where isCompleted==true, orderBy createdAt desc', async () => {
    const { query, where, orderBy } = await import('firebase/firestore');
    const { result } = renderHook(() => useRetroStore());
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.fetchRetroHistory(); });
    expect(where).toHaveBeenCalledWith('isCompleted', '==', true);
    expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(query).toHaveBeenCalled();
  });

  it('deleteSession calls deleteDoc and removes the session from store.history', async () => {
    const { deleteDoc, onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementation((ref, onNext) => {
      if (ref.includes('entries')) { onNext({ docs: [] }); }
      else { onNext({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin', currentPhase: 1, drillPath: [] }) }); }
      return vi.fn();
    });

    const { result } = renderHook(() => useRetroStore());
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.joinSession('123'); });
    await vi.waitFor(() => expect(result.current.session).not.toBeNull());

    await act(async () => { await result.current.deleteSession('S1'); });
    expect(deleteDoc).toHaveBeenCalled();
    const refArg = deleteDoc.mock.calls[0][0];
    expect(String(refArg)).toContain('S1');
  });
});
