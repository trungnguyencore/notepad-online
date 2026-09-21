# PROJECT PROGRESS — GPT RESUME

- Last verified: 2026-09-21
- Canonical state source: `docs\PROJECT_PROGRESS.md`
- Current phase: iPhone/mobile stabilization implementation complete in local working tree; final mobile + desktop regression PASS. Physical iPhone/Safari and production deploy remain unverified.

## Verified current state
- App source đã có `App.jsx`, NoteList, NoteEditor, SyncKeyModal, ThemeToggle và EmptyState.
- `useNotes.js` có Firestore real-time listener và CRUD helpers.
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

## Not verified yet
- Production URL/Vercel project hiện tại.
- Firestore Rules deployment state.
- PWA/offline behavior.
- Không có test/lint script canonical trong `package.json`.

## Next actions
1. Physical iPhone/Safari + keyboard/safe-area/PWA standalone check.
2. Bundle/code-splitting optimization.
3. Verify production Vercel + Firestore Rules.
4. Continue feature backlog after mobile acceptance.

> Nếu mâu thuẫn, `docs\PROJECT_PROGRESS.md` và source/Git evidence mới hơn thắng.
