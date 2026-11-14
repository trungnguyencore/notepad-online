# Local fixes — chờ user test và duyệt

> Cập nhật 14/11/2026: user đã duyệt và bản sửa đã deploy/verify production. Xem [rollout/handoff mới](../2026-11-14/ROLLOUT.md). Các trạng thái chờ duyệt và thiếu integration bên dưới là snapshot trước rollout ngày 13/11.

Verified: 13/11/2026. Baseline Git `ba122f3`; changes uncommitted. Local user review: **http://127.0.0.1:3113/**. Nếu đang mở tab cũ, reload để nhận source mới. Backend của URL này là dữ liệu test lưu trên trình duyệt, không tải notes production dù nhập cùng Sync Key.

## Các sửa đã kiểm chứng local

| Audit | Thay đổi | Source |
|---|---|---|
| UI-01 | Tên custom folder có cả hàng riêng, xuống dòng khi dài; Đổi tên/Xóa ở hàng dưới, vùng bấm >=44px trong các ca đã đo | `src/components/FolderList.jsx` |
| UI-02 | Shared HTML→text helper giữ khoảng cách giữa paragraph/list/br, áp dụng cùng cho search và preview; giữ nguyên HTML đã lưu | `src/lib/noteText.js`, `src/App.jsx`, `src/components/NoteList.jsx` |
| A11Y-01 | Nút trash editor có accessible name “Xóa ghi chú” cả desktop và mobile | `src/components/NoteEditor.jsx` |
| SYNC-01 | Editor sạch nhận remote content; editor có draft giữ draft và hiện lựa chọn Dùng bản mới/Giữ bản của tôi; save so sánh baseline title/content trong transaction để chặn stale overwrite | `src/hooks/useNoteDraft.js`, `src/hooks/useNotes.js`, `src/components/NoteEditor.jsx` |
| SYNC-02 | Mỗi callback giữ workspace riêng; hash/listener cũ bị hủy, notes cũ ẩn ngay khi đổi key; flush pending draft giữ đúng workspace ban đầu | `src/hooks/useNotes.js`, `src/App.jsx` |

- Bản nháp chưa lưu được giữ trong **sessionStorage của tab**, scoped bằng workspace hash + note ID; reload có thể khôi phục. Đây không phải backup lâu dài: đóng tab/xóa browser storage có thể mất recovery data.
- Các lượt save được xếp hàng; save cũ không đánh dấu draft mới là đã lưu. Khi quay lại note lúc save cũ chưa xong, save cũ không được xóa recovery entry của editor mới.
- Nếu một baseline mới xuất hiện trong lúc đang giữ draft, hệ thống có thể yêu cầu chọn bản cần giữ. Không tự merge hoặc tự ghi đè nội dung khác.
- Có thông báo lỗi và nút Thử lưu lại; nếu browser chặn lưu recovery thì hiện cảnh báo để user sao chép nội dung trước khi rời trang.
- Không đổi Firestore schema/rules, dependencies hoặc production config. Folder transaction behavior giữ nguyên.

## Evidence cuối

| Artifact | Kết quả |
|---|---|
| `regression.json` | 29/29, actual React/TipTap/hooks + isolated Firestore double |
| `regression-mobile.json` | 29/29 tại 393×852, cùng suite trên mobile emulation |
| `legacy-regression.json` | 25/25: checklist operations/fast switch/save status, folder cancel/delete/403-note batches/failure/concurrent move/late note/mobile layout |
| `app-smoke.json` | 21/21 qua actual app: search/preview, folder rename/delete giữ notes, pin, two-tab clean/dirty remote update, failed save/recovery/reload, explicit keep-local, Sync Key switch trong debounce, mobile layout/accessibility, confirmed note delete |
| `build.txt` | `npm run build -- --outDir dist-review-20261113`, exit 0, 1707 modules, JS 841.28 kB / gzip 238.39 kB |
| `hashes.json` | SHA-256 cho 7 source files và final build HTML/JS/CSS |

Tổng **104/104 lượt kiểm tra** thuộc 4 suite (không phải 104 chức năng độc lập). Final desktop/mobile regression console SEVERE=0. Test full-app dùng profile headless riêng và Sync Key synthetic; không thao tác lên profile/notes test đang mở của user.

Đã xem trực tiếp các ảnh:

- [Desktop folder name + paragraph preview](app-desktop.png)
- [Desktop conflict](app-conflict-desktop.png)
- [Mobile folder long name](app-mobile-folders.png)
- [Mobile editor](app-mobile-editor.png)

Lúc mở rộng ca thử lưu chậm, một assertion từng kỳ vọng tự ghi draft mới qua baseline cũ đã không đạt; hành vi đúng là giữ draft và yêu cầu chọn khi có baseline mới. Ca cuối kiểm tra cả draft còn nguyên và chọn Giữ bản của tôi lưu được. Report cuối 29/29 bao gồm các kiểm tra này; không coi hành vi giữ draft để chờ lựa chọn là thất bại bảo toàn dữ liệu.

## Phạm vi kiểm chứng và phần chưa duyệt

- Tất cả writes trong các suite là trên test double; **chưa kiểm thử integration với Firestore thật/emulator hoặc retry/offline thực tế của Firebase SDK**. Transaction compare-and-set đã được kiểm tra với double; chưa dùng các kết quả này để khẳng định server concurrency/rules PASS.
- Two-tab smoke kiểm tra thông báo cập nhật qua localStorage test backend, không phải hai thiết bị kết nối Firebase thật.
- iPhone ở đây là Chrome emulation, chưa phải Safari/iPhone vật lý, bàn phím iOS hoặc tất cả kích thước/landscape.
- Build giữ cảnh báo chunk >500 kB và Browserslist cũ; không tự cập nhật package hay mở rộng tối ưu bundle.
- Không sửa/xóa các artifact cũ hoặc data user. `dist/` và `dist-review-20261031/` giữ nguyên; final build dùng thư mục mới `dist-review-20261113/`.
- Server 3113 giữ mở, kiểm tra HTTP 200. **Chờ user test/duyệt local. Không commit/push/deploy Vercel, không deploy Firebase rules.**

## Chạy lại

```powershell
node node_modules/vite/bin/vite.js --config scripts/qa/vite.local-audit.config.js
python scripts/qa/run_audit_regression.py
python scripts/qa/run_audit_regression.py mobile
python scripts/qa/app_smoke.py
```

Legacy suite cần server riêng: `node node_modules/vite/bin/vite.js --config scripts/qa/vite.config.js` (3107), rồi `python scripts/qa/regression.py docs/qa/2026-11-13/legacy-regression.json`; chọn `DRIVER` là chromedriver tương thích nếu Selenium Manager không resolve được. Hai QA server có cache Vite riêng để tránh xung đột alias/cache.

Chạy lại sẽ ghi đè **chính các report QA của ngày này**. Không chạy live_smoke production như một phần của local regression.
