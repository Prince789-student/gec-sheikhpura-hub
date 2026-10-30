const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  // Test admin dashboard tabs clickability
  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    localStorage.setItem('gec_admin_auth', JSON.stringify({
      id: 'admin-prince-super-id',
      email: 'prince86944@gmail.com',
      role: 'super_admin',
      display_name: 'Prince Kumar (Super Admin)',
      created_at: new Date().toISOString()
    }));
  });

  await page.reload({ waitUntil: 'networkidle0' });

  // Test clicking every tab button
  const tabs = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.tool-nav-btn[data-admin-tab]'));
    return btns.map(b => ({
      tabId: b.getAttribute('data-admin-tab'),
      text: b.innerText.trim(),
      hasPanel: !!document.getElementById(b.getAttribute('data-admin-tab'))
    }));
  });

  console.log(`Found ${tabs.length} admin tabs:`);
  let missingPanels = [];
  for (const t of tabs) {
    if (!t.hasPanel) {
      missingPanels.push(t);
    }
  }
  console.log('Tabs with missing panels:', missingPanels);

  // Check which tabs don't change content or fail on click
  const clickResults = [];
  for (const t of tabs) {
    const success = await page.evaluate((tabId) => {
      const btn = document.querySelector(`.tool-nav-btn[data-admin-tab="${tabId}"]`);
      if (!btn) return false;
      btn.click();
      const panel = document.getElementById(tabId);
      return panel && panel.style.display !== 'none';
    }, t.tabId);
    clickResults.push({ tab: t.tabId, success });
  }

  const failedClicks = clickResults.filter(r => !r.success);
  console.log('Failed clicks count:', failedClicks.length);
  if (failedClicks.length > 0) {
    console.log('Failed clicks:', failedClicks);
  } else {
    console.log('All tab buttons clicked and successfully opened their panels!');
  }

  await browser.close();
})();

