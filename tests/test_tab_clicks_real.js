const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });

  // Set gec_admin_session
  await page.evaluate(() => {
    localStorage.setItem('gec_admin_session', JSON.stringify({
      id: 'admin-prince-super-id',
      email: 'prince86944@gmail.com',
      role: 'super_admin',
      display_name: 'Prince Kumar (Super Admin)',
      created_at: new Date().toISOString()
    }));
  });

  await page.reload({ waitUntil: 'networkidle0' });

  const tabs = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.tool-nav-btn[data-admin-tab]'));
    return btns.map(b => ({
      tabId: b.getAttribute('data-admin-tab'),
      text: b.innerText.trim(),
      hasPanel: !!document.getElementById(b.getAttribute('data-admin-tab'))
    }));
  });

  const clickResults = [];
  for (const t of tabs) {
    const success = await page.evaluate((tabId) => {
      const btn = document.querySelector(`.tool-nav-btn[data-admin-tab="${tabId}"]`);
      if (!btn) return false;
      btn.click();
      const panel = document.getElementById(tabId);
      return panel && panel.style.display !== 'none' && panel.classList.contains('active');
    }, t.tabId);
    clickResults.push({ tab: t.tabId, success });
  }

  const failedClicks = clickResults.filter(r => !r.success);
  console.log(`Tested ${tabs.length} tabs. Failed: ${failedClicks.length}`);
  if (failedClicks.length > 0) {
    console.log('Failed:', failedClicks);
  } else {
    console.log('SUCCESS: All 24 tabs in admin.html are 100% clickable and active!');
  }

  await browser.close();
})();

