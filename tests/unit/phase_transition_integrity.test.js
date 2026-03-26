/**
 * tests/unit/phase_transition_integrity.test.js
 * 
 * Verifies that saveActionItemAndReset definitively awaits the Firestore 
 * write for the new action item BEFORE resetting the local state (currentPhase, drillPath)
 * to prevent UI race conditions where the view jumps to Phase 1 before the item is saved.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRetroStore } from '../../src/useRetroStore';

// ── Mock Firebase ────────────────────────────────────────────────────────────
vi.mock('firebase/app', () => ({ initializeApp: vi.fn() }));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ signOut: vi.fn() })),
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'anon' } }),
  onAuthStateChanged: vi.fn((auth, cb) => {
    // Admin user mock
    cb({ uid: 'test-admin', email: 'stephan.asemota@gmail.com', isAnonymous: false });
    return vi.fn();
  }),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithCustomToken: vi.fn(),
}));

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    doc: vi.fn((db, ...path) => path.join('/')),
    collection: vi.fn((db, ...path) => path.join('/')),
    setDoc: vi.fn().mockResolvedValue(),
    getDoc: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin' }) }),
    updateDoc: vi.fn().mockResolvedValue(),
    addDoc: vi.fn().mockResolvedValue(),
    deleteDoc: vi.fn().mockResolvedValue(),
    getDocs: vi.fn().mockResolvedValue({ docs: [] }),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn((ref, onNext) => {
      if (ref.includes('entries')) {
        onNext({ docs: [{ id: 'e1', data: () => ({ text: 'entry1', category: 'liked' }) }] });
      } else {
        onNext({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin', currentPhase: 3, drillPath: [] }) });
      }
      return vi.fn(); // unsub
    }),
    serverTimestamp: vi.fn(() => 'ts'),
    increment: vi.fn(),
    arrayUnion: vi.fn(val => val), // mock array union to just return the value so we can assert on it
    arrayRemove: vi.fn(),
  };
});

describe('Phase Transition Integrity: saveActionItemAndReset', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: { search: '' }, writable: true });
    vi.clearAllMocks();
  });

  it('awaits the action item write before transitioning to Phase 1', async () => {
    const { updateDoc } = await import('firebase/firestore');
    
    const { result } = renderHook(() => useRetroStore());
    
    // Wait for auth & store to initialize
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    // Join a session to become host
    await act(async () => { await result.current.joinSession('123'); });

    const testItem = { id: 'a1', what: 'Test Maßnahme' };

    await act(async () => {
      await result.current.saveActionItemAndReset(testItem);
    });

    // We expect exactly 2 sequential updateDoc calls
    expect(updateDoc).toHaveBeenCalledTimes(2);

    // Call 1: Write the action item
    expect(updateDoc.mock.calls[0][1]).toEqual({
      sessionActionItems: testItem
    });

    // Call 2: Reset the state
    expect(updateDoc.mock.calls[1][1]).toEqual({
      currentPhase: 1,
      focusId: null,
      drillPath: []
    });
  });
});
