/* global __initial_auth_token */
import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
  signInAnonymously, onAuthStateChanged, signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, updateDoc,
  collection, addDoc, onSnapshot, serverTimestamp,
  increment, arrayUnion, arrayRemove,
  query, where, orderBy, getDocs, deleteDoc,
} from 'firebase/firestore';
import {
  filterEntries, updateHistory, calculateCurrentPhase,
  buildCSVContent, buildNavigationHistoryUpdate,
} from './logic';

// ── Firebase Init ────────────────────────────────────────────────────────────
let app, auth, db;
try {
  const cfg = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };
  if (cfg.apiKey) console.log('%c[Retro-Lite] Frankfurt Init', 'background:#ea580c;color:#fff;padding:2px 8px;border-radius:4px', cfg.projectId);
  app  = initializeApp(cfg);
  auth = getAuth(app);
  db   = getFirestore(app);
} catch (e) {
  console.error('Firebase init failed', e);
}

const APP_ID = import.meta.env.VITE_APP_ID || 'retro-lite-prod';

// ── Access Control ───────────────────────────────────────────────────────────
// Only this Google account may act as session host / admin.
const ADMIN_EMAIL = 'stephan.asemota@gmail.com';

// Ref Helpers
const sessionRef = (sid) => doc(db, 'artifacts', APP_ID, 'public', 'data', 'sessions', sid);
const entriesRef = (sid) => collection(db, 'artifacts', APP_ID, 'public', 'data', 'sessions', sid, 'entries');
const entryRef   = (sid, eid) => doc(db, 'artifacts', APP_ID, 'public', 'data', 'sessions', sid, 'entries', eid);

/**
 * Standalone helper – exported so unit tests can import it directly.
 * Deletes a session document from Firestore.
 * Guards: only the admin email may call this in production; the guard is
 * omitted here so tests can mock deleteDoc freely.
 */
export async function deleteSession(sid) {
  await deleteDoc(doc(db, 'artifacts', (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_ID) || 'retro-lite-prod', 'public', 'data', 'sessions', sid));
}

/**
 * Custom Hook for Retro-Lite Firebase Logic
 */
export function useRetroStore() {
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sessionId, setSessionId]   = useState('');
  const [view, setView]             = useState('landing'); // 'landing' | 'session'
  const [session, setSession]       = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [error, setError]           = useState(null);
  const [history, setHistory]       = useState([]);

  // In-flight lock: prevents double-click race on toggleVote.
  // Using a ref (not state) so the Set mutation never triggers a re-render.
  const votingInFlightRef = useRef(new Set());

  // Auth Init
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testMode = params.get('testMode') === 'true';

    if (testMode) {
      const role = params.get('role') || 'admin';
      const isStephan = role === 'admin';
      console.log(`%c[Retro-Lite] BDD Test Mode Active: ${role}`, 'background:#4338ca;color:#fff;padding:2px 8px;border-radius:4px');
      
      const initTest = async () => {
        try {
          // In Local Development/Testing, we want to perform real auth if possible
          if (auth && !import.meta.env.PROD) {
            const cred = await signInAnonymously(auth);
            setUser({ 
              uid: cred.user.uid,
              email: isStephan ? 'stephan.admin@lst.de' : 'michael.part@lst.de', 
              displayName: isStephan ? 'Stephan Admin' : 'Michael Participant', 
              isAnonymous: false 
            });
          } else {
            // Fallback for mock behavior
            setUser({ 
              uid: isStephan ? 'test-admin' : 'test-participant', 
              email: isStephan ? 'stephan.admin@lst.de' : 'michael.part@lst.de', 
              displayName: isStephan ? 'Stephan Admin' : 'Michael Participant', 
              isAnonymous: false 
            });
          }
        } catch (e) {
          console.warn('[STORE] BDD Auth failed, using mock state:', e.message);
          setUser({ 
            uid: isStephan ? 'test-admin' : 'test-participant', 
            email: isStephan ? 'stephan.admin@lst.de' : 'michael.part@lst.de', 
            displayName: isStephan ? 'Stephan Admin' : 'Michael Participant', 
            isAnonymous: false 
          });
        } finally {
          setLoading(false);
          console.log('[STORE] BDD Test Init complete, loading off');
        }
      };
      initTest();
      return;
    }

    const init = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token)
             await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch (e) { console.error('Auth init:', e); }
    };
    init();
    return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
  }, []);

  // Real-time Listeners
  useEffect(() => {
    if (!sessionId || sessionId.trim() === '' || view === 'landing' || !user) return;
    
    const unsubSession = onSnapshot(sessionRef(sessionId), snap => {
      if (snap.exists()) {
        setSession(snap.data());
      } else { 
        setSessionId(''); 
        setSession(null); 
      }
    }, (err) => {
      console.error(`[STORE] Session error: ${err.message}`);
      setError('Verbindung zur Session verloren.');
    });

    const unsubEntries = onSnapshot(entriesRef(sessionId), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllEntries(docs);
    }, () => setError('Fehler beim Laden der Einträge.'));

    return () => { 
      console.log('[STORE] Stopping listeners for:', sessionId);
      unsubSession(); 
      unsubEntries(); 
    };
  }, [user, sessionId, view]);

  // Derived State
  const currentPhase = session?.currentPhase || calculateCurrentPhase(session?.drillPath);
  const focusId      = session?.focusId ?? null;
  const drillPath    = session?.drillPath ?? [];
  // isHost requires BOTH matching hostId AND the verified admin email.
  // Defense-in-depth: even if a UID somehow matched, wrong email = no host powers.
  const isHost       = session?.hostId === user?.uid && user?.email === ADMIN_EMAIL;
  const isCompleted  = session?.isCompleted ?? false;
  
  // Logic to determine view based on session state
  useEffect(() => {
    if (isCompleted && view === 'session') {
      setView('summary');
    }
  }, [isCompleted, view]);
  
  // Math: Filter entries for current view
  const displayEntries = useMemo(() =>
    filterEntries(allEntries, focusId).sort((a, b) => (b.votes || 0) - (a.votes || 0)),
    [allEntries, focusId]
  );

  // Actions
  const loginAdmin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      // Hard gate: only the designated admin account may log in.
      if (result.user.email !== ADMIN_EMAIL) {
        await auth.signOut();
        setError(`❌ Zugriff verweigert: Nur der autorisierte Admin darf Sessions erstellen.\n(Eingeloggt als: ${result.user.email})`);
      }
    } catch (err) {
      if (err.code === 'auth/unauthorized-domain') {
        const pid = app?.options?.projectId ?? APP_ID;
        setError(`❌ Domain nicht erlaubt.\nhttps://console.firebase.google.com/project/${pid}/authentication/settings\n→ Add domain → localhost`);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(`Login fehlgeschlagen [${err.code}]: ${err.message}`);
      }
    }
  };

  const logout = () => auth.signOut();

  const joinSession = async (idToJoin) => {
    const cleanId = idToJoin.toUpperCase().trim();
    if (!cleanId) return;
    try {
      const snap = await getDoc(sessionRef(cleanId));
      if (snap.exists()) {
        setSessionId(cleanId);
        setView('session');
      }
      else setError('Session-ID nicht gefunden!');
    } catch { setError('Fehler beim Beitritt.'); }
  };

  const createSession = async (sessionName) => {
    if (!user || user.isAnonymous) {
      throw new Error('Nur Admins können Sessions erstellen.');
    }
    if (!sessionName.trim()) throw new Error('Bitte einen Session-Namen eingeben.');
    if (!db) throw new Error('Firestore ist nicht initialisiert.');
    
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await setDoc(sessionRef(newId), {
        id:           newId,
        sessionName:  sessionName.trim(),
        hostId:       user.uid,
        createdAt:    serverTimestamp(),
        isBlurred:    true,
        currentPhase: 1,
        focusId:      null,
        drillPath:    [],
        navigationHistory: [],
        sessionActionItems: [],
      });
      setSessionId(newId);
      setView('session');
    } catch (err) {
      console.error(`[STORE] Firestore write FAILED: ${err.message}`);
      throw err;
    }
  };

  const leaveSession = () => {
    setSessionId('');
    setView('landing');
    setSession(null);
    setAllEntries([]);
  };

  const addEntry = async (text, category) => {
    if (!text.trim() || !user || !sessionId) return;

    try {
      await addDoc(entriesRef(sessionId), {
        text:      text.trim(),
        category,
        userId:    user.uid,
        timestamp: serverTimestamp(),
        votes:     0,
        voters:    [],
        parentId:  focusId,
        phase:     currentPhase,
      });
    } catch (err) { 
      console.error('[STORE] addDoc failed:', err);
      setError(`Fehler beim Hinzufügen: ${err.message}`); 
    }
  };

  const toggleVote = async (entryId, voters = []) => {
    if (!user) return;
    // In-flight lock: bail if a write for this entry is already in progress.
    // Prevents the double-click race where votes increments twice but voters
    // only union'd once (Firestore atomic ops don't help with stale closure reads).
    if (votingInFlightRef.current.has(entryId)) return;
    votingInFlightRef.current.add(entryId);
    const hasVoted = voters.includes(user.uid);
    try {
      await updateDoc(entryRef(sessionId, entryId), {
        votes:  increment(hasVoted ? -1 : 1),
        voters: hasVoted ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) { 
      console.error('[STORE] toggleVote failed:', err);
      setError('Fehler beim Abstimmen.'); 
    } finally {
      votingInFlightRef.current.delete(entryId);
    }
  };

  const toggleBlur = async () => {
    if (!isHost) return;
    const nextBlur = !session.isBlurred;
    try {
      await updateDoc(sessionRef(sessionId), { isBlurred: nextBlur });
    } catch (err) { 
      console.error('[STORE] toggleBlur failed:', err);
      setError('Fehler beim Ändern des Blurs.'); 
    }
  };

  const setDrillPhase = async (nextPhase, newFocusId, newPath) => {
    if (!isHost) return;
    try {
      const updates = {
        currentPhase: nextPhase,
        focusId: newFocusId,
        drillPath: newPath
      };
      
      // Add to navigationHistory if drilling into a specific ID (pure helper)
      const updatedHistory = buildNavigationHistoryUpdate(session?.navigationHistory, newFocusId, newPath);
      if (updatedHistory !== null) {
        updates.navigationHistory = updatedHistory;
      }

      await updateDoc(sessionRef(sessionId), updates);
    } catch (err) { 
      console.error('[STORE] setDrillPhase failed:', err);
      setError(`Sync-Fehler: ${err.message}`); 
    }
  };

  const setManualPhase = async (phaseNum) => {
    if (!isHost) return;
    const updates = { currentPhase: phaseNum };
    if (phaseNum === 1) {
      updates.focusId = null;
      updates.drillPath = [];
    }
    try {
      await updateDoc(sessionRef(sessionId), updates);
    } catch (err) {
      console.error('[STORE] setManualPhase failed:', err);
      setError(`Sync-Fehler: ${err.message}`);
    }
  };

  const jumpToHistory = async (item) => {
    if (!isHost) return;
    try {
      await updateDoc(sessionRef(sessionId), {
        currentPhase: item.phase + 1,
        focusId: item.id,
        drillPath: item.drillPath
      });
    } catch (err) {
      console.error('[STORE] jumpToHistory failed:', err);
      setError(`Sync-Fehler: ${err.message}`);
    }
  };

  const completeRetro = async () => {
    if (!isHost) return;
    try {
      await updateDoc(sessionRef(sessionId), { isCompleted: true });
      setView('summary');
    } catch (err) {
      console.error('[STORE] completeRetro failed:', err);
      setError('Fehler beim Abschließen der Retro.');
    }
  };

  const saveActionItemAndReset = async (item) => {
    if (!isHost) return;
    try {
      await updateDoc(sessionRef(sessionId), {
        sessionActionItems: arrayUnion(item),
        currentPhase: 1,
        focusId: null,
        drillPath: []
      });
    } catch (err) {
      console.error('[STORE] saveActionItemAndReset failed:', err);
      setError(`Sync-Fehler: ${err.message}`);
    }
  };

  const updateActionItem = async (itemId, updates) => {
    if (!isHost) return;
    const items = session?.sessionActionItems || [];
    const newItems = items.map(i => i.id === itemId ? { ...i, ...updates } : i);
    try {
      await updateDoc(sessionRef(sessionId), { sessionActionItems: newItems });
    } catch (err) {
      console.error('[STORE] updateActionItem failed:', err);
      setError(`Sync-Fehler: ${err.message}`);
    }
  };

  const exportActionsToCSV = () => {
    const actions = session?.sessionActionItems || [];
    // buildCSVContent returns null for empty arrays — no DOM work needed
    const csvContent = buildCSVContent(actions);
    if (!csvContent) return;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Retro_Actions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * fetchRetroHistory — loads all completed sessions ordered newest first.
   * NOTE: requires a Firestore composite index on (isCompleted ASC, createdAt DESC).
   * If missing, Firestore will log the creation URL in the browser console.
   */
  const fetchRetroHistory = async () => {
    if (!db || !user) return;
    try {
      const sessionsCol = collection(db, 'artifacts', APP_ID, 'public', 'data', 'sessions');
      const q = query(
        sessionsCol,
        where('isCompleted', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('[retro-Lite] fetchRetroHistory failed:', err);
      setError('Fehler beim Laden der Session-Historie.');
    }
  };

  const deleteSession = async (sid) => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    // Optimistic update: remove from UI immediately
    setHistory(prev => prev.filter(s => s.id !== sid));
    try {
      await deleteDoc(sessionRef(sid));
      toast.success('Retro-Session erfolgreich gelöscht! 🗑️');
    } catch (err) {
      console.error('[retro-Lite] deleteSession failed:', err);
      toast.error(`Fehler beim Löschen: ${err.message}`);
      setError(`Sync-Fehler beim Löschen: ${err.message}`);
      // Rollback: re-fetch the real list from Firestore
      fetchRetroHistory();
    }
  };

  const viewSession = (sid) => {
    setSessionId(sid);
    setView('summary');
  };

  const clearError = () => setError(null);

  return {
    // State
    user, loading, error, clearError,
    sessionId, view, session, allEntries, displayEntries,
    currentPhase, focusId, drillPath, isHost,
    history,

    // Actions
    loginAdmin, logout, joinSession, createSession, leaveSession,
    addEntry, toggleVote, toggleBlur, setDrillPhase,
    setManualPhase, jumpToHistory, completeRetro,
    saveActionItemAndReset, updateActionItem, exportActionsToCSV,
    fetchRetroHistory, deleteSession, viewSession,
  };
}
