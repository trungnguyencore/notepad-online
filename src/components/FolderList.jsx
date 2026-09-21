import React from 'react';
import { Folder, Inbox, List, Pencil, Plus } from 'lucide-react';

function FolderRow({ label, count, active, icon: Icon, onSelect, onRename }) {
  return (
    <div className={`flex min-h-12 items-stretch rounded-xl transition ${active ? 'bg-apple-bg-primary ring-2 ring-apple-accent' : 'hover:bg-apple-bg-tertiary'}`}>
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left"
        aria-current={active ? 'true' : undefined}
      >
        <Icon size={18} className={`shrink-0 ${active ? 'text-apple-accent' : 'text-apple-text-secondary'}`} />
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-apple-text-primary">{label}</span>
        <span className="shrink-0 text-[12px] text-apple-text-secondary">{count}</span>
      </button>
      {onRename && (
        <button
          type="button"
          onClick={onRename}
          className="m-1 flex w-11 shrink-0 items-center justify-center rounded-xl text-apple-text-secondary hover:bg-apple-bg-tertiary hover:text-apple-text-primary active:scale-95 transition"
          aria-label={`Đổi tên thư mục ${label}`}
        >
          <Pencil size={16} />
        </button>
      )}
    </div>
  );
}

export default function FolderList({
  folders,
  notes,
  loading,
  selectedFolderId,
  onSelect,
  onCreate,
  onRename,
}) {
  const unfiledCount = notes.filter(note => !note.folderId).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-note-title text-apple-text-primary">Thư mục</h2>
          <p className="text-note-caption text-apple-text-secondary">
            {loading ? 'Đang đồng bộ...' : `${folders.length} thư mục`}
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-apple-accent text-black hover:bg-apple-accent-hover active:scale-95 transition"
          aria-label="Tạo thư mục mới"
        >
          <Plus size={19} />
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
        <FolderRow
          label="Tất cả ghi chú"
          count={notes.length}
          active={selectedFolderId === 'all'}
          icon={List}
          onSelect={() => onSelect('all')}
        />
        <FolderRow
          label="Chưa phân loại"
          count={unfiledCount}
          active={selectedFolderId === 'unfiled'}
          icon={Inbox}
          onSelect={() => onSelect('unfiled')}
        />

        <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-apple-text-secondary">
          Của bạn
        </div>

        {loading && [0, 1, 2].map(index => (
          <div key={index} className="h-12 rounded-xl bg-apple-bg-tertiary animate-pulse" />
        ))}

        {!loading && folders.length === 0 && (
          <div className="rounded-xl bg-apple-bg-tertiary p-3 text-note-caption text-apple-text-secondary">
            Chưa có thư mục. Nhấn + để tạo thư mục đầu tiên.
          </div>
        )}

        {!loading && folders.map(folder => (
          <FolderRow
            key={folder.id}
            label={folder.name}
            count={notes.filter(note => note.folderId === folder.id).length}
            active={selectedFolderId === folder.id}
            icon={Folder}
            onSelect={() => onSelect(folder.id)}
            onRename={() => onRename(folder)}
          />
        ))}
      </div>
    </div>
  );
}
