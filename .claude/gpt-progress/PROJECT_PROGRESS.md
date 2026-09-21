# PROJECT PROGRESS — GPT RESUME

- Last verified: 2026-09-21
- Canonical state source: `docs\PROJECT_PROGRESS.md`
- Current phase: Folder organization v1 + `@trunk.ng` attribution implemented and regression-tested locally against Firestore production backend. Firestore folder rules are deployed; Vercel production UI still awaits folder-code push/deploy.

## Verified current state
- App source có `App.jsx`, FolderList/FolderDialog/FolderPicker, NoteList, NoteEditor, SyncKeyModal, ThemeToggle và EmptyState.
- `useNotes.js` có Firestore real-time listener, CRUD helpers và nullable `folderId`.
- `useFolders.js` có realtime folder listener + create/rename helpers.
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

## Not verified yet
- Folder UI has not been pushed/deployed to Vercel production yet; current production UI remains baseline `1f88301`.
- Firestore Rules hardening beyond current Sync-Key trust model remains open.
- PWA/offline behavior remains open.
- Không có test/lint script canonical trong `package.json`.

## Next actions
1. On explicit user deploy request: stage/review diff, commit/push folder feature to `main`.
2. Wait for Vercel Ready and run production folder/Instagram smoke.
3. Then continue bundle optimization + Firestore Rules hardening.
4. Optional future folder delete must move notes to Unfiled, never cascade-delete notes.

> Nếu mâu thuẫn, `docs\PROJECT_PROGRESS.md` và source/Git evidence mới hơn thắng.
