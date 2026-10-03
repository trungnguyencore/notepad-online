# PROJECT CONTEXT — Notepad Online

- Root: `D:\OTHERS\LATVAT\notepad app online`
- Canonical progress: `docs\PROJECT_PROGRESS.md`
- Backlog: `docs\TODOLIST.md`
- AI rules: `.claude\CLAUDE.md`
- Legacy archive: `D:\OTHERS\LATVAT\notepad_old`
- Pre-mobile backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile`
- Pre-folders backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_folders`
- Pre-checklist backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-10-01_pre_checklist`
- Last verified: 2026-10-03

## Source priority
1. Source code và config thực tế trong `src\`, `public\`, root config.
2. Git state/history của repo hiện tại.
3. `docs\PROJECT_PROGRESS.md`.
4. `docs\TODOLIST.md` chỉ là backlog, không phải bằng chứng hoàn thành.
5. `notepad_old` chỉ là reference và không được chỉnh sửa.

## Architecture
- React 18 + Vite 6.
- Tailwind CSS + CSS variables.
- TipTap rich-text editor; runtime line verified 2.27.2. Checklist uses `TaskList` + `TaskItem` serialized inside note HTML.
- Firebase Firestore.
- Sync Key được SHA-256 trước khi dùng làm Firestore document path.
- Notes: `sync_data/{hash}/notes/{noteId}`; folder organization dùng `folderId` nullable để giữ backward compatibility.
- Folders: `sync_data/{hash}/folders/{folderId}`; create/read/update rules đã deploy, delete deny trong v1.
- Desktop folder UI = 3 pane; mobile = Folders → Notes → Editor.
- Vercel config có trong `vercel.json`; production alias `https://notepad-online-beta.vercel.app` hiện đã chạy Checklist/Task list sau feature commit `822c80b`.

## Critical rules
Không đọc `.env` nếu task không cần.
Không biến TODO thành fact đã hoàn thành.
Không sửa hoặc xóa `notepad_old`.
Không chỉnh sửa backup pre-mobile/pre-folders/pre-checklist trừ khi user yêu cầu restore rõ ràng.
