import React, { useMemo, useState } from 'react';
import { ChevronLeft, Pin, Plus, Search, Trash2, X } from 'lucide-react';

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

function normalizeSearchText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLocaleLowerCase('vi');
}

function HighlightedText({ text, query }) {
    if (!query) return text;

    const normalizedText = normalizeSearchText(text);
    const normalizedQuery = normalizeSearchText(query).trim();
    if (!normalizedQuery) return text;

    const matchIndex = normalizedText.indexOf(normalizedQuery);
    if (matchIndex < 0) return text;

    const matchEnd = matchIndex + normalizedQuery.length;
    return (
        <>
            {text.slice(0, matchIndex)}
            <mark className="rounded bg-apple-accent px-0.5 text-black">
                {text.slice(matchIndex, matchEnd)}
            </mark>
            {text.slice(matchEnd)}
        </>
    );
}

function getSearchPreview(content, query) {
    const text = getPreviewText(content);
    if (!text) return '';
    if (!query?.trim()) return text.slice(0, 80);

    const normalizedText = normalizeSearchText(text);
    const normalizedQuery = normalizeSearchText(query).trim();
    const matchIndex = normalizedText.indexOf(normalizedQuery);
    if (matchIndex < 0) return text.slice(0, 80);

    const start = Math.max(0, matchIndex - 28);
    const end = Math.min(text.length, matchIndex + normalizedQuery.length + 44);
    return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

export default function NoteList({
    notes,
    totalNoteCount = notes.length,
    selectedId,
    onSelect,
    onCreate,
    onPin,
    onDelete,
    onBack,
    title = 'Ghi chú',
    loading,
    recentMode = false,
    searchQuery = '',
    onSearchChange,
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
                    <h2 className="truncate text-note-title text-apple-text-primary">{searchQuery.trim() ? 'Tìm kiếm' : title}</h2>
                    <p className="text-note-caption text-apple-text-secondary">
                        {loading
                            ? 'Đang đồng bộ...'
                            : searchQuery.trim()
                                ? `${notes.length} kết quả / ${totalNoteCount} ghi chú`
                                : `${notes.length} ghi chú`}
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

            <div className="mt-3 px-1">
                <div className="flex min-h-11 items-center gap-2 rounded-xl bg-apple-bg-tertiary px-3 focus-within:ring-2 focus-within:ring-apple-accent">
                    <Search size={17} className="shrink-0 text-apple-text-secondary" aria-hidden="true" />
                    <input
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        value={searchQuery}
                        onChange={(event) => onSearchChange?.(event.target.value)}
                        placeholder="Tìm trong tất cả ghi chú"
                        aria-label="Tìm trong tất cả ghi chú"
                        className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-apple-text-primary outline-none placeholder:text-apple-text-secondary sm:text-[14px]"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange?.('')}
                            className="-mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-apple-text-secondary hover:bg-apple-bg-primary hover:text-apple-text-primary active:scale-95 transition"
                            aria-label="Xóa tìm kiếm"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
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
                        {searchQuery.trim()
                            ? 'Không tìm thấy ghi chú phù hợp.'
                            : 'Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên.'}
                    </div>
                )}

                {!loading && sortedNotes.map((note) => {
                    const isActive = note.id === selectedId;
                    const preview = getSearchPreview(note.content, searchQuery);

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
                                            <HighlightedText
                                                text={note.title || 'Ghi chú mới'}
                                                query={searchQuery}
                                            />
                                        </p>
                                        <p className="text-note-caption text-apple-text-secondary truncate">
                                            {preview ? (
                                                <HighlightedText text={preview} query={searchQuery} />
                                            ) : (
                                                'Nội dung đang trống'
                                            )}
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
