# PROJECT PROGRESS — Notepad Online

- **Last verified:** 2026-09-21
- **Root:** `D:\OTHERS\LATVAT\notepad app online`
- **Status:** source foundation đã có; runtime/deployment cần xác minh theo từng task.
- **Backlog:** `docs\TODOLIST.md`
- **AI rules:** `.claude\CLAUDE.md`

## 1. Project structure

```text
notepad app online/
├── .claude/
│   ├── CLAUDE.md
│   └── gpt-progress/
│       ├── PROJECT_CONTEXT.md
│       ├── PROJECT_PROGRESS.md
│       ├── PROJECT_COMMANDS.md
│       └── PROJECT_EVIDENCE.md
├── docs/
│   ├── PROJECT_PROGRESS.md
│   └── TODOLIST.md
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
```
## 2. Verified implementation

- React 18 + Vite 6 làm frontend foundation.
- Tailwind CSS và CSS variables dùng cho UI/theme.
- TipTap dùng cho rich-text editing.
- `src\App.jsx` điều phối Sync Key, note selection và layout.
- `src\hooks\useNotes.js` có SHA-256 Sync Key, Firestore `onSnapshot` và CRUD helpers.
- `src\hooks\useTheme.js` quản lý theme persistence.
- `src\components\NoteEditor.jsx` có editor và autosave debounce.
- `src\components\NoteList.jsx` có danh sách, create/select/delete UI.
- `src\components\SyncKeyModal.jsx` có luồng nhập Sync Key.
- Firebase client config lấy từ `VITE_FIREBASE_*` trong `src\lib\firebase.js`.
- `vercel.json` có SPA rewrite/security headers.

## 3. Git state at verification

- Branch: `main`.
- Trước reorganization, `main` theo `origin/main` tại commit `a837440`.
- Remote cấu hình local: `https://github.com/trungnguyencore/notepad-online.git`.
- Remote mới đã được xác minh bằng `git ls-remote origin HEAD` ngày 2026-09-21 và resolve tới commit `a837440`.
- Có user work chưa commit từ trước ở `index.html`, `public/manifest.json` và bộ PWA/social assets.
- Reorganization tài liệu trong session này cũng tạo thêm Git changes; không commit/push tự động.

## 4. Verification status

- Production URL/Vercel project hiện tại chưa được xác minh.
- Chưa xác minh Firestore Rules đã deploy.
- CRUD Firestore isolated-key acceptance ngày 2026-09-21: create → autosave → refresh persistence → delete cleanup PASS.
- Chưa xác minh PWA/offline behavior.
- Không có `test` hoặc `lint` script trong `package.json` hiện tại.
## 5. Mobile/runtime stabilization — 2026-09-21

- Backup pre-mobile: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile` (91/91 files so với source excluding `node_modules`/`dist`; giữ `.git`, `.env`, source/config/docs).
- Final `npm run build`: PASS, 1699 modules transformed; JS bundle 803.22 kB minified / 228.30 kB gzip; Vite vẫn cảnh báo chunk >500 kB.
- Mobile emulation 393×852 và 430×932: không horizontal overflow; Sync Key input = 16px; console sạch.
- Mobile master/detail đã thay layout xếp dọc: list view 6 notes có document height = viewport 852px và editor section hidden cho tới khi chọn note.
- Visible interactive targets regression: không còn target <44px; toolbar 9/9 nút = 44×44.
- `NoteList` nested interactive regression: `button button = 0`.
- Fast-switch regression: gõ rồi quay lại danh sách trước debounce 450ms, refresh vẫn giữ draft (`fastSwitchPersisted = true`).
- Confirm delete regression: dialog hiện, Hủy giữ note, Xóa mới xóa.
- Desktop smoke 1440×900: two-pane vẫn hiển thị đúng, autosave/refresh persistence PASS, nested button = 0, console sạch.
- Tất cả test notes dùng Sync Key riêng đã cleanup về 0.

## 6. Current backlog

Backlog chi tiết nằm tại `docs\TODOLIST.md`.
Ưu tiên hiện tại: physical iPhone/Safari check, bundle/code-splitting, verify production/Vercel + Firestore Rules, rồi mới tiếp tục feature backlog.

## 7. Next actions

1. Kiểm tra thực tế trên Safari/iPhone thật, nhất là keyboard + safe-area + PWA standalone.
2. Tối ưu bundle/code-splitting; warning >500 kB vẫn còn.
3. Xác minh Vercel production/auto-deploy và Firestore Rules production.
4. Tiếp tục backlog feature (toast/search/shortcuts...) sau khi mobile stabilization được chấp nhận.
5. Trước mọi code change: kiểm tra Git status và bảo vệ pre-existing uncommitted work.

## 8. Archive rule

`D:\OTHERS\LATVAT\notepad_old` là legacy archive/reference.
Không chỉnh sửa, move, rename hoặc xóa folder này.
Mọi công việc Notepad mặc định phải thực hiện ở project hiện tại.

## 9. Changelog

- 2026-09-21: Chuẩn hóa documentation layout; chuyển `PROGRESS.md` thành `docs\PROJECT_PROGRESS.md`, chuyển `TODOLIST.md` vào `docs\`, tạo `.claude\CLAUDE.md` và `.claude\gpt-progress\` chuẩn DFT/CTRR.
- 2026-09-21: Refresh state theo source/Git thực tế; loại bỏ các mô tả stale rằng React components chưa được tạo.
- 2026-09-21: Mobile/runtime audit xác minh build + CRUD PASS, tái hiện data-loss khi chuyển note nhanh, đo touch-target/mobile stacking và ghi lại bundle/meta warnings.
- 2026-09-21: Tạo backup pre-mobile rồi implement iPhone stabilization: flush autosave, mobile master/detail, 44px touch targets, 16px Sync Key input, nested-button fix, confirm dialog và PWA meta; final mobile + desktop regression PASS.
