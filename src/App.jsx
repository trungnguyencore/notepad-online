import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import EmptyState from './components/EmptyState';
import NoteEditor from './components/NoteEditor';
import NoteList from './components/NoteList';
import SyncKeyModal from './components/SyncKeyModal';
import ThemeToggle from './components/ThemeToggle';
import ConfirmDialog from './components/ConfirmDialog';

const SYNC_KEY_STORAGE = 'notepad-sync-key';

export default function App() {
    const [syncKey, setSyncKey] = useState(() => localStorage.getItem(SYNC_KEY_STORAGE) || '');
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [showSyncModal, setShowSyncModal] = useState(!syncKey);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);

    const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes(syncKey);
    const { darkMode, toggleTheme } = useTheme();

    useEffect(() => {
        if (!syncKey) {
            setSelectedNoteId(null);
            setShowSyncModal(true);
        }
    }, [syncKey]);

    useEffect(() => {
        const media = window.matchMedia('(min-width: 1024px)');
        const updateViewport = () => setIsDesktop(media.matches);
        updateViewport();
        media.addEventListener('change', updateViewport);
        return () => media.removeEventListener('change', updateViewport);
    }, []);

    useEffect(() => {
        if (!notes.length) {
            setSelectedNoteId(null);
            return;
        }

        const selectionExists = selectedNoteId && notes.some(note => note.id === selectedNoteId);
        if (selectedNoteId && !selectionExists) {
            setSelectedNoteId(null);
            return;
        }

        if (isDesktop && !selectedNoteId) {
            setSelectedNoteId(notes[0].id);
        }
    }, [notes, selectedNoteId, isDesktop]);

    const handleCreateNote = useCallback(async () => {
        const newId = await createNote();
        if (newId) setSelectedNoteId(newId);
    }, [createNote]);

    const handleDeleteNote = useCallback((noteId) => {
        setPendingDeleteId(noteId);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!pendingDeleteId) return;
        const noteId = pendingDeleteId;
        setPendingDeleteId(null);
        await deleteNote(noteId);
        if (selectedNoteId === noteId) setSelectedNoteId(null);
    }, [deleteNote, pendingDeleteId, selectedNoteId]);

    const handleCancelDelete = useCallback(() => setPendingDeleteId(null), []);

    const handleSubmitSyncKey = useCallback((key) => {
        const trimmed = key.trim();
        if (!trimmed) return;
        localStorage.setItem(SYNC_KEY_STORAGE, trimmed);
        setSyncKey(trimmed);
        setShowSyncModal(false);
    }, []);

    const handleOpenSyncModal = useCallback(() => setShowSyncModal(true), []);
    const handleCloseSyncModal = useCallback(() => setShowSyncModal(false), []);

    const selectedNote = notes.find(note => note.id === selectedNoteId) || null;
    const pendingDeleteNote = notes.find(note => note.id === pendingDeleteId) || null;
    const maskedKey = useMemo(() => {
        if (!syncKey) return '';
        if (syncKey.length <= 6) return `${syncKey.slice(0, 2)}***`;
        return `${syncKey.slice(0, 3)}***${syncKey.slice(-2)}`;
    }, [syncKey]);

    return (
        <div className="min-h-screen bg-apple-bg-primary text-apple-text-primary">
            <div className="min-h-screen bg-gradient-to-b from-apple-bg-primary via-apple-bg-primary to-apple-bg-secondary">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-[var(--safe-area-top)] pb-[var(--safe-area-bottom)]">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-apple-accent text-black flex items-center justify-center shadow-sm">
                                <span className="text-[15px] font-semibold">N</span>
                            </div>
                            <div>
                                <h1 className="text-[18px] font-semibold">Notepad Online</h1>
                                <p className="text-note-caption text-apple-text-secondary">
                                    {syncKey ? `Sync Key: ${maskedKey}` : 'Chưa có Sync Key'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleOpenSyncModal}
                                className="flex min-h-11 items-center gap-2 px-4 py-2 rounded-full bg-apple-bg-secondary text-note-caption text-apple-text-primary hover:bg-apple-bg-tertiary active:scale-95 transition"
                            >
                                <KeyRound size={16} />
                                Sync Key
                            </button>
                            <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
                        </div>
                    </header>

                    {error && (
                        <div className="mb-4 rounded-xl border border-apple-danger bg-apple-bg-tertiary text-apple-danger px-4 py-3 text-note-caption">
                            {error}
                        </div>
                    )}

                    <main className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
                        <aside className={`${selectedNoteId ? 'hidden lg:block' : 'block'} h-[calc(100dvh-180px)] min-h-[420px] bg-apple-bg-secondary rounded-2xl p-3 shadow-sm lg:h-auto lg:min-h-0`}>
                            <NoteList
                                notes={notes}
                                loading={loading}
                                selectedId={selectedNoteId}
                                onSelect={setSelectedNoteId}
                                onCreate={handleCreateNote}
                                onDelete={handleDeleteNote}
                            />
                        </aside>
                        <section className={`${selectedNoteId ? 'block' : 'hidden lg:block'} h-[calc(100dvh-180px)] min-h-[420px] bg-apple-bg-secondary rounded-2xl p-4 shadow-sm lg:h-auto lg:min-h-[60vh]`}>
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-note-caption text-apple-text-secondary">
                                    Đang đồng bộ...
                                </div>
                            ) : notes.length === 0 ? (
                                <EmptyState onCreate={handleCreateNote} />
                            ) : (
                                <NoteEditor
                                    note={selectedNote}
                                    onUpdate={updateNote}
                                    onDelete={handleDeleteNote}
                                    onBack={() => setSelectedNoteId(null)}
                                />
                            )}
                        </section>
                    </main>
                </div>
            </div>

            <SyncKeyModal
                open={showSyncModal}
                initialValue={syncKey}
                onSubmit={handleSubmitSyncKey}
                onClose={handleCloseSyncModal}
                canClose={Boolean(syncKey)}
                noteCount={notes.length}
            />

            <ConfirmDialog
                open={Boolean(pendingDeleteId)}
                title="Xóa ghi chú?"
                message={`Ghi chú “${pendingDeleteNote?.title || 'Ghi chú mới'}” sẽ bị xóa vĩnh viễn.`}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
