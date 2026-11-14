import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import NoteEditor from '../../src/components/NoteEditor';
import FolderList from '../../src/components/FolderList';
import { useNotes } from '../../src/hooks/useNotes';
import { getPlainText } from '../../src/lib/noteText';
import '../../src/index.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const results = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const fixture = document.getElementById('fixture');
const root = createRoot(fixture);
const runId = `qa-regression-${Date.now()}`;
const storageKey = `${runId}:draft`;
const output = document.getElementById('results');
const check = (name, pass, evidence = null) => {
    results.push({ name, pass: Boolean(pass), evidence });
    output.textContent = JSON.stringify(results, null, 2);
};
const render = async component => { await act(async () => { root.render(component); await wait(70); }); };
const settle = async (ms = 70) => { await act(async () => { await wait(ms); }); };
const action = async fn => { let result; await act(async () => { result = await fn(); }); return result; };
const editor = () => fixture.querySelector('.ProseMirror')?.editor;
const noop = () => {};
let remote = { id: 'test-editor', title: 'Original', content: '<p>Original</p>', updatedAt: new Date() };
let saves = [];
let delay = 0;
const save = async (id, data, options) => {
    await wait(delay);
    if (options?.expected && (options.expected.title !== remote.title || options.expected.content !== remote.content)) {
        return { conflict: true, remote: { title: remote.title, content: remote.content } };
    }
    saves.push({ id, ...data });
    remote = { ...remote, ...data };
    return true;
};
const view = () => <NoteEditor key="editor" note={{...remote}} folders={[]} onUpdate={save} onBack={noop} onDelete={noop} onMoveFolder={noop} draftStorageKey={storageKey} />;
const type = async html => { await act(async () => { editor().commands.setContent(html, true); }); };
const click = async label => {
    const button = [...fixture.querySelectorAll('button')].find(button => button.textContent.trim() === label);
    if (!button) throw Error(`Missing button ${label}`);
    await act(async () => { button.click(); await wait(50); });
};

try {
    check('block_boundaries', getPlainText('<p>QA Báo cáo</p><p>Học máy</p>') === 'QA Báo cáo Học máy');
    check('nested_inline_br_entities', getPlainText('<ul><li><p>A <strong>B</strong><br>C&nbsp;D</p><ul><li>E</li></ul></li></ul>') === 'A B C D E');
    await render(view());
    const deleteButton = fixture.querySelector('button[aria-label="Xóa ghi chú"]');
    check('delete_accessible_name', Boolean(deleteButton));
    remote = {...remote, title:'Remote clean', content:'<p>Remote clean</p>'};
    await render(view());
    check('clean_editor_accepts_remote', editor().getText() === 'Remote clean', editor().getText());
    check('remote_adoption_no_writeback', saves.length === 0);

    await type('<p>Local draft</p>');
    remote = {...remote, title:'Other device', content:'<p>Other device</p>'};
    await render(view());
    await settle(550);
    check('dirty_remote_preserves_draft', editor().getText() === 'Local draft');
    check('conflict_blocks_autosave', saves.length === 0 && fixture.textContent.includes('Bản nháp của bạn được giữ lại'));
    check('conflict_recovery_stored', JSON.parse(sessionStorage.getItem(storageKey))?.draft.content === '<p>Local draft</p>');
    await render(<div />);
    check('conflict_unmount_does_not_overwrite_remote', remote.title === 'Other device' && saves.length === 0);
    await render(view());
    check('conflict_restored_after_remount', editor().getText() === 'Local draft' && fixture.textContent.includes('Bản nháp của bạn được giữ lại'));
    await click('Dùng bản mới');
    check('use_remote_explicit', editor().getText() === 'Other device' && !sessionStorage.getItem(storageKey));

    await type('<p>Keep local</p>');
    remote = {...remote, title:'Newer remote', content:'<p>Newer remote</p>'};
    await render(view());
    await click('Giữ bản của tôi');
    await settle(550);
    check('keep_local_explicit_cas', remote.title === 'Keep local' && saves.length === 1);

    // Server changes without delivering the snapshot before the debounce: CAS
    // must still reject the stale write and show the conflict.
    await type('<p>Race local</p>');
    remote = {...remote, title:'Race remote', content:'<p>Race remote</p>'};
    await settle(550);
    check('late_remote_cas_rejects_stale_save', remote.title === 'Race remote' && saves.length === 1 && fixture.textContent.includes('Bản nháp của bạn được giữ lại'));
    await click('Dùng bản mới');
    await type('<p>Fast departure</p>');
    await render(<div />);
    await settle(100);
    check('unmount_flushes_pending_draft', remote.title === 'Fast departure');

    await render(view());
    delay = 200;
    await type('<p>Version one</p>');
    await settle(480);
    await type('<p>Version two</p>');
    await settle(1000);
    check('serial_saves_keep_latest_version', remote.title === 'Version two' && !sessionStorage.getItem(storageKey));
    delay = 0;
    await type('<p>Temporary change</p>');
    await type('<p>Version two</p>');
    check('revert_to_saved_content_not_stuck_saving', !fixture.textContent.includes('?ang l?u...') && !sessionStorage.getItem(storageKey));
    await type('<p>Same edit</p>');
    remote = {...remote, title:'Same edit', content:'<p>Same edit</p>'};
    await render(view());
    check('identical_remote_does_not_create_conflict', !fixture.textContent.includes('B?n nh?p c?a b?n ???c gi? l?i') && !sessionStorage.getItem(storageKey));

    delay = 400;
    await type('<p>Slow old editor</p>');
    await settle(480);
    await render(<div />);
    await render(view());
    await type('<p>New editor draft</p>');
    await settle(250);
    check('old_completion_does_not_erase_new_recovery', JSON.parse(sessionStorage.getItem(storageKey))?.draft.content === '<p>New editor draft</p>');
    await render(view());
    await settle(1000);
    check('reopen_during_save_keeps_unsaved_content', editor().getText() === 'New editor draft');
    // The previous editor's delayed commit may now be a newer baseline. Keep
    // the draft, then require the same explicit conflict resolution as a remote edit.
    if (fixture.textContent.includes('Bản nháp của bạn được giữ lại')) await click('Giữ bản của tôi');
    await settle(1000);
    check('reopen_during_save_can_resolve_latest_content', remote.title === 'New editor draft');
    delay = 0;
    await type('<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Done</p></li><li data-type="taskItem" data-checked="false"><p>Todo</p></li></ul>');
    await settle(550);
    await render(<div />);
    await render(view());
    check('checklist_checked_state_remount', fixture.querySelectorAll('li[data-checked="true"]').length === 1 && fixture.querySelectorAll('li[data-checked="false"]').length === 1);
    await render(<div style={{width:196,height:400}}><FolderList folders={[{id:'folder',name:'QA Học tập'}]} notes={[]} loading={false} selectedFolderId="folder" onSelect={noop} onCreate={noop} onRename={noop} onDelete={noop} /></div>);
    const folderName = [...fixture.querySelectorAll('span')].find(span => span.textContent === 'QA Học tập');
    check('folder_name_not_clipped', folderName && folderName.scrollWidth <= folderName.clientWidth && getComputedStyle(folderName).textOverflow !== 'ellipsis', { width:folderName?.clientWidth,scrollWidth:folderName?.scrollWidth });
    check('folder_action_targets', [...fixture.querySelectorAll('button')].every(button => button.getBoundingClientRect().height >= 44));

    let api;
    function Hook({syncKey}) { api = useNotes(syncKey); return <p>{api.notes.map(note => note.title).join(',')}</p>; }
    const originalDigest = crypto.subtle.digest.bind(crypto.subtle);
    const hash = async key => Array.from(new Uint8Array(await originalDigest('SHA-256',new TextEncoder().encode(key))), byte=>byte.toString(16).padStart(2,'0')).join('');
    const keyA = `${runId}-A`, keyB = `${runId}-B`, slowKey = `${runId}-slow`;
    const hashA=await hash(keyA), hashB=await hash(keyB);
    await render(<Hook syncKey={keyA} />); await settle();
    const oldApi = api;
    const noteA = await action(() => oldApi.createNote('Workspace A', '<p>A</p>')); await settle();
    let release;
    const held = new Promise(resolve => { release = resolve; });
    crypto.subtle.digest = async (algorithm,data) => {
        if (new TextDecoder().decode(data) === slowKey) await held;
        return originalDigest(algorithm,data);
    };
    await render(<Hook syncKey={slowKey} />);
    check('new_workspace_unready_blocks_writes', await api.createNote('Must not create') === null && api.notes.length === 0);
    await render(<Hook syncKey={keyB} />); await settle();
    const currentApi = api;
    await action(async () => { release(); await wait(120); });
    const noteB = await action(() => api.createNote('Workspace B', '<p>B</p>')); await settle();
    check('late_hash_cannot_rebind_listener', window.firestoreQA.records.has(`sync_data/${hashB}/notes/${noteB}`) && api.notes.every(note=>note.title === 'Workspace B'));
    await action(() => oldApi.updateNote(noteA,{title:'Old draft flushed',content:'<p>A flushed</p>'})); await settle();
    check('old_callback_writes_original_workspace', window.firestoreQA.records.get(`sync_data/${hashA}/notes/${noteA}`)?.title === 'Old draft flushed' && api.notes.every(note=>note.title === 'Workspace B'));
    const before = window.firestoreQA.records.get(`sync_data/${hashB}/notes/${noteB}`);
    const rejected = await action(() => currentApi.updateNote(noteB,{title:'Clobber',content:'<p>Clobber</p>'},{expected:{title:'Stale',content:''}}));
    check('transaction_rejects_stale_baseline', rejected?.conflict && window.firestoreQA.records.get(`sync_data/${hashB}/notes/${noteB}`).title === before.title);
    const accepted = await action(() => currentApi.updateNote(noteB,{title:'Accepted',content:'<p>Accepted</p>'},{expected:{title:before.title,content:before.content}}));
    check('transaction_accepts_matching_baseline', accepted === true && window.firestoreQA.records.get(`sync_data/${hashB}/notes/${noteB}`).title === 'Accepted');
    await render(<Hook syncKey="" />); await settle();
    check('empty_sync_key_clears_workspace', api.notes.length === 0 && !api.loading && await api.createNote('No workspace') === null);
    crypto.subtle.digest = originalDigest;
    // Remove only the exact synthetic records created by this suite.
    for (const path of [...window.firestoreQA.records.keys()]) if (path.startsWith(`sync_data/${hashA}/`) || path.startsWith(`sync_data/${hashB}/`)) window.firestoreQA.records.delete(path);
    await action(() => window.firestoreQA.emit());
    sessionStorage.removeItem(storageKey);
    await render(<p>Local regression complete. User test notes preserved.</p>);
} catch(error) {
    check('unexpected_exception', false, error.stack || String(error));
}
const report = { name: new URLSearchParams(location.search).has('mobile') ? 'regression-mobile' : 'regression', environment:'actual React/TipTap + isolated Firestore double; not live Firebase', viewport:{width:innerWidth,height:innerHeight}, results, passed:results.filter(item=>item.pass).length, total:results.length };
output.textContent = JSON.stringify(report,null,2);
const sent = await fetch('/__qa_result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});
document.title = `QA ${report.passed}/${report.total} ${sent.ok ? 'saved' : 'UNSAVED'}`;
