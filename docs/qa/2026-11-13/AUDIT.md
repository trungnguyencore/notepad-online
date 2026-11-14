# Audit local — 13/11/2026

## Phạm vi và môi trường

- User duyệt mở localhost và test trước; phải review lỗi trước khi sửa. Chưa được push/deploy.
- Baseline source: HEAD `ba122f3`, feature gần nhất `2632f60`. Không sửa `src/`, rules hoặc root production config trong lượt audit.
- Local: `http://127.0.0.1:3113/`, title `[LOCAL TEST]`. Start: `node node_modules/vite/bin/vite.js --config scripts/qa/vite.local-audit.config.js`.
- Actual App/components/hooks; config QA chặn `src/lib/firebase.js` và alias `firebase/firestore` sang test double. Không kết nối Firebase thật. Test double lưu records trong localStorage riêng của origin localhost, hỗ trợ reload; không phải backup hoặc bản sao dữ liệu production.
- Dùng Chrome đang mở trên máy, thao tác qua Computer Use: desktop dark/light (đưa zoom từ 90% về 100%), DevTools iPhone 16 393×852, sau đó tắt emulation/đóng DevTools và trả dark mode.
- Không tự động import dữ liệu thật dù nhập cùng Sync Key. Không ghi giá trị Sync Key vào báo cáo.
- Evidence UI: screenshot/accessibility snapshots trong tool transcript của session này. **Không có file screenshot/DOM dump lưu kèm báo cáo**; các quan sát dưới đây là biên bản manual QA, không phải automated test output.

## Lỗi đã tái hiện

### UI-01 — Tên thư mục bị cắt quá mạnh trên desktop (P2)

1. Tạo thư mục `QA Học tập`.
2. Quan sát sidebar desktop 3 cột ở zoom 100% (cũng xảy ra ở 90%).
3. Tên chỉ hiển thị `QA…`/`Q…`, trong khi header danh sách và folder picker vẫn hiển thị tên đầy đủ.

Source: `src/App.jsx:307` thiết lập cột folder 220px; `src/components/FolderList.jsx:10` chia chiều rộng giữa nút chọn và hai nút thao tác rộng 44px, cùng icon/count/gap/padding; tên bị truncate ở dòng 14. Đây là vấn đề khả năng đọc/nhận diện, không phải mất tên trong dữ liệu.

Đề xuất: phân bổ lại vùng tên và thao tác của custom folder; giữ touch targets mobile. Cân nhắc menu thao tác hoặc layout hai hàng; cần user review thiết kế trước khi sửa.

### UI-02 — Mất ranh giới đoạn trong preview và tìm kiếm (P2)

1. Nhập ba đoạn bằng paste plain text:
   - `QA Báo cáo`
   - `Học máy và nghiên cứu`
   - `Dòng cuối để kiểm tra lưu`
2. Preview/accessibility name của note dính thành `QA Báo cáoHọc máy và nghiên cứuDòng cuối để kiểm tra lưu`.
3. Tìm `hoc may` → 1 kết quả (đúng).
4. Tìm `cao hoc` → 0 kết quả, dù hai từ nằm cuối đoạn đầu/đầu đoạn kế tiếp.
5. Clear search → note và nội dung trở lại.

Source: `src/App.jsx:21-25` và `src/components/NoteList.jsx:25-29` lấy `body.textContent`; textContent không chèn khoảng trắng tại ranh giới các block. Normalization phía sau không thể khôi phục khoảng trắng đã mất.

Đề xuất: dùng chung helper HTML→plain text có phân cách block/br cho search và preview. Giữ nguyên HTML đã lưu, hỗ trợ checklist/nested list và tìm không dấu.

### A11Y-01 — Nút xóa editor mobile không có accessible name (P2)

1. Mở note ở iPhone 16 393×852.
2. Nút trash góc phải editor vẫn nhìn thấy và mở đúng confirm xóa note.
3. Accessibility tree chỉ ghi `button` không có tên; desktop thì có tên `Xóa`.

Source: `src/components/NoteEditor.jsx:227-234`: text `Xóa` bị `hidden sm:inline`; button không có `aria-label`.

Đề xuất: thêm accessible name ổn định cho nút xóa. Không đổi hành vi xóa.

## Rủi ro đọc từ source — CHƯA tái hiện runtime

- **SYNC-01, ưu tiên kiểm chứng P1:** `NoteEditor.jsx:89-179` khởi tạo draft/content từ note và reset theo `[note?.id, onUpdate]`; không có đường reconcile `note.content` mới của cùng note vào editor. `App.jsx:354` cũng giữ key theo workspace/note ID. Cần test hai phiên cùng mở một note: remote edit khi local sạch; remote edit khi có local draft. Chưa có bằng chứng từ lượt này rằng đồng bộ hai thiết bị hay mất dữ liệu thực tế xảy ra.
- **SYNC-02, ưu tiên kiểm chứng P1:** `useNotes.js:30-80` await hash rồi gán `hashRef`/đăng ký listener mà không có cancellation/generation guard; effect không reset hash/notes ngay khi đổi key. `useFolders.js` đã có cancellation/reset tương ứng. Cần controlled delay và rapid A→B→C switch trước khi sửa; chưa có bằng chứng runtime sai workspace từ lượt này.
- Chưa kiểm tra focus trap/keyboard navigation toàn bộ modal. Không ghi PASS accessibility tổng thể.

## Các ca manual đã quan sát đạt

| Ca | Bằng chứng quan sát |
|---|---|
| Mở workspace test | Modal đóng; workspace trống, title LOCAL TEST |
| Tạo folder | `QA Học tập`, count 1 |
| Đổi tên folder | Đổi thành `QA Đã đổi tên`, picker/header cập nhật |
| Tạo note trong folder | Hai note trong folder, Unfiled=0 |
| Nhập nhiều đoạn, autosave, reload | Nội dung ba đoạn còn nguyên sau reload |
| Tìm không dấu | `hoc may` → 1 kết quả |
| No-result và clear | `cao hoc` → 0; clear phục hồi note |
| Checklist Enter/Backspace/undo/redo | Ba mục còn nguyên sau chuỗi thêm dòng trống→Backspace→undo→redo đã thử |
| Tick, lưu và cold reload mobile | Mục đầu tick vàng/gạch ngang; sau reload, qua Folder→Unfiled→note vẫn tick, hai mục còn lại chưa tick |
| Pin | `QA Báo cáo` lên trước note mới hơn; có nút Bỏ ghim |
| Sort A–Z | Control chọn được A–Z; không coi dataset 2 note này là kiểm chứng toàn bộ comparator |
| Recent | Checklist vừa mở đứng trước Báo cáo, dù Báo cáo đang pin |
| Hủy xóa folder | Escape đóng confirm, folder/note còn nguyên |
| Xóa folder | Folder=0, Unfiled=2; cả hai note/nội dung và pin Báo cáo vẫn còn trên UI |
| Hủy xóa note mobile | Confirm hiển thị đúng QA Checklist; Escape đóng, note còn |
| Dark/light | Đổi được hai chiều, đã quan sát cả hai layout; cuối lượt trả dark |
| Mobile master/detail | Sau cold reload là folder; vào Unfiled rồi mở checklist được |

Không gán số lượng PASS tự động cho bảng này. Chưa thử xóa note xác nhận cuối, mọi toolbar formatting, long-content/keyboard-open/landscape, fast switching dưới debounce có đo thời gian, hoặc toàn bộ các trạng thái lỗi.

## Giới hạn và trạng thái cuối

- QA double không xác minh rules, retry/offline, network latency, multi-device Firestore hoặc server transactions/concurrency. Double kế thừa không thực thi `orderBy` như server và chưa có rollback/conflict mô phỏng đầy đủ; không suy ra lỗi production từ khác biệt này.
- Chrome có extension đang hoạt động. Console khi mở DevTools hiển thị React DevTools info và extension Flash Glass Translate; chưa thu console toàn phiên, không kết luận console toàn phiên sạch.
- iPhone giả lập không phải Safari/iPhone thật. Chưa đo định lượng overflow/contrast/touch size trong lượt này.
- Không chạy build vì chưa đổi runtime source; không dùng kết quả build 31/10 làm kết quả của hôm nay.
- Giữ hai note synthetic trong localStorage để user review; folder synthetic đã bị xóa trong test. Không cleanup dữ liệu khác.
- Server local đang được giữ mở. Source production, rules, package/dependencies và dist cũ giữ nguyên; không commit/push/deploy.

## Phạm vi sửa đề xuất để user review

1. UI-01: `src/components/FolderList.jsx` (chỉ đổi `src/App.jsx` nếu chọn tăng độ rộng sidebar).
2. UI-02: helper text mới dùng chung + `src/App.jsx`, `src/components/NoteList.jsx`.
3. A11Y-01: `src/components/NoteEditor.jsx`.
4. Viết ca kiểm chứng riêng cho SYNC-01/02 trước khi chốt phạm vi sửa sync; không mặc định ghi đè draft bằng remote content.
5. Recheck local desktop/mobile, then separate review build. Firebase integration test với backend riêng/emulator vẫn cần trước khi khẳng định sync ổn. User review local trước mọi deployment.
