# Notepad Online — checkpoint 14/11/2026

> Superseded sau checkpoint: user đã nói “rồi deploy đi”; deployment và 19/19 actual production Firebase checks đã PASS. Latest handoff: [ROLLOUT.md](../2026-11-14/ROLLOUT.md). Nội dung dưới đây giữ trạng thái checkpoint trước khi user duyệt.

## Điểm tiếp tục

**Chờ user test và duyệt bản local; chưa được deploy Vercel.** Không tự suy ra local QA PASS là user acceptance hoặc cho phép push/deploy.

- Project: `D:\OTHERS\LATVAT\notepad app online`.
- Canonical state: `docs/PROJECT_PROGRESS.md`, section 5L.
- Chi tiết sửa/bằng chứng: `docs/qa/2026-11-13/FIXES.md`; audit trước sửa: `AUDIT.md` cùng thư mục.
- Git: `main`, HEAD `ba122f3`. Source, progress và QA additions còn **uncommitted**. Giữ nguyên tất cả working-tree changes và artifacts; không reset/cleanup.
- Local review: **http://127.0.0.1:3113/**, title `[LOCAL TEST]`; backend giả lập lưu localStorage, không đọc/ghi Firebase production. Nhập cùng Sync Key không tải note production.

## Đã hoàn thành

1. Folder name có hàng riêng, wrap khi dài; hàng Đổi tên/Xóa giữ vùng bấm >=44px trong các ca đã thử.
2. Shared HTML→plain text giữ ranh giới paragraph/list/br cho search/preview.
3. Nút xóa editor có accessible name trên mobile.
4. Remote content nhận vào editor sạch; dirty draft được giữ và có hai lựa chọn giải quyết conflict. Save transaction so sánh baseline title/content; sessionStorage recovery, save queue và guard không để save cũ xóa draft mới.
5. Callback gắn workspace ban đầu; hủy stale hash/listener, ẩn notes cũ ngay khi đổi Sync Key; flush draft không ghi sang workspace mới.

Source sửa: `src/App.jsx`, `src/components/FolderList.jsx`, `src/components/NoteList.jsx`, `src/components/NoteEditor.jsx`, `src/hooks/useNotes.js`; source mới: `src/hooks/useNoteDraft.js`, `src/lib/noteText.js`.

## Bằng chứng và kiểm tra checkpoint

- **Tests chạy ngày 13/11:** desktop 29/29, mobile 29/29, legacy 25/25, full-app smoke 21/21 = **104/104 lượt**. Các JSON tương ứng là `regression.json`, `regression-mobile.json`, `legacy-regression.json`, `app-smoke.json`.
- Build 13/11 PASS: `dist-review-20261113/`, JS `index-4u6YFiP1.js`; log `build.txt`, source/build SHA-256 trong `hashes.json`. Không thay `dist/` hoặc build review 31/10.
- **Checkpoint 14/11 chỉ đọc:** 4 report vẫn ghi 104/104; 10/10 hash source/build khớp; server 3113 đang listen và HTTP 200; HEAD vẫn `ba122f3`. Không rerun test/build hoặc đổi ngày kết quả cũ thành hôm nay.
- Chưa có kiểm chứng mới với Firestore thật/emulator, mạng/retry/offline thực tế hoặc Safari/iPhone vật lý. Không dùng test double làm bằng chứng các phần này PASS.
- Production Last Verified vẫn 31/10; chưa commit/push/deploy hoặc đổi Firebase rules/config/dependencies.

## Khi tiếp tục

1. Đọc `.claude/CLAUDE.md` và bốn resume files theo thứ tự, rồi canonical section 5L và report FIXES.
2. Kiểm tra Git status; bảo vệ cả changes hiện tại và thay đổi user làm sau checkpoint.
3. Nếu localhost không còn chạy: `node node_modules/vite/bin/vite.js --config scripts/qa/vite.local-audit.config.js`. Không dùng preview build có config Firebase thật để thay cho isolated review server.
4. Nhận kết quả test/review của user. Nếu user báo lỗi mới, tái hiện và sửa trong phạm vi đó. Integration Firebase cần evidence riêng trước khi khẳng định production readiness.
5. Chỉ commit/push/deploy Vercel sau user duyệt rõ; hiện tại chưa có phê duyệt đó.

Các script QA/rerun commands đã ghi trong FIXES và `.claude/gpt-progress/PROJECT_COMMANDS.md`. Rerun sẽ overwrite report ngày 13/11 được chỉ định; không chạy lại chỉ để làm mới progress.
