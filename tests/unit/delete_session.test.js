/**
 * tests/unit/delete_session.test.js
 * TDD: verifies toast.success is called on successful delete and
 * toast.error is called when Firestore rejects.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRetroStore } from '../../src/useRetroStore';

// ── Mock react-toastify ───────────────────────────────────────────────────────
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error:   vi.fn(),
  },
}));

vi.mock('firebase/app', () => ({ initializeApp: vi.fn() }));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ signOut: vi.fn() })),
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'anon' } }),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb({ uid: 'test-admin', email: 'stephan.asemota@gmail.com', isAnonymous: false });
    return vi.fn();
  }),
  signInWithPopup: vi.fn().mockResolvedValue({
    user: { uid: 'test-admin', email: 'stephan.asemota@gmail.com', isAnonymous: false },
  }),
  GoogleAuthProvider: vi.fn(),
  signInWithCustomToken: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore:    vi.fn(() => ({})),
  doc:             vi.fn((db, ...path) => path.join('/')),
  collection:      vi.fn((db, ...path) => path.join('/')),
  setDoc:          vi.fn().mockResolvedValue(),
  getDoc:          vi.fn().mockResolvedValue({ exists: () => true, data: () => ({}) }),
  updateDoc:       vi.fn().mockResolvedValue(),
  addDoc:          vi.fn().mockResolvedValue(),
  deleteDoc:       vi.fn().mockResolvedValue(),
  getDocs:         vi.fn().mockResolvedValue({ docs: [] }),
  query:           vi.fn((...args) => args.join('|')),
  where:           vi.fn(() => 'where'),
  orderBy:         vi.fn(() => 'orderBy'),
  onSnapshot:      vi.fn((ref, onNext) => {
    onNext({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin', currentPhase: 1, drillPath: [] }) });
    return vi.fn();
  }),
  serverTimestamp: vi.fn(() => 'ts'),
  increment:       vi.fn(v => v),
  arrayUnion:      vi.fn(v => v),
  arrayRemove:     vi.fn(v => v),
}));

describe('deleteSession toasts', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: { search: '' }, writable: true });
    vi.clearAllMocks();
  });

  it('calls toast.success when deleteDoc resolves', async () => {
    const { toast } = await import('react-toastify');
    const { deleteDoc, getDocs } = await import('firebase/firestore');
    deleteDoc.mockResolvedValueOnce();
    getDocs.mockResolvedValueOnce({
      docs: [{ id: 'S1', data: () => ({ sessionName: 'Old Sprint', isCompleted: true }) }],
    });

    const { result } = renderHook(() => useRetroStore());
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.fetchRetroHistory(); });
    await act(async () => { await result.current.deleteSession('S1'); });

    expect(toast.success).toHaveBeenCalledWith('Retro-Session erfolgreich gelöscht! 🗑️');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('calls toast.error when deleteDoc rejects', async () => {
    const { toast } = await import('react-toastify');
    const { deleteDoc, getDocs } = await import('firebase/firestore');
    deleteDoc.mockRejectedValueOnce(new Error('Permission denied'));
    getDocs.mockResolvedValueOnce({
      docs: [{ id: 'S2', data: () => ({ sessionName: 'Sprint 2', isCompleted: true }) }],
    });

    const { result } = renderHook(() => useRetroStore());
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.fetchRetroHistory(); });
    await act(async () => { await result.current.deleteSession('S2'); });

    expect(toast.error).toHaveBeenCalledWith('Fehler beim Löschen: Permission denied');
    expect(toast.success).not.toHaveBeenCalled();
  });
});
// ── TC-06: Standalone deleteSession export ─────────────────────────────────────
import { deleteSession as standaloneDeleteSession } from '../../src/useRetroStore';

describe('standalone deleteSession export', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: { search: '' }, writable: true });
    vi.clearAllMocks();
  });

  it('TC-06: calls deleteDoc with a path that contains the session ID', async () => {
    const { deleteDoc, doc } = await import('firebase/firestore');
    deleteDoc.mockResolvedValueOnce();

    await standaloneDeleteSession('TEST01');

    expect(deleteDoc).toHaveBeenCalledTimes(1);
    // doc() is called with (db, ...pathSegments). Verify the last segment contains TEST01.
    const docCallArgs = doc.mock.calls.at(-1).slice(1); // drop the db arg
    expect(docCallArgs.join('/')).toContain('TEST01');
  });
});
