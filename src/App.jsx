import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Instagram, KeyRound } from 'lucide-react';
import { useFolders } from './hooks/useFolders';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import ConfirmDialog from './components/ConfirmDialog';
import EmptyState from './components/EmptyState';
import FolderDialog from './components/FolderDialog';
import FolderList from './components/FolderList';
import NoteEditor from './components/NoteEditor';
import NoteList from './components/NoteList';
import SyncKeyModal from './components/SyncKeyModal';
import ThemeToggle from './components/ThemeToggle';

const SYNC_KEY_STORAGE = 'notepad-sync-key';
const ALL_FOLDER = 'all';
const RECENT_FOLDER = 'recent';
const UNFILED_FOLDER = 'unfiled';
const INSTAGRAM_URL = 'https://www.instagram.com/trunk.ng/';

function getPlainText(content) {
    if (!content) return '';
    try {
        const parsed = new DOMParser().parseFromString(content, 'text/html');
        return parsed.body.textContent || '';
    } catch {
        return String(content).replace(/<[^>]*>/g, ' ');
    }
}

function normalizeSearchText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLocaleLowerCase('vi')
        .replace(/\s+/g, ' ')
        .trim();
}

export default function App() {
    const [syncKey, setSyncKey] = useState(() => localStorage.getItem(SYNC_KEY_STORAGE) || '');
    const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
    const [selectedFolderId, setSelectedFolderId] = useState(() =>
        window.matchMedia('(min-width: 1024px)').matches ? ALL_FOLDER : null
    );
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [showSyncModal, setShowSyncModal] = useState(!syncKey);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [folderDialog, setFolderDialog] = useState({ open: false, mode: 'create', folder: null });

    const { notes, loading, error, createNote, updateNote, setPinned, touchNoteOpened, deleteNote } = useNotes(syncKey);
    const {
        folders,
        loading: foldersLoading,
        error: folderError,
        createFolder,
        renameFolder,
    } = useFolders(syncKey);
    const { darkMode, toggleTheme } = useTheme();

    useEffect(() => {
        setSelectedNoteId(null);
        setPendingDeleteId(null);
        setSearchQuery('');
        setSelectedFolderId(window.matchMedia('(min-width: 1024px)').matches ? ALL_FOLDER : null);
        if (!syncKey) setShowSyncModal(true);
    }, [syncKey]);

    useEffect(() => {
        const media = window.matchMedia('(min-width: 1024px)');
        const updateViewport = () => {
            setIsDesktop(media.matches);
            if (media.matches) {
                setSelectedFolderId(current => current || ALL_FOLDER);
            }
        };
        updateViewport();
        media.addEventListener('change', updateViewport);
        return () => media.removeEventListener('change', updateViewport);
    }, []);

    useEffect(() => {
        if (!selectedFolderId || [ALL_FOLDER, RECENT_FOLDER, UNFILED_FOLDER].includes(selectedFolderId)) return;
        if (foldersLoading) return;
        if (!folders.some(folder => folder.id === selectedFolderId)) {
            setSelectedFolderId(isDesktop ? ALL_FOLDER : null);
            setSelectedNoteId(null);
        }
    }, [folders, foldersLoading, isDesktop, selectedFolderId]);

    const filteredNotes = useMemo(() => {
        if (!selectedFolderId || selectedFolderId === ALL_FOLDER) return notes;
        if (selectedFolderId === RECENT_FOLDER) {
            return notes
                .filter(note => note.lastOpenedAt)
                .sort((a, b) => b.lastOpenedAt.getTime() - a.lastOpenedAt.getTime())
                .slice(0, 10);
        }
        if (selectedFolderId === UNFILED_FOLDER) return notes.filter(note => !note.folderId);
        return notes.filter(note => note.folderId === selectedFolderId);
    }, [notes, selectedFolderId]);

    const normalizedSearchQuery = useMemo(() => normalizeSearchText(searchQuery), [searchQuery]);

    const visibleNotes = useMemo(() => {
        if (!normalizedSearchQuery) return filteredNotes;

        return notes.filter((note) => {
            const searchable = normalizeSearchText(`${note.title || ''} ${getPlainText(note.content)}`);
            return searchable.includes(normalizedSearchQuery);
        });
    }, [filteredNotes, normalizedSearchQuery, notes]);

    useEffect(() => {
        if (selectedNoteId && !notes.some(note => note.id === selectedNoteId)) {
            setSelectedNoteId(null);
            return;
        }

        if (!isDesktop || !selectedFolderId) return;
        if (!selectedNoteId || !visibleNotes.some(note => note.id === selectedNoteId)) {
            setSelectedNoteId(visibleNotes[0]?.id || null);
        }
    }, [isDesktop, notes, selectedFolderId, selectedNoteId, visibleNotes]);

    const selectedFolderName = useMemo(() => {
        if (selectedFolderId === ALL_FOLDER) return 'Tất cả ghi chú';
        if (selectedFolderId === RECENT_FOLDER) return 'Gần đây';
        if (selectedFolderId === UNFILED_FOLDER) return 'Chưa phân loại';
        return folders.find(folder => folder.id === selectedFolderId)?.name || 'Ghi chú';
    }, [folders, selectedFolderId]);

    const selectedNote = notes.find(note => note.id === selectedNoteId) || null;
    const pendingDeleteNote = notes.find(note => note.id === pendingDeleteId) || null;
    const combinedError = error || folderError;

    const maskedKey = useMemo(() => {
        if (!syncKey) return '';
        if (syncKey.length <= 6) return `${syncKey.slice(0, 2)}***`;
        return `${syncKey.slice(0, 3)}***${syncKey.slice(-2)}`;
    }, [syncKey]);

    const handleSelectFolder = useCallback((folderId) => {
        setSearchQuery('');
        setSelectedFolderId(folderId);
        setSelectedNoteId(null);
    }, []);

    const handleBackToFolders = useCallback(() => {
        setSearchQuery('');
        setSelectedNoteId(null);
        setSelectedFolderId(null);
    }, []);

    const handleCreateNote = useCallback(async () => {
        setSearchQuery('');
        const folderId = selectedFolderId && ![ALL_FOLDER, RECENT_FOLDER, UNFILED_FOLDER].includes(selectedFolderId)
            ? selectedFolderId
            : null;
        const newId = await createNote('Ghi chú mới', '', folderId);
        if (newId) setSelectedNoteId(newId);
    }, [createNote, selectedFolderId]);

    const handleMoveNoteFolder = useCallback(async (noteId, folderId) => {
        const normalizedFolderId = folderId || null;
        const ok = await updateNote(noteId, { folderId: normalizedFolderId });
        if (ok && ![ALL_FOLDER, RECENT_FOLDER].includes(selectedFolderId)) {
            setSelectedFolderId(normalizedFolderId || UNFILED_FOLDER);
        }
        return ok;
    }, [selectedFolderId, updateNote]);

    const handleSelectNote = useCallback((noteId) => {
        setSelectedNoteId(noteId);
        void touchNoteOpened(noteId);
    }, [touchNoteOpened]);

    const handlePinNote = useCallback((noteId, pinned) => {
        void setPinned(noteId, pinned);
    }, [setPinned]);

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

    const handleOpenCreateFolder = useCallback(() => {
        setFolderDialog({ open: true, mode: 'create', folder: null });
    }, []);

    const handleOpenRenameFolder = useCallback((folder) => {
        setFolderDialog({ open: true, mode: 'rename', folder });
    }, []);

    const handleCloseFolderDialog = useCallback(() => {
        setFolderDialog(current => ({ ...current, open: false }));
    }, []);

    const handleSubmitFolder = useCallback(async (name) => {
        if (folderDialog.mode === 'rename' && folderDialog.folder) {
            return renameFolder(folderDialog.folder.id, name);
        }

        const folderId = await createFolder(name);
        if (!folderId) return false;
        setSelectedFolderId(folderId);
        setSelectedNoteId(null);
        return true;
    }, [createFolder, folderDialog.folder, folderDialog.mode, renameFolder]);

    const handleSubmitSyncKey = useCallback((key) => {
        const trimmed = key.trim();
        if (!trimmed) return;
        localStorage.setItem(SYNC_KEY_STORAGE, trimmed);
        setSyncKey(trimmed);
        setShowSyncModal(false);
    }, []);

    const handleOpenSyncModal = useCallback(() => setShowSyncModal(true), []);
    const handleCloseSyncModal = useCallback(() => setShowSyncModal(false), []);

    return (
        <div className="min-h-screen bg-apple-bg-primary text-apple-text-primary">
            <div className="min-h-screen bg-gradient-to-b from-apple-bg-primary via-apple-bg-primary to-apple-bg-secondary">
                <div className="mx-auto max-w-[1400px] px-4 pb-[var(--safe-area-bottom)] pt-[var(--safe-area-top)] sm:px-6 lg:px-8">
                    <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/notepad-logo.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-10 w-10 shrink-0 rounded-2xl shadow-sm"
                            />
                            <div>
                                <h1 className="text-[18px] font-semibold">Notepad Online</h1>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-note-caption text-apple-text-secondary">
                                    <span>{syncKey ? `Sync Key: ${maskedKey}` : 'Chưa có Sync Key'}</span>
                                    <span aria-hidden="true">·</span>
                                    <a
                                        href={INSTAGRAM_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-medium text-apple-text-primary hover:text-apple-accent transition"
                                        aria-label="Mở Instagram trunk.ng"
                                    >
                                        <Instagram size={14} />
                                        @trunk.ng
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleOpenSyncModal}
                                className="flex min-h-11 items-center gap-2 rounded-full bg-apple-bg-secondary px-4 py-2 text-note-caption text-apple-text-primary hover:bg-apple-bg-tertiary active:scale-95 transition"
                            >
                                <KeyRound size={16} />
                                Sync Key
                            </button>
                            <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
                        </div>
                    </header>

                    {combinedError && (
                        <div className="mb-4 rounded-xl border border-apple-danger bg-apple-bg-tertiary px-4 py-3 text-note-caption text-apple-danger">
                            {combinedError}
                        </div>
                    )}

                    <main className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_300px_minmax(0,1fr)]">
                        <aside className={`${selectedFolderId ? 'hidden lg:block' : 'block'} h-[calc(100dvh-180px)] min-h-[420px] rounded-2xl bg-apple-bg-secondary p-3 shadow-sm`}>
                            <FolderList
                                folders={folders}
                                notes={notes}
                                loading={foldersLoading}
                                selectedFolderId={selectedFolderId}
                                onSelect={handleSelectFolder}
                                onCreate={handleOpenCreateFolder}
                                onRename={handleOpenRenameFolder}
                            />
                        </aside>

                        <aside className={`${selectedFolderId && !selectedNoteId ? 'block' : 'hidden lg:block'} h-[calc(100dvh-180px)] min-h-[420px] rounded-2xl bg-apple-bg-secondary p-3 shadow-sm`}>
                            <NoteList
                                notes={visibleNotes}
                                totalNoteCount={notes.length}
                                loading={loading}
                                selectedId={selectedNoteId}
                                title={selectedFolderName}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                onBack={handleBackToFolders}
                                onSelect={handleSelectNote}
                                onCreate={handleCreateNote}
                                onPin={handlePinNote}
                                onDelete={handleDeleteNote}
                                recentMode={selectedFolderId === RECENT_FOLDER && !normalizedSearchQuery}
                            />
                        </aside>

                        <section className={`${selectedNoteId ? 'block' : 'hidden lg:block'} h-[calc(100dvh-180px)] min-h-[420px] rounded-2xl bg-apple-bg-secondary p-4 shadow-sm`}>
                            {loading || foldersLoading ? (
                                <div className="flex h-full items-center justify-center text-note-caption text-apple-text-secondary">
                                    Đang đồng bộ...
                                </div>
                            ) : visibleNotes.length === 0 ? (
                                normalizedSearchQuery ? (
                                    <div className="flex h-full items-center justify-center px-6 text-center text-note-caption text-apple-text-secondary">
                                        Không tìm thấy ghi chú phù hợp.
                                    </div>
                                ) : (
                                    <EmptyState onCreate={handleCreateNote} />
                                )
                            ) : selectedNote ? (
                                <NoteEditor
                                    note={selectedNote}
                                    folders={folders}
                                    onUpdate={updateNote}
                                    onMoveFolder={handleMoveNoteFolder}
                                    onDelete={handleDeleteNote}
                                    onBack={() => setSelectedNoteId(null)}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-note-caption text-apple-text-secondary">
                                    Chọn một ghi chú để bắt đầu.
                                </div>
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

            <FolderDialog
                open={folderDialog.open}
                mode={folderDialog.mode}
                initialName={folderDialog.folder?.name || ''}
                onClose={handleCloseFolderDialog}
                onSubmit={handleSubmitFolder}
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
