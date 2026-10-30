const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });

  // Login
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

  // Navigate to facultyManagerTab
  await page.evaluate(() => {
    const tabBtn = document.querySelector('.tool-nav-btn[data-admin-tab="facultyManagerTab"]');
    if (tabBtn) tabBtn.click();
  });

  // Check all modal-overlay elements on initial load
  const initialModals = await page.evaluate(() => {
    const overlays = Array.from(document.querySelectorAll('.modal-overlay'));
    return overlays.map(m => ({
      id: m.id,
      className: m.className,
      display: window.getComputedStyle(m).display,
      visibility: window.getComputedStyle(m).visibility,
      opacity: window.getComputedStyle(m).opacity
    })).filter(m => m.display !== 'none' && m.opacity !== '0');
  });

  console.log('Visible modals on initial load:', initialModals);

  await browser.close();
})();

