# PROJECT CONTEXT — Notepad Online

- Root: `D:\OTHERS\LATVAT\notepad app online`
- Canonical progress: `docs\PROJECT_PROGRESS.md`
- Latest state 2026-11-25 (PRODUCTION DEPLOYED — `75861f4`): canonical 5N + 5O. Đã gộp rollout tính năng ảnh trong note (5N: `sync_data/{hash}/images/{imageId}`, WebP/JPEG ≤720 KB, `NoteImage` NodeView + Lightbox) cùng nâng cấp editor UI (5O: custom portal dropdown `Aa`, `color-scheme: light/dark`, checklist tròn animation Apple Notes, khôi phục Bullet/Ordered list markers, Việt hóa tooltip toolbar). `firestore.rules` đã deploy lên `notepad-app-6845e` trước khi push; commit `75861f4` pushed `main` → Vercel `notepad-online-d2601ikk3-trunknguen.vercel.app` Ready → `https://notepad-online-beta.vercel.app` phục vụ đúng exact bundle `index-CKZ8xk0u.js` / `index-1zSoJxDc.css`. Automated live Firebase Selenium suite & physical iPhone test chưa chạy lại trong lượt rollout này.
- Previous production rollout 2026-11-14: canonical 5M + `docs/qa/2026-11-14/ROLLOUT.md` (`1965688` → `cf1zs5ptv`, real Firebase 19/19 PASS).
- Backlog: `docs\TODOLIST.md`
- AI rules: `.claude\CLAUDE.md`
- Legacy archive: `D:\OTHERS\LATVAT\notepad_old`
- Pre-mobile backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile`
- Pre-folders backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_folders`
- Pre-checklist backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-10-01_pre_checklist`
- Last verified: 2026-11-25 production rollout (`75861f4`, `firestore.rules` deployed, `npm run build` PASS, user local review PASS, exact production JS/CSS bundle verified); last automated real-Firebase suite 2026-11-14 (`1965688`, 19/19 PASS).

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
- Vercel config trong `vercel.json`; production alias `https://notepad-online-beta.vercel.app`. Current runtime feature `75861f4` → Vercel `notepad-online-d2601ikk3-trunknguen.vercel.app` (`dpl_J4Wu6xhoLp3yfjoDWA5mDuJJZtBK`) Ready, exact bundles `index-CKZ8xk0u.js` + `index-1zSoJxDc.css`; `firestore.rules` updated with `/images/{imageId}` on `notepad-app-6845e`. Canonical 5N + 5O.

## Critical rules
Không đọc `.env` nếu task không cần.
Không biến TODO thành fact đã hoàn thành.
Không sửa hoặc xóa `notepad_old`.
Không chỉnh sửa backup pre-mobile/pre-folders/pre-checklist trừ khi user yêu cầu restore rõ ràng.
