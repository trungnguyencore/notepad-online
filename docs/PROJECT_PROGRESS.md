# PROJECT PROGRESS — Notepad Online

- **Last verified:** 2026-10-03
- **Root:** `D:\OTHERS\LATVAT\notepad app online`
- **Status:** Global note search đã rollout production PASS trên nền Pin + Sort + Recent. Feature commit `f5cdc7b` đã push `main`; Vercel deployment `notepad-online-pzux3i19u-trunknguen.vercel.app` Ready; production alias phục vụ đúng bundle `assets/index-Ci2FaFSR.js`. Desktop + iPhone 393×852 smoke PASS; title/body search, accent-insensitive match, highlight, clear, touch targets và isolated cleanup đều verified.
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

## 5E. Deferred future design — Apple Notes Sync + Vault — 2026-10-03

- User muốn sau này sync toàn bộ Apple Notes trên iPhone lên Notepad Online và có xử lý riêng cho note đang khóa.
- Hướng đã ghi vào backlog: prototype iOS Shortcuts trước với 3 note thật (normal/checklist/locked), sau đó mới khóa schema/API; chưa giả định Shortcut đọc được locked note hoặc có stable note ID.
- V1 dự kiến one-way import `Apple Notes → iOS Shortcut → HTTPS import endpoint → Notepad Online/Firestore`; bulk first sync + incremental create/update nếu metadata cho phép; không auto-delete web note khi Apple Note bị xóa.
- Locked note design dự kiến dùng `Vault Password` riêng với `Sync Key`, ưu tiên một vault cho locked notes trong workspace; plaintext locked note phải được mã hóa/giải mã client-side trước khi lưu Firestore. Crypto details phải review khi implement, chưa chốt algorithm/KDF ở state hiện tại.
- Nếu locked Apple Notes không đọc được qua Shortcut sau xác thực iPhone thì V1 phải skip + report, không bypass cơ chế khóa. Attachment/ảnh/PDF/scan/drawing để phase sau.
- Đây là **future design only**: chưa có code, endpoint, schema migration, iPhone prototype hoặc production evidence.

## 5F. Branding logo A rollout — 2026-10-03

- User chọn concept A: folded note tối giản, nền cream, góc gập vàng, ba dòng charcoal và accent dot vàng.
- Added `public/notepad-logo.svg`; header `src/App.jsx` thay avatar chữ `N` bằng SVG 40×40, giữ nguyên header height/layout và accessibility thông qua title text hiện có.
- Local `npm run build` PASS: 1705 modules; JS 818.62 kB / 232.55 kB gzip; warning chunk >500 kB vẫn còn.
- Local visual acceptance PASS desktop light/dark + mobile 393×852: logo load đúng, 40×40, no page overflow.
- Feature commit `2cf812b` (`feat: add notepad brand logo`) pushed `main`; Vercel deployment `notepad-online-6950taq52-trunknguen.vercel.app` Ready.
- Production alias `https://notepad-online-beta.vercel.app` Selenium readback: logo complete=true, natural 150×150, rendered 40×40, page overflow=false.
- Không đổi Firestore, Sync Key, note/editor/folder behavior hoặc archive/backups.

## 5G. Pin + Sort + Recent notes — 2026-10-03

- Added backward-compatible note metadata: `pinned` (missing = false) và `lastOpenedAt` (missing = null); không cần Firestore rules/schema migration vì current note rules cho phép update field.
- Pin/unpin dùng write riêng, **không** touch `updatedAt`, nên thao tác ghim không làm sai thứ tự `Mới sửa`.
- Explicit note open cập nhật `lastOpenedAt` riêng; virtual system folder `Gần đây` hiển thị tối đa 10 note mở gần nhất và sync được giữa iPhone/laptop qua Firestore.
- Sort trong các list thường: `Mới sửa`, `Cũ nhất`, `A–Z`; pinned notes luôn đứng trước rồi mới áp sort trong từng nhóm. Sort preference lưu localStorage key `notepad-note-sort`.
- Recent view giữ thứ tự `lastOpenedAt` thay vì sort/pin priority để đúng semantics gần đây.
- Note card có Pin + Delete là sibling controls; pin/delete touch targets >=44px và DOM `button button = 0`.
- Final local build PASS: 1705 modules; JS 822.27 kB / 233.44 kB gzip; existing Vite chunk >500 kB warning remains.
- Local desktop regression với 4 isolated notes: pin Delta => `[Delta,Mike,Zulu,Alpha]`; Cũ nhất => `[Delta,Alpha,Zulu,Mike]`; A–Z => `[Delta,Alpha,Mike,Zulu]`; Recent after opening Zulu→Alpha => `[Alpha,Zulu,Mike,Delta]`; reload giữ Recent + pin; overflowX=false; console SEVERE=[] .
- Local mobile 393×852: A–Z + pin priority đúng; sort control 44px; pin/delete >=44px; Recent row/count + order đúng; no overflow/nested buttons; sort preference `title-asc` persisted after reload; console SEVERE=[] .
- Feature commit `8ca3b92` (`feat: add pin sort and recent notes`) pushed `main`; Vercel `notepad-online-dqukqqd8l-trunknguen.vercel.app` Ready; production alias served exact local JS bundle `assets/index-BqJz-Nup.js`.
- Production desktop smoke: default `[Delta,Mike,Zulu,Alpha]`, A–Z `[Delta,Alpha,Mike,Zulu]`, Recent `[Alpha,Zulu,Mike,Delta]`, pin 44×56, no overflow/nested, console SEVERE=[] .
- Production iPhone 393×852: Recent row count=4, same list order/persistence, sort 69×44, pin buttons 44×56, no overflow, console SEVERE=[] .
- Isolated Sync Key SHA-256 root `9f486f5bac01bfdc793e91443f2b8c2c331f89b67361e9bcf2ba64b582cb862b` cleanup via Firebase CLI exit 0; final production browser readback = 0 note / 0 editor.

## 5H. Global note search — 2026-10-03

- Added global real-time search UI inside `NoteList`; search source là **toàn bộ notes trong Sync Key hiện tại**, không chỉ folder/Recent đang chọn.
- Search match `title + plain-text body`; HTML content được giảm về text bằng `DOMParser` trước khi match.
- Matching case-insensitive và Vietnamese diacritic-insensitive: ASCII `hoc may` match `Học máy`, `bao cao` match `Báo cáo`, `đ/Đ` normalize về `d/D`.
- Khi search active, heading cột note đổi thành `Tìm kiếm`, caption hiện `N kết quả / total ghi chú`; clear search trả lại đúng folder/Recent scope.
- Search results giữ pinned-first + sort semantics hiện có; Recent ordering chỉ tạm ngưng trong lúc search global, sau clear thì phục hồi.
- Title/body preview highlight match đầu tiên; body preview tự recenter quanh match nếu match nằm ngoài 80 ký tự đầu.
- Search input mobile-safe font 16px + height 44px; clear button 44×44; desktop font 14px.
- Tạo note mới, đổi folder, đổi Sync Key hoặc back về folders đều clear transient search state.
- Final local build PASS: 1705 modules; JS 825.54 kB / 234.21 kB gzip; Vite chunk >500 kB warning cũ vẫn còn.
- Local desktop isolated regression từ folder `HocTap`: trước search `[Mon AI]`; `project` => global `[Project DFT]`; `hoc may` => `[Mon AI]` qua body và highlight `Học máy`; `bao cao` => `[Project DFT]` highlight `Báo cáo`; no-result => 0 cards; clear => `[Mon AI]`; input 44px, clear 44×44, no overflow/nested, console SEVERE=[] .
- Local iPhone 393×852 regression PASS: global title/body search từ folder scope, body highlight `Học máy`, no-result 0 cards, clear restore folder; input 240×44 font 16px, clear 44×44, sort 69×44, pin 44×56, no overflow/nested, console SEVERE=[] .
- Feature commit `f5cdc7b` (`feat: add global note search`) pushed `main`; Vercel `notepad-online-pzux3i19u-trunknguen.vercel.app` Ready; production alias served exact local runtime bundle `assets/index-Ci2FaFSR.js`.
- Production desktop + iPhone 393×852 smoke reproduced global title/body search, no-accent match, highlight, clear behavior và 44px mobile targets; console SEVERE=[] .
- Isolated Sync Key SHA-256 root `06e4629db15f4d840ff1a80393fe354c07fc596c10aacbed53238ce8c51aff57` cleanup via Firebase CLI exit 0; final production readback = 0 note cards / 0 editor.

## 6. Current backlog

Backlog chi tiết nằm tại `docs\TODOLIST.md`.
Global Search, Pin + Sort + Recent, compact header, checklist, folder flows và branding logo hiện đều production PASS. Bundle/code-splitting, Firestore Rules hardening, toast/shortcuts và Apple Notes Sync + Vault vẫn còn backlog.

## 7. Next actions

1. User acceptance Global Search + Pin + Sort + Recent (cùng compact header/checklist) trên iPhone thật.
2. Tiếp tục bundle/code-splitting và Firestore Rules hardening.
3. Folder delete chưa có trong v1; nếu thêm sau phải chuyển notes về `Chưa phân loại`, không cascade-delete notes.
4. Tiếp tục backlog feature (toast/keyboard shortcuts...); Apple Notes Sync + Vault giữ ở future design cho tới khi user bắt đầu phase đó.

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
- 2026-10-03: Branding logo A rollout: added `public/notepad-logo.svg`, header avatar `N` replaced with folded-note logo; build + light/dark/mobile visual PASS; feature `2cf812b` pushed `main`; Vercel `6950taq52` Ready; production logo 40×40/no-overflow PASS.
- 2026-10-03: Pin + Sort + Recent rollout: feature `8ca3b92` pushed `main`; Vercel `dqukqqd8l` Ready; pinned priority + Mới sửa/Cũ nhất/A–Z + virtual Recent 10-note view verified local/production desktop+iPhone; isolated workspace cleanup=0.
- 2026-10-03: Global Search rollout: feature `f5cdc7b` pushed `main`; Vercel `pzux3i19u` Ready; global title/body search + no-accent Vietnamese matching + highlight + clear verified desktop/iPhone production; isolated search workspace cleanup=0.
