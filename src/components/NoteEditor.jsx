import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, ChevronLeft, Italic, List, ListOrdered, Quote, Trash2, Underline as UnderlineIcon } from 'lucide-react';

const SAVE_DELAY = 450;

function formatDetailDate(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function getTitleFromText(text) {
    const lines = String(text || '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    if (!lines.length) return 'Ghi chú mới';
    return lines[0].slice(0, 80);
}

function ToolbarButton({ active, onClick, label, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`toolbar-btn ${active ? 'is-active' : ''}`}
            aria-label={label}
        >
            {children}
        </button>
    );
}

export default function NoteEditor({ note, onUpdate, onDelete, onBack }) {
    const [draftTitle, setDraftTitle] = useState(note?.title || 'Ghi chú mới');
    const [draftContent, setDraftContent] = useState(note?.content || '');
    const [saveState, setSaveState] = useState('idle');
    const draftRef = useRef({ title: note?.title || 'Ghi chú mới', content: note?.content || '' });
    const persistedRef = useRef({ title: note?.title || 'Ghi chú mới', content: note?.content || '' });
    const activeNoteIdRef = useRef(note?.id || null);

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({
                    heading: { levels: [1, 2, 3] },
                }),
                Underline,
                Placeholder.configure({
                    placeholder: 'Bắt đầu viết...'
                }),
            ],
            content: note?.content || '',
            editorProps: {
                attributes: {
                    class: 'text-note-body text-apple-text-primary focus:outline-none',
                },
            },
            onUpdate: ({ editor }) => {
                const html = editor.getHTML();
                const title = getTitleFromText(editor.getText());
                draftRef.current = { title, content: html };
                setDraftTitle(title);
                setDraftContent(html);
            },
        },
        [note?.id]
    );

    useEffect(() => {
        const initial = {
            title: note?.title || 'Ghi chú mới',
            content: note?.content || '',
        };
        activeNoteIdRef.current = note?.id || null;
        draftRef.current = initial;
        persistedRef.current = initial;
        setDraftTitle(initial.title);
        setDraftContent(initial.content);
        setSaveState('idle');

        return () => {
            if (!note?.id) return;
            const pending = draftRef.current;
            const persisted = persistedRef.current;
            if (pending.title === persisted.title && pending.content === persisted.content) return;
            onUpdate(note.id, {
                title: pending.title || 'Ghi chú mới',
                content: pending.content || '',
            });
        };
    }, [note?.id, onUpdate]);

    useEffect(() => {
        if (!note?.id) return undefined;

        const pending = {
            title: draftTitle || 'Ghi chú mới',
            content: draftContent || '',
        };
        draftRef.current = pending;
        const persisted = persistedRef.current;
        if (pending.title === persisted.title && pending.content === persisted.content) return undefined;

        setSaveState('saving');
        const timer = setTimeout(async () => {
            const ok = await onUpdate(note.id, pending);
            if (activeNoteIdRef.current !== note.id) return;
            if (ok === false) {
                setSaveState('error');
                return;
            }
            persistedRef.current = pending;
            setSaveState('saved');
        }, SAVE_DELAY);

        return () => clearTimeout(timer);
    }, [draftTitle, draftContent, note?.id, onUpdate]);

    const statusLabel = useMemo(() => {
        if (saveState === 'saving') return 'Đang lưu...';
        if (saveState === 'saved') return 'Đã lưu';
        if (saveState === 'error') return 'Lỗi lưu';
        return 'Tự động lưu';
    }, [saveState]);

    if (!note) {
        return (
            <div className="h-full flex items-center justify-center text-note-caption text-apple-text-secondary">
                Chọn một ghi chú để bắt đầu.
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-col gap-4 border-b border-apple-border pb-4">
                <div className="flex items-start gap-2 sm:gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-apple-text-secondary hover:bg-apple-bg-tertiary active:scale-95 transition lg:hidden"
                        aria-label="Quay lại danh sách ghi chú"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-note-title text-apple-text-primary break-words">
                            {draftTitle || note.title || 'Ghi chú mới'}
                        </h2>
                        <p className={`text-note-caption ${saveState === 'error' ? 'text-apple-danger' : 'text-apple-text-secondary'}`}>
                            Cập nhật {formatDetailDate(note.updatedAt)} · {statusLabel}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onDelete(note.id)}
                        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-note-caption text-apple-text-secondary hover:text-apple-danger hover:bg-apple-bg-tertiary active:scale-95 transition"
                    >
                        <Trash2 size={17} />
                        <span className="hidden sm:inline">Xóa</span>
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
                    <ToolbarButton
                        label="Bold"
                        active={editor?.isActive('bold')}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                    >
                        <Bold size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Italic"
                        active={editor?.isActive('italic')}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                    >
                        <Italic size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Underline"
                        active={editor?.isActive('underline')}
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    >
                        <UnderlineIcon size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Heading 1"
                        active={editor?.isActive('heading', { level: 1 })}
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        <span className="text-[11px] font-semibold">H1</span>
                    </ToolbarButton>
                    <ToolbarButton
                        label="Heading 2"
                        active={editor?.isActive('heading', { level: 2 })}
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        <span className="text-[11px] font-semibold">H2</span>
                    </ToolbarButton>
                    <ToolbarButton
                        label="Heading 3"
                        active={editor?.isActive('heading', { level: 3 })}
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                        <span className="text-[11px] font-semibold">H3</span>
                    </ToolbarButton>
                    <ToolbarButton
                        label="Bullet list"
                        active={editor?.isActive('bulletList')}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    >
                        <List size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Ordered list"
                        active={editor?.isActive('orderedList')}
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Quote"
                        active={editor?.isActive('blockquote')}
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote size={16} />
                    </ToolbarButton>
                </div>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto">
                <EditorContent editor={editor} className="min-h-[360px]" />
            </div>
        </div>
    );
}
