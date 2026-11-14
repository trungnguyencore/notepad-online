"""Real-Firestore sync smoke, restricted to generated disposable workspaces."""
import hashlib,json,os,sys,time,uuid
from pathlib import Path
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
sys.stdout.reconfigure(encoding='utf-8')
url,output=sys.argv[1:3]
output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
key='codex-sync-smoke-'+uuid.uuid4().hex
keys=[key,key+'-B']
roots=[hashlib.sha256(k.encode()).hexdigest() for k in keys]
base='https://firestore.googleapis.com/v1/projects/notepad-app-6845e/databases/(default)/documents/sync_data/'
http=requests.Session();results=[];cleanup={};error=None
cache=Path.home()/'.cache/selenium/chromedriver/win64'
drivers=sorted(cache.glob('*/chromedriver.exe'),key=lambda p:tuple(map(int,p.parent.name.split('.'))))
options=webdriver.ChromeOptions();options.add_argument('--headless=new');options.add_argument('--window-size=1440,1000')
options.set_capability('goog:loggingPrefs',{'browser':'ALL'})
d=webdriver.Chrome(service=Service(str(drivers[-1])),options=options);w=WebDriverWait(d,30)
def js(code,*args):return d.execute_script(code,*args)
def body():return d.find_element(By.TAG_NAME,'body').text
def read(root,kind='notes'):
 r=http.get(f'{base}{root}/{kind}',timeout=20);r.raise_for_status();return r.json().get('documents',[])
def until(fn,seconds=30):
 end=time.monotonic()+seconds
 while time.monotonic()<end:
  v=fn()
  if v:return v
  time.sleep(.2)
 raise AssertionError('condition timed out')
def record(name,ok,evidence=None):
 results.append({'name':name,'pass':bool(ok),'evidence':evidence});print(name,'PASS' if ok else 'FAIL',flush=True)
 assert ok,name
def click(selector):w.until(lambda _:d.find_element(By.CSS_SELECTOR,selector).is_displayed());d.find_element(By.CSS_SELECTOR,selector).click()
def ready():w.until(lambda _:js("return !!document.querySelector('.ProseMirror')?.editor"))
def content(text):js("document.querySelector('.ProseMirror').editor.commands.setContent('<p>'+arguments[0]+'</p>',true)",text)
def field(name):
 docs=read(roots[0]);return docs[0]['fields'].get(name) if docs else None
def wait_title(title):until(lambda:field('title')=={'stringValue':title})
def editor_text(text):w.until(lambda _:d.find_element(By.CSS_SELECTOR,'.ProseMirror').text==text)
try:
 d.get(url);w.until(lambda _:'Sync Key' in body());js("localStorage.setItem('notepad-sync-key',arguments[0])",key);d.refresh()
 w.until(lambda _:'Đang đồng bộ' not in body())
 record('both_workspaces_start_empty',not read(roots[0]) and not read(roots[1]))
 click('[aria-label="Tạo ghi chú mới"]');ready();content('QA Sync original');wait_title('QA Sync original')
 record('transaction_save_persists_real_firestore',field('content')=={'stringValue':'<p>QA Sync original</p>'})
 first=d.current_window_handle;d.switch_to.new_window('tab');second=d.current_window_handle;d.get(url);ready();editor_text('QA Sync original')
 content('Remote clean');wait_title('Remote clean');stamp=field('updatedAt')
 d.switch_to.window(first);editor_text('Remote clean');time.sleep(.7)
 record('real_two_tab_clean_remote_adoption',field('title')=={'stringValue':'Remote clean'})
 record('clean_remote_update_does_not_write_back',field('updatedAt')==stamp)
 # Hold only the app debounce while a real external write arrives. No Firebase
 # mocks are used, and optimistic transaction validation remains enabled.
 js("window.qaNativeTimeout=window.setTimeout;window.setTimeout=(fn,ms,...args)=>window.qaNativeTimeout(fn,ms===450?3000:ms,...args)")
 content('Local pending')
 doc=read(roots[0])[0]
 response=http.patch('https://firestore.googleapis.com/v1/'+doc['name']+'?updateMask.fieldPaths=title&updateMask.fieldPaths=content',json={'fields':{'title':{'stringValue':'Remote conflict'},'content':{'stringValue':'<p>Remote conflict</p>'}}},timeout=20);response.raise_for_status()
 w.until(lambda _:'Bản nháp của bạn được giữ lại' in body());editor_text('Local pending')
 js('window.setTimeout=window.qaNativeTimeout')
 record('real_remote_conflict_keeps_local_draft',field('title')=={'stringValue':'Remote conflict'})
 d.save_screenshot(str(output.with_name(output.stem+'-conflict.png')))
 d.refresh();ready();w.until(lambda _:'Bản nháp của bạn được giữ lại' in body());editor_text('Local pending')
 record('conflict_draft_survives_reload_real_backend',True)
 next(button for button in d.find_elements(By.TAG_NAME,'button') if button.text=='Giữ bản của tôi').click();wait_title('Local pending');w.until(lambda _:'Đã lưu' in body())
 record('explicit_keep_local_transaction_succeeds',not js("return Object.keys(sessionStorage).some(k=>k.startsWith('notepad-draft:'))"))
 d.switch_to.window(second);editor_text('Local pending')
 record('second_tab_receives_confirmed_save',True)
 d.close();d.switch_to.window(first)
 # New title is kept in the original workspace when switching Sync Key.
 click('header button');keybox=d.find_element(By.CSS_SELECTOR,'input[type=password]');keybox.send_keys(Keys.CONTROL,'a');keybox.send_keys(keys[1]);
 content('Flush original workspace');keybox.send_keys(Keys.ENTER)
 w.until(lambda _:'Chưa có ghi chú nào' in body());wait_title('Flush original workspace')
 record('key_switch_preserves_original_workspace_save',not read(roots[1]))
 d.save_screenshot(str(output.with_suffix('.png')))
except Exception as exc:
 error=f'{type(exc).__name__}: {exc}';print(error,flush=True);d.save_screenshot(str(output.with_name(output.stem+'-failure.png')))
finally:
 for k,root in zip(keys,roots):
  assert k.startswith('codex-sync-smoke-') and hashlib.sha256(k.encode()).hexdigest()==root
  for kind in ['notes','folders']:
   for doc in read(root,kind):
    assert doc['name'].startswith(f'projects/notepad-app-6845e/databases/(default)/documents/sync_data/{root}/{kind}/')
    response=http.delete('https://firestore.googleapis.com/v1/'+doc['name'],timeout=20);response.raise_for_status()
   cleanup[root+'/'+kind]=len(read(root,kind))
 report={'url':url,'environment':'actual production bundle + Firebase SDK + real Firestore; disposable workspaces only','results':results,'error':error,'cleanup':cleanup,'console':d.get_log('browser'),'browser':d.capabilities['browserVersion'],'scripts':js("return [...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src'))")}
 output.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');d.quit()
 print(json.dumps({'passed':sum(r['pass'] for r in results),'total':len(results),'error':error,'cleanup':cleanup},ensure_ascii=False),flush=True)
sys.exit(1 if error or not results or not all(r['pass'] for r in results) or any(cleanup.values()) else 0)
