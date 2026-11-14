import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Bold, ChevronLeft, Italic, List, ListChecks, ListOrdered, Quote, Trash2, Underline as UnderlineIcon } from 'lucide-react';
import FolderPicker from './FolderPicker';
import { useNoteDraft } from '../hooks/useNoteDraft';

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

function formatDetailTime(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('vi-VN', {
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

function TextStyleSelect({ editor }) {
    const value = editor?.isActive('heading', { level: 1 })
        ? 'h1'
        : editor?.isActive('heading', { level: 2 })
            ? 'h2'
            : editor?.isActive('heading', { level: 3 })
                ? 'h3'
                : 'paragraph';

    const handleChange = (event) => {
        if (!editor) return;
        const next = event.target.value;
        if (next === 'paragraph') {
            editor.chain().focus().setParagraph().run();
            return;
        }
        editor.chain().focus().setHeading({ level: Number(next.slice(1)) }).run();
    };

    return (
        <label className="toolbar-style-select" aria-label="Kiểu văn bản">
            <span className="sr-only">Kiểu văn bản</span>
            <select value={value} onChange={handleChange} aria-label="Kiểu văn bản">
                <option value="paragraph">Aa</option>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
            </select>
        </label>
    );
}

export default function NoteEditor({ note, folders, onUpdate, onMoveFolder, onDelete, onBack, draftStorageKey }) {
    const draft = useNoteDraft(note, onUpdate, draftStorageKey);
    const draftTitle = draft.title;
    const saveState = draft.status;

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({
                    heading: { levels: [1, 2, 3] },
                }),
                Underline,
                TaskList,
                TaskItem.configure({
                    nested: true,
                }),
                Placeholder.configure({
                    placeholder: 'Bắt đầu viết...'
                }),
            ],
            content: draft.content,
            editorProps: {
                attributes: {
                    class: 'text-note-body text-apple-text-primary focus:outline-none',
                },
            },
            onUpdate: ({ editor }) => {
                draft.change({ title: getTitleFromText(editor.getText()), content: editor.getHTML() });
            },
        },
        [note?.id]
    );

    // Only explicit remote adoption changes revision. Local typing keeps the
    // existing selection/undo history; remote content is applied without saving it back.
    useEffect(() => {
        if (editor && editor.getHTML() !== draft.content) editor.commands.setContent(draft.content, false);
    }, [editor, draft.revision]);

    const statusLabel = {
        saving: 'Đang lưu...', saved: 'Đã lưu', error: 'Lỗi lưu', conflict: 'Có thay đổi từ phiên khác',
    }[saveState] || 'Tự động lưu';

    if (!note) {
        return (
            <div className="h-full flex items-center justify-center text-note-caption text-apple-text-secondary">
                Chọn một ghi chú để bắt đầu.
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-col gap-2 border-b border-apple-border pb-2">
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
                        <div className={`mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-note-caption ${saveState === 'error' ? 'text-apple-danger' : 'text-apple-text-secondary'}`}>
                            <span className="sm:hidden">
                                {formatDetailTime(note.updatedAt)} · {statusLabel}
                            </span>
                            <span className="hidden sm:inline">
                                Cập nhật {formatDetailDate(note.updatedAt)} · {statusLabel}
                            </span>
                            <FolderPicker
                                folders={folders}
                                value={note.folderId || ''}
                                onChange={(folderId) => onMoveFolder(note.id, folderId)}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Xóa ghi chú"
                        onClick={() => onDelete(note.id)}
                        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-note-caption text-apple-text-secondary hover:text-apple-danger hover:bg-apple-bg-tertiary active:scale-95 transition"
                    >
                        <Trash2 size={17} />
                        <span className="hidden sm:inline">Xóa</span>
                    </button>
                </div>

                <div className="editor-toolbar flex gap-1.5 overflow-x-auto lg:flex-nowrap lg:overflow-visible">
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
                    <TextStyleSelect editor={editor} />
                    <ToolbarButton
                        label="Checklist"
                        active={editor?.isActive('taskList')}
                        onClick={() => editor?.chain().focus().toggleTaskList().run()}
                    >
                        <ListChecks size={17} />
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

            {draft.conflict && (
                <div role="alert" className="mt-2 rounded-xl border border-apple-accent bg-apple-bg-tertiary p-3 text-note-caption">
                    <p>Ghi chú đã thay đổi ở phiên khác. Bản nháp của bạn được giữ lại, chưa ghi đè bản mới.</p>
                    {draft.conflict.remote && <>
                        <p className="mt-1">Dùng bản mới sẽ thay nội dung đang soạn. Giữ bản của tôi sẽ lưu nội dung đang soạn thay cho bản mới.</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <button type="button" onClick={draft.useRemote} className="min-h-11 rounded-xl bg-apple-bg-secondary px-3">Dùng bản mới</button>
                            <button type="button" onClick={draft.keepLocal} className="min-h-11 rounded-xl bg-apple-accent px-3 text-black">Giữ bản của tôi</button>
                        </div>
                    </>}
                </div>
            )}
            {saveState === 'error' && <div role="alert" className="mt-2 flex items-center gap-2 text-note-caption text-apple-danger">
                <span>Chưa lưu được thay đổi.</span>
                <button type="button" onClick={draft.retry} className="min-h-11 rounded-xl px-3 underline">Thử lưu lại</button>
            </div>}
            {draft.recoveryError && <p role="alert" className="mt-2 text-note-caption text-apple-danger">Không thể lưu bản nháp trên thiết bị. Hãy giữ trang mở và sao chép nội dung trước khi rời đi.</p>}
            <div className="mt-2 flex-1 min-h-0 overflow-y-auto">
                <EditorContent editor={editor} className="min-h-[360px]" />
            </div>
        </div>
    );
}
