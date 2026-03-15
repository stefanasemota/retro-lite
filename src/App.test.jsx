import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';
import * as useRetroStoreModule from './useRetroStore';

// Mock the store hook
vi.mock('./useRetroStore', () => ({
  useRetroStore: vi.fn()
}));

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
      drillPath: []
    });
    render(<App />);
    expect(screen.getByText(/Teams befähigen/i)).toBeTruthy();
    expect(screen.getByTestId('join-code-input')).toBeTruthy();
  });

  it('renders session view when in a session', () => {
    useRetroStoreModule.useRetroStore.mockReturnValue({
      loading: false,
      view: 'session',
      currentPhase: 1,
      displayEntries: [],
      drillPath: [],
      session: { sessionId: '123' },
      user: { uid: 'user1' }
    });
    render(<App />);
    expect(screen.queryByTestId('retro-card')).toBeNull(); // Empty state renders Instead
    expect(screen.getByTestId('entry-input')).toBeTruthy();
  });
});
