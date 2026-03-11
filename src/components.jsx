import React from 'react';
import { ThumbsUp, Trophy, Search, Lightbulb, CheckSquare, ClipboardList, Settings, Activity, History } from 'lucide-react';

import { CATEGORIES, PHASE_CONFIG } from './logic';

const ICON_MAP = {
  Search:      <Search className="w-3.5 h-3.5" />,
  Lightbulb:   <Lightbulb className="w-3.5 h-3.5" />,
  CheckSquare: <CheckSquare className="w-3.5 h-3.5" />,
};

export const PHASES = Object.fromEntries(
  Object.entries(PHASE_CONFIG).map(([k, v]) => [
    k, { ...v, nextIcon: v.nextIcon ? ICON_MAP[v.nextIcon] : null }
  ])
);


// ── Entry Card Component ──────────────────────────────────────────────────────
export function EntryCard({ entry, user, session, phase, toggleVote, isWinner, onDrill }) {
  const isBlurred = session?.isBlurred && entry.userId !== user?.uid;
  const hasVoted  = entry.voters?.includes(user?.uid);

  return (
    <div className={`relative p-5 rounded-[1.75rem] border border-white shadow-sm bg-white hover:shadow-md transition-all overflow-hidden ${isBlurred ? 'blur-md select-none opacity-40' : ''}`}>
      {isWinner && (
        <div data-testid="winner-trophy" className="absolute -top-1 -right-1 p-1.5 bg-amber-400 text-white rounded-bl-2xl shadow-sm">
          <Trophy className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="flex justify-between items-start gap-3">
        <p data-testid="entry-text" className="text-slate-700 text-[15px] leading-relaxed font-semibold flex-1 pr-2">{entry.text}</p>
        <button data-testid={`btn-vote-${entry.text}`} onClick={() => toggleVote(entry.id, entry.voters)}
          className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl transition-all active:scale-75 shrink-0 ${hasVoted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-300 hover:text-indigo-400'}`}>
          <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-black tracking-tighter">{entry.votes || 0}</span>
        </button>
      </div>

      {isWinner && onDrill && phase.nextLabel && (
        <button data-testid="drill-button" onClick={onDrill}
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
            {items.map((entry) => (
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
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} user={user} session={session} phase={phase}
          toggleVote={toggleVote} isWinner={winnerId === entry.id}
          onDrill={onDrill && phase.nextPhase ? () => onDrill(entry) : null} />
      ))}
      {entries.length === 0 && <EmptyState />}
    </div>
  );
}

export function ContextSidebar({ drillPath, currentPhase }) {
  if (!drillPath) return null;

  return (
    <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar py-2">
      <div data-testid="sidebar-context" className="bg-slate-50/80 backdrop-blur-sm rounded-[2.5rem] border border-slate-100 p-6 shadow-inner">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          Der Rote Faden
        </h3>
        
        <div className="space-y-4">
          {/* Phase 1 Status */}
          {currentPhase === 1 && (
            <div className="bg-white p-4 rounded-2xl border border-white shadow-sm flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Phase 1</p>
                <p className="text-[13px] font-bold text-slate-500">Daten sammeln...</p>
              </div>
            </div>
          )}

          {/* Drill Path Trail */}
          {drillPath.map((step, i) => {
            let icon = '⚓';
            let label = 'Anker';
            let theme = 'bg-white border-white text-slate-700 shadow-sm';
            
            if (step.phase === 2) {
              icon = '🔍';
              label = 'Ursache';
              theme = 'bg-indigo-50/50 border-indigo-100 text-indigo-900 shadow-none';
            } else if (step.phase === 3) {
              icon = '💡';
              label = 'Lösung';
              theme = 'bg-violet-50/50 border-violet-100 text-violet-900 shadow-none';
            }

            return (
              <div key={i} className="relative">
                {/* Visual Connector Line */}
                {i < drillPath.length - 1 && (
                  <div className="absolute left-6 top-10 w-0.5 h-10 bg-slate-200/50 -z-10" />
                )}
                
                <div data-testid="sidebar-step" className={`p-4 rounded-2xl border transition-all ${theme}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</span>
                    <span className="ml-auto text-[8px] font-bold bg-white/40 px-1.5 py-0.5 rounded-full border border-black/5">P{step.phase}</span>
                  </div>
                  <p data-testid="sidebar-step-text" className="text-[12px] font-semibold leading-relaxed line-clamp-3">
                    {step.parentText}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Active Phase Indicator (if drilled down) */}
          {currentPhase > 1 && (
            <div className="mt-8 p-4 rounded-2xl border border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">{PHASES[currentPhase]?.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Aktuell</span>
              </div>
              <p className="text-[14px] font-black leading-tight">{PHASES[currentPhase]?.label}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function AdminControlTower({ store }) {
  const { session, currentPhase, setManualPhase, jumpToHistory } = store;
  const history = session?.navigationHistory || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-8 text-white mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
          <Settings className="w-3 h-3" />
          Control Tower
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Host Mode</span>
        </div>
      </div>

      {/* Manual Phase Switcher */}
      <div className="space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Phase Switcher
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              onClick={() => setManualPhase(p)}
              className={`py-3 rounded-2xl text-[12px] font-black transition-all border-2 ${
                currentPhase === p
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb History */}
      <div className="space-y-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
          <History className="w-3 h-3" />
          Branch History
        </p>
        
        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
          {history.length === 0 ? (
            <div className="py-6 text-center border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Keine History vorhanden</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => jumpToHistory(item)}
                className="w-full text-left p-3 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 group-hover:bg-indigo-900 group-hover:text-indigo-300">P{item.phase}</span>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 truncate flex-1">{PHASES[item.phase]?.label}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-300 line-clamp-1 group-hover:text-white italic">
                  "{item.text}"
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
