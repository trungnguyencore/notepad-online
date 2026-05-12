import React from 'react';
import { FileText, Plus } from 'lucide-react';

export default function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-apple-bg-tertiary flex items-center justify-center mb-6">
        <FileText size={36} className="text-apple-text-secondary" />
      </div>
      <h2 className="text-note-title text-apple-text-primary mb-2">
        Chưa có ghi chú nào
      </h2>
      <p className="text-note-caption text-apple-text-secondary mb-8 max-w-xs">
        Tạo ghi chú đầu tiên của bạn và đồng bộ an toàn qua Sync Key
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-apple-accent text-black font-semibold text-[15px] hover:bg-apple-accent-hover active:scale-95 transition-all duration-200 shadow-lg shadow-apple-accent/25"
      >
        <Plus size={18} />
        Tạo ghi chú mới
      </button>
    </div>
  );
}
