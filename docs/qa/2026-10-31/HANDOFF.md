# Notepad Online — handoff 2026-10-31

## State and authorization

User approved local folder delete + checklist repair, tested localhost, then authorized deployment. Base HEAD `155400d`; feature `2632f60` pushed main → Vercel `2fp75o1w8` Ready. Firebase rules compiled/released 13:27:43 +07:00. Production alias serves exact reviewed local bundle `index-BLTcuew3.js`; localhost + actual Firebase 10/10 PASS and production 10/10 PASS, test cleanup notes=0/folders=0 for both. Canonical section 5J records production PASS; section 5I records the earlier local-only phase. No workspace master layout applies to this D:\OTHERS project. A subsequent documentation push may produce another Vercel deployment with identical runtime; final alias verification accompanies task completion.

## Changes

- `src/hooks/useFolders.js`: deleteFolder reads server notes, moves folderId only in transactions of <=200 notes, rechecks concurrently moved/deleted notes, checks for late additions, then deletes folder metadata. Captures workspace hash for the operation and resets stale folder state on workspace switch.
- `src/components/FolderList.jsx`: custom folder delete button, no delete control on system folders.
- `src/components/ConfirmDialog.jsx`: optional busy/error state, block duplicate actions/cancel during processing.
- `src/App.jsx`: confirmation flow; deleted/missing folder references visible in Unfiled; editor key by workspace/note.
- `src/index.css`: scope task flex layout to direct task-list children; checked text decoration only on task paragraphs; 44×44 mobile labels; long-text wrap.
- `src/components/NoteEditor.jsx`: draft version guard avoids marking a newer draft saved when an older save finishes.
- `firestore.rules`: folder delete enabled under the existing Sync-Key trust model. Compiled/released to actual Firebase project on 31/10; this is not security hardening.
- Canonical progress/backlog and four GPT resume files updated. No package/dependency changes.

## Verification

- `baseline.json`: 10 checks before source changes; 3 layout/touch issues reproduced. Its small-window screenshot was desktop Chrome's 500px minimum, not a real 393px viewport.
- `after.json`: 25/25 isolated browser checks PASS, SEVERE console entries=[]; Enter/Backspace/Delete, empty row exit, undo, nested indent/outdent, range deletion, checked states, switch/save/reload; folder cancel/empty/403 notes/error/concurrent move/late note/orphan fallback; final mobile innerWidth=393 and height=852 using CDP.
- Screenshots `after.png` and `after-folder.png` inspected directly.
- `build.txt`: final `npm run build -- --outDir dist-review-20261031`, PASS, 1705 modules; JS 837.27 kB / gzip 236.91 kB. Large-chunk warning remains. Original `dist/` untouched; separate build directory is a review artifact, not intended for source commit.
- `git -c core.safecrlf=false diff --check` PASS before documentation update; final check recorded at task completion.
- Initial isolated QA did not use Firebase; Vite QA config replaces Firebase imports. Follow-up `live_smoke.py` uses actual app/Firebase with generated disposable Sync Key only; no user notes. `live-local.json`: 10/10 PASS; backend independently confirms every note field except folderId is unchanged after folder delete; cleanup=0; SEVERE=[].
- `live-production.json`: 10/10 PASS against production alias and real Firestore; same field-preservation checks, desktop/mobile reload, 44px mobile labels/no overflow, empty folder delete, UI note cleanup; no error, SEVERE=[], backend cleanup notes=0/folders=0. Mobile screenshot inspected directly.
- `production-bundle.json`: feature deployment `notepad-online-2fp75o1w8-trunknguen.vercel.app` Ready; alias bundle `index-BLTcuew3.js`, 837270 bytes, SHA256 `6f5c45586e06229da293b65748b4bb93afc1e6e9463e8280dcba2a3c0b8a8d1b`, byte-for-byte equal to reviewed local build.
- Browser used Chrome 156.0.8078.74 with cached chromedriver 154 and `--disable-build-check`; use a matching driver when available. Selenium actions, model assertions and screenshots succeeded, but this compatibility override is a test-environment limitation.

## Remaining uncertainty

- User reports checklist rows misalign/disappear during add/delete. CSS defects reproduced and repaired; tested text/model operations preserved content. Have NOT reproduced every original symptom on the user's iPhone or notes. Do not claim all data-loss causes fixed.
- Standard TipTap semantics retained: Enter on an empty task exits the list; Backspace at a task boundary may merge/lift rows. No custom keymap introduced.
- Same-note remote-content reconciliation/conflict handling was discussed in initial review, but was not implemented: task was narrowed to add/delete-row failures. Simultaneous editing of the same note remains unverified.
- Folder operation is NOT atomic across all chunks. If a later move fails, earlier notes remain safely in Unfiled and the folder stays. UI error says partial move is possible.
- A stale client can still create/assign a note after the final emptiness query. No note is deleted; App displays stale references as Unfiled. This does not repair the stored folderId or enforce integrity in server rules.
- Rules compiled/released (`c0337244-8e5e-4e38-b0c4-9137f36a1f48`); both localhost and production use actual Firebase and delete now PASS. Existing Sync-Key trust model remains, no wider security hardening added.

## Resume commands

From project root, start isolated server:

```powershell
node node_modules/vite/bin/vite.js --config scripts/qa/vite.config.js
```

In another terminal with a compatible Chrome driver:

```powershell
python scripts/qa/regression.py docs/qa/2026-10-31/after.json
```

For the cached driver environment used in this run only:

```powershell
$env:DRIVER = 'C:\Users\admin\.cache\selenium\chromedriver\win64\154.0.8037.92\chromedriver.exe'
$env:ALLOW_DRIVER_MISMATCH = '1'
python scripts/qa/regression.py docs/qa/2026-10-31/after.json
```

Build without overwriting historical dist:

```powershell
npm run build -- --outDir dist-review-20261031
```

## Next steps

1. Let user review the local change and retry the original add/delete-row sequence. If symptoms remain, capture exact caret/selection, keys, nested structure and device; use synthetic notes before touching real data.
2. Rollout and live production verification complete. Let user retry the original sequence on their physical device; do not auto-advance features or rerun destructive tests on real user notes.
3. Do not auto-fix dependency audits, add unrelated features, change archives or cleanup existing artifacts.

## Recovery and artifacts

Pre-change copies of the seven source/rules files and progress documents: `C:\Users\admin\AppData\Local\Temp\notepad-before-20261031-131004`. `.env` was not manually opened/copied/printed; Vite uses its existing environment-loading mechanism. Original dist, archives and pre-existing backups were not changed. New QA files: `scripts/qa/`; outputs: this directory and `dist-review-20261031/`. Temp backup is local recovery convenience, not a durable remote backup. Generated build and the first smoke-run helper failure screenshot remain local artifacts; they are excluded from the documentation commit.
