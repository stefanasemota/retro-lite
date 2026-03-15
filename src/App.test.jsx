import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import * as useRetroStoreModule from './useRetroStore';

// Mock the store hook
vi.mock('./useRetroStore', () => ({
  useRetroStore: vi.fn()
}));

// Mock logic explicitly for predictable coverage metrics since they interact closely with App loops
vi.mock('./logic', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getWinner: vi.fn(() => ({ id: 'e1' })),
    getCategoryWinners: vi.fn(() => ({ liked: { id: 'e1' } })),
  };
});

describe('App', () => {
  it('renders loading state when store is loaded', () => {
    useRetroStoreModule.useRetroStore.mockReturnValue({ loading: true });
    render(<App />);
    expect(screen.getByText('LST Engine startet…')).toBeTruthy();
  });

  it('renders main landing view when not in a session', () => {
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false,
      view: 'landing',
      session: null,
      user: null,
      drillPath: [],
      loginAdmin: vi.fn(),
      clearError: vi.fn()
    });
    render(<App />);
    expect(screen.getByText(/Teams befähigen/i)).toBeTruthy();
    expect(screen.getByTestId('join-code-input')).toBeTruthy();
  });

  it('triggers create session logic naturally', async () => {
    const createSession = vi.fn().mockResolvedValue();
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false,
      view: 'landing',
      session: null,
      user: { uid: 'u1', isAnonymous: false },
      drillPath: [],
      createSession,
      clearError: vi.fn()
    });
    render(<App />);
    
    // Open modal
    const hostBtn = screen.getByTestId('host-session-button');
    fireEvent.click(hostBtn);

    const input = screen.getByTestId('session-name-input');
    fireEvent.change(input, { target: { value: 'New Sprint Retro' } });

    // Submit via Enter
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });
    expect(createSession).toHaveBeenCalledWith('New Sprint Retro');
  });

  it('adds an entry and drills', () => {
    const addEntry = vi.fn();
    const setDrillPhase = vi.fn();
    
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false,
      view: 'session',
      currentPhase: 1,
      displayEntries: [{ id: 'e1', text: 'Drill Target', category: 'liked' }],
      drillPath: [],
      session: { sessionId: '123' },
      user: { uid: 'user1' },
      isHost: true,
      addEntry,
      setDrillPhase,
      toggleVote: vi.fn(),
      clearError: vi.fn()
    });
    
    render(<App />);
    
    // Add Entry Action
    const input = screen.getByTestId('entry-input');
    fireEvent.change(input, { target: { value: 'Great planning' } });
    const submitBtn = screen.getByTestId('btn-submit-entry');
    fireEvent.click(submitBtn);
    expect(addEntry).toHaveBeenCalledWith('Great planning', 'liked');

    // Drill Action on Phase 1 Item
    const drillBtn = screen.getByTestId('drill-button');
    fireEvent.click(drillBtn);
    expect(setDrillPhase).toHaveBeenCalledWith(2, 'e1', expect.anything());
  });

  it('renders error boundary', () => {
    const clearError = vi.fn();
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false,
      view: 'session',
      error: 'Network Down!',
      displayEntries: [],
      drillPath: [],
      session: { sessionId: '123' },
      user: { uid: 'user1' },
      clearError
    });
    render(<App />);
    expect(screen.getByText(/Network Down!/)).toBeTruthy();
  });
});
