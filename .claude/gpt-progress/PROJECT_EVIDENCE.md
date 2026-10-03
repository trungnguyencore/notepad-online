# PROJECT EVIDENCE — Notepad Online

- Last verified: 2026-10-03
- Canonical progress: `docs\PROJECT_PROGRESS.md`

## Verified source evidence
- `src\App.jsx`: root layout, Sync Key state, folder/note selection, desktop 3-pane/mobile 3-step navigation và `@trunk.ng` attribution.
- `src\hooks\useNotes.js`: SHA-256 Sync Key, Firestore listener, CRUD helpers, nullable `folderId`, backward-compatible `pinned` + `lastOpenedAt`, dedicated pin/open metadata writes không touch `updatedAt`.
- `src\hooks\useFolders.js`: Firestore realtime folders + create/rename.
- `src\components\FolderList.jsx`, `FolderDialog.jsx`, `FolderPicker.jsx`: folder navigation/create/rename/note assignment UI.
- `src\components\NoteEditor.jsx`: TipTap editor + autosave + folder picker + TaskList/TaskItem checklist toolbar command.
- `src\components\NoteList.jsx`: note list/create/delete + pin/unpin + persisted sort selector + global search UI/highlight + mobile back-to-folders navigation; Recent view preserves last-opened ordering.
- `src\components\SyncKeyModal.jsx`: Sync Key input flow.
- `src\lib\firebase.js`: Firebase init từ `VITE_FIREBASE_*`.
- `package.json`: React/Vite/Tailwind/TipTap/Firebase dependencies và npm scripts.

## Verified Git evidence
- Branch local: `main`; remote `https://github.com/trungnguyencore/notepad-online.git`.
- Baseline before folder feature: local/remote HEAD `1f88301e68fbe5f619a5ab1be09d85b26d3c310e`.
- Folder/Instagram rollout commit: `d9165d0c8c9248df3cfaf2ee5e035650f2b09de8`, pushed to `main`.
- Baseline at checklist start: local/remote `main` = `ef2c3ed7ad0e2bf8e6f08f0558ac774fc65c9ae8`.
- Checklist rollout feature commit: `822c80b29be0e622fd229b6769ec0613e43284c8`, pushed to `main`.
- Compact header feature commit: `f8f7c63` (`feat: compact note editor header`), pushed to `main`; production alias served matching runtime bundle `assets/index-fN71wbty.js`.
- Pin/Sort/Recent feature commit: `8ca3b92` (`feat: add pin sort and recent notes`), pushed to `main`; production alias served matching runtime bundle `assets/index-BqJz-Nup.js`.
- Global Search feature commit: `f5cdc7b` (`feat: add global note search`), pushed to `main`; production alias served matching runtime bundle `assets/index-Ci2FaFSR.js`.
- `.env` remains ignored and was not read/staged.

## Runtime/mobile evidence — 2026-09-21
- Pre-change backup verified 91/91 files (excluding `node_modules`/`dist`) tại `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile`.
- Final `npm run build`: PASS, 1699 modules transformed; JS 803.22 kB minified / 228.30 kB gzip; chunk warning >500 kB vẫn còn.
- Mobile regression 393×852: `fastSwitchPersisted=true`, `nestedButtons=0`, 9/9 toolbar = 44×44, confirm cancel/delete PASS, 6-note list giữ document height = viewport 852px, cleanup 6/6.
- Final touch regression: Sync Key input 16px, no visible button under 44px, overflowX=0, cleanup remaining=0.
- 430×932: overflowX=0, input=16px.
- Desktop 1440×900: two-pane visible, persistence PASS, nested button=0, cleanup=0, console sạch.
- Browser console post-fix sạch trong các flow đã test.

## Production deployment evidence — 2026-09-21
- GitHub push: `a837440..fba947a`, branch `main`, remote `trungnguyencore/notepad-online`.
- Vercel project account remains `trunknguen`; Git integration auto-created deployment `https://notepad-online-mur34tw7l-trunknguen.vercel.app`.
- Deployment status `Ready`, created 2026-09-21 13:16:24 +07:00; production alias `https://notepad-online-beta.vercel.app` points to it.
- Production Selenium mobile smoke 393×852: title correct, input 16px, overflowX=0, fast-switch persisted=true, nested=0, small touch target count=0, confirm visible=true, cleanup remaining=0, console=[] .

## Folder v1 evidence — 2026-09-21
- Pre-folder backup `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_folders`: 132/132 files excluding `node_modules`/`dist`; Git HEAD `1f88301`.
- `firestore.rules` compile + release PASS on Firebase project `notepad-app-6845e`; `folders` read/create/update enabled, delete denied.
- First folder probe before rule deploy correctly failed with `Missing or insufficient permissions`; same flow after deploy created folder successfully.
- Desktop local regression: folderCreated=true, renamed=true, picker initially renamed folder, move to Unfiled PASS, refresh persistence=true, nestedButtons=0, overflowX=0, noteCleanup=0.
- Mobile 393×852 local regression: Folder→Notes→Editor→Back navigation PASS, renameVisible=true, persistedContent=true, overflowX=0, nested=0, small buttons=[], cleanupRemaining=0, stable console=[] .
- Test-key data cleanup executed via `firebase firestore:delete ... --recursive --force`, exit code 0.
- Final `npm run build`: PASS, 1703 modules; JS 814.74 kB minified / 231.51 kB gzip; chunk warning remains.
- Instagram anchor verified in browser: text `@trunk.ng`, href `https://www.instagram.com/trunk.ng/`, target `_blank`.

## Production folder rollout evidence — 2026-09-21
- Git push: `1f88301..d9165d0` to `trungnguyencore/notepad-online` `main`.
- Vercel deployment `https://notepad-online-k9ioc8h0z-trunknguen.vercel.app`, status Ready, created 2026-09-21 14:35:21 +07:00; alias `https://notepad-online-beta.vercel.app` points to it.
- Production Selenium mobile smoke 393×852: Instagram text/href/target correct; foldersHome=true; folderCreated=true; rename=true; persistedContent=true; pickerAfterMove=`Chưa phân loại`; overflowX=0; nested=0; small=0; noteCleanupRemaining=0; console=[] .
- Production test Sync Key root cleanup via Firebase CLI recursive delete completed with exit code 0.

## Checklist evidence — 2026-10-01
- Pre-checklist backup `D:\OTHERS\LATVAT\notepad app online_backup_2026-10-01_pre_checklist`: 175/175 files excluding `node_modules`/`dist`; Git HEAD `ef2c3ed`.
- `npm ls` confirms `@tiptap/react`, `starter-kit`, `extension-task-list`, `extension-task-item` all at 2.27.2.
- Final `npm run build`: PASS, 1705 modules; JS 818.31 kB minified / 232.39 kB gzip.
- Browser saveprobe: typed two checklist items `[false,false]`; reload after first click `[true,false]`; reload after second click `[true,true]`; console clean.
- Fast-back test: UI changed `[true,true] → [false,true]`; after allowing Firestore commit, direct backend read = 1 true / 1 false; independent mobile cold-start rendered `[false,true]`.
- Mobile 393×852 cold-start: Checklist toolbar 44×44, `ul[data-type=taskList]` present, overflowX=0, nestedButtons=0, console=[] .
- Checked item computed style includes `text-decoration-line: line-through`.
- Cleanup verification across 5 isolated checklist Sync Keys: all collections returned 0 documents.
- Production checklist rollout: feature commit `822c80b` → Vercel deployment `https://notepad-online-fyoy7lzt2-trunknguen.vercel.app`, status Ready, created 2026-10-01 22:33:38 +07:00; alias `https://notepad-online-beta.vercel.app` updated.
- Production desktop smoke: create two task items `[false,false]`, first check `[true,false]`, reload `[true,false]`, toolbar 44×44, line-through verified, console=[] .
- Production mobile 393×852 smoke: cold `[true,false]`, task-list markup present, second check `[true,true]`, reload `[true,true]`, toolbar 44×44, overflowX=0, nestedButtons=0, console=[] .
- Production isolated test note deleted through UI; final note-card count = 0.

## Compact header evidence — 2026-10-03
- Local diff chỉ chạm `src/components/NoteEditor.jsx`, `src/components/FolderPicker.jsx`, `src/index.css` trước khi progress docs được cập nhật.
- Folder picker đã nằm cùng metadata line; desktop dùng compact chip, mobile giữ min-height 44px.
- H1/H2/H3 được thay bằng `TextStyleSelect` (`Aa`, H1, H2, H3); list/checklist/quote và B/I/U giữ nguyên.
- Final `npm run build` PASS: 1705 modules; JS 818.69 kB minified / 232.53 kB gzip; chunk warning >500 kB vẫn còn.
- Desktop local visual acceptance: viewport 1424×749, no page overflow, folder chip 32px, toolbar 44px một hàng.
- iPhone emulation 393×852: no page overflow, folder chip 44px, toolbar 44px; horizontal swipe còn hoạt động nhưng scrollbar ẩn; Checklist nằm trong vùng nhìn thấy ngay sau `Aa`.
- Mobile save metadata dùng `HH:mm · trạng thái`; desktop vẫn full date/time. Isolated visual-test Sync Key đã cleanup về 0 note.
- Production desktop smoke: no page overflow, toolbar 44px một hàng, Checklist + `Aa` visible; `Aa` paragraph→H2→paragraph verified (`h2Count 1 → 0`); severe console=[] .
- Production iPhone emulation 393×852: no page overflow, folder chip 44px, toolbar/style/checklist 44px, Checklist visible in viewport, toolbar horizontal-scroll 394/329px with hidden scrollbar; content persisted through reload.
- First mobile capture logged one transient Firestore Listen channel 404; two subsequent 5-second reruns after clearing initial logs had severe console=[] and persisted content unchanged, so it was not reproducible as a functional regression.
- Production isolated Sync Key root SHA-256 = `fb009209ef7192ae85b309bef556020efbc39128428499df6138c002403887ce`; exact Firebase CLI recursive cleanup completed exit 0; final browser readback = 0 note cards / 0 editor.

## Branding logo A evidence — 2026-10-03
- Source: `public/notepad-logo.svg` + `src/App.jsx` header image replacement only; no Firestore/data logic change.
- Local build PASS: 1705 modules; JS 818.62 kB minified / 232.55 kB gzip; existing chunk warning remains.
- Local visual: desktop light, desktop dark, mobile 393×852 all rendered 40×40 logo with no page overflow.
- Git feature commit `2cf812b` pushed to `main`.
- Vercel deployment `notepad-online-6950taq52-trunknguen.vercel.app` status Ready.
- Production alias browser readback: image complete=true, natural size 150×150, rendered size 40×40, page overflow=false.

## Pin + Sort + Recent evidence — 2026-10-03
- Local final build PASS: 1705 modules; JS 822.27 kB minified / 233.44 kB gzip; existing >500 kB chunk warning remains.
- Desktop isolated 4-note regression: initial newest `[Mike,Zulu,Alpha,Delta]`; pin Delta => `[Delta,Mike,Zulu,Alpha]`; Cũ nhất => `[Delta,Alpha,Zulu,Mike]`; A–Z => `[Delta,Alpha,Mike,Zulu]`.
- Explicit opens Zulu then Alpha produced Recent `[Alpha,Zulu,Mike,Delta]`; same order after reload; Delta pin persisted; nested buttons=0; pin controls 44×56; overflowX=false; console SEVERE=[] .
- Mobile 393×852 local: default pinned ordering `[Delta,Mike,Zulu,Alpha]`; A–Z `[Delta,Alpha,Mike,Zulu]`; Recent row count=4 and order `[Alpha,Zulu,Mike,Delta]`; sort control final 69×44; pin/delete controls >=44px; sort `title-asc` persisted after reload; overflowX=false; console SEVERE=[] .
- Vercel production deployment `notepad-online-dqukqqd8l-trunknguen.vercel.app` status Ready; alias `https://notepad-online-beta.vercel.app` served exact local bundle `assets/index-BqJz-Nup.js`.
- Production desktop smoke: pin priority, A–Z, Recent, 44×56 pin, no overflow/nested, severe console=[] . Production iPhone 393×852: Recent row count=4, sort 69×44, pin controls 44×56, no overflow, severe console=[] .
- Isolated workspace Sync Key hash root `9f486f5bac01bfdc793e91443f2b8c2c331f89b67361e9bcf2ba64b582cb862b`; Firebase CLI recursive cleanup exit 0; final production browser readback `cards=0`, `editors=0`, test titles absent.

## Global Search evidence — 2026-10-03
- Local final build PASS: 1705 modules; JS 825.54 kB minified / 234.21 kB gzip; existing >500 kB chunk warning remains.
- Desktop local: folder-scope `[Mon AI]`; global title query `project` => `[Project DFT]`; body query `hoc may` => `[Mon AI]` with highlighted `Học máy`; `bao cao` => `[Project DFT]` with highlighted `Báo cáo`; no-result=0; clear restores `[Mon AI]`; input=44px; clear=44×44; overflowX=false; nested=0; SEVERE=[] .
- iPhone 393×852 local: same global title/body behavior; input 240×44 at 16px font; clear 44×44; sort 69×44; pin 44×56; overflowX=false; nested=0; SEVERE=[] .
- Production alias served exact bundle `assets/index-Ci2FaFSR.js`; Vercel deployment `notepad-online-pzux3i19u-trunknguen.vercel.app` Ready.
- Production desktop/mobile smoke reproduced title/body/no-accent/highlight/clear behavior; desktop input font 14px, mobile 16px; clear 44×44; mobile sort 69×44; overflowX=false; nested=0; SEVERE=[] .
- Isolated workspace SHA-256 root `06e4629db15f4d840ff1a80393fe354c07fc596c10aacbed53238ce8c51aff57`; Firebase CLI recursive cleanup exit 0; final production browser readback `cards=0`, `editors=0`.

## Still unverified
- Firestore rule hardening beyond current Sync-Key model and PWA offline behavior remain open.
