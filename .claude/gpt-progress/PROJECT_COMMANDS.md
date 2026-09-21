# PROJECT COMMANDS — Notepad Online

- Last verified: 2026-09-21
- Source: `package.json` + verified Firebase deployment flow.

## Canonical npm scripts
`npm run dev` — chạy Vite dev server.
`npm run build` — build production bằng Vite.
`npm run preview` — preview output build.

## Environment
`node_modules` hiện tồn tại local.
Firebase runtime dùng các biến `VITE_FIREBASE_*`.
Không đọc/in `.env` nếu task không cần.

## Missing commands
`package.json` hiện không có script `test` hoặc `lint`.
Không tự invent test/lint command rồi ghi là canonical.

## Firestore rules
`npx --yes firebase-tools@latest deploy --only firestore:rules --project notepad-app-6845e --non-interactive` — verified PASS ngày 2026-09-21 sau Firebase CLI login.
`firebase.json` trỏ rules source tới `firestore.rules`.

## Deployment
GitHub `main` → Vercel auto-deploy đã verify ở production trước folder feature.
Current production alias: `https://notepad-online-beta.vercel.app`.
Không commit/push/deploy UI folder nếu user chưa yêu cầu rõ.
