/**
 * export_logic.test.jsx
 * Verifies that the PNG export button renders and calls html2canvas when clicked.
 *
 * NOTE: vi.mock is hoisted — all vi.fn() calls must be INSIDE the factory,
 * not referencing any module-level variables declared before the factory.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// --- Mock html2canvas INLINE — no external variable references ---
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn(() => 'data:image/png;base64,ABC'),
  }),
}));

// --- Mock useRetroStore ---
vi.mock('./useRetroStore', () => ({
  useRetroStore: vi.fn(() => ({
    loading:      false,
    view:         'session',
    currentPhase: 4,
    session: {
      sessionId: '123',
      sessionActionItems: [
        { id: 'a1', originalWhat: 'Fix CI', what: 'Fix CI pipeline', who: 'Alice', when: '2026-04-01', done: false, sourceAnchorText: 'Speed', categoryId: 'liked' },
      ],
    },
    displayEntries:     [],
    allEntries:         [],
    drillPath:          [],
    user:               { uid: 'host', email: 'stephan.asemota@gmail.com', isAnonymous: false },
    isHost:             true,
    error:              null,
    sessionId:          '123',
    history:            [],
    updateActionItem:   vi.fn(),
    exportActionsToCSV: vi.fn(),
    completeRetro:      vi.fn(),
    clearError:         vi.fn(),
    toggleBlur:         vi.fn(),
    leaveSession:       vi.fn(),
    fetchRetroHistory:  vi.fn(),
    deleteSession:      vi.fn(),
    viewSession:        vi.fn(),
  })),
}));

import App from './App';

describe('GenesisTable PNG Export', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the Export as PNG button in Phase 4', async () => {
    render(<App />);
    expect(screen.getByTitle('Export Matrix as PNG')).toBeTruthy();
  });

  it('calls html2canvas with the matrix DOM element when Export as PNG is clicked', async () => {
    const { default: html2canvas } = await import('html2canvas');
    render(<App />);
    const btn = screen.getByTitle('Export Matrix as PNG');
    await act(async () => { fireEvent.click(btn); });
    expect(html2canvas).toHaveBeenCalledTimes(1);
    expect(html2canvas.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });
});
