import React from 'react';
import { Folder } from 'lucide-react';

export default function FolderPicker({ folders, value, onChange }) {
  return (
    <label className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-lg bg-apple-bg-tertiary px-2 text-note-caption text-apple-text-secondary lg:min-h-8">
      <Folder size={14} className="shrink-0 text-apple-accent" />
      <span className="sr-only">Thư mục</span>
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="min-w-0 max-w-[180px] flex-1 bg-transparent py-1 text-[13px] text-apple-text-primary outline-none"
        aria-label="Chọn thư mục cho ghi chú"
      >
        <option value="">Chưa phân loại</option>
        {folders.map(folder => (
          <option key={folder.id} value={folder.id}>{folder.name}</option>
        ))}
      </select>
    </label>
  );
}
