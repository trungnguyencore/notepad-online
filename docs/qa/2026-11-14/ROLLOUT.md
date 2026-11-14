# Production rollout — 14/11/2026

**Đã được user duyệt và deploy:** https://notepad-online-beta.vercel.app/

User nói “rồi deploy đi” sau khi xem phần so sánh local/web. Authorization này thay checkpoint chờ duyệt trong handoff ngày 13/11; không yêu cầu xác nhận lại. Không đổi runtime source trong lượt rollout.

## Bản đã lên production

- Feature commit: `196568895b98542a30f95be119a0ea4d00d8804a`, pushed `main` vào `trungnguyencore/notepad-online`.
- Vercel feature deployment: `notepad-online-cf1zs5ptv-trunknguen.vercel.app`, **READY**; production alias đã trỏ đến bản mới.
- Runtime: `/assets/index-4u6YFiP1.js`, **841275 bytes**, SHA-256 **335578c81d5828fe330701dbc3ec44c54dcca6e6bfbacf317bd60da969a80580**.
- Production bundle khớp từng byte với reviewed local build `dist-review-20261113/`. Không có `[LOCAL TEST]` title hoặc persistent QA mock trong production bundle.
- Evidence: `deployment-feature.json`, `production-bundle.json`.

## Kiểm chứng

| Môi trường | Report | Kết quả |
|---|---|---|
| Reviewed production build preview 3114 + Firestore thật | `live-local.json` | 10/10 |
| Reviewed production build preview 3114 + Firestore thật | `sync-local-final.json` | 9/9 |
| Production alias + Firestore thật | `live-production.json` | 10/10 |
| Production alias + Firestore thật | `sync-production.json` | 9/9 |

Tổng **19/19 ca actual Firebase trên mỗi môi trường**. Các report cuối đều `error=null`, console SEVERE=0; mọi workspace test ngẫu nhiên cleanup còn 0 notes/folders qua REST readback độc lập.

Live smoke kiểm tra checklist Enter/Backspace/tick/save, folder cancel/delete giữ toàn bộ note fields trừ folderId, desktop reload, mobile 393×852 layout/tick cold reload, empty-folder deletion và UI note deletion.

Sync smoke kiểm tra save transaction, hai tab nhận remote khi sạch và không save-back, dirty conflict giữ draft, recovery sau reload, user chọn Giữ bản của tôi lưu được bằng transaction, tab kia nhận nội dung và đổi Sync Key không đưa draft sang workspace mới. Dirty-conflict test giữ riêng debounce local đủ lâu để external write đến; Firebase SDK/Firestore vẫn là thật, không dùng backend double.

Đã xem trực tiếp [checklist production mobile](live-production.png) và [conflict production desktop](sync-production-conflict.png), cùng hai ảnh preflight tương ứng.

Một lượt sync script ban đầu dùng `[0]` trên REST list khi document vừa tạo chưa xuất hiện và gặp IndexError. Đã sửa helper trả None để polling đợi có dữ liệu, rồi final preflight 9/9. Không sửa app để làm test qua. Failure artifact `sync-local.json`/`sync-local-failure.png` được giữ local, không đưa vào commit evidence thành công.

## Phạm vi đã publish và dữ liệu

- UI/UX fixes: folder name wrap + hàng thao tác riêng; shared paragraph-aware search/preview; accessible name nút xóa mobile.
- Sync fixes: workspace-bound callbacks/cancellation, transaction baseline checks, giữ local draft và explicit conflict choice, sessionStorage recovery/save queue/ownership protection.
- Không đổi schema, rules, package/dependencies hoặc root production configs; **không deploy Firebase rules**.
- Test dùng browser profile và Sync Key ngẫu nhiên mới, chỉ đọc/ghi/dọn đúng các workspace đó. Không đọc hoặc sửa ghi chú thật của user, không lưu Sync Key user vào báo cáo.
- Giữ `.env`, original `dist/`, archives/backups và các artifact cũ. Không stage generated `dist-review-*` hoặc failure screenshot cũ.
- 104/104 isolated local checks trước rollout vẫn ở QA folder 13/11; real Firebase evidence ở đây bổ sung và không thay số liệu cũ.

## Điểm tiếp tục

- Canonical: `docs/PROJECT_PROGRESS.md`, section 5M. Latest handoff là file này.
- Production đã verified; không còn chờ phê duyệt rollout này. Documentation push có thể tạo deployment mới cùng runtime; final alias Ready/bundle check giữ trong `final-alias.json` local, tránh chuỗi commit tự tham chiếu.
- Chưa có physical-iPhone/Safari acceptance hoặc coverage mọi offline/retry/network/concurrent edit case; không khẳng định các phần này PASS.
- Người dùng nên reload trang để nhận bundle mới. Local QA 3113 vẫn là backend double; preview 3114 dùng real Firebase, không nhập Sync Key thật vào đó để test phá dữ liệu.
- Có thể trở lại deployment runtime trước (`ba122f3`, `notepad-online-lnr0n4zkn-trunknguen.vercel.app`) nếu thật sự cần, nhưng chưa có yêu cầu rollback và không tự thực hiện.

## Commands đã dùng

```powershell
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 3114 --strictPort --outDir dist-review-20261113
python scripts/qa/live_smoke.py http://127.0.0.1:3114/ docs/qa/2026-11-14/live-local.json
python scripts/qa/live_sync_smoke.py http://127.0.0.1:3114/ docs/qa/2026-11-14/sync-local-final.json
git push origin main
vercel inspect notepad-online-cf1zs5ptv-trunknguen.vercel.app --wait --timeout 50s --json
python scripts/qa/live_smoke.py https://notepad-online-beta.vercel.app/ docs/qa/2026-11-14/live-production.json
python scripts/qa/live_sync_smoke.py https://notepad-online-beta.vercel.app/ docs/qa/2026-11-14/sync-production.json
```

Các script tự tạo workspace synthetic và dọn đúng workspace đó. Không chạy lại test ghi dữ liệu chỉ để refresh progress. Có thể chọn DRIVER tương thích nếu Selenium Manager không resolve được.
