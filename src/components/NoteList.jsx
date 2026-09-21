import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

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

export default function NoteList({
    notes,
    selectedId,
    onSelect,
    onCreate,
    onDelete,
    loading,
}) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-note-title text-apple-text-primary">Ghi chú</h2>
                    <p className="text-note-caption text-apple-text-secondary">
                        {loading ? 'Đang đồng bộ...' : `${notes.length} ghi chú`}
                    </p>
                </div>
                <button
                    onClick={onCreate}
                    className="w-11 h-11 rounded-full bg-apple-accent text-black flex items-center justify-center hover:bg-apple-accent-hover active:scale-95 transition"
                    aria-label="Tạo ghi chú mới"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
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

                {!loading && notes.map((note) => {
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
                            <button
                                type="button"
                                onClick={() => onDelete(note.id)}
                                className="m-1 flex w-11 shrink-0 items-center justify-center rounded-xl text-apple-text-secondary hover:text-apple-danger hover:bg-apple-bg-tertiary active:scale-95 transition"
                                aria-label={`Xóa ${note.title || 'ghi chú'}`}
                            >
                                <Trash2 size={17} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
