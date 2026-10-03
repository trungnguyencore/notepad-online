# PROJECT PROGRESS — GPT RESUME

- Last verified: 2026-10-03
- Canonical state source: `docs\PROJECT_PROGRESS.md`
- Current phase: Global Search + Pin + Sort + Recent production PASS on top of existing compact header/checklist/folder/logo flows. Search feature `f5cdc7b` pushed `main`; Vercel `pzux3i19u` Ready; desktop+iPhone search smoke PASS; isolated search test cleanup=0.

## Verified current state
- App source có `App.jsx`, FolderList/FolderDialog/FolderPicker, NoteList, NoteEditor, SyncKeyModal, ThemeToggle và EmptyState.
- `useNotes.js` có Firestore real-time listener, CRUD helpers và nullable `folderId`.
- `useFolders.js` có realtime folder listener + create/rename helpers.
- `NoteEditor.jsx` dùng TipTap TaskList/TaskItem cho checklist; checked state nằm trong note HTML nên không đổi Firestore schema.
- Sync Key được hash SHA-256 trong `useNotes.js`.
- Firebase config được lấy từ biến `VITE_FIREBASE_*` trong `src\lib\firebase.js`.
- `package.json` có ba script: `dev`, `build`, `preview`.
- Repo Git dùng branch `main` và có remote `origin`.

## Verified stabilization 2026-09-21
- Backup pre-mobile tồn tại tại `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile`.
- Final `npm run build` PASS; Vite vẫn cảnh báo JS chunk ~803 kB >500 kB.
- Fast-switch data-loss regression PASS: draft vẫn persist khi rời note trước 450ms.
- Mobile 393×852/430×932: không overflow ngang; master/detail active; Sync Key 16px; visible touch targets >=44px; nested `button` = 0; console sạch.
- Confirm delete PASS (cancel giữ note, confirm mới xóa).
- Desktop 1440×900 two-pane + persistence + cleanup PASS.

## Production verified 2026-09-21
- GitHub main commit `fba947a` pushed to `trungnguyencore/notepad-online`.
- Vercel Git auto-deploy PASS; production alias `https://notepad-online-beta.vercel.app` Ready.
- Production mobile smoke PASS: fast-switch persistence, 16px Sync Key, no horizontal overflow, nested button=0, visible touch targets >=44px, confirm delete, cleanup=0, console clean.

## Folder v1 verified 2026-09-21
- Backup pre-folders verified 132/132 files, HEAD `1f88301`.
- Firestore rules compiled + deployed to project `notepad-app-6845e`; folders allow read/create/update, delete denied in v1.
- Desktop regression PASS: create/rename folder, create note in folder, move to Unfiled, refresh persistence, cleanup note=0.
- Mobile 393×852 regression PASS: Folders→Notes→Editor→Back, rename, persistence, overflowX=0, nested button=0, no visible button <44px, stable console clean.
- Header `@trunk.ng` link to `https://www.instagram.com/trunk.ng/` verified.
- Final build PASS: 1703 modules, JS 814.74 kB / 231.51 kB gzip; chunk >500 kB warning remains.

## Production folder rollout verified 2026-09-21
- GitHub `main` commit `d9165d0` contains folder UI + Instagram attribution + Firebase config/rules source.
- Vercel auto-deploy PASS; deployment `notepad-online-k9ioc8h0z-trunknguen.vercel.app` Ready and production alias updated.
- Production mobile smoke 393×852 PASS: folder create/rename, note-in-folder, persistence, move to Unfiled, `@trunk.ng` link, overflowX=0, nested=0, no visible button <44px, console clean.
- Production smoke workspace cleanup PASS via Firebase CLI recursive delete.

## Checklist local verified 2026-10-01
- Backup pre-checklist verified 175/175 files excluding `node_modules`/`dist`, HEAD `ef2c3ed`.
- TipTap runtime-aligned packages: TaskList/TaskItem/React/StarterKit = 2.27.2.
- Final build PASS: 1705 modules; JS 818.31 kB / 232.39 kB gzip; chunk >500 kB warning remains.
- Normal checklist persistence PASS: 2 items via Enter; first/second checkbox states survive independent reloads.
- Fast switch/back pending-draft path verified: after waiting for Firestore commit, backend and cold-start UI preserve `[unchecked, checked]` state.
- Mobile 393×852: Checklist button 44×44, task-list markup present, overflowX=0, nested button=0, console clean.
- Checked task line-through verified by computed style.
- 5 isolated checklist test workspaces cleaned; direct Firestore verification = 0 docs each.
- Checklist feature commit `822c80b29be0e622fd229b6769ec0613e43284c8` đã push lên `main`.

## Production checklist rollout verified 2026-10-01
- Vercel deployment `notepad-online-fyoy7lzt2-trunknguen.vercel.app` Ready; created 2026-10-01 22:33:38 +07:00; production alias updated.
- Desktop production smoke: `[false,false] → [true,false] → reload [true,false]`; toolbar 44×44; checked item line-through; console clean.
- Mobile 393×852 production smoke: cold `[true,false]`; task markup present; second check `[true,true]`; reload `[true,true]`; toolbar 44×44; overflowX=0; nested=0; console clean.
- Test note cleanup via production UI PASS; `cleanupCards=0` on isolated Sync Key.

## Branding logo A verified 2026-10-03
- `public/notepad-logo.svg` added; `src/App.jsx` header uses it instead of the yellow `N` avatar.
- Build PASS: 1705 modules; JS 818.62 kB / 232.55 kB gzip.
- Local desktop light/dark + mobile 393×852 visual PASS; production Selenium readback logo complete=true, natural 150×150, rendered 40×40, no page overflow.
- Feature commit `2cf812b` pushed `main`; Vercel deployment `notepad-online-6950taq52-trunknguen.vercel.app` Ready.

## Pin + Sort + Recent verified 2026-10-03
- Notes now support backward-compatible `pinned` + `lastOpenedAt`; pin/open metadata writes do not touch `updatedAt`.
- Normal list sort options: updated desc, updated asc, title A–Z; pinned always first. Preference persists in `localStorage:notepad-note-sort`.
- Virtual system folder `recent` shows up to 10 most recently explicitly opened notes, ordered by `lastOpenedAt`; this metadata syncs via Firestore across devices.
- Local build PASS: 1705 modules; JS 822.27 kB / 233.44 kB gzip; existing >500 kB chunk warning remains.
- Local desktop/mobile regressions PASS; iPhone 393×852 sort control=44px, pin/delete >=44px, overflowX=0, nested buttons=0, console SEVERE=[] .
- Production feature commit `8ca3b92`; Vercel `notepad-online-dqukqqd8l-trunknguen.vercel.app` Ready; production alias bundle `index-BqJz-Nup.js`; desktop/mobile smoke PASS.
- Isolated test workspace SHA root `9f486f5bac01bfdc793e91443f2b8c2c331f89b67361e9bcf2ba64b582cb862b` cleanup exit 0; final browser readback 0 notes.

## Global Search verified 2026-10-03
- Global search scans all notes in current Sync Key, not only selected folder/Recent scope.
- Match source = note title + plain-text body. Matching is case-insensitive and Vietnamese diacritic-insensitive; `hoc may`→`Học máy`, `bao cao`→`Báo cáo` verified.
- Search-active UI heading = `Tìm kiếm`, result count = `N kết quả / total ghi chú`; clear restores selected folder/Recent scope.
- Existing pinned-first/sort behavior remains active for search results; Recent ordering resumes after search clear.
- Local final build PASS: 1705 modules; JS 825.54 kB / 234.21 kB gzip; existing >500 kB chunk warning remains.
- Local desktop + iPhone 393×852 regressions PASS: title/body/global/no-accent/highlight/clear; input 44px, mobile font 16px, clear 44×44, overflowX=0, nested buttons=0, console SEVERE=[] .
- Feature `f5cdc7b` pushed `main`; Vercel `notepad-online-pzux3i19u-trunknguen.vercel.app` Ready; production alias served exact bundle `assets/index-Ci2FaFSR.js`; production desktop/mobile smoke PASS.
- Isolated search workspace root `06e4629db15f4d840ff1a80393fe354c07fc596c10aacbed53238ce8c51aff57` cleanup exit 0; final production browser readback 0 notes.

## Deferred future design captured 2026-10-03
- Apple Notes Sync + Locked Notes/Vault đã được ghi chi tiết trong `docs\TODOLIST.md` và canonical progress section 5E.
- Resume intent: prototype iOS Shortcuts với normal/checklist/locked note trước; V1 one-way bulk/import + incremental create/update nếu metadata đủ tin cậy; no auto-delete.
- Locked-note direction: `Vault Password` tách khỏi `Sync Key`, client-side encryption trước Firestore; nếu Shortcut không đọc được locked note thì skip + report. Attachment/media để phase sau.
- Đây chỉ là planned design; chưa có implementation/evidence và không được report như feature đã làm.

## Not verified yet
- Firestore Rules hardening beyond current Sync-Key trust model remains open.
- PWA/offline behavior remains open.
- Apple Notes Shortcuts metadata/locked-note behavior chưa được prototype trên iPhone thật.
- Không có test/lint script canonical trong `package.json`.

## Next actions
1. User acceptance Global Search + Pin + Sort + Recent together with compact header/checklist on real iPhone.
2. Continue bundle optimization + Firestore Rules hardening.
3. Optional future folder delete must move notes to Unfiled, never cascade-delete notes.

> Nếu mâu thuẫn, `docs\PROJECT_PROGRESS.md` và source/Git evidence mới hơn thắng.
