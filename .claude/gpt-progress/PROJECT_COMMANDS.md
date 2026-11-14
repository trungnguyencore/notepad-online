# PROJECT COMMANDS — Notepad Online

- Last verified: 2026-11-14 local + live production; deployment sections dated 31/10 remain historical
- Source: `package.json` + verified Firebase deployment flow.

## Approved rollout 2026-11-14

- `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 3114 --strictPort --outDir dist-review-20261113` — actual reviewed production build, real Firebase; không dùng Sync Key user để destructive test ở URL này.
- `python scripts/qa/live_smoke.py http://127.0.0.1:3114/ docs/qa/2026-11-14/live-local.json` — 10/10, cleanup=0.
- `python scripts/qa/live_sync_smoke.py http://127.0.0.1:3114/ docs/qa/2026-11-14/sync-local-final.json` — 9/9, cleanup=0.
- `git push origin main` — feature `1965688` triggered Vercel production Git deployment, user approved. Không force push/reset.
- `vercel inspect notepad-online-cf1zs5ptv-trunknguen.vercel.app --wait --timeout 50s --json` — feature deployment READY, aliases contain production URL.
- `python scripts/qa/live_smoke.py https://notepad-online-beta.vercel.app/ docs/qa/2026-11-14/live-production.json` — 10/10 actual Firebase, cleanup=0/SEVERE=0.
- `python scripts/qa/live_sync_smoke.py https://notepad-online-beta.vercel.app/ docs/qa/2026-11-14/sync-production.json` — 9/9 actual Firebase, cleanup=0/SEVERE=0.
- Hai script chỉ dùng disposable generated Sync Keys và cleanup đúng hash root đó. Không rerun production writes chỉ để refresh progress. Không deploy rules trong rollout này.

## Canonical npm scripts
Local review 2026-11-13: `node node_modules/vite/bin/vite.js --config scripts/qa/vite.local-audit.config.js` — server 3113 với actual app + persistent localStorage test double, Firebase imports bị thay bằng mock; cache riêng với legacy QA 3107. Không dùng để chứng minh live Firestore sync/rules.

- `python scripts/qa/run_audit_regression.py` — verified 29/29 desktop; writes `docs/qa/2026-11-13/regression.json`, screenshot/console.
- `python scripts/qa/run_audit_regression.py mobile` — verified 29/29 at 393×852; writes `regression-mobile.json`, screenshot/console.
- `python scripts/qa/app_smoke.py` — verified 21/21 actual-app isolated smoke; two tabs, save failure/recovery, workspace switch, mobile, CRUD; writes `app-smoke.json` and screenshots.
- Legacy server command dưới + `python scripts/qa/regression.py docs/qa/2026-11-13/legacy-regression.json` — 25/25 final rerun; select compatible DRIVER if needed.
- `npm run build -- --outDir dist-review-20261113` — PASS, separate build; chunk/Browserslist warnings remain. Không tự deploy output này.
- Reruns overwrite only these named QA reports, not historical 31/10 outputs. Scripts use disposable browser profiles/test workspaces; không chạy live-production smoke cho local review.

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
