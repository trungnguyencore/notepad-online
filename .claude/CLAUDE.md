# CLAUDE.md — Notepad Online

## AI RESUME ENTRYPOINT

Trước khi làm bất kỳ task nào trong project, đọc theo thứ tự:

@.claude/gpt-progress/PROJECT_CONTEXT.md
@.claude/gpt-progress/PROJECT_PROGRESS.md
@.claude/gpt-progress/PROJECT_COMMANDS.md
@.claude/gpt-progress/PROJECT_EVIDENCE.md

Sau đó đối chiếu canonical source được chỉ ra trong các file trên trước khi thay đổi project state.
Không suy diễn tiến độ từ tên file và không sửa file ngoài phạm vi task.

## Project identity

- Active project: Notepad Online
- Root: `D:\OTHERS\LATVAT\notepad app online`
- Canonical progress: `docs\PROJECT_PROGRESS.md`
- Backlog: `docs\TODOLIST.md`
- Legacy archive: `D:\OTHERS\LATVAT\notepad_old`
- Pre-mobile backup: `D:\OTHERS\LATVAT\notepad app online_backup_2026-09-21_pre_mobile`

## Critical workspace rule

`notepad_old` là bản cũ chỉ để reference.
Không chỉnh sửa, move, rename hoặc xóa folder đó.
Backup `notepad app online_backup_2026-09-21_pre_mobile` là snapshot fallback; không chỉnh sửa nó trừ khi user yêu cầu restore rõ ràng.
Mọi task Notepad mặc định phải làm trong project hiện tại.
## Technical scope

Source hiện tại dùng React + Vite, Tailwind CSS, TipTap và Firebase Firestore.
Sync Key được hash SHA-256 trước khi dùng làm Firestore path.
Firebase client config được lấy từ biến môi trường `VITE_FIREBASE_*`.

## Safety rules

- Không đọc hoặc in nội dung `.env` nếu task không thật sự cần.
- Không commit/push/deploy nếu user chưa yêu cầu rõ.
- Không reset/revert hoặc ghi đè uncommitted work.
- Trước khi sửa code phải kiểm tra `git status`.
- Giữ diff nhỏ và đúng phạm vi task.
- Không coi TODO hay tài liệu cũ là bằng chứng tính năng đã hoạt động.
- Test/build/deploy chỉ được ghi PASS khi đã đọc output thực tế.

## State update rule

Sau thay đổi có ý nghĩa:
1. Cập nhật `docs\PROJECT_PROGRESS.md` trước.
2. Xác minh source/Git/output liên quan.
3. Refresh `.claude\gpt-progress\`.
4. Chỉ cập nhật master `layout.md` khi state/path/resume pointer thay đổi đáng kể.
