import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function SyncKeyModal({
    open,
    initialValue = '',
    onSubmit,
    onClose,
    canClose = false,
    noteCount = 0,
}) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        setValue(initialValue || '');
        setError('');
    }, [open, initialValue]);

    if (!open) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) {
            setError('Vui lòng nhập Sync Key.');
            return;
        }
        onSubmit(trimmed);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-y-auto bg-black/40 px-4 pb-[max(16px,var(--safe-area-bottom))] pt-[var(--safe-area-top)] backdrop-blur-sm modal-overlay">
            <div className="w-full max-w-md bg-apple-bg-primary text-apple-text-primary rounded-modal shadow-2xl p-5 sm:p-6 modal-content">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-apple-accent text-black flex items-center justify-center shadow-sm">
                        <KeyRound size={20} />
                    </div>
                    <div>
                        <h2 className="text-note-title">Nhập Sync Key</h2>
                        <p className="text-note-caption text-apple-text-secondary">
                            Khóa đồng bộ mở ghi chú đã lưu của bạn.
                        </p>
                    </div>
                </div>

                {noteCount > 0 && (
                    <div className="mb-4 rounded-xl bg-apple-bg-secondary px-4 py-3 text-note-caption text-apple-text-secondary">
                        Sync Key hiện tại có {noteCount} ghi chú.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-note-caption text-apple-text-secondary">Sync Key</label>
                        <input
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            className="mt-2 w-full rounded-xl bg-apple-bg-secondary px-4 py-3 text-[16px] leading-6 text-apple-text-primary outline-none ring-1 ring-transparent focus:ring-2 focus:ring-apple-accent"
                            placeholder="Ví dụ: night-breeze-2026"
                            type="password"
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            enterKeyHint="go"
                        />
                        {error && <p className="text-[12px] text-apple-danger mt-2">{error}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        {canClose ? (
                            <button
                                type="button"
                                onClick={onClose}
                                className="min-h-11 px-4 py-2 rounded-full text-note-caption text-apple-text-secondary hover:text-apple-text-primary active:scale-95 transition"
                            >
                                Hủy
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-note-caption text-apple-text-secondary">
                                <ShieldCheck size={14} />
                                Không cần đăng nhập
                            </div>
                        )}
                        <button
                            type="submit"
                            className="min-h-11 px-6 py-2 rounded-full bg-apple-accent text-black font-semibold text-[15px] hover:bg-apple-accent-hover active:scale-95 transition"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </form>

                <p className="mt-4 text-[12px] text-apple-text-secondary">
                    Gợi ý: dùng cụm từ dài, khó đoán để bảo mật ghi chú.
                </p>
            </div>
        </div>
    );
}
