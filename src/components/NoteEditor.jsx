import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
    Bold,
    Check,
    ChevronDown,
    ChevronLeft,
    ImagePlus,
    Italic,
    List,
    ListChecks,
    ListOrdered,
    Loader2,
    Quote,
    Trash2,
    Underline as UnderlineIcon,
    X,
} from 'lucide-react';
import FolderPicker from './FolderPicker';
import { NoteImage } from './NoteImageExtension';
import { useNoteDraft } from '../hooks/useNoteDraft';
import { deleteWorkspaceImage, extractClipboardImageFiles, uploadWorkspaceImage } from '../lib/noteImages';

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

async function dataUrlToFile(dataUrl, index = 0) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const ext = (blob.type?.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
    return new File([blob], `pasted-image-${index + 1}.${ext}`, { type: blob.type || 'image/png' });
}

function ToolbarButton({ active, disabled, onClick, label, children }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`toolbar-btn ${active ? 'is-active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={label}
            title={label}
        >
            {children}
        </button>
    );
}

const TEXT_STYLE_OPTIONS = [
    {
        value: 'paragraph',
        shortLabel: 'Aa',
        label: 'Văn bản thường',
        previewClass: 'text-[15px] font-normal',
    },
    {
        value: 'h1',
        shortLabel: 'H1',
        label: 'Tiêu đề lớn',
        previewClass: 'text-[20px] font-bold leading-tight',
    },
    {
        value: 'h2',
        shortLabel: 'H2',
        label: 'Tiêu đề vừa',
        previewClass: 'text-[17px] font-semibold leading-tight',
    },
    {
        value: 'h3',
        shortLabel: 'H3',
        label: 'Tiêu đề nhỏ',
        previewClass: 'text-[15px] font-semibold leading-tight',
    },
];

function TextStyleSelect({ editor }) {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const value = editor?.isActive('heading', { level: 1 })
        ? 'h1'
        : editor?.isActive('heading', { level: 2 })
            ? 'h2'
            : editor?.isActive('heading', { level: 3 })
                ? 'h3'
                : 'paragraph';

    const activeOption = TEXT_STYLE_OPTIONS.find(option => option.value === value) || TEXT_STYLE_OPTIONS[0];
    const isHeadingActive = value !== 'paragraph';

    const updateMenuPosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const menuWidth = 220;
        const estimatedMenuHeight = 200;
        const spaceBelow = window.innerHeight - rect.bottom;
        const top = spaceBelow >= estimatedMenuHeight + 12
            ? rect.bottom + 6
            : Math.max(8, rect.top - estimatedMenuHeight - 6);
        const left = Math.min(Math.max(8, rect.left), window.innerWidth - menuWidth - 8);
        setMenuPos({ top, left });
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        updateMenuPosition();

        const handlePointerDown = (event) => {
            if (triggerRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) {
                return;
            }
            setOpen(false);
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };
        const handleViewportChange = (event) => {
            if (event.type === 'scroll' && menuRef.current?.contains(event.target)) {
                return;
            }
            setOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [open, updateMenuPosition]);

    const handleSelect = (next) => {
        setOpen(false);
        if (!editor) return;
        if (next === 'paragraph') {
            editor.chain().focus().setParagraph().run();
            return;
        }
        editor.chain().focus().setHeading({ level: Number(next.slice(1)) }).run();
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setOpen(prev => !prev)}
                className={`toolbar-style-btn ${isHeadingActive ? 'is-active' : ''} ${open ? 'is-open' : ''}`}
                aria-label="Kiểu chữ và tiêu đề"
                aria-haspopup="menu"
                aria-expanded={open}
                title={`Kiểu chữ: ${activeOption.label}`}
            >
                <span>{activeOption.shortLabel}</span>
                <ChevronDown size={13} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && typeof document !== 'undefined' && createPortal(
                <div
                    ref={menuRef}
                    role="menu"
                    aria-label="Chọn kiểu chữ"
                    style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
                    className="text-style-menu fixed z-50 w-[220px] rounded-xl border border-apple-border bg-apple-bg-secondary p-1.5 shadow-xl"
                >
                    {TEXT_STYLE_OPTIONS.map((option) => {
                        const selected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="menuitemradio"
                                aria-checked={selected}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => handleSelect(option.value)}
                                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition ${
                                    selected
                                        ? 'bg-apple-accent/15 text-apple-text-primary'
                                        : 'text-apple-text-primary hover:bg-apple-bg-tertiary'
                                }`}
                            >
                                <span className={option.previewClass}>{option.label}</span>
                                <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-apple-text-secondary">
                                    <span>{option.shortLabel}</span>
                                    {selected && <Check size={15} className="text-apple-accent" />}
                                </span>
                            </button>
                        );
                    })}
                </div>,
                document.body
            )}
        </>
    );
}

export default function NoteEditor({ note, workspaceId, folders, onUpdate, onMoveFolder, onDelete, onBack, draftStorageKey }) {
    const draft = useNoteDraft(note, onUpdate, draftStorageKey);
    const draftTitle = draft.title;
    const saveState = draft.status;

    const [uploadingCount, setUploadingCount] = useState(0);
    const [imageError, setImageError] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [isDraggingImage, setIsDraggingImage] = useState(false);

    const fileInputRef = useRef(null);
    const workspaceIdRef = useRef(workspaceId);
    const noteIdRef = useRef(note?.id || null);
    const editorRef = useRef(null);
    const mountedRef = useRef(true);
    const insertImagesRef = useRef(null);

    workspaceIdRef.current = workspaceId;
    noteIdRef.current = note?.id || null;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!lightboxImage) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setLightboxImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxImage]);

    const insertImageFiles = useCallback(async (files, insertPos = null) => {
        const list = Array.from(files || []).filter(file => file && String(file.type || '').startsWith('image/'));
        if (!list.length) return;

        const targetWorkspaceId = workspaceIdRef.current;
        const targetNoteId = noteIdRef.current;

        if (!targetWorkspaceId) {
            setImageError('Chưa kết nối xong Sync Key. Hãy thử lại sau vài giây.');
            return;
        }

        setImageError(null);
        setUploadingCount(count => count + list.length);

        const uploadedNodes = [];
        const errors = [];
        let aborted = false;

        for (const file of list) {
            if (!mountedRef.current || editorRef.current?.isDestroyed) {
                aborted = true;
                break;
            }
            try {
                const uploaded = await uploadWorkspaceImage(targetWorkspaceId, file, targetNoteId);
                if (!mountedRef.current || editorRef.current?.isDestroyed) {
                    // User left the note mid-upload: remove the just-uploaded unreferenced doc.
                    void deleteWorkspaceImage(targetWorkspaceId, uploaded.imageId).catch(() => {});
                    aborted = true;
                    break;
                }
                uploadedNodes.push({
                    type: 'image',
                    attrs: {
                        imageId: uploaded.imageId,
                        alt: uploaded.alt,
                        width: uploaded.width,
                        height: uploaded.height,
                    },
                });
            } catch (err) {
                errors.push(err?.message || 'Không thể tải ảnh lên.');
            } finally {
                if (mountedRef.current) {
                    setUploadingCount(count => Math.max(0, count - 1));
                }
            }
        }

        if (aborted || !mountedRef.current || !editorRef.current || editorRef.current.isDestroyed) {
            for (const node of uploadedNodes) {
                void deleteWorkspaceImage(targetWorkspaceId, node.attrs.imageId).catch(() => {});
            }
            return;
        }

        if (uploadedNodes.length > 0) {
            const contentToInsert = [...uploadedNodes, { type: 'paragraph' }];
            const selection = editorRef.current.state?.selection;
            const isImageSelected = selection?.node?.type?.name === 'image';
            if (typeof insertPos === 'number') {
                editorRef.current.chain().focus().insertContentAt(insertPos, contentToInsert).run();
            } else if (isImageSelected) {
                editorRef.current.chain().focus().insertContentAt(selection.to, contentToInsert).run();
            } else {
                editorRef.current.chain().focus().insertContent(contentToInsert).run();
            }
        }

        if (errors.length > 0) {
            setImageError(errors[0]);
        }
    }, []);

    insertImagesRef.current = insertImageFiles;

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
                NoteImage.configure({
                    getWorkspaceId: () => workspaceIdRef.current,
                    onPreview: (payload) => setLightboxImage(payload),
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
                handlePaste: (_view, event) => {
                    const files = extractClipboardImageFiles(event.clipboardData);
                    if (files.length > 0) {
                        event.preventDefault();
                        void insertImagesRef.current?.(files);
                        return true;
                    }

                    // Catch apps that paste a single embedded data:image/* inside HTML without binary files.
                    const html = event.clipboardData?.getData('text/html') || '';
                    const plain = (event.clipboardData?.getData('text/plain') || '').trim();
                    if (!plain && /src=["']data:image\//i.test(html)) {
                        const parsed = new DOMParser().parseFromString(html, 'text/html');
                        const dataImages = Array.from(parsed.querySelectorAll('img[src^="data:image/"]'))
                            .map(img => img.getAttribute('src'))
                            .filter(Boolean);
                        if (dataImages.length > 0) {
                            event.preventDefault();
                            void Promise.all(dataImages.map((src, idx) => dataUrlToFile(src, idx)))
                                .then(converted => insertImagesRef.current?.(converted))
                                .catch(() => {
                                    if (mountedRef.current) setImageError('Không thể đọc ảnh từ clipboard.');
                                });
                            return true;
                        }
                    }

                    return false;
                },
                handleDrop: (view, event, _slice, moved) => {
                    if (moved) return false;
                    const files = extractClipboardImageFiles(event.dataTransfer);
                    if (!files.length) return false;

                    event.preventDefault();
                    setIsDraggingImage(false);
                    const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    void insertImagesRef.current?.(files, coords?.pos ?? null);
                    return true;
                },
            },
            onUpdate: ({ editor: currentEditor }) => {
                draft.change({ title: getTitleFromText(currentEditor.getText()), content: currentEditor.getHTML() });
            },
        },
        [note?.id]
    );

    editorRef.current = editor;

    // Only explicit remote adoption changes revision. Local typing keeps the
    // existing selection/undo history; remote content is applied without saving it back.
    // Defer via microtask so TipTap ReactNodeViewRenderer never calls flushSync inside React's commit lifecycle.
    useEffect(() => {
        if (!editor || editor.getHTML() === draft.content) return undefined;
        let cancelled = false;
        const contentToApply = draft.content;
        queueMicrotask(() => {
            if (!cancelled && !editor.isDestroyed && editor.getHTML() !== contentToApply) {
                editor.commands.setContent(contentToApply, false);
            }
        });
        return () => { cancelled = true; };
    }, [editor, draft.revision]);

    const handleFilePickerChange = (event) => {
        const files = event.target.files;
        if (files?.length) {
            void insertImageFiles(files);
        }
        event.target.value = '';
    };

    const handleDragOver = (event) => {
        const hasFiles = Array.from(event.dataTransfer?.types || []).includes('Files');
        if (!hasFiles) return;
        event.preventDefault();
        if (!isDraggingImage) setIsDraggingImage(true);
    };

    const handleDragLeave = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDraggingImage(false);
        }
    };

    const handleDropContainer = () => {
        if (isDraggingImage) setIsDraggingImage(false);
    };

    const statusLabel = uploadingCount > 0
        ? 'Đang tải ảnh...'
        : ({
            saving: 'Đang lưu...',
            saved: 'Đã lưu',
            error: 'Lỗi lưu',
            conflict: 'Có thay đổi từ phiên khác',
        }[saveState] || 'Tự động lưu');

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
                        label="In đậm"
                        active={editor?.isActive('bold')}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                    >
                        <Bold size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="In nghiêng"
                        active={editor?.isActive('italic')}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                    >
                        <Italic size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Gạch chân"
                        active={editor?.isActive('underline')}
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    >
                        <UnderlineIcon size={16} />
                    </ToolbarButton>
                    <TextStyleSelect editor={editor} />
                    <ToolbarButton
                        label="Danh sách việc cần làm"
                        active={editor?.isActive('taskList')}
                        onClick={() => editor?.chain().focus().toggleTaskList().run()}
                    >
                        <ListChecks size={17} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Chèn ảnh"
                        disabled={uploadingCount > 0}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploadingCount > 0 ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                    </ToolbarButton>
                    <ToolbarButton
                        label="Danh sách gạch đầu dòng"
                        active={editor?.isActive('bulletList')}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    >
                        <List size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Danh sách đánh số"
                        active={editor?.isActive('orderedList')}
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered size={16} />
                    </ToolbarButton>
                    <ToolbarButton
                        label="Trích dẫn"
                        active={editor?.isActive('blockquote')}
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote size={16} />
                    </ToolbarButton>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilePickerChange}
                        className="hidden"
                        aria-hidden="true"
                        tabIndex={-1}
                    />
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
            {imageError && (
                <div role="alert" className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-apple-danger bg-apple-bg-tertiary px-3 py-1.5 text-note-caption text-apple-danger">
                    <span>{imageError}</span>
                    <button
                        type="button"
                        onClick={() => setImageError(null)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-apple-text-secondary hover:text-apple-text-primary transition"
                        aria-label="Đóng thông báo lỗi ảnh"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            {uploadingCount > 0 && (
                <div role="status" className="mt-2 flex items-center gap-2 rounded-xl bg-apple-bg-tertiary px-3 py-2 text-note-caption text-apple-text-secondary">
                    <Loader2 size={15} className="animate-spin shrink-0 text-apple-accent" />
                    <span>Đang nén và tải {uploadingCount} ảnh lên...</span>
                </div>
            )}

            <div
                className={`relative mt-2 flex-1 min-h-0 overflow-y-auto rounded-xl transition ${
                    isDraggingImage ? 'ring-2 ring-dashed ring-apple-accent bg-apple-bg-tertiary/40' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropContainer}
            >
                {isDraggingImage && (
                    <div className="pointer-events-none sticky top-2 z-10 mx-2 mb-2 rounded-xl bg-apple-accent px-3 py-2 text-center text-note-caption font-medium text-black shadow-sm">
                        Thả ảnh vào đây để chèn vào ghi chú
                    </div>
                )}
                <EditorContent editor={editor} className="min-h-[360px]" />
            </div>

            {lightboxImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Xem ảnh phóng to"
                    className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxImage(null)}
                        className="fixed right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition"
                        aria-label="Đóng xem ảnh"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={lightboxImage.src}
                        alt={lightboxImage.alt || 'Hình ảnh đính kèm'}
                        onClick={(event) => event.stopPropagation()}
                        className="modal-content max-h-[88dvh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
}
