/**
 * timer_store.test.js — Integration tests for the useRetroStore timer actions.
 * Maps to BDD scenarios in tests/features/facilitator_timer.feature.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRetroStore } from '../../src/useRetroStore';

vi.mock('firebase/app',  () => ({ initializeApp: vi.fn() }));

vi.mock('firebase/auth', () => ({
  getAuth:            vi.fn(() => ({ signOut: vi.fn() })),
  signInAnonymously:  vi.fn().mockResolvedValue({ user: { uid: 'anon' } }),
  signInWithCustomToken: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb({ uid: 'test-admin', email: 'stephan.asemota@gmail.com', isAnonymous: false });
    return vi.fn();
  }),
  signInWithPopup:   vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore:   vi.fn(() => ({})),
  doc:            vi.fn((db, ...path) => path.join('/')),
  collection:     vi.fn((db, ...path) => path.join('/')),
  setDoc:         vi.fn().mockResolvedValue(),
  getDoc:         vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin' }) }),
  updateDoc:      vi.fn().mockResolvedValue(),
  addDoc:         vi.fn().mockResolvedValue(),
  deleteDoc:      vi.fn().mockResolvedValue(),
  getDocs:        vi.fn().mockResolvedValue({ docs: [] }),
  query:          vi.fn((...args) => args.join('|')),
  where:          vi.fn(() => 'where'),
  orderBy:        vi.fn(() => 'orderBy'),
  onSnapshot:     vi.fn((ref, onNext) => {
    if (ref.includes('entries')) onNext({ docs: [] });
    else onNext({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin', currentPhase: 1, drillPath: [], timer: null }) });
    return vi.fn();
  }),
  serverTimestamp: vi.fn(() => 'timestamp'),
  increment:       vi.fn(val => val),
  arrayUnion:      vi.fn(val => val),
  arrayRemove:     vi.fn(val => val),
}));

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// ── Helpers ───────────────────────────────────────────────────────────────────

async function setupStore() {
  Object.defineProperty(window, 'location', { value: { search: '' }, writable: true });
  const { result } = renderHook(() => useRetroStore());
  await vi.waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { await result.current.joinSession('123'); });
  return result;
}

// ── BDD: Scenario 1 — Host starts 5-minute timer ─────────────────────────────

describe('BDD: Host starts the Facilitator Timer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Scenario 1: startTimer writes status:active + correct endTime to Firestore', async () => {
    const { updateDoc } = await import('firebase/firestore');
    const before = Date.now();
    const result = await setupStore();

    await act(async () => { await result.current.startTimer(300); }); // 5 minutes

    const call = updateDoc.mock.calls.find(c => c[1]['timer.status'] === 'active');
    expect(call).toBeDefined();
    const payload = call[1];
    expect(payload['timer.status']).toBe('active');
    expect(payload['timer.duration']).toBe(300);
    // endTime should be ~300 seconds from now (within 2s window for test execution)
    expect(payload['timer.endTime']).toBeGreaterThanOrEqual(before + 299000);
    expect(payload['timer.endTime']).toBeLessThanOrEqual(before + 302000);
  });
});

// ── BDD: Scenario 3 — Host pauses the timer ──────────────────────────────────

describe('BDD: Host pauses the Facilitator Timer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Scenario 3: stopTimer writes status:paused with remaining seconds preserved', async () => {
    const { updateDoc, onSnapshot } = await import('firebase/firestore');

    // Simulate active timer with 180s remaining
    const endTime = Date.now() + 180000;
    onSnapshot.mockImplementation((ref, onNext) => {
      if (ref.includes('entries')) onNext({ docs: [] });
      else onNext({
        exists: () => true,
        data: () => ({
          id: '123', hostId: 'test-admin', currentPhase: 1, drillPath: [],
          timer: { status: 'active', duration: 300, endTime },
        }),
      });
      return vi.fn();
    });

    const result = await setupStore();
    updateDoc.mockClear();

    await act(async () => { await result.current.stopTimer(); });

    const call = updateDoc.mock.calls.find(c => c[1]['timer.status'] === 'paused');
    expect(call).toBeDefined();
    const payload = call[1];
    expect(payload['timer.status']).toBe('paused');
    // remaining should be close to 180s (within 2s execution window)
    expect(payload['timer.duration']).toBeGreaterThanOrEqual(178);
    expect(payload['timer.duration']).toBeLessThanOrEqual(181);
    expect(payload['timer.endTime']).toBeNull();
  });
});

// ── BDD: Scenario 4 — Host resets the timer ──────────────────────────────────

describe('BDD: Host resets the Facilitator Timer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Scenario 4: resetTimer writes status:reset + nullifies endTime', async () => {
    const { updateDoc } = await import('firebase/firestore');
    const result = await setupStore();
    updateDoc.mockClear();

    await act(async () => { await result.current.resetTimer(300); });

    const call = updateDoc.mock.calls.find(c => c[1]['timer.status'] === 'reset');
    expect(call).toBeDefined();
    const payload = call[1];
    expect(payload['timer.status']).toBe('reset');
    expect(payload['timer.duration']).toBe(300);
    expect(payload['timer.endTime']).toBeNull();
  });
});

// ── BDD: Scenario 5 — Non-host guard ─────────────────────────────────────────

describe('BDD: Participant cannot control the timer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Scenario 5: startTimer/stopTimer/resetTimer no-op when isHost=false', async () => {
    const { onAuthStateChanged } = await import('firebase/auth');
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: 'participant', email: 'other@example.com', isAnonymous: false });
      return vi.fn();
    });
    const { updateDoc }  = await import('firebase/firestore');
    updateDoc.mockClear();

    const { result } = renderHook(() => useRetroStore());
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.startTimer(300); });
    await act(async () => { await result.current.stopTimer(); });
    await act(async () => { await result.current.resetTimer(0); });

    expect(updateDoc).not.toHaveBeenCalled();
  });
});
