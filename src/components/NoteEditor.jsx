import React, { useEffect, useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Trash2, Underline as UnderlineIcon } from 'lucide-react';

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

export default function NoteEditor({ note, onUpdate, onDelete }) {
    const [draftTitle, setDraftTitle] = useState(note?.title || 'Ghi chú mới');
    const [draftContent, setDraftContent] = useState(note?.content || '');
    const [saveState, setSaveState] = useState('idle');

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
                setDraftTitle(title);
                setDraftContent(html);
            },
        },
        [note?.id]
    );

    useEffect(() => {
        setDraftTitle(note?.title || 'Ghi chú mới');
        setDraftContent(note?.content || '');
        setSaveState('idle');
    }, [note?.id]);

    useEffect(() => {
        if (!note) return;

        const currentTitle = note.title || 'Ghi chú mới';
        const currentContent = note.content || '';
        if (draftTitle === currentTitle && draftContent === currentContent) return;

        setSaveState('saving');
        const timer = setTimeout(async () => {
            await onUpdate(note.id, {
                title: draftTitle || 'Ghi chú mới',
                content: draftContent || '',
            });
            setSaveState('saved');
        }, SAVE_DELAY);

        return () => clearTimeout(timer);
    }, [draftTitle, draftContent, note, onUpdate]);

    const statusLabel = useMemo(() => {
        if (saveState === 'saving') return 'Đang lưu...';
        if (saveState === 'saved') return 'Đã lưu';
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
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-note-title text-apple-text-primary">
                            {draftTitle || note.title || 'Ghi chú mới'}
                        </h2>
                        <p className="text-note-caption text-apple-text-secondary">
                            Cập nhật {formatDetailDate(note.updatedAt)} · {statusLabel}
                        </p>
                    </div>
                    <button
                        onClick={() => onDelete(note.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-note-caption text-apple-text-secondary hover:text-apple-danger hover:bg-apple-bg-tertiary transition"
                    >
                        <Trash2 size={16} />
                        Xóa
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
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
