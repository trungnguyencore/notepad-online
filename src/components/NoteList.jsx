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
                    className="w-9 h-9 rounded-full bg-apple-accent text-black flex items-center justify-center hover:bg-apple-accent-hover active:scale-95 transition"
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
                        <button
                            key={note.id}
                            onClick={() => onSelect(note.id)}
                            className={`note-card w-full text-left rounded-note border px-4 py-3 transition ${isActive
                                    ? 'bg-apple-bg-primary border-apple-accent ring-2 ring-apple-accent'
                                    : 'bg-apple-bg-primary border-apple-border'
                                }`}
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
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[11px] text-apple-text-secondary">
                                        {formatNoteDate(note.updatedAt)}
                                    </span>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onDelete(note.id);
                                        }}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-apple-text-secondary hover:text-apple-danger hover:bg-apple-bg-tertiary transition"
                                        aria-label="Xóa ghi chú"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
