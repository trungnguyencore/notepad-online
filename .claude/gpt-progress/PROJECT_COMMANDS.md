# PROJECT COMMANDS — Notepad Online

- Last verified: 2026-09-21
- Source: `package.json`.

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

## Deployment
`vercel.json` tồn tại nhưng command deploy và production target phải được xác minh trước khi dùng.
Không commit/push/deploy nếu user chưa yêu cầu rõ.
