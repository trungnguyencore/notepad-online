import React, { useEffect, useState } from 'react';

export default function FolderDialog({ open, mode = 'create', initialName = '', onClose, onSubmit }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initialName || '');
    setError('');
  }, [open, initialName]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tên thư mục không được để trống.');
      return;
    }
    const ok = await onSubmit(trimmed.slice(0, 60));
    if (ok !== false) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 px-4 pb-[max(16px,var(--safe-area-bottom))] pt-[var(--safe-area-top)] backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-dialog-title"
        className="w-full max-w-sm rounded-2xl bg-apple-bg-primary p-5 text-apple-text-primary shadow-2xl"
      >
        <h2 id="folder-dialog-title" className="text-[18px] font-semibold">
          {mode === 'rename' ? 'Đổi tên thư mục' : 'Tạo thư mục mới'}
        </h2>
        <p className="mt-1 text-note-caption text-apple-text-secondary">
          {mode === 'rename' ? 'Nhập tên mới cho thư mục.' : 'Đặt tên để nhóm các ghi chú liên quan.'}
        </p>

        <input
          autoFocus
          value={name}
          onChange={(event) => { setName(event.target.value); setError(''); }}
          maxLength={60}
          className="mt-4 w-full rounded-xl bg-apple-bg-secondary px-4 py-3 text-[16px] leading-6 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-apple-accent"
          placeholder="Ví dụ: Học tập"
          autoComplete="off"
        />
        {error && <p className="mt-2 text-[12px] text-apple-danger">{error}</p>}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl bg-apple-bg-secondary px-4 font-medium active:scale-[0.98] transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="min-h-11 rounded-xl bg-apple-accent px-4 font-semibold text-black active:scale-[0.98] transition"
          >
            {mode === 'rename' ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </form>
    </div>
  );
}
