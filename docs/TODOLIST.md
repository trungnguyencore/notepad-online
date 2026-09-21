# 📋 TODO List — Notepad App Online

> **Cập nhật:** 2026-09-21 | **Phiên bản hiện tại:** 1.0.0

---

## 🐛 Bugs cần sửa

- [x] **Thiếu file `favicon.svg`** — `index.html` dòng 5 reference `/favicon.svg` nhưng file không tồn tại trong `public/`, gây lỗi 404 trên console. ✅ Đã tạo favicon.svg + icon-192.png + icon-512.png
- [x] **Xóa note không có confirm dialog** — ✅ 2026-09-21: thêm `ConfirmDialog`, test Hủy giữ note và Xóa xác nhận mới xóa.
- [x] **P0 — Mất draft khi chuyển note nhanh** — ✅ 2026-09-21: flush pending draft khi rời note + guard async race; regression gõ rồi Back trước 450ms, refresh vẫn giữ nội dung.
- [x] **Autosave trigger không cần thiết** — ✅ 2026-09-21: debounce phụ thuộc `note?.id` + draft state, dùng persisted ref thay vì dependency cả `note` object.
- [ ] **Firestore Rules quá mở** — `allow read, write: if true` không có rate limiting. Nên thêm giới hạn document size và validate trường dữ liệu.
- [x] **P0 — Mobile list/editor xếp dọc quá dài** — ✅ 2026-09-21: mobile chuyển sang master/detail; list và editor không còn render nối tiếp. Regression 6 notes: document height = viewport 852px, editor section hidden ở list view.
- [x] **P1 — Touch targets quá nhỏ trên iPhone** — ✅ 2026-09-21: visible interactive controls regression không còn target <44px; editor toolbar 44×44.
- [x] **P1 — Sync Key input 15px** — ✅ 2026-09-21: computed font-size = 16px ở 393×852 và 430×932.
- [x] **P1 — Nested interactive control** — ✅ 2026-09-21: note card và delete là sibling controls; DOM regression `button button = 0`.
- [ ] **P2 — Bundle lớn** — build 2026-09-21: JS 799.26 kB minified / 227.29 kB gzip, Vite warning chunk >500 kB; cân nhắc code-splitting.
- [x] **P2 — PWA meta warning** — ✅ 2026-09-21: thêm `mobile-web-app-capable=yes`; browser console regression sạch.
- [x] **Thiếu PWA icons chuẩn** — `manifest.json` chỉ reference `favicon.svg` với `sizes: "any"`. Cần icon 192x192 và 512x512 PNG cho PWA. ✅ Đã thêm đầy đủ
- [x] **Thiếu meta tags social sharing** — Không có `og:image`, `og:title`, `twitter:card` cho preview khi share link. ✅ Đã thêm Open Graph + Twitter Card

---

## 🚀 Tính năng dự kiến

### 🔴 Ưu tiên Cao — Bản 1.1

- [ ] **Toast Notifications** — Thông báo đẹp khi: mất kết nối Firestore, lưu thành công, lỗi CRUD. Dùng component tự build, animate slide-in từ bottom.
- [x] **Confirm Dialog khi xóa** — ✅ Custom modal responsive, nút Hủy / Xóa tối thiểu 44px, Escape/backdrop cancel trên desktop.
- [ ] **Tìm kiếm ghi chú** — Thanh search trong `NoteList`, lọc real-time theo tiêu đề và nội dung. Highlight từ khóa khớp.
- [ ] **Keyboard Shortcuts** — Hỗ trợ phím tắt:
  - `Ctrl+N` → Tạo ghi chú mới
  - `Ctrl+F` → Focus thanh tìm kiếm
  - `Delete` → Xóa ghi chú đang chọn (có confirm)
  - `Ctrl+B/I/U` → Bold/Italic/Underline trong editor

### 🟡 Ưu tiên Trung bình — Bản 1.2

- [ ] **Ghim ghi chú (Pin)** — Ghim ghi chú quan trọng lên đầu danh sách, lưu cờ `pinned: boolean` vào Firestore, hiển thị icon 📌.
- [ ] **Sắp xếp notes** — Dropdown sắp xếp: Mới nhất trước, Cũ nhất trước, Tên A-Z, Tên Z-A.
- [ ] **Word/Character count** — Hiển thị số từ + số ký tự ở footer editor, cập nhật real-time.
- [ ] **Export ra JSON** — Nút "Xuất dữ liệu" tải tất cả ghi chú về file `.json` để backup thủ công.
- [ ] **Import từ JSON** — Nút "Nhập dữ liệu" cho phép chọn file `.json` đã export trước đó để khôi phục.
- [ ] **Swipe-to-delete trên mobile** — Touch gesture vuốt trái để hiện nút xóa trên mỗi note card.

### 🟢 Ưu tiên Thấp — Bản 1.3+

- [ ] **Color Tags / Labels** — Gắn nhãn màu cho note (🔴🟠🟡🟢🔵🟣), lọc theo màu.
- [ ] **Multi-Sync Key (Workspaces)** — Hỗ trợ nhiều sync key, chuyển đổi workspace khác nhau từ dropdown.
- [ ] **Hỗ trợ ảnh trong note** — Kéo thả / paste ảnh vào editor, upload lên Firebase Storage, hiển thị inline.
- [ ] **Markdown shortcuts** — Gõ `#` → heading, `-` → bullet list, `>` → blockquote tự động format.
- [ ] **Note Statistics Dashboard** — Thống kê: tổng số ghi chú, tổng số từ, ghi chú gần đây, hoạt động theo ngày.
- [ ] **PWA Offline Support** — Service Worker cache + IndexedDB lưu local, đồng bộ khi có mạng.
- [ ] **End-to-End Encryption** — Mã hóa nội dung bằng AES-256 trước khi gửi lên Firestore, chỉ giải mã ở client.

---

## 🎨 Assets

- [x] `public/favicon.svg` — Icon notepad SVG cho browser tab
- [x] `public/icon-192.png` — PWA icon 192×192
- [x] `public/icon-512.png` — PWA icon 512×512
- [x] `public/og-image.png` — Open Graph image 1200×630 cho social sharing
- [x] `public/apple-touch-icon.png` — Apple touch icon 180×180
- [x] `public/manifest.json` — PWA manifest đầy đủ icons
- [x] `index.html` — Open Graph + Twitter Card meta tags

---

## 📝 Ghi chú

- **Lợi thế cạnh tranh:** Không cần đăng nhập + bảo mật bằng Sync Key (SHA-256)
- **Tech stack:** React 18 + Vite 6 + Tailwind CSS 3.4 + TipTap 2.9 + Firebase Firestore
- **Deploy:** Vercel (SPA), auto-deploy từ GitHub push

---

> *Đánh dấu `[x]` khi hoàn thành mỗi mục.*
