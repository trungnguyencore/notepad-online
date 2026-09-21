import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../lib/firebase';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

async function hashKey(key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function useFolders(syncKey) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hashRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (!syncKey) {
      setFolders([]);
      setLoading(false);
      hashRef.current = null;
      return undefined;
    }

    const connect = async () => {
      try {
        const hashed = await hashKey(syncKey);
        if (cancelled) return;
        hashRef.current = hashed;
        const foldersRef = collection(db, 'sync_data', hashed, 'folders');
        const q = query(foldersRef, orderBy('createdAt', 'asc'));

        if (unsubRef.current) unsubRef.current();
        unsubRef.current = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map(folderDoc => ({
            id: folderDoc.id,
            ...folderDoc.data(),
            createdAt: folderDoc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: folderDoc.data().updatedAt?.toDate?.() || new Date(),
          }));
          setFolders(items);
          setLoading(false);
        }, (err) => {
          console.error('Firestore folder error:', err);
          setError(err.message);
          setLoading(false);
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [syncKey]);

  const createFolder = useCallback(async (name) => {
    const trimmed = String(name || '').trim();
    if (!hashRef.current || !trimmed) return null;
    try {
      const foldersRef = collection(db, 'sync_data', hashRef.current, 'folders');
      const folderRef = await addDoc(foldersRef, {
        name: trimmed.slice(0, 60),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return folderRef.id;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const renameFolder = useCallback(async (folderId, name) => {
    const trimmed = String(name || '').trim();
    if (!hashRef.current || !folderId || !trimmed) return false;
    try {
      const folderRef = doc(db, 'sync_data', hashRef.current, 'folders', folderId);
      await updateDoc(folderRef, {
        name: trimmed.slice(0, 60),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  return { folders, loading, error, createFolder, renameFolder };
}
