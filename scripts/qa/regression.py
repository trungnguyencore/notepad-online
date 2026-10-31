"""Run isolated browser regressions; requires the QA Vite server and Selenium.

No Firebase credentials or user notes are used. DRIVER may point to a compatible
chromedriver; ALLOW_DRIVER_MISMATCH=1 is only for local QA with cached drivers.
"""
import json
import os
from pathlib import Path
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait

sys.stdout.reconfigure(encoding='utf-8')
output = Path(sys.argv[1] if len(sys.argv) > 1 else 'docs/qa/2026-10-31/result.json')
output.parent.mkdir(parents=True, exist_ok=True)
options = webdriver.ChromeOptions()
options.add_argument('--headless=new')
options.add_argument('--window-size=1440,1000')
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
driver_path = os.environ.get('DRIVER')
service = Service(driver_path, service_args=['--disable-build-check'] if os.environ.get('ALLOW_DRIVER_MISMATCH') else []) if driver_path else Service()
d = webdriver.Chrome(options=options, service=service)
d.set_page_load_timeout(20)
results = []

def js(code, *args):
    return d.execute_script(code, *args)

def check(name, passed, evidence=None):
    results.append({'name': name, 'pass': bool(passed), 'evidence': evidence})
    print(name, 'PASS' if passed else 'FAIL', flush=True)

def setup(html):
    js("const e=document.querySelector('.ProseMirror').editor; e.commands.setContent(arguments[0],true);", html)
    time.sleep(.1)

def caret(text, offset=0):
    js("const e=document.querySelector('.ProseMirror').editor; let pos; e.state.doc.descendants((n,p)=>{if(n.isText && n.text===arguments[0])pos=p+arguments[1];}); if(pos===undefined)throw Error('text missing'); e.commands.setTextSelection(pos); e.commands.focus();", text, offset)
    WebDriverWait(d, 5).until(lambda x: js("return document.activeElement===document.querySelector('.ProseMirror')"))
    time.sleep(.05)

def state():
    return js("const e=document.querySelector('.ProseMirror').editor; return {html:e.getHTML(),text:e.getText(), tasks:[...document.querySelectorAll('ul[data-type=taskList] > li')].map(li=>({checked:li.dataset.checked,text:li.querySelector(':scope > div').textContent})),json:e.getJSON()};")

def key(*keys):
    actions = ActionChains(d)
    if len(keys)>1 and keys[0] in (Keys.CONTROL, Keys.SHIFT, Keys.ALT):
        actions.key_down(keys[0]).send_keys(*keys[1:]).key_up(keys[0]).perform()
    else:
        actions.send_keys(*keys).perform()
    time.sleep(.12)

def tasks():
    return '<p>note record</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>buoi1</p></li><li data-type="taskItem" data-checked="false"><p>buoi2</p></li><li data-type="taskItem" data-checked="false"><p>buoi3</p></li></ul>'

def mobile_view():
    # Headless desktop Chrome otherwise clamps its window to >=500 CSS pixels.
    d.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {'width':393, 'height':852, 'deviceScaleFactor':1, 'mobile':True})
    d.execute_cdp_cmd('Emulation.setTouchEmulationEnabled', {'enabled':True})

try:
    d.get('http://127.0.0.1:3107/scripts/qa/index.html')
    WebDriverWait(d, 20).until(lambda x: js("return !!document.querySelector('.ProseMirror')?.editor"))
    setup(tasks())
    caret('buoi2', 2)
    key(Keys.ENTER)
    s = state()
    check('enter_middle_preserves_surrounding_rows', [t['text'] for t in s['tasks']] == ['buoi1','bu','oi2','buoi3'] and s['tasks'][0]['checked']=='true', s)

    setup(tasks())
    caret('buoi2', 0)
    key(Keys.BACKSPACE)
    s = state()
    check('backspace_start_preserves_text_and_other_rows', 'buoi1' in s['text'] and 'buoi2' in s['text'] and 'buoi3' in s['text'], s)

    setup(tasks())
    caret('buoi2', 0)
    key(Keys.DELETE)
    s = state()
    check('delete_character_does_not_remove_checkbox', [t['text'] for t in s['tasks']]==['buoi1','uoi2','buoi3'], s)

    setup(tasks())
    caret('buoi2', 0)
    js("const e=document.querySelector('.ProseMirror').editor; e.commands.deleteRange({from:e.state.selection.from,to:e.state.selection.from+5});")
    key(Keys.BACKSPACE)
    s = state()
    check('remove_empty_row_preserves_neighbors', 'buoi1' in s['text'] and 'buoi3' in s['text'] and len(s['tasks'])==2, s)

    setup(tasks())
    caret('buoi2', 5)
    key(Keys.ENTER)
    key(Keys.ENTER)
    s = state()
    check('enter_empty_exits_list_without_losing_following_row', 'buoi3' in s['text'] and all(t['text'].strip() for t in s['tasks']), s)

    setup(tasks())
    time.sleep(.6)  # Separate fixture replacement from the user action's undo group.
    caret('buoi2', 2)
    key(Keys.ENTER)
    key(Keys.CONTROL, 'z')
    s = state()
    check('undo_restores_split_row_and_checked_state', [t['text'] for t in s['tasks']]==['buoi1','buoi2','buoi3'] and s['tasks'][0]['checked']=='true',s)

    setup(tasks())
    caret('buoi2', 0)
    key(Keys.TAB)
    nested=state()
    key(Keys.SHIFT, Keys.TAB)
    unnested=state()
    check('indent_outdent_preserve_rows', len(nested['tasks'])==3 and [t['text'] for t in unnested['tasks']]==['buoi1','buoi2','buoi3'],{'nested':nested,'unnested':unnested})

    setup(tasks())
    js("const e=document.querySelector('.ProseMirror').editor; let from,to; e.state.doc.descendants((n,p)=>{if(n.isText&&n.text==='buoi2')from=p+2;if(n.isText&&n.text==='buoi3')to=p+2;});e.commands.setTextSelection({from,to});e.commands.focus();")
    WebDriverWait(d,5).until(lambda x: js("return document.activeElement===document.querySelector('.ProseMirror')"))
    key(Keys.BACKSPACE)
    s=state()
    check('delete_across_rows_preserves_unselected_text', s['tasks'][0]['text']=='buoi1' and 'bu' in s['text'] and 'oi3' in s['text'],s)

    setup('<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>parent</p><ul><li><p>bullet child</p></li></ul></li></ul>')
    layout = js("const li=document.querySelector('li:not([data-checked])'); return {display:getComputedStyle(li).display,html:document.querySelector('.ProseMirror').innerHTML};")
    check('nested_bullet_keeps_list_item_layout', layout['display']=='list-item', layout)

    setup('<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>parent</p><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>child</p></li></ul></li></ul>')
    decoration = js("return [...document.querySelectorAll('ul[data-type=taskList] > li > div')].map(el=>getComputedStyle(el).textDecorationLine)")
    check('checked_parent_does_not_strike_whole_child_container', decoration[0]=='none', decoration)

    setup(tasks())
    caret('buoi2', 5)
    key(Keys.ENTER)
    key('new row')
    expected = state()['html']
    js("window.qa.switch('b')")
    time.sleep(.15)
    js("window.qa.switch('a')")
    time.sleep(.9)
    check('fast_switch_preserves_added_row', state()['html']==expected, {'expected':expected,'actual':state()['html'],'saves':js('return window.qa.saves')})

    js('window.qa.reload()')
    time.sleep(.25)
    check('reload_preserves_checklist', state()['html']==expected, state())
    d.find_elements('css selector','ul[data-type=taskList] > li > label input')[1].click()
    time.sleep(.7)
    checked=state()['html']
    js('window.qa.reload()')
    time.sleep(.2)
    check('checkbox_toggle_persists_after_edit_and_reload', state()['html']==checked and state()['tasks'][1]['checked']=='true',state())

    # Finish an older save while a newer draft is waiting for its debounce.
    js('window.qa.delay=300')
    caret('new row', 7)
    key(' x')
    time.sleep(.46)
    key(' y')
    time.sleep(.21)
    check('older_save_does_not_mark_new_draft_saved', 'Đã lưu' not in d.find_element('tag name','body').text)
    time.sleep(.7)
    js('window.qa.delay=0')
    mobile_view()
    setup(tasks())
    layout = js("const l=document.querySelector('ul[data-type=taskList] > li > label').getBoundingClientRect(); return {width:l.width,height:l.height,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth};")
    check('mobile_checkbox_target_and_no_overflow', layout['viewport']==393 and layout['width']>=44 and layout['height']>=44 and not layout['overflow'],layout)
    d.save_screenshot(str(output.with_suffix('.png')))

    # Whole App uses the real hooks against a deliberately isolated Firestore double.
    d.execute_cdp_cmd('Emulation.clearDeviceMetricsOverride', {})
    d.execute_cdp_cmd('Emulation.setTouchEmulationEnabled', {'enabled':False})
    d.set_window_size(1440, 1000)
    d.get('http://127.0.0.1:3107/scripts/qa/index.html?app')
    WebDriverWait(d, 10).until(lambda x: js('return !!window.firestoreQA'))
    js("localStorage.setItem('notepad-sync-key','qa-local-only');")
    d.refresh()
    WebDriverWait(d, 10).until(lambda x: len(d.find_elements('css selector','[aria-label="Tạo thư mục mới"]')) > 0)
    time.sleep(.25)

    def seed(count=3):
        return js("""
          const q=window.firestoreQA; q.records.clear(); q.fail=false; q.transactions=[];
          const bytes=new TextEncoder().encode('qa-local-only');
          return crypto.subtle.digest('SHA-256',bytes).then(hash=>{
            const root='sync_data/'+[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
            q.root=root;
            for(const id of ['folderA','folderB'])q.records.set(root+'/folders/'+id,{name:id,createdAt:q.stamp(),updatedAt:q.stamp()});
            for(let i=0;i<arguments[0];i++)q.records.set(root+'/notes/n'+i,{title:'note '+i,content:'<p>keep '+i+'</p>',folderId:'folderA',pinned:true,createdAt:q.stamp(),updatedAt:q.stamp(),lastOpenedAt:q.stamp()});
            q.emit(); return root;
          });
        """, count)

    def delete_click():
        d.find_element('css selector','[aria-label="Xóa thư mục folderA"]').click()
        WebDriverWait(d, 5).until(lambda x: d.find_elements('css selector','[role=alertdialog]'))
        time.sleep(.25)  # Wait for the 200 ms modal scale animation before measuring.

    def confirm():
        d.find_element('xpath',"//*[@role='alertdialog']//button[normalize-space(.)='Xóa']").click()
        time.sleep(.25)

    seed()
    delete_click()
    d.find_element('xpath',"//*[@role='alertdialog']//button[normalize-space(.)='Hủy']").click()
    check('folder_delete_cancel_changes_nothing', js("return window.firestoreQA.records.size===5 && window.firestoreQA.transactions.length===0"))
    delete_click()
    confirm()
    evidence=js("const q=window.firestoreQA;return {folderExists:q.records.has(q.root+'/folders/folderA'),notes:[...q.records].filter(([p])=>p.includes('/notes/')).map(([p,n])=>({id:p,folder:n.folderId,content:n.content,pinned:n.pinned})),writes:q.transactions};")
    check('folder_delete_preserves_notes_and_metadata', not evidence['folderExists'] and len(evidence['notes'])==3 and all(n['folder'] is None and n['pinned'] and n['content'].startswith('<p>keep') for n in evidence['notes']) and all(set(w.get('data') or {})<= {'folderId'} for t in evidence['writes'] for w in t), evidence)
    check('system_folders_have_no_delete_control', not d.find_elements('css selector','[aria-label="Xóa thư mục Tất cả ghi chú"],[aria-label="Xóa thư mục Gần đây"],[aria-label="Xóa thư mục Chưa phân loại"]'))

    seed(0)
    delete_click(); confirm()
    check('empty_folder_deletes', js("return !window.firestoreQA.records.has(window.firestoreQA.root+'/folders/folderA')"))

    seed(403)
    delete_click(); confirm()
    check('large_folder_uses_bounded_transactions', js("const q=window.firestoreQA;return !q.records.has(q.root+'/folders/folderA') && [...q.records].filter(([p,n])=>p.includes('/notes/')&&n.folderId===null).length===403 && q.transactions.every(t=>t.length<=200)"))

    seed()
    js('window.firestoreQA.fail=true')
    delete_click(); confirm()
    check('failed_move_keeps_folder_and_notes', js("const q=window.firestoreQA;return q.records.has(q.root+'/folders/folderA') && [...q.records].filter(([p,n])=>p.includes('/notes/')&&n.folderId==='folderA').length===3") and bool(d.find_elements('css selector','[role=alertdialog] [role=alert]')))
    d.find_element('xpath',"//*[@role='alertdialog']//button[normalize-space(.)='Hủy']").click()

    seed()
    js("window.firestoreQA.afterRead=()=>{const q=window.firestoreQA; const p=q.root+'/notes/n1';q.records.set(p,{...q.records.get(p),folderId:'folderB'});}")
    delete_click(); confirm()
    check('concurrent_move_to_other_folder_is_preserved', js("const q=window.firestoreQA;return q.records.get(q.root+'/notes/n1').folderId==='folderB' && !q.records.has(q.root+'/folders/folderA')"))

    seed()
    js("window.firestoreQA.afterRead=()=>{const q=window.firestoreQA;q.records.set(q.root+'/notes/late',{title:'late',content:'<p>late</p>',folderId:'folderA',updatedAt:q.stamp()});}")
    delete_click(); confirm()
    check('late_note_prevents_folder_delete_and_is_kept', js("const q=window.firestoreQA;return q.records.has(q.root+'/folders/folderA') && q.records.has(q.root+'/notes/late')"))
    d.find_element('xpath',"//*[@role='alertdialog']//button[normalize-space(.)='Hủy']").click()

    seed(1)
    delete_click(); confirm()
    js("const q=window.firestoreQA;q.records.set(q.root+'/notes/orphan',{title:'orphan',content:'<p>orphan</p>',folderId:'folderA',updatedAt:q.stamp()});q.emit();")
    time.sleep(.2)
    check('stale_folder_reference_visible_in_unfiled', 'orphan' in d.find_element('tag name','body').text)

    mobile_view()
    d.refresh()
    WebDriverWait(d,10).until(lambda x: d.find_elements('css selector','[aria-label="Tạo thư mục mới"]'))
    time.sleep(.25)
    seed()
    # Mobile must be at folder navigation before testing controls.
    for label in ['Quay lại danh sách ghi chú','Quay lại danh sách thư mục']:
        for button in d.find_elements('css selector',f'[aria-label="{label}"]'):
            if button.is_displayed(): button.click(); time.sleep(.2)
    WebDriverWait(d,5).until(lambda x: d.find_element('css selector','[aria-label="Xóa thư mục folderA"]').is_displayed())
    delete_click()
    mobile=js("return {viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('[role=alertdialog] button')].map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})),nested:document.querySelectorAll('button button').length}")
    check('mobile_folder_confirm_layout', mobile['viewport']==393 and not mobile['overflow'] and mobile['nested']==0 and all(b['width']>=44 and b['height']>=44 for b in mobile['buttons']),mobile)
    d.save_screenshot(str(output.with_name(output.stem+'-folder.png')))
finally:
    try:
        logs=d.get_log('browser')
    except Exception:
        logs=[]
    output.write_text(json.dumps({'results':results,'console':logs}, ensure_ascii=False, indent=2),encoding='utf-8')
    d.quit()
print(str(output), flush=True)
sys.exit(0 if results and all(r['pass'] for r in results) else 1)
