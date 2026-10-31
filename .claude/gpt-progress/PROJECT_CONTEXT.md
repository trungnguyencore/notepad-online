# PROJECT CONTEXT — Notepad Online

- Root: `D:\OTHERS\LATVAT\notepad app online`
- Canonical progress: `docs\PROJECT_PROGRESS.md`
- Backlog: `docs\TODOLIST.md`
- AI rules: `.claude\CLAUDE.md`
- Legacy archive: `D:\OTHERS\LATVAT\notepad_old`
- Pre-mobile backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile`
- Pre-folders backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_folders`
- Pre-checklist backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-10-01_pre_checklist`
- Last verified: 2026-10-31; rules/frontend deployed + live production PASS

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
- Notes: `sync_data/{hash}/notes/{noteId}`; folder organization dùng `folderId` nullable; Pin/Recent dùng backward-compatible `pinned` + `lastOpenedAt` metadata.
- Folders: `sync_data/{hash}/folders/{folderId}`; delete giữ notes bằng transactions theo nhóm 200. Rules compile/release ngày 31/10; feature `2632f60` deployed, 10/10 live production checks PASS; test cleanup=0.
- Desktop folder UI = 3 pane; mobile = Folders → Notes → Editor.
- Vercel config có trong `vercel.json`; production alias `https://notepad-online-beta.vercel.app`. Feature `2632f60` → Vercel `2fp75o1w8` Ready, exact bundle `index-BLTcuew3.js` verified, live production smoke PASS; canonical section 5J. Handoff: `docs/qa/2026-10-31/HANDOFF.md`.

## Critical rules
Không đọc `.env` nếu task không cần.
Không biến TODO thành fact đã hoàn thành.
Không sửa hoặc xóa `notepad_old`.
Không chỉnh sửa backup pre-mobile/pre-folders/pre-checklist trừ khi user yêu cầu restore rõ ràng.
