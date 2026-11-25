import React, { useEffect, useState } from 'react';
import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { ImageOff, Maximize2, RefreshCw, X } from 'lucide-react';
import { getCachedWorkspaceImage, loadWorkspaceImage } from '../lib/noteImages';

function NoteImageView({ node, selected, deleteNode, extension }) {
    const { imageId, src: externalSrc, alt, width, height } = node.attrs;
    const workspaceId = extension.options.getWorkspaceId?.() || null;
    const onPreview = extension.options.onPreview;

    const initialCached = imageId && workspaceId ? getCachedWorkspaceImage(workspaceId, imageId) : null;
    const [resolvedSrc, setResolvedSrc] = useState(() => initialCached?.dataUrl || externalSrc || null);
    const [status, setStatus] = useState(() => (initialCached?.dataUrl || externalSrc ? 'ready' : 'loading'));
    const [retryTick, setRetryTick] = useState(0);

    useEffect(() => {
        if (!imageId) {
            setResolvedSrc(externalSrc || null);
            setStatus(externalSrc ? 'ready' : 'error');
            return undefined;
        }

        if (!workspaceId) {
            setStatus('loading');
            return undefined;
        }

        const cached = getCachedWorkspaceImage(workspaceId, imageId);
        if (cached?.dataUrl) {
            setResolvedSrc(cached.dataUrl);
            setStatus('ready');
            return undefined;
        }

        let cancelled = false;
        setStatus('loading');
        loadWorkspaceImage(workspaceId, imageId)
            .then(data => {
                if (cancelled) return;
                if (data?.dataUrl) {
                    setResolvedSrc(data.dataUrl);
                    setStatus('ready');
                } else {
                    setResolvedSrc(null);
                    setStatus('error');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setResolvedSrc(null);
                    setStatus('error');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [externalSrc, imageId, retryTick, workspaceId]);

    const aspectStyle = width && height
        ? { aspectRatio: `${width} / ${height}`, maxWidth: `min(100%, ${width}px)` }
        : undefined;

    const handleOpenPreview = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (resolvedSrc) {
            onPreview?.({ src: resolvedSrc, alt: alt || 'Hình ảnh đính kèm' });
        }
    };

    const handleDelete = (event) => {
        event.preventDefault();
        event.stopPropagation();
        deleteNode();
    };

    const handleRetry = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setRetryTick(count => count + 1);
    };

    return (
        <NodeViewWrapper
            className="note-image-wrapper"
            data-image-id={imageId || undefined}
        >
            <figure
                contentEditable={false}
                className={`note-image-figure ${selected ? 'is-selected' : ''}`}
            >
                {status === 'ready' && resolvedSrc ? (
                    <>
                        <img
                            src={resolvedSrc}
                            alt={alt || 'Hình ảnh đính kèm'}
                            loading="lazy"
                            draggable={false}
                            onDoubleClick={handleOpenPreview}
                            onError={() => setStatus('error')}
                            className="note-image-img"
                        />
                        <div className="note-image-actions">
                            <button
                                type="button"
                                onClick={handleOpenPreview}
                                className="note-image-action-btn"
                                aria-label="Xem ảnh lớn"
                                title="Xem ảnh lớn"
                            >
                                <Maximize2 size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="note-image-action-btn is-danger"
                                aria-label="Xóa ảnh"
                                title="Xóa ảnh"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </>
                ) : status === 'loading' ? (
                    <div
                        className="note-image-placeholder"
                        style={aspectStyle}
                        role="status"
                        aria-label="Đang tải ảnh"
                    >
                        <span>Đang tải ảnh...</span>
                    </div>
                ) : (
                    <div className="note-image-error" role="alert">
                        <ImageOff size={18} className="shrink-0 text-apple-text-secondary" />
                        <span className="text-note-caption text-apple-text-secondary">
                            Không tải được ảnh
                        </span>
                        <div className="flex items-center gap-2">
                            {imageId && (
                                <button
                                    type="button"
                                    onClick={handleRetry}
                                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-apple-bg-secondary px-3 text-note-caption text-apple-text-primary hover:bg-apple-bg-primary transition"
                                >
                                    <RefreshCw size={14} />
                                    Thử lại
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-apple-bg-secondary px-3 text-note-caption text-apple-danger hover:bg-apple-bg-primary transition"
                            >
                                <X size={14} />
                                Xóa
                            </button>
                        </div>
                    </div>
                )}
            </figure>
        </NodeViewWrapper>
    );
}

export const NoteImage = Image.extend({
    name: 'image',
    inline: false,
    group: 'block',
    draggable: true,
    selectable: true,

    addOptions() {
        return {
            ...this.parent?.(),
            inline: false,
            allowBase64: false,
            getWorkspaceId: () => null,
            onPreview: null,
        };
    },

    addAttributes() {
        return {
            imageId: {
                default: null,
                parseHTML: element => element.getAttribute('data-image-id') || null,
                renderHTML: attrs => (attrs.imageId ? { 'data-image-id': attrs.imageId } : {}),
            },
            src: {
                default: null,
                parseHTML: element => {
                    if (element.getAttribute('data-image-id')) return null;
                    const raw = element.getAttribute('src');
                    return raw && /^https?:\/\//i.test(raw) ? raw : null;
                },
                renderHTML: attrs => (attrs.imageId || !attrs.src ? {} : { src: attrs.src }),
            },
            alt: {
                default: null,
                parseHTML: element => element.getAttribute('alt') || null,
                renderHTML: attrs => (attrs.alt ? { alt: attrs.alt } : {}),
            },
            width: {
                default: null,
                parseHTML: element => {
                    const parsed = Number(element.getAttribute('width'));
                    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                },
                renderHTML: attrs => (attrs.width ? { width: String(attrs.width) } : {}),
            },
            height: {
                default: null,
                parseHTML: element => {
                    const parsed = Number(element.getAttribute('height'));
                    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                },
                renderHTML: attrs => (attrs.height ? { height: String(attrs.height) } : {}),
            },
        };
    },

    parseHTML() {
        return [
            { tag: 'img[data-image-id]' },
            { tag: 'img[src]' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(NoteImageView);
    },
});
