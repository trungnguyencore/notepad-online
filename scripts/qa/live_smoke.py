"""Live smoke for the actual app/Firebase using a unique disposable Sync Key.

Usage: python scripts/qa/live_smoke.py URL REPORT.json
Only the generated workspace is read/written/cleaned. No user Sync Key is used.
"""
import hashlib
import json
import os
from pathlib import Path
import sys
import time
import uuid
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait

sys.stdout.reconfigure(encoding='utf-8')
url, report_name = sys.argv[1:3]
report_path = Path(report_name)
report_path.parent.mkdir(parents=True, exist_ok=True)
key = 'codex-smoke-' + uuid.uuid4().hex
root = hashlib.sha256(key.encode()).hexdigest()
base = f'https://firestore.googleapis.com/v1/projects/notepad-app-6845e/databases/(default)/documents/sync_data/{root}'
http = requests.Session()
results = []

def read(kind):
    response = http.get(f'{base}/{kind}', timeout=20)
    response.raise_for_status()
    return response.json().get('documents', [])

def until(fn, seconds=25):
    deadline = time.monotonic()+seconds
    while time.monotonic()<deadline:
        value=fn()
        if value:
            return value
        time.sleep(.25)
    raise AssertionError('condition timed out')

def record(name, condition, evidence=None):
    results.append({'name':name,'pass':bool(condition),'evidence':evidence})
    print(name, 'PASS' if condition else 'FAIL', flush=True)
    assert condition, name

options = webdriver.ChromeOptions()
options.add_argument('--headless=new')
options.add_argument('--window-size=1440,1000')
options.set_capability('goog:loggingPrefs', {'browser':'ALL'})
service=Service(os.environ['DRIVER'], service_args=['--disable-build-check'] if os.environ.get('ALLOW_DRIVER_MISMATCH') else []) if os.environ.get('DRIVER') else Service()
d = webdriver.Chrome(service=service,options=options)
d.set_page_load_timeout(30)

def js(code,*args): return d.execute_script(code,*args)
def css(selector): return d.find_element('css selector',selector)
def click(selector):
    WebDriverWait(d,15).until(lambda x: css(selector) if css(selector).is_displayed() and css(selector).is_enabled() else False).click()

def editor():
    return WebDriverWait(d,15).until(lambda x: js("return !!document.querySelector('.ProseMirror')?.editor"))

def task_state():
    return js("return [...document.querySelectorAll('ul[data-type=taskList] > li')].map(li=>({checked:li.dataset.checked,text:li.querySelector(':scope > div').textContent}))")

def caret(text,offset):
    js("const e=document.querySelector('.ProseMirror').editor;let pos;e.state.doc.descendants((n,p)=>{if(n.isText&&n.text===arguments[0])pos=p+arguments[1]});if(pos===undefined)throw Error('missing text');e.commands.setTextSelection(pos);e.commands.focus();",text,offset)
    WebDriverWait(d,5).until(lambda x: js("return document.activeElement===document.querySelector('.ProseMirror')"))
    time.sleep(.05)

def keys(*values):
    ActionChains(d).send_keys(*values).perform()
    time.sleep(.12)

def delete_folder(name):
    click(f'[aria-label="Xóa thư mục {name}"]')
    time.sleep(.25)
    d.find_element('xpath',"//*[@role='alertdialog']//button[normalize-space(.)='Xóa']").click()
    WebDriverWait(d,25).until(lambda x: not d.find_elements('css selector','[role=alertdialog]'))

def open_unfiled():
    d.find_element('xpath',"//aside//button[.//span[text()='Chưa phân loại']]").click()
    click('.note-card > button')
    editor()

error=None
cleanup=None
try:
    d.get(url)
    WebDriverWait(d,20).until(lambda x:'Sync Key' in x.find_element('tag name','body').text)
    js("localStorage.setItem('notepad-sync-key',arguments[0]);",key)
    d.refresh()
    until(lambda:'Đang đồng bộ' not in d.find_element('tag name','body').text)
    record('isolated_workspace_starts_empty', not read('notes') and not read('folders'), {'root':root})
    click('[aria-label="Tạo thư mục mới"]')
    css('[role=dialog] input').send_keys('QA-folder')
    css('[role=dialog] button[type=submit]').click()
    until(lambda:len(read('folders'))==1)
    WebDriverWait(d,15).until(lambda x:not d.find_elements('css selector','[role=dialog]'))
    click('[aria-label="Tạo ghi chú mới"]')
    editor()
    content='<p>QA deploy checklist</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>buoi1</p></li><li data-type="taskItem" data-checked="false"><p>buoi2</p></li></ul>'
    js("document.querySelector('.ProseMirror').editor.commands.setContent(arguments[0],true)", content)
    until(lambda:len(read('notes'))==1 and 'buoi2' in read('notes')[0]['fields']['content']['stringValue'])
    caret('buoi2',5); keys(Keys.ENTER); keys('buoi3'); keys(Keys.ENTER); keys(Keys.BACKSPACE)
    state=task_state()
    record('add_and_remove_empty_task_preserves_rows',[t['text'] for t in state]==['buoi1','buoi2','buoi3'],state)
    css('ul[data-type=taskList] > li:nth-child(2) input').click()
    until(lambda: read('notes')[0]['fields']['content']['stringValue'].count('data-checked="true"')==2)
    click('[aria-label^="Ghim "]')
    until(lambda:read('notes')[0]['fields'].get('pinned',{}).get('booleanValue'))
    before=read('notes')[0]['fields']
    record('checklist_saved_to_real_firestore',before['content']['stringValue'].count('data-checked="true"')==2 and 'buoi3' in before['content']['stringValue'])
    click('[aria-label="Xóa thư mục QA-folder"]')
    time.sleep(.25)
    d.find_element('xpath',"//*[@role='alertdialog']//button[normalize-space(.)='Hủy']").click()
    record('cancel_keeps_live_folder',len(read('folders'))==1)
    delete_folder('QA-folder')
    until(lambda: not read('folders') and 'nullValue' in read('notes')[0]['fields']['folderId'])
    after=read('notes')[0]['fields']
    record('delete_folder_keeps_all_note_fields_except_folderId',{k:v for k,v in before.items() if k!='folderId'}=={k:v for k,v in after.items() if k!='folderId'}, {'before':before,'after':after})
    d.refresh(); editor()
    state=task_state()
    record('desktop_reload_preserves_checked_states',[t['checked'] for t in state]==['true','true','false'],state)
    d.execute_cdp_cmd('Emulation.setDeviceMetricsOverride',{'width':393,'height':852,'deviceScaleFactor':1,'mobile':True})
    d.execute_cdp_cmd('Emulation.setTouchEmulationEnabled',{'enabled':True})
    d.refresh()
    WebDriverWait(d,20).until(lambda x: not d.find_elements('css selector','[aria-label="Xóa thư mục QA-folder"]') and 'Đang đồng bộ' not in d.find_element('tag name','body').text)
    open_unfiled()
    layout=js("const r=document.querySelector('ul[data-type=taskList] > li > label').getBoundingClientRect();return {viewport:innerWidth,height:innerHeight,width:r.width,targetHeight:r.height,overflow:document.documentElement.scrollWidth>innerWidth,nested:document.querySelectorAll('button button').length}")
    record('production_mobile_layout',layout['viewport']==393 and layout['height']==852 and layout['width']>=44 and layout['targetHeight']>=44 and not layout['overflow'] and not layout['nested'],layout)
    css('ul[data-type=taskList] > li:nth-child(3) input').click()
    until(lambda:read('notes')[0]['fields']['content']['stringValue'].count('data-checked="true"')==3)
    d.refresh(); open_unfiled()
    record('mobile_checkbox_persists_cold_reload',[t['checked'] for t in task_state()]==['true']*3,task_state())
    d.save_screenshot(str(report_path.with_suffix('.png')))
    click('[aria-label="Quay lại danh sách ghi chú"]')
    click('[aria-label="Quay lại danh sách thư mục"]')
    click('[aria-label="Tạo thư mục mới"]')
    css('[role=dialog] input').send_keys('QA-mobile-empty')
    css('[role=dialog] button[type=submit]').click()
    until(lambda:len(read('folders'))==1)
    WebDriverWait(d,15).until(lambda x:not d.find_elements('css selector','[role=dialog]'))
    click('[aria-label="Quay lại danh sách thư mục"]')
    delete_folder('QA-mobile-empty')
    record('mobile_empty_folder_delete',not read('folders') and len(read('notes'))==1)
    # Delete only this test note through the actual UI.
    click('[aria-label^="Xóa QA deploy checklist"]')
    time.sleep(.25)
    d.find_element('xpath',"//*[@role='alertdialog']//button[normalize-space(.)='Xóa']").click()
    until(lambda:not read('notes'))
    record('ui_test_note_cleanup',not read('notes') and not read('folders'))
except Exception as exc:
    error=f'{type(exc).__name__}: {exc}'
    print(error,flush=True)
    d.save_screenshot(str(report_path.with_name(report_path.stem+'-failure.png')))
finally:
    # All cleanup is bounded to the random workspace generated above.
    assert key.startswith('codex-smoke-') and hashlib.sha256(key.encode()).hexdigest()==root
    for kind in ['notes','folders']:
        for item in read(kind):
            assert item['name'].startswith(f'projects/notepad-app-6845e/databases/(default)/documents/sync_data/{root}/{kind}/')
            response=http.delete('https://firestore.googleapis.com/v1/'+item['name'],timeout=20)
            response.raise_for_status()
    cleanup={'notes':len(read('notes')),'folders':len(read('folders'))}
    logs=d.get_log('browser')
    capabilities={'browser':d.capabilities.get('browserVersion'),'driver':d.capabilities.get('chrome',{}).get('chromedriverVersion')}
    scripts=js("return [...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src'))")
    report_path.write_text(json.dumps({'url':url,'root':root,'results':results,'error':error,'cleanup':cleanup,'console':logs,'capabilities':capabilities,'scripts':scripts},ensure_ascii=False,indent=2),encoding='utf-8')
    d.quit()
print('cleanup',cleanup,flush=True)
sys.exit(1 if error or not results or not all(r['pass'] for r in results) else 0)
