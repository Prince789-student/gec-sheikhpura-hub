const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

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

  const inspectTabClick = await page.evaluate(() => {
    const btn = document.querySelector('.tool-nav-btn[data-admin-tab="reviewsTab"]');
    const panel = document.getElementById('reviewsTab');
    
    // Check classes and style before click
    const beforeBtnClasses = btn ? btn.className : 'no btn';
    const beforePanelDisplay = panel ? panel.style.display : 'no panel';

    // Click it
    if (btn) btn.click();

    const afterBtnClasses = btn ? btn.className : 'no btn';
    const afterPanelDisplay = panel ? panel.style.display : 'no panel';

    return {
      beforeBtnClasses,
      beforePanelDisplay,
      afterBtnClasses,
      afterPanelDisplay
    };
  });

  console.log('Inspect Tab Click on reviewsTab:', inspectTabClick);

  await browser.close();
})();

