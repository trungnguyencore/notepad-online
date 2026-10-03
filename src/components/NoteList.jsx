import React, { useMemo, useState } from 'react';
import { ChevronLeft, Pin, Plus, Trash2 } from 'lucide-react';

const SORT_STORAGE = 'notepad-note-sort';

function formatNoteDate(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();

    if (sameDay) {
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
    }).format(date);
}

function getPreviewText(content) {
    if (!content) return '';
    try {
        const doc = new DOMParser().parseFromString(content, 'text/html');
        return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    } catch (error) {
        return String(content).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
}

function getTime(value) {
    if (!value) return 0;
    const date = value instanceof Date ? value : new Date(value);
    const time = date.getTime();
    return Number.isNaN(time) ? 0 : time;
}

export default function NoteList({
    notes,
    selectedId,
    onSelect,
    onCreate,
    onPin,
    onDelete,
    onBack,
    title = 'Ghi chú',
    loading,
    recentMode = false,
}) {
    const [sortMode, setSortMode] = useState(() => localStorage.getItem(SORT_STORAGE) || 'updated-desc');

    const sortedNotes = useMemo(() => {
        const items = [...notes];

        if (recentMode) {
            return items.sort((a, b) => getTime(b.lastOpenedAt) - getTime(a.lastOpenedAt));
        }

        return items.sort((a, b) => {
            const pinnedDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
            if (pinnedDiff !== 0) return pinnedDiff;

            if (sortMode === 'updated-asc') {
                return getTime(a.updatedAt) - getTime(b.updatedAt);
            }

            if (sortMode === 'title-asc') {
                return String(a.title || '').localeCompare(String(b.title || ''), 'vi', { sensitivity: 'base' });
            }

            return getTime(b.updatedAt) - getTime(a.updatedAt);
        });
    }, [notes, recentMode, sortMode]);

    const handleSortChange = (event) => {
        const next = event.target.value;
        setSortMode(next);
        localStorage.setItem(SORT_STORAGE, next);
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 px-1">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-apple-text-secondary hover:bg-apple-bg-tertiary active:scale-95 transition lg:hidden"
                        aria-label="Quay lại danh sách thư mục"
                    >
                        <ChevronLeft size={22} />
                    </button>
                )}
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-note-title text-apple-text-primary">{title}</h2>
                    <p className="text-note-caption text-apple-text-secondary">
                        {loading ? 'Đang đồng bộ...' : `${notes.length} ghi chú`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCreate}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-apple-accent text-black hover:bg-apple-accent-hover active:scale-95 transition"
                    aria-label="Tạo ghi chú mới"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="mt-2 flex min-h-9 items-center justify-end px-1">
                {recentMode ? (
                    <span className="text-[12px] text-apple-text-secondary">{notes.length} ghi chú mở gần nhất</span>
                ) : (
                    <label className="inline-flex items-center rounded-lg bg-apple-bg-tertiary px-2 text-[12px] text-apple-text-secondary">
                        <span className="sr-only">Sắp xếp ghi chú</span>
                        <select
                            value={sortMode}
                            onChange={handleSortChange}
                            className="h-11 bg-transparent pr-1 text-[12px] text-apple-text-primary outline-none"
                            aria-label="Sắp xếp ghi chú"
                        >
                            <option value="updated-desc">Mới sửa</option>
                            <option value="updated-asc">Cũ nhất</option>
                            <option value="title-asc">A–Z</option>
                        </select>
                    </label>
                )}
            </div>

            <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
                {loading && (
                    <div className="space-y-3">
                        {[0, 1, 2].map((index) => (
                            <div
                                key={index}
                                className="h-20 rounded-note bg-apple-bg-tertiary animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {!loading && notes.length === 0 && (
                    <div className="rounded-note bg-apple-bg-tertiary p-4 text-note-caption text-apple-text-secondary">
                        Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên.
                    </div>
                )}

                {!loading && sortedNotes.map((note) => {
                    const isActive = note.id === selectedId;
                    const preview = getPreviewText(note.content).slice(0, 80);

                    return (
                        <div
                            key={note.id}
                            className={`note-card flex w-full items-stretch rounded-note border transition ${isActive
                                    ? 'bg-apple-bg-primary border-apple-accent ring-2 ring-apple-accent'
                                    : 'bg-apple-bg-primary border-apple-border'
                                }`}
                        >
                            <button
                                type="button"
                                onClick={() => onSelect(note.id)}
                                className="min-w-0 flex-1 px-4 py-3 text-left"
                                aria-current={isActive ? 'true' : undefined}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-note-title text-apple-text-primary truncate">
                                            {note.title || 'Ghi chú mới'}
                                        </p>
                                        <p className="text-note-caption text-apple-text-secondary truncate">
                                            {preview || 'Nội dung đang trống'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[11px] text-apple-text-secondary">
                                        {formatNoteDate(note.updatedAt)}
                                    </span>
                                </div>
                            </button>
                            <div className="flex shrink-0 items-stretch p-1">
                                <button
                                    type="button"
                                    onClick={() => onPin(note.id, !note.pinned)}
                                    className={`flex w-11 items-center justify-center rounded-xl hover:bg-apple-bg-tertiary active:scale-95 transition ${note.pinned ? 'text-apple-accent' : 'text-apple-text-secondary'}`}
                                    aria-label={note.pinned ? `Bỏ ghim ${note.title || 'ghi chú'}` : `Ghim ${note.title || 'ghi chú'}`}
                                    aria-pressed={note.pinned ? 'true' : 'false'}
                                >
                                    <Pin size={17} className={note.pinned ? 'fill-current' : ''} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(note.id)}
                                    className="flex w-11 items-center justify-center rounded-xl text-apple-text-secondary hover:text-apple-danger hover:bg-apple-bg-tertiary active:scale-95 transition"
                                    aria-label={`Xóa ${note.title || 'ghi chú'}`}
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
