const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', req => console.log('FAILED REQ:', req.url(), req.failure()?.errorText));

  console.log('Navigating to http://localhost:3000/community.html?tab=clubs ...');
  await page.goto('http://localhost:3000/community.html?tab=clubs', { waitUntil: 'networkidle2' });

  // Check stylesheet loads
  const styleInfo = await page.evaluate(() => {
    return Array.from(document.styleSheets).map(s => {
      try {
        return { href: s.href, rulesCount: s.cssRules ? s.cssRules.length : 0 };
      } catch (e) {
        return { href: s.href, error: e.message };
      }
    });
  });
  console.log('StyleSheets loaded:', JSON.stringify(styleInfo, null, 2));

  // Check tab states and visibility
  const state = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.tool-nav-btn')).map(b => ({
      text: b.textContent.trim(),
      active: b.classList.contains('active'),
      tabId: b.getAttribute('data-community-tab'),
      classes: b.className
    }));
    const panels = Array.from(document.querySelectorAll('.community-tab-panel')).map(p => ({
      id: p.id,
      display: window.getComputedStyle(p).display,
      htmlLength: p.innerHTML.length
    }));
    const notifWrapper = document.getElementById('headerNotifBellWrapper');
    const notifDropdown = document.getElementById('headerNotifDropdown');
    return {
      tabs,
      panels,
      hasNotifWrapper: !!notifWrapper,
      notifDropdownDisplay: notifDropdown ? window.getComputedStyle(notifDropdown).display : null,
      notifDropdownOpen: notifDropdown ? notifDropdown.classList.contains('open') : false
    };
  });
  console.log('Page State:', JSON.stringify(state, null, 2));

  await page.screenshot({ path: 'beu all unofficaial college/gec sheikhpura/tests/diagnose_community.png', fullPage: true });
  console.log('Saved screenshot to diagnose_community.png');

  await browser.close();
})();
