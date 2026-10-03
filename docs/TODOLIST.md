# 📋 TODO List — Notepad App Online

> **Cập nhật:** 2026-10-03 | **Phiên bản hiện tại:** 1.0.0

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
- [ ] **P2 — Bundle lớn** — build 2026-10-01 sau checklist: JS 818.31 kB minified / 232.39 kB gzip, Vite warning chunk >500 kB; cân nhắc code-splitting.
- [x] **P2 — PWA meta warning** — ✅ 2026-09-21: thêm `mobile-web-app-capable=yes`; browser console regression sạch.
- [x] **Thiếu PWA icons chuẩn** — `manifest.json` chỉ reference `favicon.svg` với `sizes: "any"`. Cần icon 192x192 và 512x512 PNG cho PWA. ✅ Đã thêm đầy đủ
- [x] **Thiếu meta tags social sharing** — Không có `og:image`, `og:title`, `twitter:card` cho preview khi share link. ✅ Đã thêm Open Graph + Twitter Card

---

## 🚀 Tính năng dự kiến

### 🔴 Ưu tiên Cao — Bản 1.1

- [x] **Folder organization v1** — ✅ 2026-09-21: tạo/đổi tên folder, desktop 3-pane, mobile Folder→Notes→Editor, note có `folderId`, chuyển note giữa folder/Chưa phân loại, backward-compatible note cũ.
- [x] **Instagram attribution** — ✅ Header có `@trunk.ng` link `https://www.instagram.com/trunk.ng/`, mở tab mới; browser test PASS.
- [x] **Branding logo A** — ✅ 2026-10-03: folded-note SVG thay avatar chữ `N`; light/dark/mobile visual PASS; production alias render 40×40/no-overflow PASS.
- [x] **Checklist / Task list kiểu Apple Notes** — ✅ 2026-10-01: toolbar Checklist 44×44, Enter tạo item mới, click checkbox giữ `checked` qua autosave/Firestore, checked text line-through; desktop/mobile + fast-switch/back regression PASS; production Vercel smoke PASS.
- [ ] **Toast Notifications** — Thông báo đẹp khi: mất kết nối Firestore, lưu thành công, lỗi CRUD. Dùng component tự build, animate slide-in từ bottom.
- [x] **Confirm Dialog khi xóa** — ✅ Custom modal responsive, nút Hủy / Xóa tối thiểu 44px, Escape/backdrop cancel trên desktop.
- [ ] **Tìm kiếm ghi chú** — Thanh search trong `NoteList`, lọc real-time theo tiêu đề và nội dung. Highlight từ khóa khớp.
- [ ] **Keyboard Shortcuts** — Hỗ trợ phím tắt:
  - `Ctrl+N` → Tạo ghi chú mới
  - `Ctrl+F` → Focus thanh tìm kiếm
  - `Delete` → Xóa ghi chú đang chọn (có confirm)
  - `Ctrl+B/I/U` → Bold/Italic/Underline trong editor

### 🟡 Ưu tiên Trung bình — Bản 1.2

- [ ] **Xóa folder an toàn** — Nếu bổ sung, chỉ xóa folder metadata và chuyển notes bên trong về `Chưa phân loại`; không cascade-delete note.
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
- [ ] **End-to-End Encryption** — Mã hóa nội dung trước khi gửi lên Firestore, chỉ giải mã ở client.

### 🔵 Future integration — Apple Notes Sync + Locked Notes

> Đây là **kế hoạch tương lai / chưa implement / chưa kiểm chứng đầy đủ trên iPhone thật**. Khi bắt đầu phải prototype trước, không coi các giả định Shortcuts bên dưới là fact.

- [ ] **Prototype Apple Notes → Notepad Online bằng iOS Shortcuts** — test tối thiểu 3 note thật: 1 note thường, 1 checklist, 1 note đang khóa; xác minh chính xác Shortcut trả được field nào (title/body/folder/created/modified/formatting/locked state hoặc identifier nếu có).
- [ ] **Apple Notes Sync V1 — one-way import** — ưu tiên flow `Apple Notes → iOS Shortcut → HTTPS import endpoint → Notepad Online/Firestore`; chưa làm realtime two-way sync ở V1.
- [ ] **Bulk + incremental sync** — lần đầu import toàn bộ note hỗ trợ; các lần sau chỉ create/update note thay đổi nếu có metadata đủ tin cậy. Không match chỉ bằng title; cần thiết kế mapping/deduplication sau prototype.
- [ ] **Không auto-delete ở V1** — xóa note trên Apple Notes không được tự cascade-delete bản web cho tới khi sync engine đủ tin cậy.
- [ ] **Folder mapping** — nếu Shortcut cung cấp folder ổn định thì map Apple Notes folder sang folder của Notepad Online; giữ metadata nguồn để truy vết.
- [ ] **Import report** — sau sync phải báo rõ số note imported/updated/skipped; locked note hoặc attachment chưa hỗ trợ phải được báo, không âm thầm bỏ qua.
- [ ] **Locked Apple Notes handling** — không giả định Shortcut có thể đọc nội dung note đang khóa. Nếu prototype không đọc được sau xác thực iPhone thì V1 phải skip + report; không tìm cách bypass cơ chế khóa của Apple.
- [ ] **Vault / Lock Note trên web** — thiết kế một `Vault Password` riêng với `Sync Key`; ưu tiên một vault password cho các locked note trong cùng workspace thay vì mỗi note một password.
- [ ] **Client-side encryption cho locked note** — khi implement Vault, plaintext của locked note không được lưu trực tiếp lên Firestore; mã hóa/giải mã ở client, có versioned encrypted payload + salt/IV/KDF metadata theo thiết kế crypto được review trước khi code.
- [ ] **Vault session timeout** — sau khi unlock có thể giữ vault mở tạm thời rồi tự lock lại; duration cụ thể quyết định khi implement.
- [ ] **Locked-title privacy option** — mặc định có thể giữ title để dễ nhận diện; cân nhắc tùy chọn ẩn title của locked note ở phase sau.
- [ ] **Import locked note sau Vault** — chỉ sau khi prototype xác minh iPhone có thể cung cấp plaintext hợp lệ và Vault encryption đã hoàn thiện mới cho phép import locked Apple Notes thành encrypted web note.
- [ ] **Attachment/ảnh/PDF/scan/drawing** — để phase sau; V1 tập trung text, folder, thời gian, checklist/basic formatting nếu chuyển đổi tin cậy.

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
- **Tech stack:** React 18 + Vite 6 + Tailwind CSS 3.4 + TipTap runtime 2.27.2 + Firebase Firestore
- **Deploy:** Vercel (SPA), auto-deploy từ GitHub push

---

> *Đánh dấu `[x]` khi hoàn thành mỗi mục.*
