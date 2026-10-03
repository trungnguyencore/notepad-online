# PROJECT PROGRESS — Notepad Online

- **Last verified:** 2026-10-03
- **Root:** `D:\OTHERS\LATVAT\notepad app online`
- **Status:** Compact editor header đã rollout production PASS. Feature commit `f8f7c63` đã push `main`; production alias `https://notepad-online-beta.vercel.app` nhận đúng bundle mới `assets/index-fN71wbty.js`. Desktop + iPhone 393×852 production smoke PASS, `Aa` selector round-trip H2→paragraph PASS, mobile persistence qua reload PASS, isolated test workspace cleanup=0.
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
- `src\components\NoteEditor.jsx` có editor, autosave debounce, folder picker và Checklist/Task list bằng TipTap `TaskList` + `TaskItem`.
- `src\components\NoteList.jsx` có danh sách, create/select/delete UI và mobile back-to-folders navigation.
- `src\components\SyncKeyModal.jsx` có luồng nhập Sync Key.
- Header có attribution `@trunk.ng` link tới `https://www.instagram.com/trunk.ng/`.
- Firebase client config lấy từ `VITE_FIREBASE_*` trong `src\lib\firebase.js`.
- `vercel.json` có SPA rewrite/security headers.

## 3. Git state at verification

- Branch: `main`, remote `https://github.com/trungnguyencore/notepad-online.git`.
- Baseline trước checklist: `ef2c3ed7ad0e2bf8e6f08f0558ac774fc65c9ae8` (`docs: add project README`).
- Checklist feature commit đã push `main`: `822c80b29be0e622fd229b6769ec0613e43284c8` (`feat: add checklist task lists`).
- `.env` vẫn ignored/untracked; task checklist không đọc hoặc stage `.env`.

## 4. Verification status

- Production URL: `https://notepad-online-beta.vercel.app`; folder UI hiện đã deploy production.
- Vercel deployment folder rollout: `https://notepad-online-k9ioc8h0z-trunknguen.vercel.app`, status `Ready`, created 2026-09-21 14:35:21 +07:00.
- Vercel project `trunknguen/notepad-online` auto-deploy từ GitHub `main` PASS sau push commit `d9165d0`.
- Firestore project: `notepad-app-6845e`; `firestore.rules` folder rules compiled và deploy PASS ngày 2026-09-21.
- Existing note CRUD isolated-key acceptance: create → autosave → refresh persistence → delete cleanup PASS.
- Chưa xác minh PWA/offline behavior.
- Không có `test` hoặc `lint` script trong `package.json` hiện tại.
- `npm install` trong task checklist báo 50 dependency audit findings (2 low, 39 moderate, 8 high, 1 critical); không chạy `npm audit fix` vì ngoài scope và có thể đổi dependency rộng.
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
- Production rollout PASS: `d9165d0` → Vercel Ready → alias `https://notepad-online-beta.vercel.app`.
- Production mobile smoke 393×852 PASS: `@trunk.ng` link đúng; folder home hiện; create folder PASS; rename PASS; note tạo trong folder nhận đúng picker; nội dung persist; move về `Chưa phân loại` PASS; overflowX=0; nested button=0; visible small button count=0; note cleanup=0; console=[] .
- Production test workspace đã cleanup bằng Firebase CLI recursive delete, exit code 0.

## 5C. Checklist / Task list implementation — 2026-10-01

- Backup pre-checklist: `D:\OTHERS\LATVAT\notepad app online_backup_2026-10-01_pre_checklist`; verified 175/175 files excluding `node_modules`/`dist`, Git HEAD `ef2c3ed`.
- Added exact runtime-aligned dependencies `@tiptap/extension-task-list@2.27.2` và `@tiptap/extension-task-item@2.27.2`; `npm ls` confirms React/StarterKit/TaskList/TaskItem cùng TipTap 2.27.2 line.
- Editor toolbar có nút `Checklist` 44×44 dùng icon `ListChecks`; command `toggleTaskList()`; Enter tạo task item tiếp theo.
- Task item render checkbox native; checked item dùng text secondary + line-through; nested task list được enable.
- Không đổi Firestore schema/rules: checklist được serialize trực tiếp trong `note.content` HTML với `data-type="taskList"`, `data-type="taskItem"`, `data-checked` và sync qua autosave hiện có.
- Normal-save regression: `[false,false] → first click → reload [true,false] → second click → reload [true,true]`, console sạch.
- Fast-switch/back regression: checkbox change trước debounce vẫn đi qua pending-draft flush; direct Firestore verification sau commit delay xác nhận đúng `1 checked / 1 unchecked`; cold-start mobile render lại `[false,true]` đúng backend.
- Mobile 393×852 cold-start: Checklist toolbar 44×44, task-list markup present, overflowX=0, nested buttons=0, console=[] .
- Checked task computed `text-decoration-line = line-through`.
- Final build after version alignment: PASS, 1705 modules; JS 818.31 kB minified / 232.39 kB gzip; Vite chunk >500 kB warning remains.
- 5 isolated checklist Sync Keys đã cleanup; direct Firestore verification = 0 documents cho cả 5 test workspaces.
- Checklist feature commit `822c80b` đã push lên GitHub `main` và Vercel auto-deploy production PASS.
- Feature deployment: `https://notepad-online-fyoy7lzt2-trunknguen.vercel.app`, status `Ready`, created 2026-10-01 22:33:38 +07:00; alias `https://notepad-online-beta.vercel.app` trỏ vào deployment này tại thời điểm production smoke.
- Production desktop smoke PASS: tạo 2 checklist item `[false,false]`, check item đầu `[true,false]`, refresh vẫn `[true,false]`, toolbar 44×44, checked text line-through, console=[] .
- Production mobile 393×852 smoke PASS: cold state `[true,false]`, task markup present, check item hai → `[true,true]`, reload vẫn `[true,true]`, toolbar 44×44, overflowX=0, nestedButtons=0, console=[] .
- Production test note cleanup qua UI PASS; `cleanupCards=0` trên isolated Sync Key.

## 5D. Compact editor header — 2026-10-03

- UI refinement theo user review; không đổi Firestore schema, autosave, folder data model hoặc checklist serialization.
- `FolderPicker` được chuyển từ một hàng riêng lên cùng metadata line với `Cập nhật ... · trạng thái lưu`; desktop chip nhỏ hơn, mobile vẫn giữ touch target tối thiểu 44px.
- Ba nút `H1/H2/H3` được gom thành một selector `Aa` với các lựa chọn paragraph/H1/H2/H3; Bold/Italic/Underline/list/checklist/quote giữ nguyên.
- Header gap/padding và khoảng cách trước editor được giảm; toolbar desktop ép một hàng, mobile vẫn horizontal-scroll khi thiếu chỗ.
- Final local visual acceptance PASS: desktop viewport 1424×749 không overflow ngang, folder chip 32px, toolbar 44px một hàng; iPhone emulation 393×852 không page overflow, folder chip giữ 44px touch target, toolbar 44px và horizontal swipe khi thiếu chỗ. Checklist được đưa ngay sau `Aa` để luôn thấy trên 393px; scrollbar ngang bị ẩn nhưng scroll vẫn hoạt động.
- Mobile metadata rút gọn còn `HH:mm · trạng thái`; desktop vẫn giữ đầy đủ ngày giờ. Isolated Sync Key visual test đã cleanup về 0 note.
- Final `npm run build` PASS ngày 2026-10-03: 1705 modules, JS 818.69 kB / 232.53 kB gzip; warning chunk >500 kB vẫn còn.
- Production rollout: feature commit `f8f7c63` pushed to `main`; Vercel production alias served exact local runtime bundle `assets/index-fN71wbty.js`.
- Production desktop smoke PASS: no page overflow; toolbar 44px một hàng; Checklist + `Aa` visible; `Aa` đổi paragraph→H2 rồi H2→paragraph đúng (`1 → 0` H2 node); severe console=[] .
- Production iPhone emulation 393×852 PASS: no page overflow; folder chip 44px; toolbar/style/checklist 44px; Checklist nằm trong viewport; toolbar horizontal-scroll 394/329px nhưng scrollbar ẩn; content persist qua reload. Lần đầu có một Firestore Listen 404 transient; hai lượt rerun sau khi clear log đều severe console=[] và dữ liệu vẫn persist.
- Isolated production test workspace cleanup dùng exact SHA-256 root `fb009209ef7192ae85b309bef556020efbc39128428499df6138c002403887ce`; Firebase CLI recursive cleanup exit 0; final browser readback = 0 note / 0 editor.

## 6. Current backlog

Backlog chi tiết nằm tại `docs\TODOLIST.md`.
Compact header đã production PASS cùng checklist/folder flows hiện có. Bundle/code-splitting và Firestore Rules hardening vẫn còn.

## 7. Next actions

1. User acceptance compact header/checklist trên iPhone thật.
2. Tiếp tục bundle/code-splitting và Firestore Rules hardening.
3. Folder delete chưa có trong v1; nếu thêm sau phải chuyển notes về `Chưa phân loại`, không cascade-delete notes.
4. Tiếp tục backlog feature (toast/search/shortcuts...).

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
- 2026-09-21: Tạo backup pre-folders, implement folder create/rename + note folder assignment + desktop 3-pane/mobile 3-step + `@trunk.ng` Instagram attribution; deploy Firestore folder rules; desktop/mobile regression PASS.
- 2026-09-21: Push commit `d9165d0` lên `main`; Vercel auto-deploy folder UI Ready; production alias `notepad-online-beta.vercel.app` smoke PASS cho create/rename folder, folder-scoped note, move-to-Unfiled và Instagram attribution; test workspace cleanup PASS.
- 2026-10-01: Tạo backup pre-checklist; thêm TipTap TaskList/TaskItem + toolbar Checklist + checked styling; build PASS; normal save/reload + fast switch/back + mobile cold-start regressions PASS; 5/5 test workspaces cleanup về 0.
- 2026-10-01: Push feature commit `822c80b`; Vercel deployment `notepad-online-fyoy7lzt2-trunknguen.vercel.app` Ready; production desktop/mobile checklist smoke PASS, test note cleanup=0.
- 2026-10-03: Compact editor header rollout production: feature `f8f7c63` push `main`; Vercel alias nhận bundle `index-fN71wbty.js`; desktop + iPhone 393×852 smoke PASS, `Aa` round-trip PASS, mobile reload persistence PASS; transient Firestore Listen 404 không tái hiện sau clear-log rerun; isolated test workspace cleanup=0.
