// @refresh reset
import React, { useRef } from 'react';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import { ThumbsUp, Trophy, Search, Lightbulb, CheckSquare, ClipboardList, Settings, Activity, History, LayoutList, Clock, User } from 'lucide-react';

import { CATEGORIES, PHASE_CONFIG, findRootCategory } from './logic';

const ICON_MAP = {
  Search:      <Search className="w-3.5 h-3.5" />,
  Lightbulb:   <Lightbulb className="w-3.5 h-3.5" />,
  CheckSquare: <CheckSquare className="w-3.5 h-3.5" />,
};

// eslint-disable-next-line react-refresh/only-export-components
export const PHASE_THEMES = {
  1: { color: '#4f46e5', accent: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-100', ripple: 'bg-indigo-400/20' },
  2: { color: '#7c3aed', accent: 'bg-violet-600', text: 'text-violet-600', bg: 'bg-violet-50/50', border: 'border-violet-100', ripple: 'bg-violet-400/20' },
  3: { color: '#10b981', accent: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100', ripple: 'bg-emerald-400/20' },
  4: { color: '#e11d48', accent: 'bg-rose-600', text: 'text-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-100', ripple: 'bg-rose-400/20' },
};

const _PHASES = Object.fromEntries(
  Object.entries(PHASE_CONFIG).map(([k, v]) => [
    k, { 
      ...v, 
      ...PHASE_THEMES[v.id || k],
      nextIcon: v.nextIcon ? ICON_MAP[v.nextIcon] : null 
    }
  ])
);

// Map to both strings and numbers for safety
// eslint-disable-next-line react-refresh/only-export-components
export const PHASES = {
  ..._PHASES,
  1: _PHASES["1"],
  2: _PHASES["2"],
  3: _PHASES["3"],
  4: _PHASES["4"],
};

// ── Context Header (Breadcrumbs) ─────────────────────────────────────────────
export function ContextHeader({ drillPath, currentPhase, history = [] }) {
  if (currentPhase === 1 && drillPath.length === 0 && history.length === 0) return null;

  // If in Phase 1 but have history, show a placeholder or root indicator
  if (currentPhase === 1 && drillPath.length === 0) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm whitespace-nowrap">
          <span className="text-lg">🗂️</span>
          <span className="text-[11px] font-black uppercase tracking-widest">4L Übersicht</span>
        </div>
        {history.length > 0 && (
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-3 py-1 rounded-lg">
            {history.length} Branches aktiv
          </div>
        )}
      </div>
    );
  }

  const steps = drillPath.map((step) => {
    let icon = '⚓';
    if (step.phase === 2) icon = '🔍';
    if (step.phase === 3) icon = '💡';
    return { ...step, icon };
  });

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100 whitespace-nowrap animate-in fade-in slide-in-from-left-4">
            <span className="text-lg">{step.icon}</span>
            <span className="text-[13px] font-bold text-slate-700 italic">"{step.parentText}"</span>
          </div>
          {i < steps.length - 1 && (
            <div className="text-slate-300 font-black">→</div>
          )}
        </React.Fragment>
      ))}
      
      {/* Current Phase Indicator */}
      {currentPhase > 1 && steps.length > 0 && steps[steps.length - 1].phase < currentPhase && (
         <>
           <div className="text-slate-300 font-black">→</div>
           <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl shadow-md border border-indigo-500 whitespace-nowrap animate-pulse">
             <span className="text-lg">{PHASES[currentPhase]?.icon}</span>
             <span className="text-[11px] font-black uppercase tracking-widest">{PHASES[currentPhase]?.label}</span>
           </div>
         </>
      )}
    </div>
  );
}

export function AnchorBanner({ drillPath, currentPhase }) {
  if (currentPhase < 2 || !drillPath || drillPath.length === 0) return null;
  const currentTarget = drillPath[drillPath.length - 1];
  
  const theme = currentPhase === 2 ? 'bg-indigo-900 border-indigo-700 text-indigo-100 shadow-indigo-900/30' : 'bg-violet-900 border-violet-700 text-violet-100 shadow-violet-900/30';
  const icon = currentPhase === 2 ? '⚓' : '🔍';
  const label = currentPhase === 2 ? 'Fokus' : 'Ursache';

  return (
    <div className={`p-6 rounded-[2rem] border ${theme} shadow-2xl mb-6 relative overflow-hidden group/anchor`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover/anchor:scale-150 transition-transform duration-1000" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 opacity-80">
          <span className="text-xl">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-[18px] font-black leading-snug italic text-white tracking-tight">
          "{currentTarget.parentText}"
        </p>
      </div>
    </div>
  );
}


// ── Entry Card Component ──────────────────────────────────────────────────────
export function EntryCard({ entry, user, session, currentPhase, toggleVote, isWinner, isCategoryWinner, onDrill, onSaveAction, history = [] }) {
  const phase = PHASES[currentPhase] || PHASES[1];
  const isBlurred = session?.isBlurred && entry.userId !== user?.uid;
  const hasVoted  = entry.voters?.includes(user?.uid);
  const wasDrilled = history.some(h => h.id === entry.id);

  return (
    <div data-testid="retro-card" className={`relative px-8 py-7 rounded-[2.5rem] border border-white shadow-sm bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group ${isBlurred ? 'blur-md select-none opacity-40' : ''}`}>
      {isWinner && (
        <div data-testid="winner-trophy" className={`absolute -top-1 -right-1 p-2.5 ${phase.accent} text-white rounded-bl-3xl shadow-lg z-10`}>
          <Trophy className="w-4 h-4" />
        </div>
      )}

      {wasDrilled && !isWinner && (
        <div title="Bereits analysiert" className={`absolute top-5 right-7 flex items-center gap-2 ${phase.text} opacity-40 group-hover:opacity-100 transition-opacity`}>
          <Search className="w-4 h-4" />
        </div>
      )}

      <div className="space-y-5">
        <p data-testid="entry-text" className="text-slate-800 text-[17px] leading-relaxed font-bold break-words">{entry.text}</p>
        
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
          <button data-testid={`btn-vote-${entry.text}`} onClick={() => toggleVote(entry.id, entry.voters)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all active:scale-90 shadow-md border-2 ${hasVoted ? `${phase.accent} text-white border-transparent` : `bg-white ${phase.text} ${phase.border} hover:${phase.bg}`}`}>
            <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
            <span className="text-[15px] font-black tracking-tighter">{entry.votes || 0}</span>
          </button>
          {wasDrilled && (
            <span data-testid="drilled-pill" className="bg-slate-800 text-[10px] text-white px-3 py-1.5 rounded-[1rem] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg relative group overflow-hidden">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"/>
              <Search className="w-3.5 h-3.5 text-emerald-400" /> DRILLED
            </span>
          )}
        </div>
      </div>

      {isCategoryWinner && onDrill && phase.nextLabel && (
        <button data-testid="drill-button" onClick={onDrill}
          className={`mt-6 w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-[1.5rem] text-[13px] font-black transition-all active:scale-95 border-2 shadow-sm ${phase.accent} text-white border-transparent hover:brightness-110`}>
          {phase.nextIcon}
          {phase.nextLabel}
        </button>
      )}

      {isCategoryWinner && currentPhase === 3 && onSaveAction && (
        <button data-testid="save-action-button" onClick={onSaveAction}
          className={`mt-6 w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-[1.5rem] text-[13px] font-black transition-all active:scale-95 border-2 shadow-sm bg-emerald-600 text-white border-transparent hover:brightness-110`}>
          <CheckSquare className="w-4 h-4" />
          Massnahme sichern & Nächstes Thema
        </button>
      )}

      {!isCategoryWinner && currentPhase > 1 && (entry.votes || 0) === 0 && (
        <div className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-slate-50/50 border-2 border-dashed border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
          <Clock className="w-3.5 h-3.5 opacity-50" />
          Warte auf Voting...
        </div>
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

export function BoardView({ entries, currentPhase, user, session, toggleVote, onDrill, onSaveAction, winnerId, categoryWinners, drillPath }) {
  const history = session?.navigationHistory || [];

  if (currentPhase === 1) {
    // Grouped by 4L category
    const entriesByCategory = CATEGORIES.map(cat => ({
      cat,
      items: entries.filter(e => e.category === cat.id),
    }));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8 mt-4 items-start w-full">
        {entriesByCategory.map(({ cat, items }) => (
          <div key={cat.id} className="space-y-4">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3 transition-transform hover:scale-105">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[12px]">{cat.label}</h3>
              </div>
              <span className="bg-white border border-slate-100 text-indigo-600 text-[11px] font-black px-4 py-1.5 rounded-full shadow-sm">{items.length}</span>
            </div>
            <div className="space-y-4">
              {items.map((entry) => (
                <EntryCard key={entry.id} entry={entry} user={user} session={session} currentPhase={currentPhase}
                  toggleVote={toggleVote} 
                  isWinner={winnerId === entry.id}
                  isCategoryWinner={categoryWinners && categoryWinners[entry.category]?.includes(entry.id)}
                  onDrill={onDrill ? () => onDrill(entry) : null}
                  onSaveAction={null}
                  history={history} />
              ))}
              {items.length === 0 && <EmptyState />}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Flat list for Drill phases
  const maxVotes = entries.length > 0 ? Math.max(...entries.map(e => e.votes || 0)) : 0;

  return (
    <div className="space-y-3 mt-2">
      <AnchorBanner drillPath={drillPath} currentPhase={currentPhase} />
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} user={user} session={session} currentPhase={currentPhase}
          toggleVote={toggleVote} 
          isWinner={winnerId === entry.id}
          isCategoryWinner={entry.votes === maxVotes && maxVotes > 0}
          onDrill={onDrill && PHASES[currentPhase].nextPhase ? () => onDrill(entry) : null}
          onSaveAction={onSaveAction && currentPhase === 3 ? () => onSaveAction(entry) : null}
          history={history} />
      ))}
      {entries.length === 0 && <EmptyState />}
    </div>
  );
}

export function ContextSidebar({ drillPath, currentPhase }) {
  if (!drillPath) return null;

  return (
    <aside className="hidden lg:block w-full shrink-0">
      <div data-testid="sidebar-context" className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-indigo-100/30 space-y-8">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-3">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
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

      {/* Branch Navigation (Active Drill-Downs) */}
      <div className="space-y-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
          <History className="w-3 h-3" />
          Aktive Drill-Downs
        </p>
        
        <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
          {history.length === 0 ? (
            <div className="py-6 text-center border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Keine Branches aktiv</p>
            </div>
          ) : (
            history.map((item, idx) => {
              const isActive = store.focusId === item.id;
              let phaseIcon = '🔍';
              if (item.phase === 2) phaseIcon = '🔍';
              if (item.phase === 3) phaseIcon = '💡';
              if (item.phase === 4) phaseIcon = '✅';

              return (
                <button
                  key={idx}
                  onClick={() => jumpToHistory(item)}
                  className={`w-full text-left p-4 rounded-[1.5rem] transition-all group border ${
                    isActive 
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-900/20' 
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{phaseIcon}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                      Phase {item.phase}/4
                    </span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />}
                  </div>
                  <p className={`text-[12px] font-bold leading-snug line-clamp-2 italic ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    "{item.text}"
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

// ── Genesis Table (Phase 4 Dashboard) ───────────────────────────────────────
export function GenesisTable({ session, updateActionItem, isHost, onComplete }) {
  const matrixRef = useRef(null);

  const handleExportPNG = async () => {
    if (!matrixRef.current) return;
    try {
      // Wait one paint to ensure no pending DOM updates, then clear any selection
      await new Promise(resolve =>
        typeof requestAnimationFrame === 'function'
          ? requestAnimationFrame(resolve)
          : setTimeout(resolve, 0)
      );
      window.getSelection()?.removeAllRanges();

      const canvas = await html2canvas(matrixRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        // Skip textarea/input elements — html2canvas has a known Range.setEnd
        // crash when measuring text nodes inside editable fields.
        ignoreElements: (el) => el.tagName === 'TEXTAREA' || el.tagName === 'INPUT',
      });
      const filename = `retro-Lite_Actions_${new Date().toISOString().split('T')[0]}.png`;
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => {
          if (!blob) { toast.error('Export fehlgeschlagen: Canvas war leer.'); return; }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = filename;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('PNG erfolgreich exportiert ✓');
        }, 'image/png');
      } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PNG erfolgreich exportiert ✓');
      }
    } catch (err) {
      console.error('[retro-Lite] PNG export failed:', err);
      toast.error(`Export fehlgeschlagen: ${err.message}`);
    }
  };

  const actions = session?.sessionActionItems || [];
  const completedActions = actions.filter(a => a.done).length;
  const rate = actions.length ? Math.round((completedActions / actions.length) * 100) : 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
          <div className="p-5 bg-rose-50 text-rose-600 rounded-3xl group-hover:rotate-12 transition-transform"><LayoutList className="w-8 h-8"/></div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Total Actions</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{actions.length}</h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">↑ 4% this month</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
          <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:rotate-12 transition-transform"><CheckSquare className="w-8 h-8"/></div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Completed</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{completedActions}</h3>
            <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">{rate}% of goal</p>
          </div>
        </div>
      </div>

      <div ref={matrixRef} className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-50">
        <div className="px-12 py-10 bg-slate-50/50 border-b flex justify-between items-center">
          <div>
            <h2 className="font-black text-2xl tracking-tighter text-slate-800">Genesis Evolution Matrix</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">TEAM COMMITMENT TRACKER</p>
          </div>
          <div className="flex items-center gap-4">
            {isHost && onComplete && (
              <button 
                onClick={onComplete}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-full text-[11px] uppercase font-black tracking-widest transition-all shadow-md shadow-emerald-900/20 active:scale-95 animate-in fade-in duration-500"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Retro abschließen
              </button>
            )}
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-5 py-2.5 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
              title="Export Matrix as PNG"
            >
              ↓ Export as PNG
            </button>
            <div className="flex gap-3 bg-white p-2 rounded-full shadow-inner border border-slate-200">
              {['All', 'Pending', 'Done'].map(tab => (
                <button key={tab} className={`px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${tab === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{tab}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b">
                <th className="px-12 py-8" style={{minWidth: '260px', width: '30%'}}>Beschlossene Lösung</th>
                <th className="px-12 py-8" style={{minWidth: '260px', width: '35%'}}>Konkrete Maßnahme (What)</th>
                <th className="px-12 py-8 w-40">Timing / Impact</th>
                <th className="px-12 py-8 text-right w-48">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((item) => {
                const cat = CATEGORIES.find(c => c.id === item.categoryId) || CATEGORIES[0];
                return (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-all border-b last:border-none align-top">
                    <td className="px-12 py-8">
                      <div className="flex items-start gap-4">
                        <div className={`w-1.5 h-12 rounded-full ${PHASE_THEMES[3].accent} opacity-30 mt-1`}/>
                        <div>
                          <p className="font-bold text-slate-700 text-[14px] leading-relaxed whitespace-pre-wrap break-words pr-4">{item.originalWhat || item.what}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm"><Activity className={`w-3 h-3 ${cat.text}`}/> {item.sourceAnchorText}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <textarea
                        disabled={!isHost}
                        placeholder="Erfasse die konkrete Massnahme..."
                        className="w-full min-w-0 bg-white border-2 border-slate-100 text-emerald-800 text-[15px] font-bold px-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-[120px] shadow-sm transition-colors disabled:opacity-50 placeholder:text-slate-300 whitespace-pre-wrap"
                        value={item.what}
                        onChange={(e) => updateActionItem(item.id, { what: e.target.value })}
                      />
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex flex-col gap-2">
                        <input
                          type="date"
                          disabled={!isHost}
                          className="bg-slate-50 border border-slate-200 text-slate-700 text-[12px] font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          value={item.when !== 'TBD' ? item.when : ''}
                          onChange={(e) => updateActionItem(item.id, { when: e.target.value || 'TBD' })}
                        />
                      </div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex items-center justify-end gap-3 group/user">
                        <input
                          type="text"
                          placeholder="Assignee..."
                          disabled={!isHost}
                          className="bg-transparent border-b-2 border-slate-100 text-slate-800 text-[14px] font-black text-right px-2 py-1 outline-none focus:border-indigo-400 disabled:opacity-50 w-32 transition-colors placeholder:text-slate-300"
                          value={item.who !== 'To be assigned' ? item.who : ''}
                          onChange={(e) => updateActionItem(item.id, { who: e.target.value || 'To be assigned' })}
                        />
                        <div className="p-3 bg-slate-100 rounded-[1.25rem] text-slate-400 group-hover/user:bg-indigo-600 group-hover/user:text-white transition-colors duration-300 shadow-sm"><User className="w-5 h-5"/></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
