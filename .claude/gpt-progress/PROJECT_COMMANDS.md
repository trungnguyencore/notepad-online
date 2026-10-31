# PROJECT COMMANDS — Notepad Online

- Last verified: 2026-10-31 (local commands; deployment commands below are historical)
- Source: `package.json` + verified Firebase deployment flow.

## Canonical npm scripts
`npm run dev` — chạy Vite dev server.
`npm run build` — build production bằng Vite.
`npm run preview` — preview output build.

## Isolated QA added 2026-10-31

- `node node_modules/vite/bin/vite.js --config scripts/qa/vite.config.js` — server loopback 3107; stub Firebase config và Firestore, không ghi dữ liệu thật.
- `python scripts/qa/regression.py docs/qa/2026-10-31/after.json` — Selenium, 25 browser checks. Có thể đặt env `DRIVER` tới chromedriver tương thích; lượt verified dùng cached driver 154 với Chrome 156 và `ALLOW_DRIVER_MISMATCH=1` (bypass build check), nên ưu tiên driver đúng version khi rerun.
- `npm run build -- --outDir dist-review-20261031` — verified build PASS, giữ nguyên `dist/` cũ; output là artifact review, không phải bản đã deploy.
- `git -c core.safecrlf=false diff --check` — verified PASS.

Đây là QA scripts riêng, chưa thêm npm test/lint script.

## Live rollout verification 2026-10-31

- `python scripts/qa/live_smoke.py http://127.0.0.1:3000/ docs/qa/2026-10-31/live-local.json` — PASS 10/10 với actual Firebase, disposable Sync Key, backend REST readback + cleanup=0. Dùng DRIVER override như isolated QA nếu cần.
- `python scripts/qa/live_smoke.py https://notepad-online-beta.vercel.app/ docs/qa/2026-10-31/live-production.json` — verified PASS 10/10, backend readback + cleanup notes=0/folders=0, SEVERE=[].
- Cached Firebase CLI 15.30.2: deploy `--only firestore:rules --project notepad-app-6845e --non-interactive` đã compile/release PASS ngày 31/10; evidence `rules-deploy.txt`.

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
GitHub `main` → Vercel auto-deploy đã verify qua mobile, folder và checklist production rollouts.
Current production alias: `https://notepad-online-beta.vercel.app`.
Không commit/push/deploy feature UI mới nếu user chưa yêu cầu rõ.
