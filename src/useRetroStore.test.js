import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRetroStore } from './useRetroStore';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'anon' } }),
  onAuthStateChanged: vi.fn((auth, cb) => {
    // Immediate callback for user state
    cb({ uid: 'test-admin', email: 'stephan.admin@lst.de', isAnonymous: false });
    return vi.fn(); // unsubscribe
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
    onSnapshot: vi.fn((ref, onNext) => {
      if (ref.includes('entries')) {
        onNext({ docs: [{ id: 'e1', data: () => ({ text: 'entry1', category: 'liked' }) }] });
      } else {
        onNext({ exists: () => true, data: () => ({ id: '123', hostId: 'test-admin', currentPhase: 1, drillPath: [] }) });
      }
      return vi.fn(); // unsub
    }),
    serverTimestamp: vi.fn(() => 'timestamp'),
    increment: vi.fn(val => val),
    arrayUnion: vi.fn(val => val),
    arrayRemove: vi.fn(val => val),
  };
});

describe('useRetroStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate non-testMode
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true
    });
  });

  it('initializes and loads user', async () => {
    const { result } = renderHook(() => useRetroStore());
    
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({
      uid: 'test-admin', 
      email: 'stephan.admin@lst.de', 
      isAnonymous: false
    });
  });

  it('creates a session', async () => {
    const { result } = renderHook(() => useRetroStore());
    
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createSession('Test Session');
    });

    expect(result.current.sessionId).toBeTruthy();
    expect(result.current.view).toBe('session');
    expect(result.current.error).toBeNull();
  });

  it('joins a session', async () => {
    const { result } = renderHook(() => useRetroStore());
    
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.joinSession('123');
    });

    expect(result.current.sessionId).toBe('123');
    expect(result.current.view).toBe('session');
  });

  it('adds an entry to the session', async () => {
    const { result } = renderHook(() => useRetroStore());
    
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.joinSession('123');
    });

    await act(async () => {
      await result.current.addEntry('My Text', 'liked');
    });
    
    expect(result.current.error).toBeNull();
  });

  it('switches manual phase correctly when host', async () => {
    const { result } = renderHook(() => useRetroStore());
    
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    
    await act(async () => {
      await result.current.joinSession('123');
    });

    await act(async () => {
      await result.current.setManualPhase(2);
    });
    // updateDoc should be called. State updates through mocked event channel
    expect(result.current.error).toBeNull();
  });
});
