# PROJECT PROGRESS — Notepad Online

- **Last verified:** 2026-09-21
- **Root:** `D:\OTHERS\LATVAT\notepad app online`
- **Status:** folder organization + Instagram attribution đã implement/test local với Firestore production backend; Vercel production UI chưa push/deploy folder code.
- **Backlog:** `docs\TODOLIST.md`
- **AI rules:** `.claude\CLAUDE.md`

## 1. Project structure

```text
notepad app online/
├── .claude/
│   ├── CLAUDE.md
│   └── gpt-progress/
│       ├── PROJECT_CONTEXT.md
│       ├── PROJECT_PROGRESS.md
│       ├── PROJECT_COMMANDS.md
│       └── PROJECT_EVIDENCE.md
├── docs/
│   ├── PROJECT_PROGRESS.md
│   └── TODOLIST.md
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
```
## 2. Verified implementation

- React 18 + Vite 6 làm frontend foundation.
- Tailwind CSS và CSS variables dùng cho UI/theme.
- TipTap dùng cho rich-text editing.
- `src\App.jsx` điều phối Sync Key, note selection và layout.
- `src\hooks\useNotes.js` có SHA-256 Sync Key, Firestore `onSnapshot`, CRUD helpers và `folderId` backward-compatible.
- `src\hooks\useFolders.js` có realtime folders + create/rename trên `sync_data/{hash}/folders`.
- `src\hooks\useTheme.js` quản lý theme persistence.
- `src\components\FolderList.jsx`, `FolderDialog.jsx`, `FolderPicker.jsx` cung cấp folder navigation/create/rename/move-note UI.
- `src\components\NoteEditor.jsx` có editor, autosave debounce và folder picker.
- `src\components\NoteList.jsx` có danh sách, create/select/delete UI và mobile back-to-folders navigation.
- `src\components\SyncKeyModal.jsx` có luồng nhập Sync Key.
- Header có attribution `@trunk.ng` link tới `https://www.instagram.com/trunk.ng/`.
- Firebase client config lấy từ `VITE_FIREBASE_*` trong `src\lib\firebase.js`.
- `vercel.json` có SPA rewrite/security headers.

## 3. Git state at verification

- Branch: `main`, remote `https://github.com/trungnguyencore/notepad-online.git`.
- Local/remote baseline trước folder work: commit `1f88301e68fbe5f619a5ab1be09d85b26d3c310e`.
- Folder/Instagram implementation hiện là uncommitted working-tree changes; chưa push/deploy Vercel.
- `.env` vẫn ignored/untracked; không được đọc hoặc stage trong task này.

## 4. Verification status

- Production URL hiện tại: `https://notepad-online-beta.vercel.app`; UI production vẫn ở baseline trước folder feature cho tới khi code được push.
- Vercel project `trunknguen/notepad-online` auto-deploy từ GitHub `main` đã verify trước đó.
- Firestore project: `notepad-app-6845e`; `firestore.rules` folder rules compiled và deploy PASS ngày 2026-09-21.
- Existing note CRUD isolated-key acceptance: create → autosave → refresh persistence → delete cleanup PASS.
- Chưa xác minh PWA/offline behavior.
- Không có `test` hoặc `lint` script trong `package.json` hiện tại.
## 5. Mobile/runtime stabilization — 2026-09-21

- Backup pre-mobile: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile` (91/91 files so với source excluding `node_modules`/`dist`; giữ `.git`, `.env`, source/config/docs).
- Final `npm run build`: PASS, 1699 modules transformed; JS bundle 803.22 kB minified / 228.30 kB gzip; Vite vẫn cảnh báo chunk >500 kB.
- Mobile emulation 393×852 và 430×932: không horizontal overflow; Sync Key input = 16px; console sạch.
- Mobile master/detail đã thay layout xếp dọc: list view 6 notes có document height = viewport 852px và editor section hidden cho tới khi chọn note.
- Visible interactive targets regression: không còn target <44px; toolbar 9/9 nút = 44×44.
- `NoteList` nested interactive regression: `button button = 0`.
- Fast-switch regression: gõ rồi quay lại danh sách trước debounce 450ms, refresh vẫn giữ draft (`fastSwitchPersisted = true`).
- Confirm delete regression: dialog hiện, Hủy giữ note, Xóa mới xóa.
- Desktop smoke 1440×900: two-pane vẫn hiển thị đúng, autosave/refresh persistence PASS, nested button = 0, console sạch.
- Tất cả test notes dùng Sync Key riêng đã cleanup về 0.

## 5A. Production deployment — 2026-09-21

- GitHub `main` push PASS: commit `fba947a` (`feat: optimize mobile notes experience`).
- Vercel auto-deploy được tạo sau push và alias production cập nhật thành công.
- Verified deployment: `https://notepad-online-mur34tw7l-trunknguen.vercel.app` → production alias `https://notepad-online-beta.vercel.app`.
- Vercel status: `Ready`; created 2026-09-21 13:16:24 +07:00.
- Production mobile smoke 393×852 PASS: title đúng, Sync Key input 16px, overflowX=0, fast-switch draft persist, nested button=0, visible small touch target count=0, confirm dialog hiện đúng, delete cleanup remaining=0, browser console sạch.
- Production smoke dùng Sync Key test riêng và đã xóa sạch test note.

## 5B. Folder organization implementation — 2026-09-21

- Pre-folder backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_folders`; verified 132/132 files excluding `node_modules`/`dist`, Git HEAD `1f88301`.
- Data model giữ notes ở `sync_data/{hash}/notes/{noteId}`; note cũ không có `folderId` được coi là `Chưa phân loại`.
- Folder metadata nằm song song tại `sync_data/{hash}/folders/{folderId}` với `name`, `createdAt`, `updatedAt`.
- Desktop layout local: 3 pane = Folders / Notes / Editor.
- Mobile layout local: Folders → Notes → Editor; back navigation từng tầng.
- Folder create + rename PASS; note tạo trong folder tự nhận `folderId`; FolderPicker chuyển note sang `Chưa phân loại` PASS.
- Desktop regression: create folder, rename, create note, move note, refresh persistence, nested button=0, overflowX=0, note cleanup=0.
- Mobile regression 393×852: Folders→Notes→Editor→Back, rename PASS, persisted content PASS, overflowX=0, nested button=0, no visible button <44px, stable console clean.
- Test Sync Keys/folder data được cleanup qua Firebase CLI recursive delete sau regression.
- Final `npm run build`: PASS, 1703 modules; JS 814.74 kB minified / 231.51 kB gzip; Vite chunk >500 kB warning vẫn còn.
- Firestore rules: added `folders` read/create/update; folder delete intentionally denied trong folder v1. Rules compiled + released to `cloud.firestore` on project `notepad-app-6845e`.
- Branding: header attribution `@trunk.ng` links to `https://www.instagram.com/trunk.ng/`, target `_blank`; verified in browser.
- Vercel production UI chưa chứa folder code vì working tree chưa được commit/push.

## 6. Current backlog

Backlog chi tiết nằm tại `docs\TODOLIST.md`.
Folder organization v1 đã implement/test local với Firestore production backend. Việc còn lại gần nhất là push/deploy UI folder khi user yêu cầu, sau đó production smoke. Firestore rules vẫn permissive theo mô hình Sync Key và cần hardening riêng; bundle >500 kB vẫn còn.

## 7. Next actions

1. Khi user yêu cầu deploy: review staged diff, commit/push folder feature lên `main`, chờ Vercel Ready.
2. Chạy production smoke cho create/rename folder, folder-scoped note, move note và `@trunk.ng` link.
3. Sau deploy, tiếp tục bundle/code-splitting và Firestore Rules hardening.
4. Folder delete chưa có trong v1; nếu thêm sau phải chuyển notes về `Chưa phân loại`, không cascade-delete notes.
5. Tiếp tục backlog feature (toast/search/shortcuts...) sau folder rollout.

## 8. Archive rule

`D:\OTHERS\LATVAT\notepad_old` là legacy archive/reference.
Không chỉnh sửa, move, rename hoặc xóa folder này.
Mọi công việc Notepad mặc định phải thực hiện ở project hiện tại.

## 9. Changelog

- 2026-09-21: Chuẩn hóa documentation layout; chuyển `PROGRESS.md` thành `docs\PROJECT_PROGRESS.md`, chuyển `TODOLIST.md` vào `docs\`, tạo `.claude\CLAUDE.md` và `.claude\gpt-progress\` chuẩn DFT/CTRR.
- 2026-09-21: Refresh state theo source/Git thực tế; loại bỏ các mô tả stale rằng React components chưa được tạo.
- 2026-09-21: Mobile/runtime audit xác minh build + CRUD PASS, tái hiện data-loss khi chuyển note nhanh, đo touch-target/mobile stacking và ghi lại bundle/meta warnings.
- 2026-09-21: Tạo backup pre-mobile rồi implement iPhone stabilization: flush autosave, mobile master/detail, 44px touch targets, 16px Sync Key input, nested-button fix, confirm dialog và PWA meta; final mobile + desktop regression PASS.
- 2026-09-21: Commit `fba947a` push lên `trungnguyencore/notepad-online`; Vercel Git integration auto-deploy production PASS; production alias `notepad-online-beta.vercel.app` mobile smoke + isolated CRUD cleanup PASS.
- 2026-09-21: Tạo backup pre-folders, implement folder create/rename + note folder assignment + desktop 3-pane/mobile 3-step + `@trunk.ng` Instagram attribution; deploy Firestore folder rules; desktop/mobile regression PASS. UI folder chưa push/deploy Vercel.
