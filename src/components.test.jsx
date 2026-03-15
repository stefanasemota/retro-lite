import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ContextHeader, GenesisTable } from './components';

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
    render(<GenesisTable allEntries={[]} />);
    
    // Zero total actions
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('renders actions and correctly calculates completion rate', () => {
    const allEntries = [
      { id: 'e1', phase: 3, text: 'Action 1', votes: 1, parentId: 'p1' }, // completed
      { id: 'e2', phase: 3, text: 'Action 2', votes: 0, parentId: 'p1' }, // pending
      { id: 'p1', phase: 1, category: 'liked', text: 'Parent' } // to resolve root category
    ];
    render(<GenesisTable allEntries={allEntries} />);
    
    // Total actions should be 2
    expect(screen.getByText('2')).toBeTruthy();
    
    // 50% completion rate (2 actions, 1 completed)
    expect(screen.getByText('50% of goal')).toBeTruthy();
    
    // Check if the actions are rendered in the table
    expect(screen.getByText('Action 1')).toBeTruthy();
    expect(screen.getByText('Action 2')).toBeTruthy();
  });
});
