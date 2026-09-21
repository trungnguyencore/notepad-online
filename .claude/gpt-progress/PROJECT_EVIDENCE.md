# PROJECT EVIDENCE — Notepad Online

- Last verified: 2026-09-21
- Canonical progress: `docs\PROJECT_PROGRESS.md`

## Verified source evidence
- `src\App.jsx`: root layout, Sync Key state, note selection và composition.
- `src\hooks\useNotes.js`: SHA-256 Sync Key, Firestore listener và CRUD helpers.
- `src\components\NoteEditor.jsx`: TipTap editor + autosave logic.
- `src\components\NoteList.jsx`: note list/create/delete UI.
- `src\components\SyncKeyModal.jsx`: Sync Key input flow.
- `src\lib\firebase.js`: Firebase init từ `VITE_FIREBASE_*`.
- `package.json`: React/Vite/Tailwind/TipTap/Firebase dependencies và npm scripts.

## Verified Git evidence
- Branch local: `main`.
- Trước reorganization, `main` theo `origin/main` tại commit `a837440`.
- Remote local: `https://github.com/trungnguyencore/notepad-online.git`.
- `git ls-remote origin HEAD` ngày 2026-09-21 trả commit `a837440`, xác minh remote mới hoạt động.
- Repo có pre-existing uncommitted PWA/index/assets work; không được ghi đè.

## Runtime/mobile evidence — 2026-09-21
- Pre-change backup verified 91/91 files (excluding `node_modules`/`dist`) tại `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile`.
- Final `npm run build`: PASS, 1699 modules transformed; JS 803.22 kB minified / 228.30 kB gzip; chunk warning >500 kB vẫn còn.
- Mobile regression 393×852: `fastSwitchPersisted=true`, `nestedButtons=0`, 9/9 toolbar = 44×44, confirm cancel/delete PASS, 6-note list giữ document height = viewport 852px, cleanup 6/6.
- Final touch regression: Sync Key input 16px, no visible button under 44px, overflowX=0, cleanup remaining=0.
- 430×932: overflowX=0, input=16px.
- Desktop 1440×900: two-pane visible, persistence PASS, nested button=0, cleanup=0, console sạch.
- Browser console post-fix sạch trong các flow đã test.

## Still unverified
Chưa xác nhận URL production/Vercel, Firestore Rules deployment hoặc PWA offline behavior.
