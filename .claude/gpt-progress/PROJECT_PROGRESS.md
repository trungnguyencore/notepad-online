# PROJECT PROGRESS — GPT RESUME

- Last verified: 2026-10-01
- Canonical state source: `docs\PROJECT_PROGRESS.md`
- Current phase: Checklist/Task list đã local verified; production vẫn là folder v1, checklist chưa commit/push/deploy.

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
- Working tree contains checklist code/docs changes; not committed/pushed/deployed.

## Not verified yet
- Firestore Rules hardening beyond current Sync-Key trust model remains open.
- PWA/offline behavior remains open.
- Không có test/lint script canonical trong `package.json`.

## Next actions
1. If user requests deploy: review/stage checklist diff, commit/push `main`, wait Vercel Ready, run production checklist smoke.
2. User acceptance checklist on real iPhone after deploy.
3. Continue bundle optimization + Firestore Rules hardening.
4. Optional future folder delete must move notes to Unfiled, never cascade-delete notes.

> Nếu mâu thuẫn, `docs\PROJECT_PROGRESS.md` và source/Git evidence mới hơn thắng.
