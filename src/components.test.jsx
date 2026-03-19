import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextHeader, GenesisTable, EntryCard, EmptyState, BoardView, ContextSidebar, AdminControlTower } from './components';

describe('ContextHeader', () => {
  it('renders null when in Phase 1 without drillPath and history', () => {
    const { container } = render(<ContextHeader currentPhase={1} drillPath={[]} history={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders root indicator in Phase 1 with history', () => {
    render(<ContextHeader currentPhase={1} drillPath={[]} history={[{ id: 'h1' }]} />);
    expect(screen.getByText('4L Übersicht')).toBeTruthy();
    expect(screen.getByText(/1 Branches aktiv/)).toBeTruthy();
  });

  it('renders drillPath elements correctly', () => {
    const drillPath = [
      { id: '1', phase: 2, parentText: 'First Drill', icon: '🔍' },
      { id: '2', phase: 3, parentText: 'Second Drill', icon: '💡' }
    ];
    render(<ContextHeader currentPhase={3} drillPath={drillPath} history={[]} />);
    expect(screen.getByText('"First Drill"')).toBeTruthy();
    expect(screen.getByText('"Second Drill"')).toBeTruthy();
  });
});

describe('GenesisTable', () => {
  it('renders empty table when no actions', () => {
    render(<GenesisTable session={{ sessionActionItems: [] }} />);
    
    // Zero total actions
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('renders actions and correctly calculates completion rate', () => {
    const session = {
      sessionActionItems: [
        { id: 'e1', what: 'Action 1', who: 'To be assigned', when: 'TBD', sourceAnchorText: 'Origin A', categoryId: 'liked' },
        { id: 'e2', what: 'Action 2', who: 'To be assigned', when: 'TBD', sourceAnchorText: 'Origin B', categoryId: 'learned' }
      ]
    };
    render(<GenesisTable session={session} />);
    
    // Total actions should be 2
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    
    // 100% completion rate (2 actions, all completed by new definition)
    expect(screen.getByText('100% of goal')).toBeTruthy();
    
    // Check if the actions are rendered in the table
    expect(screen.getByText('Action 1')).toBeTruthy();
    expect(screen.getByText('Action 2')).toBeTruthy();
  });
});

describe('EntryCard', () => {
  const mockEntry = { id: 'e1', text: 'My Card', votes: 2, userId: 'u1' };

  it('renders correctly', () => {
    render(<EntryCard entry={mockEntry} currentPhase={1} />);
    expect(screen.getByText('My Card')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('handles vote toggle', () => {
    const toggleVote = vi.fn();
    render(<EntryCard entry={mockEntry} currentPhase={1} toggleVote={toggleVote} />);
    fireEvent.click(screen.getByTestId('btn-vote-My Card'));
    expect(toggleVote).toHaveBeenCalledWith('e1', undefined);
  });

  it('shows drilled indicator', () => {
    render(<EntryCard entry={mockEntry} currentPhase={1} history={[{ id: 'e1' }]} />);
    expect(screen.getByTestId('drilled-pill')).toBeTruthy();
  });

  it('shows drill button when category winner', () => {
    const onDrill = vi.fn();
    render(<EntryCard entry={mockEntry} currentPhase={1} isCategoryWinner={true} onDrill={onDrill} />);
    const drillBtn = screen.getByTestId('drill-button');
    expect(drillBtn).toBeTruthy();
    fireEvent.click(drillBtn);
    expect(onDrill).toHaveBeenCalled();
  });

  it('applies blur if blurred session and not own card', () => {
    render(<EntryCard entry={mockEntry} session={{ isBlurred: true }} user={{ uid: 'u2' }} currentPhase={1} />);
    const card = screen.getByTestId('retro-card');
    expect(card.className).toContain('blur-md');
  });
});

describe('EmptyState', () => {
  it('renders', () => {
    render(<EmptyState />);
    expect(screen.getByText('Noch keine Einträge')).toBeTruthy();
  });
});

describe('BoardView', () => {
  const entries = [
    { id: '1', text: 'Liked Entry', category: 'liked' },
  ];

  it('renders Phase 1 with categories', () => {
    const categoryWinners = { liked: { id: '1' } };
    render(<BoardView currentPhase={1} entries={entries} categoryWinners={categoryWinners} onDrill={vi.fn()} />);
    expect(screen.getByText('Liked Entry')).toBeTruthy();
  });

  it('handles Phase 1 rendering when categoryWinners is fully undefined or missing key', () => {
    // Passes nothing for categoryWinners to cover logic fallback
    render(<BoardView currentPhase={1} entries={entries} onDrill={vi.fn()} categoryWinners={null} />);
    expect(screen.getByText('Liked Entry')).toBeTruthy();
  });

  it('renders Phase 2 flat list', () => {
    const onDrill = vi.fn();
    render(<BoardView currentPhase={2} entries={entries} onDrill={onDrill} />);
    expect(screen.getByText('Liked Entry')).toBeTruthy();
    const btn = screen.getByTestId('drill-button');
    fireEvent.click(btn);
    expect(onDrill).toHaveBeenCalled();
  });
});

describe('ContextSidebar', () => {
  it('renders Phase 1 status', () => {
    render(<ContextSidebar drillPath={[]} currentPhase={1} />);
    expect(screen.getByText('Phase 1')).toBeTruthy();
  });

  it('renders drill path trail', () => {
    const path = [
      { phase: 2, parentText: 'Cause 1' },
      { phase: 3, parentText: 'Solution 1' }
    ];
    render(<ContextSidebar drillPath={path} currentPhase={4} />);
    expect(screen.getByText('Cause 1')).toBeTruthy();
    expect(screen.getByText('Solution 1')).toBeTruthy();
  });
});

describe('AdminControlTower', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = {
      session: { navigationHistory: [{ id: 'h1', text: 'Hist 1', phase: 2 }] },
      currentPhase: 1,
      setManualPhase: vi.fn(),
      jumpToHistory: vi.fn(),
      completeRetro: vi.fn(),
      exportActionsToCSV: vi.fn()
    };
  });

  it('renders and switches phase', () => {
    render(<AdminControlTower store={mockStore} />);
    const phase2Btn = screen.getByText('2', { selector: 'button' });
    fireEvent.click(phase2Btn);
    expect(mockStore.setManualPhase).toHaveBeenCalledWith(2);
  });

  it('renders history and jumps', () => {
    render(<AdminControlTower store={mockStore} />);
    const histBtn = screen.getByText(/"Hist 1"/);
    fireEvent.click(histBtn);
    expect(mockStore.jumpToHistory).toHaveBeenCalledWith(mockStore.session.navigationHistory[0]);
  });

  it('can complete retro in phase 4', () => {
    mockStore.currentPhase = 4;
    render(<AdminControlTower store={mockStore} />);
    const completeBtn = screen.getByText(/Retro abschließen/i);
    fireEvent.click(completeBtn);
    expect(mockStore.completeRetro).toHaveBeenCalled();
  });
});
