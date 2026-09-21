import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

async function hashKey(key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useNotes(syncKey) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hashRef = useRef(null);
  const unsubRef = useRef(null);

  const setupListener = useCallback(async (key) => {
    if (!key) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const hashed = await hashKey(key);
      hashRef.current = hashed;
      const notesRef = collection(db, 'sync_data', hashed, 'notes');
      const q = query(notesRef, orderBy('updatedAt', 'desc'));

      if (unsubRef.current) unsubRef.current();

      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        }));
        setNotes(items);
        setLoading(false);
      }, (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      });

      unsubRef.current = unsub;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setupListener(syncKey);

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [syncKey, setupListener]);

  const createNote = useCallback(async (title = 'Ghi chú mới', content = '', folderId = null) => {
    if (!hashRef.current) return null;
    try {
      const notesRef = collection(db, 'sync_data', hashRef.current, 'notes');
      const docRef = await addDoc(notesRef, {
        title,
        content,
        folderId: folderId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const updateNote = useCallback(async (noteId, data) => {
    if (!hashRef.current) return false;
    try {
      const noteRef = doc(db, 'sync_data', hashRef.current, 'notes', noteId);
      await updateDoc(noteRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const deleteNote = useCallback(async (noteId) => {
    if (!hashRef.current) return;
    try {
      const noteRef = doc(db, 'sync_data', hashRef.current, 'notes', noteId);
      await deleteDoc(noteRef);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return { notes, loading, error, createNote, updateNote, deleteNote };
}
