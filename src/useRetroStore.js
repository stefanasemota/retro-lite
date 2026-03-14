/* global __initial_auth_token */
import { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
  signInAnonymously, onAuthStateChanged, signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, updateDoc,
  collection, addDoc, onSnapshot, serverTimestamp,
  increment, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { filterEntries, updateHistory, calculateCurrentPhase } from './logic';

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

// Ref Helpers
const sessionRef = (sid) => doc(db, 'artifacts', APP_ID, 'public', 'data', 'sessions', sid);
const entriesRef = (sid) => collection(db, 'artifacts', APP_ID, 'public', 'data', 'sessions', sid, 'entries');
const entryRef   = (sid, eid) => doc(db, 'artifacts', APP_ID, 'public', 'data', 'sessions', sid, 'entries', eid);

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
    if (!sessionId || sessionId.trim() === '' || view !== 'session' || !user) return;
    
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
  }, [user, sessionId]);

  // Derived State
  const currentPhase = session?.currentPhase || calculateCurrentPhase(session?.drillPath);
  const focusId      = session?.focusId ?? null;
  const drillPath    = session?.drillPath ?? [];
  const isHost       = session?.hostId === user?.uid;
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
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err) {
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
    const hasVoted = voters.includes(user.uid);
    try {
      await updateDoc(entryRef(sessionId, entryId), {
        votes:  increment(hasVoted ? -1 : 1),
        voters: hasVoted ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) { 
      console.error('[STORE] toggleVote failed:', err);
      setError('Fehler beim Abstimmen.'); 
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
      
      // Add to navigationHistory if drilling into a specific ID
      if (newFocusId && newPath.length > 0) {
        const lastStep = newPath[newPath.length - 1];
        const historyEntry = {
          id: lastStep.parentId,
          text: lastStep.parentText,
          phase: lastStep.phase,
          drillPath: newPath
        };
        
        updates.navigationHistory = updateHistory(session?.navigationHistory, historyEntry);
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
    await updateDoc(sessionRef(sessionId), updates);
  };

  const jumpToHistory = async (item) => {
    if (!isHost) return;
    await updateDoc(sessionRef(sessionId), {
      currentPhase: item.phase + 1,
      focusId: item.id,
      drillPath: item.drillPath
    });
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

  const clearError = () => setError(null);

  return {
    // State
    user, loading, error, clearError,
    sessionId, view, session, allEntries, displayEntries,
    currentPhase, focusId, drillPath, isHost,
    
    // Actions
    loginAdmin, logout, joinSession, createSession, leaveSession,
    addEntry, toggleVote, toggleBlur, setDrillPhase,
    setManualPhase, jumpToHistory, completeRetro
  };
}
