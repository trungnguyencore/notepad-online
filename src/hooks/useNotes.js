import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../lib/firebase';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  serverTimestamp, query, orderBy, runTransaction,
} from 'firebase/firestore';

async function hashKey(key) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export function useNotes(syncKey) {
  // Every callback closes over one workspace. Old editor cleanup must never
  // resolve its destination using the newly selected workspace's hash.
  const workspace = useMemo(() => ({ key: syncKey, hash: null }), [syncKey]);
  const [state, setState] = useState({ workspace, notes: [], loading: true, error: null });
  const fail = useCallback((err) => {
    setState(current => current.workspace === workspace ? { ...current, error: err.message } : current);
  }, [workspace]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe;
    setState({ workspace, notes: [], loading: Boolean(syncKey), error: null });
    if (!syncKey) return undefined;

    const connect = async () => {
      try {
        const hashed = await hashKey(syncKey);
        if (cancelled) return;
        workspace.hash = hashed;
        const ref = query(collection(db, 'sync_data', hashed, 'notes'), orderBy('updatedAt', 'desc'));
        unsubscribe = onSnapshot(ref, snapshot => {
          if (cancelled) return;
          const notes = snapshot.docs.map(item => {
            const data = item.data();
            return {
              ...data, id: item.id, pinned: Boolean(data.pinned),
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
              lastOpenedAt: data.lastOpenedAt?.toDate?.() || null,
            };
          });
          setState(current => current.workspace === workspace ? { ...current, notes, loading: false, error: null } : current);
        }, err => {
          if (cancelled) return;
          setState(current => current.workspace === workspace ? { ...current, error: err.message, loading: false } : current);
        });
      } catch (err) {
        if (!cancelled) setState(current => current.workspace === workspace ? { ...current, error: err.message, loading: false } : current);
      }
    };
    void connect();
    return () => { cancelled = true; unsubscribe?.(); };
  }, [syncKey, workspace]);

  const createNote = useCallback(async (title = 'Ghi chú mới', content = '', folderId = null) => {
    if (!workspace.hash) return null;
    try {
      const result = await addDoc(collection(db, 'sync_data', workspace.hash, 'notes'), {
        title, content, folderId: folderId || null, pinned: false,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastOpenedAt: serverTimestamp(),
      });
      return result.id;
    } catch (err) { fail(err); return null; }
  }, [workspace, fail]);

  const updateNote = useCallback(async (noteId, data, options = {}) => {
    if (!workspace.hash) return false;
    const ref = doc(db, 'sync_data', workspace.hash, 'notes', noteId);
    try {
      if (options.expected) {
        // Compare only title/content: pin, folder moves and timestamps must not
        // cause false conflicts or get overwritten by an editor save.
        return await runTransaction(db, async transaction => {
          const snapshot = await transaction.get(ref);
          if (!snapshot.exists()) return { conflict: true, remote: null };
          const current = snapshot.data();
          const remote = { title: current.title || 'Ghi chú mới', content: current.content || '' };
          if (remote.title !== options.expected.title || remote.content !== options.expected.content) {
            return { conflict: true, remote };
          }
          transaction.update(ref, { ...data, updatedAt: serverTimestamp() });
          return true;
        });
      }
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      return true;
    } catch (err) { fail(err); return false; }
  }, [workspace, fail]);

  const setPinned = useCallback(async (noteId, pinned) => {
    if (!workspace.hash) return false;
    try {
      await updateDoc(doc(db, 'sync_data', workspace.hash, 'notes', noteId), { pinned: Boolean(pinned) });
      return true;
    } catch (err) { fail(err); return false; }
  }, [workspace, fail]);

  const touchNoteOpened = useCallback(async noteId => {
    if (!workspace.hash) return false;
    try {
      await updateDoc(doc(db, 'sync_data', workspace.hash, 'notes', noteId), { lastOpenedAt: serverTimestamp() });
      return true;
    } catch (err) { fail(err); return false; }
  }, [workspace, fail]);

  const deleteNote = useCallback(async noteId => {
    if (!workspace.hash) return false;
    try {
      await deleteDoc(doc(db, 'sync_data', workspace.hash, 'notes', noteId));
      return true;
    } catch (err) { fail(err); return false; }
  }, [workspace, fail]);

  // Hide the previous workspace synchronously, before the new effect runs.
  const visible = state.workspace === workspace ? state : { notes: [], loading: Boolean(syncKey), error: null };
  return { ...visible, workspaceId: workspace.hash, createNote, updateNote, setPinned, touchNoteOpened, deleteNote };
}
