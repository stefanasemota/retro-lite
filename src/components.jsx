import React from 'react';
import { ThumbsUp, Trophy, Search, Lightbulb, CheckSquare } from 'lucide-react';

export const CATEGORIES = [
  { id: 'liked',   label: 'Liked',      icon: '😊', color: 'bg-green-100 border-green-200 text-green-800'   },
  { id: 'learned', label: 'Learned',    icon: '💡', color: 'bg-blue-100 border-blue-200 text-blue-800'      },
  { id: 'lacked',  label: 'Lacked',     icon: '📉', color: 'bg-orange-100 border-orange-200 text-orange-800' },
  { id: 'longed',  label: 'Longed For', icon: '🔭', color: 'bg-purple-100 border-purple-200 text-purple-800' },
];

export const PHASES = {
  1: { label: '4L Übersicht',     icon: '🗂️', nextPhase: 2, nextLabel: 'Ursachenforschung starten', nextIcon: <Search className="w-3.5 h-3.5" />,      bg: 'bg-slate-50',   headerBg: 'bg-white/80',       pill: 'bg-slate-200 text-slate-600' },
  2: { label: 'Ursachenforschung', icon: '🔍', nextPhase: 3, nextLabel: 'Lösung finden',             nextIcon: <Lightbulb className="w-3.5 h-3.5" />,    bg: 'bg-indigo-50',  headerBg: 'bg-indigo-50/90',   pill: 'bg-indigo-100 text-indigo-700' },
  3: { label: 'Lösungen',          icon: '💡', nextPhase: 4, nextLabel: 'Massnahme festlegen',       nextIcon: <CheckSquare className="w-3.5 h-3.5" />,  bg: 'bg-violet-50',  headerBg: 'bg-violet-50/90',   pill: 'bg-violet-100 text-violet-700' },
  4: { label: 'Massnahmen',        icon: '✅', nextPhase: null, nextLabel: null, nextIcon: null,      bg: 'bg-emerald-50', headerBg: 'bg-emerald-50/90', pill: 'bg-emerald-100 text-emerald-700' },
};

/**
 * Pure function to filter entries based on parentId.
 */
export function filterEntries(allEntries, focusId) {
  return allEntries.filter(e =>
    focusId === null ? e.parentId === null : e.parentId === focusId
  );
}

/**
 * Helper to find the winning card in the current view.
 * Ties are broken by the timestamp (older first) for stability.
 */
export function getWinner(entries) {
  if (!entries || !entries.length) return null;
  const sorted = [...entries].sort((a, b) => {
    const voteDiff = (b.votes ?? 0) - (a.votes ?? 0);
    if (voteDiff !== 0) return voteDiff;
    // Tie-break: older posts (smaller timestamp) win
    return (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0);
  });
  return sorted[0].votes > 0 ? sorted[0] : null;
}

// ── Entry Card Component ──────────────────────────────────────────────────────
export function EntryCard({ entry, user, session, phase, toggleVote, isWinner, onDrill }) {
  const isBlurred = session?.isBlurred && entry.userId !== user?.uid;
  const hasVoted  = entry.voters?.includes(user?.uid);

  return (
    <div className={`relative p-5 rounded-[1.75rem] border border-white shadow-sm bg-white hover:shadow-md transition-all overflow-hidden ${isBlurred ? 'blur-md select-none opacity-40' : ''}`}>
      {isWinner && (
        <div className="absolute -top-1 -right-1 p-1.5 bg-amber-400 text-white rounded-bl-2xl shadow-sm">
          <Trophy className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="flex justify-between items-start gap-3">
        <p className="text-slate-700 text-[15px] leading-relaxed font-semibold flex-1 pr-2">{entry.text}</p>
        <button onClick={() => toggleVote(entry.id, entry.voters)}
          className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl transition-all active:scale-75 shrink-0 ${hasVoted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-300 hover:text-indigo-400'}`}>
          <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-black tracking-tighter">{entry.votes || 0}</span>
        </button>
      </div>

      {isWinner && onDrill && phase.nextLabel && (
        <button onClick={onDrill}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-[12px] font-black transition-all active:scale-95 border ${
            phase.nextPhase === 2 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' :
            phase.nextPhase === 3 ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}>
          {phase.nextIcon}
          {phase.nextLabel} {PHASES[phase.nextPhase]?.icon}
        </button>
      )}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
      Noch keine Einträge
    </div>
  );
}

export function BoardView({ entries, currentPhase, user, session, phase, toggleVote, onDrill, winnerId }) {
  if (currentPhase === 1) {
    // Grouped by 4L category
    const entriesByCategory = CATEGORIES.map(cat => ({
      cat,
      items: entries.filter(e => e.category === cat.id),
    }));

    return (
      <div className="space-y-8 mt-2">
        {entriesByCategory.map(({ cat, items }) => (
          <div key={cat.id} className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{cat.icon}</span>
                <h3 className="font-black text-slate-800 uppercase tracking-[0.15em] text-[11px]">{cat.label}</h3>
              </div>
              <span className="bg-white border border-slate-100 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full shadow-sm">{items.length}</span>
            </div>
            {items.map((entry, idx) => (
              <EntryCard key={entry.id} entry={entry} user={user} session={session} phase={phase}
                toggleVote={toggleVote} isWinner={winnerId === entry.id}
                onDrill={onDrill ? () => onDrill(entry) : null} />
            ))}
            {items.length === 0 && <EmptyState />}
          </div>
        ))}
      </div>
    );
  }

  // Flat list for Drill phases
  return (
    <div className="space-y-3 mt-2">
      {entries.map((entry, idx) => (
        <EntryCard key={entry.id} entry={entry} user={user} session={session} phase={phase}
          toggleVote={toggleVote} isWinner={winnerId === entry.id}
          onDrill={onDrill && phase.nextPhase ? () => onDrill(entry) : null} />
      ))}
      {entries.length === 0 && <EmptyState />}
    </div>
  );
}
