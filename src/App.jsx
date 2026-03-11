import React, { useState } from 'react';
import { Plus, LogOut, Download, Send, ShieldCheck, ClipboardList, Eye, EyeOff, AlertCircle, ChevronLeft, X } from 'lucide-react';
import { useRetroStore } from './useRetroStore';
import { CATEGORIES, getWinner } from './logic';
import { PHASES, BoardView, EmptyState, ContextSidebar, AdminControlTower } from './components';

export default function App() {
  const store = useRetroStore();
  const [newEntry, setNewEntry] = useState('');
  const [activeCategory, setActiveCategory] = useState('liked');
  
  // Modal state
  const [showNameModal, setShowNameModal] = useState(false);
  const [sessionName, setSessionName]     = useState('');
  const [isCreating, setIsCreating]       = useState(false);

  // Derived Values
  const phase  = PHASES[store.currentPhase];
  const winner = getWinner(store.displayEntries);
  const inDrill = store.currentPhase > 1;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCreateSession = async () => {
    setIsCreating(true);
    store.clearError();
    try {
      await store.createSession(sessionName);
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

  const handleDrillInto = (entry) => {
    if (!store.isHost || !phase.nextPhase) return;
    const newPath = [...store.drillPath, { parentId: entry.id, parentText: entry.text, phase: store.currentPhase }];
    store.setDrillPhase(phase.nextPhase, entry.id, newPath);
    setNewEntry('');
  };

  const handleDrillBack = () => {
    if (!store.isHost || store.drillPath.length === 0) return;
    const newPath   = store.drillPath.slice(0, -1);
    const prevFocus = newPath.length > 0 ? newPath[newPath.length - 1].parentId : null;
    const prevPhase = newPath.length > 0 ? newPath[newPath.length - 1].phase    : 1;
    store.setDrillPhase(prevPhase, prevFocus, newPath);
    setNewEntry('');
  };

  const exportCSV = () => {
    const headers = 'Phase,Category,Text,Votes\n';
    const rows = store.allEntries.map(e =>
      `"${PHASES[e.phase ?? 1]?.label}","${e.category}","${e.text?.replace(/"/g, '""')}",${e.votes || 0}`
    ).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })),
      download: `LST_Retro_${store.sessionId}.csv`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (store.loading) {
    return <div className="h-screen flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold">LST Engine startet…</div>;
  }

  // Signaling for BDD tests
  if (window.location.search.includes('testMode=true')) {
    console.log('App Ready for Testing');
  }

  return (
    <div className={`min-h-screen ${phase.bg} text-slate-900 font-sans pb-24 transition-colors duration-500`}>

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
      <header className={`${phase.headerBg} backdrop-blur-md border-b px-5 py-3.5 flex justify-between items-center sticky top-0 z-50 transition-colors`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-2xl shadow-md text-white ${
            store.currentPhase === 1 ? 'bg-indigo-600' :
            store.currentPhase === 2 ? 'bg-indigo-700' :
            store.currentPhase === 3 ? 'bg-violet-600' : 'bg-emerald-600'
          }`}><ClipboardList className="w-5 h-5"/></div>
          <div>
            <h1 className="font-black text-lg tracking-tight leading-none">{store.session?.sessionName ?? 'Retro-Lite'}</h1>
            <p data-testid="phase-header" className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {phase.icon} {phase.label} {inDrill && !store.isHost && <span className="ml-1 opacity-60">· Follow-the-Leader</span>}
            </p>
          </div>
        </div>
        {store.user && !store.user.isAnonymous && (
          <button onClick={store.logout} className="p-2.5 rounded-xl text-slate-500 hover:text-red-500 bg-white/60"><LogOut className="w-4 h-4"/></button>
        )}
      </header>

      <main className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 px-4 pt-6 pb-24 items-start w-full">
        <div className="flex-1 w-full max-w-md mx-auto space-y-4">

          {/* ── Error Banner ── */}
          {store.error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold whitespace-pre-line leading-snug">{store.error}</div>
              <button onClick={store.clearError} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* ════════ LANDING VIEW ════════ */}
          {!store.session ? (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-tight">Teams befähigen.<br/><span className="text-indigo-600 underline decoration-indigo-200">Insights sammeln.</span></h2>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session beitreten</label>
                <div className="flex gap-2">
                  <input id="join-input" data-testid="join-code-input" type="text" placeholder="CODE" className="flex-1 px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 uppercase font-mono text-center text-2xl tracking-[0.3em]"/>
                  <button data-testid="btn-join-session" onClick={() => store.joinSession(document.getElementById('join-input').value)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all">GO</button>
                </div>
              </div>
              <div className="relative py-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"/></div><div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span className="bg-slate-50 px-4">Scrum Master Area</span></div></div>
              {store.user && !store.user.isAnonymous ? (
                <button data-testid="host-session-button" onClick={() => { setSessionName(`LST Retro ${new Date().toLocaleDateString('de-DE')}`); setShowNameModal(true); }} className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-5 rounded-[2.5rem] font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-lg"><Plus className="w-6 h-6"/> Neue Session hosten</button>
              ) : (
                <button onClick={store.loginAdmin} className="w-full bg-slate-900 text-white py-5 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95"><ShieldCheck className="w-6 h-6 text-indigo-400"/> Admin Login</button>
              )}
            </div>
          ) : (

            // ════════ SESSION VIEW ════════
            <div className="space-y-4">

              {/* Breadcrumbs */}
              {store.drillPath.length > 0 && (
                <div className="space-y-2">
                  {store.isHost && (
                    <button onClick={handleDrillBack} className="flex items-center gap-2 text-indigo-600 font-black text-sm bg-white/70 px-4 py-2.5 rounded-2xl border border-indigo-100 shadow-sm hover:bg-white active:scale-95 transition-all"><ChevronLeft className="w-4 h-4"/> Zurück zu {PHASES[store.drillPath[store.drillPath.length - 1].phase]?.label}</button>
                  )}
                  <div className="bg-white/60 border border-slate-100 rounded-2xl px-4 py-3 space-y-2">
                    {store.drillPath.map((step, i) => (
                      <div key={i} className="flex items-start gap-2"><span className="text-xs mt-0.5">{PHASES[step.phase]?.icon}</span><p className="text-[13px] font-semibold text-slate-600 leading-snug line-clamp-2 flex-1">{step.parentText}</p></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Control Bar */}
              <div className="flex justify-between items-center bg-white/80 p-3.5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div data-testid="session-code-display" className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-full font-mono font-black tracking-widest text-sm shadow-md">{store.sessionId}</div>
                  {store.isHost && <button data-testid="btn-toggle-blur" onClick={store.toggleBlur} className={`p-2.5 rounded-full transition-all ${store.session.isBlurred ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{store.session.isBlurred ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>}
                  {inDrill && !store.isHost && <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${phase.pill}`}>Moderiert</span>}
                </div>
                {store.isHost && <button onClick={exportCSV} className="text-slate-400 hover:text-indigo-600 p-2 bg-slate-50 rounded-xl"><Download className="w-4 h-4"/></button>}
              </div>

              {/* Phase Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black ${phase.pill}`}>
                {phase.icon} Phase {store.currentPhase}: {phase.label} <span className="opacity-40">·</span> <span className="opacity-70">{store.displayEntries.length} Einträge</span>
              </div>

              {/* Input Card */}
              <div className="bg-white p-5 rounded-[2rem] shadow-lg border border-white space-y-4">
                {store.currentPhase === 1 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} data-testid={`btn-category-${cat.id}`} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-black border-2 transition-all ${activeCategory === cat.id ? `${cat.color} border-current` : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}>{cat.icon} {cat.label}</button>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <textarea data-testid="entry-input" placeholder={store.currentPhase === 1 ? `Teile deine Gedanken zu "${activeCategory}"…` : `${phase.label}: Deine Antwort…`} className="w-full bg-slate-50 p-4 rounded-3xl text-sm min-h-[100px] focus:ring-4 focus:ring-indigo-100 border-none outline-none resize-none font-medium leading-relaxed" value={newEntry} onChange={e => setNewEntry(e.target.value)} />
                  <button data-testid="btn-submit-entry" onClick={handleAddEntry} disabled={!newEntry.trim()} className="absolute bottom-3 right-3 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl disabled:opacity-30 hover:bg-indigo-700 active:scale-90 transition-all"><Send className="w-4 h-4"/></button>
                </div>
              </div>

              {/* Board Feed */}
              <BoardView 
                entries={store.displayEntries} 
                currentPhase={store.currentPhase} 
                user={store.user} 
                session={store.session} 
                phase={phase} 
                toggleVote={store.toggleVote} 
                winnerId={winner?.id} 
                onDrill={store.isHost ? handleDrillInto : null} 
              />
            </div>
          )}
        </div>

        {/* ── Context Sidebar ── */}
        {store.session && (
          <div className="flex flex-col gap-4">
            {store.isHost && <AdminControlTower store={store} />}
            <ContextSidebar drillPath={store.drillPath} currentPhase={store.currentPhase} />
          </div>
        )}
      </main>


      {/* ── Status Bar ── */}
      {store.session && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[88%] max-w-xs bg-slate-900/95 backdrop-blur-xl text-white p-3.5 rounded-[2rem] flex justify-between items-center shadow-2xl z-50 border border-white/10">
          <div className="flex items-center gap-2 ml-1"><div className="relative"><div className="w-2 h-2 bg-green-400 rounded-full"/><div className="absolute inset-0 animate-ping w-2 h-2 bg-green-400 rounded-full opacity-75"/></div><span className="text-[10px] font-black uppercase tracking-widest opacity-80">Live</span></div>
          <div className="flex items-center gap-2">
            {inDrill && store.isHost && <button onClick={() => store.setDrillPhase(1, null, [])} className="text-[10px] font-black bg-indigo-500/40 hover:bg-indigo-500/60 px-3 py-2 rounded-full flex items-center gap-1 transition-all"><ChevronLeft className="w-3 h-3"/> 4L</button>}
            <button onClick={store.leaveSession} className="text-[10px] font-black bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full tracking-widest transition-all">BEENDEN</button>
          </div>
        </div>
      )}
    </div>
  );
}