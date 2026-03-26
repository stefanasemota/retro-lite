import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import * as useRetroStoreModule from './useRetroStore';

// Mock react-toastify so tests don't depend on its DOM structure
vi.mock('react-toastify', () => ({
  ToastContainer: ({ position }) => (
    <div data-testid="toast-container" data-position={position} className={`Toastify__toast-container--${position.replace('_', '-')}`} />
  ),
  toast: { success: vi.fn(), error: vi.fn() },
}));

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
  it('renders a ToastContainer with position top-center class', () => {
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false, view: 'session', currentPhase: 1,
      session: { sessionId: '123', sessionActionItems: [] },
      displayEntries: [], allEntries: [], drillPath: [],
      user: { uid: 'host', isAnonymous: false }, isHost: true,
      error: null, clearError: vi.fn(), toggleBlur: vi.fn(),
      leaveSession: vi.fn(), history: [], fetchRetroHistory: vi.fn(),
    });
    render(<App />);
    const container = document.querySelector('.Toastify__toast-container--top-center');
    expect(container).not.toBeNull();
  });

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

  it('modal can be opened by host-session-button', () => {
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false, view: 'landing', session: null,
      user: { uid: 'u1', isAnonymous: false }, drillPath: [],
      createSession: vi.fn(), clearError: vi.fn(), error: null,
      history: [], fetchRetroHistory: vi.fn(),
    });
    render(<App />);
    fireEvent.click(screen.getByTestId('host-session-button'));
    // Modal opened — session-name-input is visible
    expect(screen.getByTestId('session-name-input')).toBeTruthy();
    expect(screen.getByTestId('btn-create-session')).toBeTruthy();
  });

  it('triggers completeRetro and exportActionsToCSV when "Retro abschließen" is clicked in Phase 4', () => {
    const completeRetro = vi.fn();
    const exportActionsToCSV = vi.fn();
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false, view: 'session', currentPhase: 4,
      session: { sessionId: '123', sessionActionItems: [] },
      displayEntries: [], allEntries: [], drillPath: [],
      user: { uid: 'host', isAnonymous: false }, isHost: true,
      error: null, sessionId: '123',
      updateActionItem: vi.fn(), exportActionsToCSV, completeRetro,
      clearError: vi.fn(), toggleBlur: vi.fn(), leaveSession: vi.fn(),
      history: [], fetchRetroHistory: vi.fn(), viewSession: vi.fn(),
      deleteSession: vi.fn(),
    });
    render(<App />);
    const btn = screen.getByText('Retro abschließen');
    fireEvent.click(btn);
    expect(exportActionsToCSV).toHaveBeenCalled();
    expect(completeRetro).toHaveBeenCalled();
  });

  it('calls joinSession when GO button is clicked', () => {
    const joinSession = vi.fn();
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false, view: 'landing', session: null,
      user: null, drillPath: [], joinSession,
      loginAdmin: vi.fn(), clearError: vi.fn(), error: null,
    });
    render(<App />);
    const input = screen.getByTestId('join-code-input');
    fireEvent.change(input, { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByTestId('btn-join-session'));
    expect(joinSession).toHaveBeenCalled();
  });

  it('renders the "Zurück zu 4L" button when inDrill=true and isHost', () => {
    const setDrillPhase = vi.fn();
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false, view: 'session', currentPhase: 2,
      session: { sessionId: '123', sessionActionItems: [], navigationHistory: [] },
      displayEntries: [], allEntries: [],
      drillPath: [{ id: 'd1', phase: 2, parentText: 'Something', parentId: 'd1' }],
      user: { uid: 'host', isAnonymous: false }, isHost: true,
      focusId: 'd1', error: null, sessionId: '123',
      toggleVote: vi.fn(), toggleBlur: vi.fn(), setDrillPhase,
      leaveSession: vi.fn(), clearError: vi.fn(),
      exportActionsToCSV: vi.fn(), completeRetro: vi.fn(),
      history: [], fetchRetroHistory: vi.fn(), viewSession: vi.fn(),
      deleteSession: vi.fn(),
    });
    render(<App />);
    const backBtn = screen.getByText('Zurück zu 4L');
    expect(backBtn).toBeTruthy();
    fireEvent.click(backBtn);
    expect(setDrillPhase).toHaveBeenCalledWith(1, null, []);
  });

  it('renders RetroHistoryList with sessions when admin is logged in and history is populated', () => {
    const viewSession = vi.fn();
    const deleteSession = vi.fn();
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false, view: 'landing', session: null,
      user: { uid: 'admin', isAnonymous: false },
      drillPath: [], loginAdmin: vi.fn(), clearError: vi.fn(), error: null,
      history: [
        { id: 'S1', sessionName: 'Sprint March 20', createdAt: { toDate: () => new Date('2026-03-20') } },
        { id: 'S2', sessionName: 'Sprint March 1',  createdAt: { toDate: () => new Date('2026-03-01') } },
      ],
      fetchRetroHistory: vi.fn(), viewSession, deleteSession,
      createSession: vi.fn(),
    });
    render(<App />);
    expect(screen.getByText('Sprint March 20')).toBeTruthy();
    expect(screen.getByText('Sprint March 1')).toBeTruthy();
    // Test View button
    fireEvent.click(screen.getByTestId('view-session-S1'));
    expect(viewSession).toHaveBeenCalledWith('S1');
    // Test Delete triggers confirm modal
    fireEvent.click(screen.getByTestId('delete-session-S2'));
    expect(screen.getByText('Session löschen?')).toBeTruthy();
    // Confirm delete
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    expect(deleteSession).toHaveBeenCalledWith('S2');
  });
});
