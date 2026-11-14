import { useCallback, useEffect, useRef, useState } from 'react';

const same = (a, b) => a.title === b.title && a.content === b.content;
const contentOf = note => ({ title: note?.title || 'Ghi chú mới', content: note?.content || '' });

function restore(note, key) {
    const remote = contentOf(note);
    try {
        const saved = key && JSON.parse(sessionStorage.getItem(key));
        if (saved?.draft && typeof saved.draft.title === 'string' && typeof saved.draft.content === 'string'
            && saved.base && typeof saved.base.title === 'string' && typeof saved.base.content === 'string') {
            if (same(saved.draft, remote)) return { draft: remote, base: remote, conflict: null };
            return { draft: saved.draft, base: saved.base, conflict: same(saved.base, remote) ? null : { remote } };
        }
    } catch { /* An unavailable/corrupt recovery entry must not prevent opening a note. */ }
    return { draft: remote, base: remote, conflict: null };
}

export function useNoteDraft(note, onUpdate, storageKey) {
    const initial = useRef(null);
    if (!initial.current) initial.current = restore(note, storageKey);
    const draftRef = useRef(initial.current.draft);
    const persistedRef = useRef(initial.current.base);
    const conflictRef = useRef(initial.current.conflict);
    const inFlightRef = useRef([]);
    const chainRef = useRef(Promise.resolve());
    const mountedRef = useRef(true);
    const ownerRef = useRef(null);
    if (!ownerRef.current) ownerRef.current = crypto.randomUUID();
    const [draft, setDraft] = useState(initial.current.draft);
    const [conflict, setConflict] = useState(initial.current.conflict);
    const [status, setStatus] = useState(initial.current.conflict ? 'conflict' : 'idle');
    const [revision, setRevision] = useState(0);
    const [recoveryError, setRecoveryError] = useState(false);

    const backup = useCallback(() => {
        if (!storageKey) return;
        try {
            // A slow save from an unmounted editor must not erase recovery data
            // written by a newly opened instance of the same note.
            if (!mountedRef.current) {
                const stored = JSON.parse(sessionStorage.getItem(storageKey));
                if (!stored || stored.owner !== ownerRef.current) return;
            }
            if (!conflictRef.current && same(draftRef.current, persistedRef.current)) sessionStorage.removeItem(storageKey);
            else sessionStorage.setItem(storageKey, JSON.stringify({ base: persistedRef.current, draft: draftRef.current, owner: ownerRef.current }));
            if (mountedRef.current) setRecoveryError(false);
        } catch {
            if (mountedRef.current) setRecoveryError(true);
        }
    }, [storageKey]);

    const markConflict = useCallback(remote => {
        conflictRef.current = { remote };
        backup();
        if (mountedRef.current) {
            setConflict({ remote });
            setStatus('conflict');
        }
    }, [backup]);

    const change = useCallback(next => {
        draftRef.current = next;
        backup();
        setDraft(next);
        setStatus(conflictRef.current ? 'conflict' : same(next, persistedRef.current) ? 'saved' : 'saving');
    }, [backup]);

    const save = useCallback(() => {
        const perform = async () => {
            if (!note?.id || conflictRef.current) return;
            const pending = { ...draftRef.current };
            if (same(pending, persistedRef.current)) {
                if (mountedRef.current) setStatus('saved');
                backup();
                return;
            }
            inFlightRef.current.push(pending);
            let result;
            try {
                result = await onUpdate(note.id, pending, { expected: { ...persistedRef.current } });
            } catch { result = false; }
            inFlightRef.current = inFlightRef.current.filter(item => item !== pending);
            if (result?.conflict) { markConflict(result.remote); return; }
            if (result === false) {
                if (mountedRef.current) setStatus('error');
                backup();
                return;
            }
            persistedRef.current = pending;
            backup();
            if (mountedRef.current && !conflictRef.current) setStatus(same(pending, draftRef.current) ? 'saved' : 'saving');
        };
        chainRef.current = chainRef.current.then(perform, perform);
        return chainRef.current;
    }, [note?.id, onUpdate, backup, markConflict]);

    useEffect(() => {
        mountedRef.current = true;
        backup();
        return () => {
            mountedRef.current = false;
            // save closes over this note's original workspace callback.
            // Conflicts stay in sessionStorage and must never flush over remote data.
            void save();
        };
    }, [save, backup]);

    useEffect(() => {
        const incoming = contentOf(note);
        if (same(incoming, persistedRef.current)) return;
        if (inFlightRef.current.some(item => same(item, incoming))) return;
        if (same(incoming, draftRef.current)) {
            persistedRef.current = incoming;
            conflictRef.current = null;
            setConflict(null);
            setStatus('saved');
            backup();
            return;
        }
        if (conflictRef.current || !same(draftRef.current, persistedRef.current)) {
            markConflict(incoming);
            return;
        }
        persistedRef.current = incoming;
        draftRef.current = incoming;
        setDraft(incoming);
        setRevision(value => value + 1);
        setStatus('saved');
        backup();
    }, [note?.id, note?.title, note?.content, backup, markConflict]);

    useEffect(() => {
        if (conflict || same(draft, persistedRef.current)) return undefined;
        const timer = setTimeout(() => { void save(); }, 450);
        return () => clearTimeout(timer);
    }, [draft, conflict, save]);

    const useRemote = useCallback(() => {
        const remote = conflictRef.current?.remote;
        if (!remote) return;
        persistedRef.current = remote;
        draftRef.current = remote;
        conflictRef.current = null;
        setConflict(null);
        setDraft(remote);
        setRevision(value => value + 1);
        setStatus('saved');
        backup();
    }, [backup]);

    const keepLocal = useCallback(() => {
        const remote = conflictRef.current?.remote;
        if (!remote) return;
        persistedRef.current = remote;
        conflictRef.current = null;
        setConflict(null);
        setStatus('saving');
        backup();
        void save();
    }, [backup, save]);

    return { ...draft, status, revision, conflict, recoveryError, change, useRemote, keepLocal, retry: save };
}
