/**
 * logic.js - Pure business logic for Retro-Lite
 * Includes extracted pure helpers: buildActionItem, buildCSVContent, buildNavigationHistoryUpdate
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

/**
 * buildActionItem - Constructs a structured action item from a Phase 3 entry.
 * Extracted from App.jsx handleSaveActionItem so it can be unit-tested without React.
 *
 * @param {object} entry      - The winning Phase 3 entry being promoted
 * @param {Array}  drillPath  - The current drill path from session state
 * @param {Array}  allEntries - All session entries (needed for root category lookup)
 * @returns {object} A structured action item ready for sessionActionItems
 */
export function buildActionItem(entry, drillPath, allEntries) {
  if (!entry) return null;
  const sourceAnchorText = drillPath?.[0]?.parentText || 'Unbekannt';
  const rootCatId = findRootCategory(entry, allEntries) || CATEGORIES[0].id;
  return {
    id: entry.id,
    originalWhat: entry.text,
    what: entry.text,
    who: 'To be assigned',
    when: 'TBD',
    sourceAnchorText,
    categoryId: rootCatId,
  };
}

/**
 * buildCSVContent - Pure function to generate a CSV data-URI string from action items.
 * Extracted from useRetroStore.exportActionsToCSV.
 * Uses ?? '' (not || '') so null/undefined don't become the string "null".
 *
 * @param {Array} actions - sessionActionItems array
 * @returns {string|null} CSV data-URI string, or null if actions is empty
 */
export function buildCSVContent(actions) {
  if (!actions || actions.length === 0) return null;
  const rows = [
    ['Origin', 'Action', 'Assignee', 'Due Date'],
    ...actions.map(a => [
      `"${String(a.sourceAnchorText ?? '').replace(/"/g, '""')}"`,
      `"${String(a.what            ?? '').replace(/"/g, '""')}"`,
      `"${String(a.who             ?? '').replace(/"/g, '""')}"`,
      `"${String(a.when            ?? '').replace(/"/g, '""')}"`,
    ])
  ];
  return 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
}

/**
 * buildNavigationHistoryUpdate - Determines the new navigationHistory for setDrillPhase.
 * Returns the updated history array if a new entry should be added, or null if not.
 *
 * @param {Array}  currentHistory - The existing navigationHistory from session state
 * @param {string} newFocusId    - The focusId being drilled into
 * @param {Array}  newPath       - The new drillPath
 * @returns {Array|null} Updated history array, or null if no update is needed
 */
export function buildNavigationHistoryUpdate(currentHistory, newFocusId, newPath) {
  if (!newFocusId || !newPath || newPath.length === 0) return null;
  const lastStep = newPath[newPath.length - 1];
  const historyEntry = {
    id:        lastStep.parentId,
    text:      lastStep.parentText,
    phase:     lastStep.phase,
    drillPath: newPath,
  };
  return updateHistory(currentHistory, historyEntry);
}

/**
 * formatDate - Converts a Firestore Timestamp, JS Date, or ISO string
 * to a human-readable "DD.MM.YYYY" string.
 * Returns '' for null/undefined inputs.
 *
 * @param {object|Date|string|null} timestamp
 * @returns {string}
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  let date;
  if (typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  if (isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
