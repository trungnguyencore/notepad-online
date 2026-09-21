# PROJECT EVIDENCE — Notepad Online

- Last verified: 2026-09-21
- Canonical progress: `docs\PROJECT_PROGRESS.md`

## Verified source evidence
- `src\App.jsx`: root layout, Sync Key state, folder/note selection, desktop 3-pane/mobile 3-step navigation và `@trunk.ng` attribution.
- `src\hooks\useNotes.js`: SHA-256 Sync Key, Firestore listener, CRUD helpers và nullable `folderId`.
- `src\hooks\useFolders.js`: Firestore realtime folders + create/rename.
- `src\components\FolderList.jsx`, `FolderDialog.jsx`, `FolderPicker.jsx`: folder navigation/create/rename/note assignment UI.
- `src\components\NoteEditor.jsx`: TipTap editor + autosave + folder picker.
- `src\components\NoteList.jsx`: note list/create/delete + mobile back-to-folders navigation.
- `src\components\SyncKeyModal.jsx`: Sync Key input flow.
- `src\lib\firebase.js`: Firebase init từ `VITE_FIREBASE_*`.
- `package.json`: React/Vite/Tailwind/TipTap/Firebase dependencies và npm scripts.

## Verified Git evidence
- Branch local: `main`; remote `https://github.com/trungnguyencore/notepad-online.git`.
- Baseline before folder feature: local/remote HEAD `1f88301e68fbe5f619a5ab1be09d85b26d3c310e`.
- Folder/Instagram changes are currently uncommitted; no push/deploy UI performed in this task yet.
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

## Still unverified
- Folder UI is not yet deployed on Vercel production; current production alias still serves pre-folder UI until next push.
- Firestore rule hardening beyond current Sync-Key model and PWA offline behavior remain open.
