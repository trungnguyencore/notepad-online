# PROJECT CONTEXT — Notepad Online

- Root: `D:\OTHERS\LATVAT\notepad app online`
- Canonical progress: `docs\PROJECT_PROGRESS.md`
- Latest state 2026-11-14: user approved deploy; canonical 5M + `docs/qa/2026-11-14/ROLLOUT.md`. Feature `1965688` pushed main → Vercel `cf1zs5ptv` Ready → production bundle exact match reviewed build `index-4u6YFiP1.js`; actual Firebase 10/10 + 9/9 both preflight 3114 and production, cleanup=0/SEVERE=0. This supersedes historical review-pending checkpoint below.
- Resume checkpoint 2026-11-14: `docs/qa/2026-11-13/HANDOFF.md`. Reports read back 104/104, 10 source/build hashes match, local 3113 HTTP 200; no test/build rerun. Await user local review; no deploy approval, working tree uncommitted.
- Local fixes verified 2026-11-13: canonical section 5L + `docs/qa/2026-11-13/FIXES.md`. 3 UI/UX + 2 sync findings fixed, 104/104 local checks + final build PASS; localhost 3113 isolated persistent test backend. User review pending; no commit/push/deploy. Production evidence below remains historical 31/10; no new real-Firebase integration evidence.
- Backlog: `docs\TODOLIST.md`
- AI rules: `.claude\CLAUDE.md`
- Legacy archive: `D:\OTHERS\LATVAT\notepad_old`
- Pre-mobile backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile`
- Pre-folders backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_folders`
- Pre-checklist backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-10-01_pre_checklist`
- Last verified: 2026-11-14 production; rules unchanged since 31/10, frontend/sync fixes deployed + live PASS. Latest handoff is QA 14/11 ROLLOUT, not older checkpoint.

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
- Vercel config trong `vercel.json`; production alias `https://notepad-online-beta.vercel.app`. Current runtime feature `1965688` → Vercel `cf1zs5ptv` Ready, exact bundle `index-4u6YFiP1.js`; live production 19/19 actual Firebase PASS. Latest handoff `docs/qa/2026-11-14/ROLLOUT.md`, canonical 5M; deployment 31/10 ở section 5J là historical.

## Critical rules
Không đọc `.env` nếu task không cần.
Không biến TODO thành fact đã hoàn thành.
Không sửa hoặc xóa `notepad_old`.
Không chỉnh sửa backup pre-mobile/pre-folders/pre-checklist trừ khi user yêu cầu restore rõ ràng.
