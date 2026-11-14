"""Run the project's isolated browser regression in a disposable headless profile."""
import json
from pathlib import Path
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait

sys.stdout.reconfigure(encoding='utf-8')
out = Path('docs/qa/2026-11-13')
mode = sys.argv[1] if len(sys.argv)>1 else 'desktop'
cache = Path.home()/'.cache/selenium/chromedriver/win64'
drivers = sorted(cache.glob('*/chromedriver.exe'), key=lambda p: tuple(map(int,p.parent.name.split('.'))))
options = webdriver.ChromeOptions()
options.add_argument('--headless=new')
options.add_argument('--window-size=1440,1000')
options.set_capability('goog:loggingPrefs', {'browser':'ALL'})
driver = webdriver.Chrome(service=Service(str(drivers[-1])),options=options)
try:
    if mode == 'mobile':
        driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride',{'width':393,'height':852,'deviceScaleFactor':1,'mobile':True})
        driver.execute_cdp_cmd('Emulation.setTouchEmulationEnabled',{'enabled':True})
    suffix = '?mobile' if mode == 'mobile' else ''
    driver.get('http://127.0.0.1:3113/scripts/qa/audit-regression.html'+suffix)
    WebDriverWait(driver,50).until(lambda d: d.title.startswith('QA '))
    report = json.loads(driver.find_element('id','results').text)
    driver.save_screenshot(str(out/f'regression-{mode}.png'))
    logs = driver.get_log('browser')
    (out/f'regression-{mode}-console.json').write_text(json.dumps(logs,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'title':driver.title,'browser':driver.capabilities['browserVersion'],'passed':report['passed'],'total':report['total'],'failures':[r for r in report['results'] if not r['pass']]},ensure_ascii=False,indent=2))
    if report['passed'] != report['total']:
        sys.exit(1)
finally:
    driver.quit()
