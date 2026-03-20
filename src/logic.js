/**
 * logic.js - Pure business logic for Retro-Lite
 */

export const CATEGORIES = [
  { id: 'liked',   label: 'Liked',      icon: '😊', color: 'bg-green-100 border-green-200 text-green-800'   },
  { id: 'learned', label: 'Learned',    icon: '💡', color: 'bg-blue-100 border-blue-200 text-blue-800'      },
  { id: 'lacked',  label: 'Lacked',     icon: '📉', color: 'bg-orange-100 border-orange-200 text-orange-800' },
  { id: 'longed',  label: 'Longed For', icon: '🔭', color: 'bg-purple-100 border-purple-200 text-purple-800' },
];

export const PHASE_CONFIG = {
  1: { id: 1, label: '4L Übersicht',     icon: '🗂️', nextPhase: 2, nextLabel: 'Ursachenforschung starten', nextIcon: 'Search',      bg: 'bg-slate-50',   headerBg: 'bg-white/80',       pill: 'bg-slate-200 text-slate-600' },
  2: { id: 2, label: 'Ursachenforschung', icon: '🔍', nextPhase: 3, nextLabel: 'Lösung finden',             nextIcon: 'Lightbulb',    bg: 'bg-indigo-50',  headerBg: 'bg-indigo-50/90',   pill: 'bg-indigo-100 text-indigo-700' },
  3: { id: 3, label: 'Lösungen',          icon: '💡', nextPhase: 4, nextLabel: 'Massnahme festlegen',       nextIcon: 'CheckSquare',  bg: 'bg-violet-50',  headerBg: 'bg-violet-50/90',   pill: 'bg-violet-100 text-violet-700' },
  4: { id: 4, label: 'Massnahmen',        icon: '✅', nextPhase: null, nextLabel: 'Zusammenfassung',         nextIcon: 'ClipboardList', bg: 'bg-emerald-50', headerBg: 'bg-emerald-50/90', pill: 'bg-emerald-100 text-emerald-700' },
};

/**
 * filterEntries - Pure function to filter entries based on parentId.
 */
export function filterEntries(allEntries, focusId) {
  return allEntries.filter(e => {
    if (!focusId) return !e.parentId;
    return e.parentId === focusId;
  });
}

/**
 * getWinner - Identifies the winning card based on votes and timestamp (FIFO).
 * This is now a convenience wrapper around getCategoryWinners for a single set of entries.
 */
export function getWinner(entries) {
  if (!entries || !entries.length) return null;
  
  const withVotes = entries.filter(e => (e.votes ?? 0) > 0);
  if (withVotes.length === 0) return null;
  
  // Sort all entries to find the ultimate one (max votes, then FIFO)
  return withVotes.sort((a, b) => {
    const voteDiff = (b.votes ?? 0) - (a.votes ?? 0);
    if (voteDiff !== 0) return voteDiff;
    const timeA = a.timestamp?.seconds ?? Infinity;
    const timeB = b.timestamp?.seconds ?? Infinity;
    return timeA - timeB;
  })[0];
}

/**
 * getCategoryWinners - Finds the winner for EACH category (Liked, Learned, etc.)
 * Returns a map of categoryId -> winningEntry
 */
export function getCategoryWinners(entries) {
  if (!entries || !entries.length) return {};
  
  const winnersMap = {};
  const categories = [...new Set(entries.map(e => e.category))];
  
  categories.forEach(catId => {
    const catEntries = entries.filter(e => e.category === catId && (e.votes ?? 0) > 0);
    if (catEntries.length === 0) return;
    
    // Find highest vote count
    const maxVotes = Math.max(...catEntries.map(e => e.votes ?? 0));
    
    // The instruction required an array of all IDs that have maxVotes
    winnersMap[catId] = catEntries.filter(e => (e.votes ?? 0) === maxVotes).map(e => e.id);
  });
  
  return winnersMap;
}

/**
 * updateHistory - Adds a new entry to the navigation history, avoiding duplicates.
 */
export function updateHistory(currentHistory, nextItem) {
  if (!nextItem || !nextItem.id) return currentHistory || [];
  const exists = (currentHistory || []).some(h => h.id === nextItem.id);
  if (exists) return currentHistory;
  return [...(currentHistory || []), nextItem];
}

/**
 * calculateCurrentPhase - Determines the phase (1-4) based on the drill path depth.
 */
export function calculateCurrentPhase(drillPath) {
  if (!drillPath) return 1;
  return Math.min(4, drillPath.length + 1);
}

/**
 * findRootCategory - Finds the Phase 1 category for an entry by tracing its parents.
 */
export function findRootCategory(entry, allEntries) {
  if (!entry) return null;
  let current = entry;
  while (current && current.parentId) {
    current = allEntries.find(e => e.id === current.parentId);
  }
  return current?.category || null;
}

/**
 * addActionItem - Pure function to append a new action item to a list, preserving integrity.
 */
export function addActionItem(items, newItem) {
  if (!items) return [newItem];
  return [...items, newItem];
}
