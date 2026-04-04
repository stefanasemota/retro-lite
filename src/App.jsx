import React, { useState, useEffect, useRef } from 'react';
import { Plus, LogOut, Send, ShieldCheck, Eye, EyeOff, AlertCircle, ChevronLeft, X, Sparkles, CheckSquare, Timer, Play, Square, RotateCcw } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRetroStore } from './useRetroStore';
import { CATEGORIES, getWinner, getCategoryWinners, buildActionItem, formatDate } from './logic';
import { formatTime, parseTimeInput, getRemainingSeconds } from './timer';
import { PHASES, BoardView, ContextSidebar, AdminControlTower, ContextHeader, GenesisTable } from './components';

// ── Facilitator Timer ──────────────────────────────────────────────────────────
function FacilitatorTimer({ timerState, isHost, onStart, onStop, onReset }) {
  const [remaining, setRemaining]   = React.useState(0);
  const [inputVal, setInputVal]     = React.useState('05:00');
  const [inputErr, setInputErr]     = React.useState(false);
  const intervalRef                  = useRef(null);

  // Local tick — recalculates from server-authoritative endTime every 500 ms.
  // This is drift-free: even if a tab freezes, on resume it reads the correct time.
  useEffect(() => {
    const tick = () => setRemaining(getRemainingSeconds(timerState));
    tick();
    intervalRef.current = setInterval(tick, 500);
    return () => clearInterval(intervalRef.current);
  }, [timerState]);

  const isActive  = timerState?.status === 'active';
  const isPaused  = timerState?.status === 'paused';
  const isExpired = isActive && remaining === 0;
  const displayed = formatTime(remaining);

  const handleStart = () => {
    if (isActive) { onStop(); return; }
    const secs = isPaused
      ? (timerState?.duration ?? 0)           // resume from paused remaining
      : parseTimeInput(inputVal);              // fresh start from input
    if (!isPaused && (secs === null || secs <= 0)) { setInputErr(true); return; }
    setInputErr(false);
    onStart(secs ?? timerState.duration);
  };

  const handleReset = () => {
    const secs = parseTimeInput(inputVal) ?? 0;
    onReset(secs);
  };

  return (
    <div data-testid="facilitator-timer" className="flex items-center gap-3">
      {/* Digital Clock Display */}
      <div className={`relative font-mono font-black tracking-widest text-[22px] leading-none px-5 py-2.5 rounded-2xl border-2 transition-all select-none ${
        isExpired
          ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-500/40'
          : isActive
            ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-inner'
            : isPaused
              ? 'bg-amber-950 text-amber-400 border-amber-800'
              : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        <span data-testid="timer-display">{displayed}</span>
        {isActive && !isExpired && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        )}
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="flex items-center gap-2">
          {/* Input — only shown when not active */}
          {!isActive && (
            <input
              data-testid="timer-input"
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setInputErr(false); }}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="MM:SS"
              className={`w-20 bg-slate-100 border-2 text-center font-mono font-bold text-[13px] py-2 px-2 rounded-xl outline-none focus:bg-white transition-all ${
                inputErr ? 'border-red-400 text-red-600' : 'border-slate-200 focus:border-indigo-400 text-slate-700'
              }`}
            />
          )}

          {/* Start / Pause */}
          <button
            data-testid="btn-timer-start"
            onClick={handleStart}
            title={isActive ? 'Pause' : isPaused ? 'Fortsetzen' : 'Timer starten'}
            className={`p-2.5 rounded-xl font-black text-[11px] transition-all active:scale-90 ${
              isActive
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
            }`}
          >
            {isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            data-testid="btn-timer-reset"
            onClick={handleReset}
            title="Reset"
            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all active:scale-90"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Participants: timer icon only (no controls) */}
      {!isHost && timerState && (
        <Timer className={`w-4 h-4 ${isExpired ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
      )}
    </div>
  );
}

// ── Retro History List (Admin Panel) ────────────────────────────────
function RetroHistoryList({ history, onView, onDelete, onFetch, fetchFailed, onRetry }) {
  useEffect(() => { onFetch?.(); }, []);
  const [confirmingDelete, setConfirmingDelete] = React.useState(null);

  // Path 4: if the fetch failed show a non-blocking retry affordance
  // instead of leaving the panel blank or showing a generic error banner.
  if (fetchFailed) {
    return (
      <div className="mt-4 bg-red-50 border border-red-100 rounded-[2rem] p-8 flex flex-col items-center gap-4 text-center">
        <p className="text-[13px] font-black text-red-600">
          ⚠️ Session-Historie konnte nicht geladen werden.
        </p>
        <button
          data-testid="btn-retry-history"
          onClick={onRetry}
          className="px-8 py-3 rounded-full bg-red-600 text-white text-[12px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-md shadow-red-200 active:scale-95"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest py-4">
        Noch keine abgeschlossenen Sessions
      </p>
    );
  }
  return (
    <div className="mt-4 bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
      {/* Delete confirmation modal */}
      {confirmingDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full flex flex-col items-center gap-6">
            <div className="p-4 bg-red-50 rounded-full">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <div className="text-center">
              <h3 className="text-[18px] font-black text-slate-800 tracking-tighter">Session löschen?</h3>
              <p className="text-[12px] text-slate-500 mt-2">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmingDelete(null)}
                className="flex-1 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >Abbrechen</button>
              <button
                data-testid="confirm-delete-btn"
                onClick={() => { onDelete(confirmingDelete); setConfirmingDelete(null); }}
                className="flex-1 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >Ja, löschen</button>
            </div>
          </div>
        </div>
      )}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-6 py-4 border-b">
        retro-Lite Session History
      </p>
      <ul className="divide-y divide-slate-50">
        {history.map(session => (
          <li key={session.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
            <div>
              <p className="text-[13px] font-black text-slate-700">{session.sessionName || session.id}</p>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">{formatDate(session.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                data-testid={`view-session-${session.id}`}
                onClick={() => onView(session.id)}
                className="text-[11px] font-black px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors uppercase tracking-widest"
              >View</button>
              <button
                data-testid={`delete-session-${session.id}`}
                onClick={() => setConfirmingDelete(session.id)}
                className="text-[11px] font-black px-4 py-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors uppercase tracking-widest"
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const store = useRetroStore();
  const [newEntry, setNewEntry] = useState('');
  const [joinCode, setJoinCode]   = useState('');
  const [activeCategory, setActiveCategory] = useState('liked');
  
  // Modal state
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionName, setSessionName]     = useState('');
  const [isCreating, setIsCreating]       = useState(false);
  const [isSavingAction, setIsSavingAction] = useState(false);
  
  // Signaling for BDD tests
  React.useEffect(() => {
    if (window.location.search.includes('testMode=true')) {
      console.log('App Ready for Testing');
    }
  }, []);

  // Derived Values
  const phase  = PHASES[store.currentPhase] || PHASES[1];
  const inDrill = store.currentPhase > 1;
  const winner = getWinner(store.displayEntries);
  
  const categoryWinners = React.useMemo(() => 
    getCategoryWinners(store.displayEntries), 
    [store.displayEntries]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCreateSession = async () => {
    setIsCreating(true);
    store.clearError();
    try {
      await store.createSession(sessionName);
      setShowNameModal(false);
      setSessionName('');
    } catch {
      // Error handled by store
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddEntry = () => {
    store.addEntry(newEntry, activeCategory);
    setNewEntry('');
  };

  const handleDrillInto = async (entry) => {
    if (!store.isHost || !phase.nextPhase) return;
    if (phase.nextPhase === 4) {
      // Bug fix: "Massnahme Festlegen" must BUILD and SAVE the action item before
      // advancing to Phase 4. Previously this called setManualPhase(4) which only
      // changed currentPhase — sessionActionItems stayed empty and GenesisTable
      // showed "0 actions". Now we write the item + phase in one atomic update.
      const actionItem = buildActionItem(entry, store.drillPath, store.allEntries);
      if (actionItem) {
        await store.saveActionItemAndGoToPhase4(actionItem);
      } else {
        // Fallback (e.g. entry is null): just advance phase so the host isn't stuck.
        store.setManualPhase(4);
      }
      setNewEntry('');
      return;
    }
    const newPath = [...store.drillPath, { parentId: entry.id, parentText: entry.text, phase: store.currentPhase }];
    store.setDrillPhase(phase.nextPhase, entry.id, newPath);
    setNewEntry('');
  };

  const handleSaveActionItem = async (entry) => {
    if (!store.isHost) return;
    setIsSavingAction(entry.id);
    const actionItem = buildActionItem(entry, store.drillPath, store.allEntries);
    if (actionItem) await store.saveActionItemAndReset(actionItem);
    setIsSavingAction(false);
  };


  // ── Render ───────────────────────────────────────────────────────────────
  if (store.loading) {
    return <div className="h-screen flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold">retro-Lite Engine startet…</div>;
  }

  return (
    <div className={`min-h-screen ${phase.bg} text-slate-900 font-sans pb-24 transition-colors duration-500`}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="light"
      />

      {/* ── Modal ── */}
      {showNameModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-xl tracking-tight">Session benennen</h2>
              <button onClick={() => setShowNameModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <input data-testid="session-name-input" autoFocus placeholder="z.B. Sprint 42" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-semibold border-none outline-none focus:ring-4 focus:ring-indigo-100" value={sessionName} onChange={e => setSessionName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateSession()} />
            <button data-testid="btn-create-session" onClick={handleCreateSession} disabled={isCreating || !sessionName.trim()} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-indigo-700 transition-all">
              {isCreating ? 'Erstelle Session…' : <><Plus className="w-5 h-5"/> Session starten</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className={`${phase.headerBg} backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 xl:px-12 py-5 flex justify-between items-center sticky top-0 z-50 transition-all duration-500 shadow-sm w-full`}>
        <div className="flex items-center gap-10 overflow-hidden flex-1">
          <div className="flex items-center gap-5 shrink-0">
            <div className={`p-3 rounded-[1.25rem] shadow-xl text-white ${phase.accent} transition-transform hover:scale-110 duration-500`}>
              <Sparkles className="w-5 h-5"/>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-slate-800 leading-none truncate max-w-[150px] md:max-w-none">{store.session?.sessionName ?? 'Retro-Lite'}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${phase.bg.replace('/50', '')} ${phase.text}`}>
                  <div className={`w-2 h-2 rounded-full ${phase.accent} animate-pulse`} />
                  ● PHASE {phase.id}: {phase.label}
                </div>
              </div>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden md:block" />

          {/* dominant Logic-Kette / Context-Header */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <ContextHeader drillPath={store.drillPath} currentPhase={store.currentPhase} history={store.session?.navigationHistory} />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            {store.sessionId && (
              <div className="hidden xl:flex items-center gap-4">
                <div data-testid="session-code-display" className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl font-mono font-black tracking-[0.3em] text-[11px] border border-slate-100 shadow-inner group hover:text-indigo-600 transition-colors">
                  {store.sessionId}
                </div>
                {store.isHost && (
                  <button data-testid="btn-toggle-blur" onClick={store.toggleBlur} className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${store.session?.isBlurred ? 'bg-amber-100 text-amber-600 shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-indigo-100'}`}>
                    {store.session?.isBlurred ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    <span>{store.session?.isBlurred ? 'Privacy' : 'Shared'}</span>
                  </button>
                )}
              </div>
            )}
            {/* Facilitator Timer — visible on all screen sizes when in a session */}
            {store.session && (
              <FacilitatorTimer
                timerState={store.timerState}
                isHost={store.isHost}
                onStart={store.startTimer}
                onStop={store.stopTimer}
                onReset={store.resetTimer}
              />
            )}
            {store.user && !store.user.isAnonymous && (
              <button onClick={store.logout} className="p-3.5 rounded-[1.25rem] text-slate-400 hover:text-red-500 bg-slate-50 border border-slate-100 transition-all hover:shadow-lg"><LogOut className="w-5 h-5"/></button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full xl:max-w-[2000px] 2xl:max-w-[2400px] mx-auto flex flex-col lg:flex-row gap-6 xl:gap-10 px-4 lg:px-8 xl:px-12 pt-8 pb-32 items-start relative">
        
        {/* ── Left Sidebar: Spatial Navigation & Input ── */}
        {store.view === 'session' && (
          <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 lg:sticky lg:top-28 space-y-8 animate-in slide-in-from-left-8 duration-700">
            {store.currentPhase !== 4 ? (
              <div className={`bg-white p-10 rounded-[4rem] shadow-2xl transition-all duration-500 border border-slate-50 space-y-8 relative overflow-hidden group/card`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 blur-[60px] rounded-full -mr-20 -mt-20 -z-0 group-hover/card:scale-150 transition-transform duration-1000" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Collaborate</h3>
                    <div className={`flex items-center gap-2 ${phase.bg} ${phase.text} px-5 py-2 rounded-full font-black text-[10px] uppercase shadow-inner border border-white`}>
                      {phase.icon} {phase.label}
                    </div>
                  </div>

                  {store.currentPhase === 1 && (
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map(cat => (
                        <button key={cat.id} data-testid={`btn-category-${cat.id}`} onClick={() => setActiveCategory(cat.id)} 
                          className={`px-4 py-3.5 rounded-[1.5rem] text-[11px] font-black border-2 transition-all text-center relative overflow-hidden group/cat ${
                            activeCategory === cat.id ? `${cat.color} border-current shadow-lg scale-105 z-10` : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100'
                          }`}>
                          <div className="relative z-10 flex flex-col items-center gap-1.5">
                            <span className="text-xl group-hover/cat:scale-125 transition-transform">{cat.icon}</span>
                            <span className="uppercase tracking-widest">{cat.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Context-Persistent Targeting Info */}
                    {inDrill && store.drillPath.length > 0 && (
                      <div className={`p-5 rounded-[2rem] ${PHASES[store.currentPhase - 1]?.bg} border ${PHASES[store.currentPhase - 1]?.border} animate-in fade-in slide-in-from-top-2 duration-500`}>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${PHASES[store.currentPhase - 1]?.text} flex items-center gap-2`}>
                          {store.currentPhase === 2 ? '⚓ Targeting Anchor' : '🔍 Targeting Cause'}
                        </p>
                        <p className="text-[14px] font-black text-slate-700 leading-snug mt-2 line-clamp-2 italic tracking-tight">
                          "{store.drillPath[store.drillPath.length - 1].parentText}"
                        </p>
                      </div>
                    )}

                    <div className="relative group/input">
                      <textarea data-testid="entry-input" 
                        placeholder={store.currentPhase === 1 ? 'Share your perspective...' : store.currentPhase === 2 ? 'Warum ist das passiert?' : 'Wie lösen wir das?'} 
                        className="w-full bg-slate-50 p-8 rounded-[3rem] text-[17px] min-h-[200px] focus:ring-[15px] focus:ring-slate-100 outline-none border-2 border-transparent focus:border-white focus:bg-white resize-none font-bold text-slate-800 leading-relaxed placeholder:text-slate-300 transition-all shadow-inner" 
                        value={newEntry} onChange={e => setNewEntry(e.target.value)} 
                      />
                      <button data-testid="btn-submit-entry" onClick={handleAddEntry} disabled={!newEntry.trim()} 
                        className={`absolute bottom-6 right-6 ${phase.accent} text-white p-5 rounded-3xl shadow-2xl disabled:opacity-20 hover:brightness-110 active:scale-90 transition-all hover:rotate-6`}>
                        <Send className="w-6 h-6"/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`bg-rose-50 p-10 rounded-[4rem] border border-rose-100 space-y-8 relative overflow-hidden group/card`}>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-400">Protokoll-Modus</h3>
                  <h4 className="text-3xl font-black text-rose-600 leading-tight tracking-tighter">Action<br/>Plan</h4>
                  <p className="text-[13px] font-bold text-rose-800/60 leading-relaxed mt-4">
                    Bitte verfeinere die beschlossenen Massnahmen und teile Verantwortlichkeiten zu.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 w-full space-y-10">
          {/* ── Error Banner ── */}
          {store.error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold whitespace-pre-line leading-snug">{store.error}</div>
              <button onClick={store.clearError} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* ════════ LANDING VIEW ════════ */}
          {store.view === 'landing' ? (
            <div className="max-w-md mx-auto space-y-10 py-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter leading-tight italic">Teams befähigen.<br/><span className="text-indigo-600 underline decoration-indigo-200 uppercase not-italic">Insights sammeln.</span></h2>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-white space-y-4">
                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-2">Einer Session beitreten</label>
                <div className="relative flex items-center w-full bg-slate-50 border border-slate-100 shadow-inner rounded-[2rem] p-2 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                  <input 
                    id="join-input" 
                    data-testid="join-code-input" 
                    type="text" 
                    placeholder="CODE"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && store.joinSession(joinCode)}
                    className="flex-1 w-full min-w-0 bg-transparent px-4 py-4 outline-none uppercase font-mono text-center text-3xl tracking-[0.4em] text-slate-800 placeholder-slate-300"
                  />
                  <button 
                    data-testid="btn-join-session" 
                    onClick={() => store.joinSession(joinCode)} 
                    className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-md shadow-indigo-200 active:scale-95 transition-all"
                  >
                    GO
                  </button>
                </div>
              </div>
              <div className="relative py-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"/></div><div className="relative flex justify-center text-[11px] font-black uppercase tracking-widest text-slate-400"><span className="bg-slate-50 px-6">Admin Area</span></div></div>
              {store.user && !store.user.isAnonymous ? (
                <>
                  <button data-testid="host-session-button" onClick={() => { setSessionName(`retro-Lite ${new Date().toLocaleDateString('de-DE')}`); setShowNameModal(true); }} className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-6 rounded-[2.5rem] font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-50"><Plus className="w-7 h-7"/> Neue Session hosten</button>
                  <RetroHistoryList
                    history={store.history}
                    onView={store.viewSession}
                    onDelete={store.deleteSession}
                    onFetch={store.fetchRetroHistory}
                    fetchFailed={store.historyFetchFailed}
                    onRetry={store.retryFetchHistory}
                  />
                </>
              ) : (
                <button onClick={store.loginAdmin} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform"><ShieldCheck className="w-7 h-7 text-indigo-400"/> Admin Login</button>
              )}
            </div>
          ) : (
            <div className="space-y-12 w-full">
              {store.view === 'summary' || store.currentPhase === 4 ? (
                <GenesisTable session={store.session} updateActionItem={store.updateActionItem} isHost={store.isHost} onComplete={() => { store.exportActionsToCSV(); store.completeRetro(); }} />
              ) : (
                <>
                  {/* Board Feed */}
                  <BoardView 
                    entries={store.displayEntries} 
                    currentPhase={store.currentPhase} 
                    user={store.user} 
                    session={store.session} 
                    toggleVote={store.toggleVote} 
                    winnerId={winner?.id} 
                    categoryWinners={categoryWinners}
                    onDrill={store.isHost ? handleDrillInto : null} 
                    onSaveAction={store.isHost ? handleSaveActionItem : null}
                    isSavingAction={isSavingAction}
                    history={store.session?.navigationHistory}
                    drillPath={store.drillPath}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Right Sidebar: Context Trail ── */}
        {store.session && (
          <div className="hidden xl:flex flex-col gap-8 w-[280px] 2xl:w-[340px] shrink-0 lg:sticky lg:top-28 self-start">
            <ContextSidebar drillPath={store.drillPath} currentPhase={store.currentPhase} />
            {store.view === 'session' && store.isHost && <AdminControlTower store={store} />}
          </div>
        )}
      </main>

      {/* ── Status Bar ── */}
      {store.session && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[94%] max-w-xl bg-slate-900/95 backdrop-blur-3xl text-white p-5 rounded-[3rem] flex justify-between items-center shadow-2xl z-50 border border-white/20 px-10">
          <div className="flex items-center gap-4 ml-1"><div className="relative"><div className="w-3 h-3 bg-green-400 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.5)]"/><div className="absolute inset-0 animate-ping w-3 h-3 bg-green-400 rounded-full opacity-75"/></div><span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-80 text-white flex items-center gap-2">Live <span className="opacity-30">|</span> Collaboration</span></div>
          <div className="flex items-center gap-4">
            {inDrill && store.isHost && <button onClick={() => store.setDrillPhase(1, null, [])} className="text-[12px] font-black bg-indigo-500/30 hover:bg-indigo-500/50 px-6 py-3 rounded-full flex items-center gap-2 transition-all border border-indigo-400/20"><ChevronLeft className="w-4 h-4"/> Zurück zu 4L</button>}
            <button onClick={store.leaveSession} className="text-[12px] font-black bg-red-600 hover:bg-red-700 px-8 py-3 rounded-full tracking-[0.2em] transition-all shadow-lg shadow-red-900/40 border border-red-500/20 uppercase">Session verlassen</button>
          </div>
        </div>
      )}
    </div>
  );
}
