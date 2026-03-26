import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
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
    getCategoryWinners: vi.fn(() => ({ liked: ['e1'] })),
  };
});

describe('App', () => {
  it('renders loading state when store is loaded', () => {
    useRetroStoreModule.useRetroStore.mockReturnValue({ loading: true });
    render(<App />);
    expect(screen.getByText('retro-Lite Engine startet…')).toBeTruthy();
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

  it('renders GenesisTable (not BoardView) when currentPhase is 4', () => {
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false,
      view: 'session',
      currentPhase: 4,
      session: { sessionId: '123', sessionActionItems: [] },
      displayEntries: [],
      allEntries: [],
      drillPath: [],
      user: { uid: 'host', isAnonymous: false },
      isHost: true,
      error: null,
      sessionId: '123',
      updateActionItem: vi.fn(),
      exportActionsToCSV: vi.fn(),
      completeRetro: vi.fn(),
      clearError: vi.fn(),
      toggleBlur: vi.fn(),
      leaveSession: vi.fn(),
    });
    render(<App />);
    // GenesisTable renders the Genesis Evolution Matrix header
    expect(screen.getByText(/Genesis Evolution Matrix/i)).toBeTruthy();
    // BoardView-specific elements should NOT be present
    expect(screen.queryByTestId('entry-input')).toBeNull();
  });

  it('renders GenesisTable when view is "summary"', () => {
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false,
      view: 'summary',
      currentPhase: 4,
      session: { sessionId: '123', sessionActionItems: [] },
      displayEntries: [],
      allEntries: [],
      drillPath: [],
      user: { uid: 'host', isAnonymous: false },
      isHost: true,
      error: null,
      sessionId: '123',
      updateActionItem: vi.fn(),
      exportActionsToCSV: vi.fn(),
      completeRetro: vi.fn(),
      clearError: vi.fn(),
      toggleBlur: vi.fn(),
      leaveSession: vi.fn(),
    });
    render(<App />);
    expect(screen.getByText(/Genesis Evolution Matrix/i)).toBeTruthy();
  });

  it('handleCreateSession finally block: isCreating resets to false after a failed session creation', async () => {
    const createSession = vi.fn().mockRejectedValue(new Error('Session create failed'));
    const clearError = vi.fn();
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false,
      view: 'landing',
      session: null,
      user: { uid: 'u1', isAnonymous: false },
      drillPath: [],
      createSession,
      clearError,
      error: null,
    });
    render(<App />);

    // Open the session name modal
    fireEvent.click(screen.getByTestId('host-session-button'));
    fireEvent.change(screen.getByTestId('session-name-input'), { target: { value: 'Failing Session' } });

    // Click create — this will reject
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-create-session'));
    });

    // The create button should no longer say "Erstelle Session…" (isCreating reset to false)
    // It should be disabled since sessionName might be cleared or error ui appears
    expect(createSession).toHaveBeenCalledWith('Failing Session');
    // After the finally block, the button should not be stuck in "creating" state
    expect(screen.queryByText('Erstelle Session…')).toBeNull();
  });
});
