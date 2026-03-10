import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  Plus,
  LogOut,
  Download,
  Users,
  Send,
  ShieldCheck,
  ClipboardList,
  ThumbsUp,
  Eye,
  EyeOff,
  AlertCircle,
  Trophy
} from 'lucide-react';

// --- Firebase Configuration ---
// Hinweis: Wenn du dies lokal ausführst, ersetze __firebase_config durch dein Objekt aus der Firebase Console
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'retro-lite';

const CATEGORIES = [
  { id: 'liked', label: 'Liked', color: 'bg-green-100 border-green-200 text-green-800', icon: '😊' },
  { id: 'learned', label: 'Learned', color: 'bg-blue-100 border-blue-200 text-blue-800', icon: '💡' },
  { id: 'lacked', label: 'Lacked', color: 'bg-orange-100 border-orange-200 text-orange-800', icon: '📉' },
  { id: 'longed', label: 'Longed For', color: 'bg-purple-100 border-purple-200 text-purple-800', icon: '🔭' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [activeCategory, setActiveCategory] = useState('liked');
  const [view, setView] = useState('landing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !sessionId || view !== 'session') return;

    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
    const entriesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId, 'entries');

    const unsubSession = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) setCurrentSession(doc.data());
      else setView('landing');
    }, (err) => setError("Verbindung zur Session verloren."));

    const unsubEntries = onSnapshot(entriesRef, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sortieren nach Stimmen (höchste zuerst)
      setEntries(docs.sort((a, b) => (b.votes || 0) - (a.votes || 0)));
    }, (err) => setError("Fehler beim Laden der Einträge."));

    return () => { unsubSession(); unsubEntries(); };
  }, [user, sessionId, view]);

  const loginAdmin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Login fehlgeschlagen. Stelle sicher, dass die Domain in Firebase erlaubt ist.");
    }
  };

  const createSession = async () => {
    if (!user) return;
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionData = {
      id: newId,
      hostId: user.uid,
      createdAt: serverTimestamp(),
      isBlurred: true,
      title: `LST Retro ${new Date().toLocaleDateString()}`
    };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', newId), sessionData);
    setSessionId(newId);
    setView('session');
  };

  const joinSession = async (idToJoin) => {
    const cleanId = idToJoin.toUpperCase().trim();
    if (!cleanId) return;
    if (!user) await signInAnonymously(auth);

    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', cleanId);
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      setSessionId(cleanId);
      setView('session');
    } else {
      setError("Session-ID nicht gefunden!");
    }
  };

  const addEntry = async () => {
    if (!newEntry.trim()) return;
    const entriesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId, 'entries');
    await addDoc(entriesRef, {
      text: newEntry,
      category: activeCategory,
      userId: user.uid,
      timestamp: serverTimestamp(),
      votes: 0,
      voters: []
    });
    setNewEntry('');
  };

  const toggleVote = async (entryId, voters = []) => {
    if (!user) return;
    const entryRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId, 'entries', entryId);
    const hasVoted = voters.includes(user.uid);

    await updateDoc(entryRef, {
      votes: increment(hasVoted ? -1 : 1),
      voters: hasVoted ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  const toggleBlur = async () => {
    if (currentSession?.hostId !== user.uid) return;
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
    await updateDoc(sessionRef, { isBlurred: !currentSession.isBlurred });
  };

  const exportCSV = () => {
    const headers = "Category,Text,Votes\n";
    const csvContent = entries.map(e => `"${e.category}","${e.text.replace(/"/g, '""')}",${e.votes || 0}`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LST_Retro_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold">LST Engine startet...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 pb-20">
      {/* App Header */}
      <header className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
            <ClipboardList className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-none">Retro-Lite</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">LST Professional</p>
          </div>
        </div>
        {user && !user.isAnonymous && (
          <button onClick={() => auth.signOut()} className="bg-slate-100 p-2.5 rounded-xl text-slate-500 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="max-w-md mx-auto p-4 pt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {view === 'landing' ? (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-tight">Teams befähigen. <br /><span className="text-indigo-600 underline decoration-indigo-200">Insights sammeln.</span></h2>
              <p className="text-slate-500 font-medium px-6">Die schlanke Alternative für deine LST Retrospektiven.</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session beitreten</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CODE"
                    className="flex-1 px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 uppercase font-mono text-center text-2xl tracking-[0.3em] transition-all"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                  />
                  <button
                    onClick={() => joinSession(sessionId)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                  >
                    GO
                  </button>
                </div>
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span className="bg-slate-50 px-4">Scrum Master Area</span></div>
            </div>

            {user && !user.isAnonymous ? (
              <button
                onClick={createSession}
                className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-5 rounded-[2.5rem] font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-50"
              >
                <Plus className="w-6 h-6" /> Neue Session hosten
              </button>
            ) : (
              <button
                onClick={loginAdmin}
                className="w-full bg-slate-900 text-white py-5 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <ShieldCheck className="w-6 h-6 text-indigo-400" /> Admin Login
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full font-mono font-black tracking-widest text-sm shadow-md">
                  {sessionId}
                </div>
                {currentSession?.hostId === user?.uid && (
                  <button
                    onClick={toggleBlur}
                    className={`p-2.5 rounded-full transition-all ${currentSession.isBlurred ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {currentSession.isBlurred ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
              {currentSession?.hostId === user?.uid && (
                <button onClick={exportCSV} className="text-slate-400 hover:text-indigo-600 p-2 bg-slate-50 rounded-xl">
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Input Section */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-white space-y-5">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all active:scale-95 ${activeCategory === cat.id ? `${cat.color} border-current` : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                      }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea
                  placeholder={`Teile deine Gedanken zu "${activeCategory}"...`}
                  className="w-full bg-slate-50 p-5 rounded-3xl text-sm min-h-[120px] focus:ring-4 focus:ring-indigo-100 border-none outline-none transition-all resize-none font-medium leading-relaxed"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                />
                <button
                  onClick={addEntry}
                  disabled={!newEntry.trim()}
                  className="absolute bottom-4 right-4 bg-indigo-600 text-white p-3.5 rounded-2xl shadow-xl disabled:opacity-30 disabled:shadow-none transition-all hover:bg-indigo-700 active:scale-90"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Board Feed */}
            <div className="space-y-12 mt-10">
              {CATEGORIES.map(cat => {
                const catEntries = entries.filter(e => e.category === cat.id);
                return (
                  <div key={cat.id} className="space-y-5">
                    <div className="flex items-center justify-between px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl drop-shadow-sm">{cat.icon}</span>
                        <h3 className="font-black text-slate-800 uppercase tracking-[0.15em] text-[11px]">{cat.label}</h3>
                      </div>
                      <span className="bg-white border border-slate-100 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                        {catEntries.length}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {catEntries.map((entry, idx) => (
                        <div
                          key={entry.id}
                          className={`group p-5 rounded-[2rem] border border-white shadow-sm bg-white transition-all hover:shadow-md relative overflow-hidden ${currentSession.isBlurred && entry.userId !== user.uid ? 'blur-md select-none opacity-40' : ''
                            }`}
                        >
                          {idx === 0 && entry.votes > 0 && (
                            <div className="absolute -top-1 -right-1 p-2 bg-amber-400 text-white rounded-bl-2xl shadow-sm">
                              <Trophy className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-slate-700 text-[15px] leading-relaxed font-semibold pr-2">{entry.text}</p>
                            <button
                              onClick={() => toggleVote(entry.id, entry.voters)}
                              className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl transition-all active:scale-75 ${entry.voters?.includes(user?.uid)
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                  : 'bg-slate-50 text-slate-300 hover:text-indigo-400'
                                }`}
                            >
                              <ThumbsUp className={`w-4 h-4 ${entry.voters?.includes(user?.uid) ? 'fill-current' : ''}`} />
                              <span className="text-[10px] font-black tracking-tighter">{entry.votes || 0}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {catEntries.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] bg-white/30">
                          Keine Karten hier
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Persistent Status Bar */}
      {view === 'session' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-xs bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-[2rem] flex justify-between items-center shadow-2xl z-50 border border-white/10 ring-1 ring-white/10">
          <div className="flex items-center gap-3 ml-2">
            <div className="relative">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Live Sync</span>
          </div>
          <button
            onClick={() => setView('landing')}
            className="text-[10px] font-black bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-colors tracking-widest"
          >
            BEENDEN
          </button>
        </div>
      )}
    </div>
  );
}