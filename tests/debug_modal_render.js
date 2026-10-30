const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });

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

  // Click "+ Add Faculty Member"
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Faculty Member'));
    btn.click();
  });

  const modalMetrics = await page.evaluate(() => {
    const m = document.getElementById('adminFacultyModal');
    const dialog = m.querySelector('.modal-dialog');
    const rect = m.getBoundingClientRect();
    const dRect = dialog ? dialog.getBoundingClientRect() : null;
    const computed = window.getComputedStyle(m);
    const dComputed = dialog ? window.getComputedStyle(dialog) : null;

    return {
      modalRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      dialogRect: dRect ? { top: dRect.top, left: dRect.left, width: dRect.width, height: dRect.height } : null,
      modalStyles: {
        position: computed.position,
        zIndex: computed.zIndex,
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        background: computed.backgroundColor
      },
      dialogStyles: dComputed ? {
        display: dComputed.display,
        visibility: dComputed.visibility,
        opacity: dComputed.opacity,
        background: dComputed.backgroundColor,
        width: dComputed.width,
        height: dComputed.height
      } : null
    };
  });

  console.log('Modal metrics after click:', JSON.stringify(modalMetrics, null, 2));

  await browser.close();
})();

