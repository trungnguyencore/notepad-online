import React, { useEffect } from 'react';

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 px-4 pb-[max(16px,var(--safe-area-bottom))] pt-[var(--safe-area-top)] backdrop-blur-sm modal-overlay"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onCancel();
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="modal-content w-full max-w-sm rounded-2xl bg-apple-bg-primary p-5 text-apple-text-primary shadow-2xl"
            >
                <h2 id="confirm-dialog-title" className="text-[18px] font-semibold">
                    {title}
                </h2>
                <p className="mt-2 text-[14px] leading-5 text-apple-text-secondary">
                    {message}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="min-h-11 rounded-xl bg-apple-bg-secondary px-4 font-medium text-apple-text-primary active:scale-[0.98] transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="min-h-11 rounded-xl bg-apple-danger px-4 font-semibold text-white active:scale-[0.98] transition"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}
