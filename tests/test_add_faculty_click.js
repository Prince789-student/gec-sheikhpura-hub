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

  // Now click "+ Add Faculty Member" button like a real user
  const result = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Faculty Member'));
    if (!btn) return { error: 'button not found' };

    const modalBefore = document.getElementById('adminFacultyModal');
    const styleBefore = window.getComputedStyle(modalBefore);

    // Click it
    btn.click();

    const styleAfter = window.getComputedStyle(modalBefore);

    return {
      btnExists: true,
      modalDisplayBefore: styleBefore.display,
      modalVisibilityBefore: styleBefore.visibility,
      modalOpacityBefore: styleBefore.opacity,
      modalClassesBefore: modalBefore.className,
      modalDisplayAfter: styleAfter.display,
      modalVisibilityAfter: styleAfter.visibility,
      modalOpacityAfter: styleAfter.opacity,
      modalClassesAfter: modalBefore.className,
      zIndexAfter: styleAfter.zIndex
    };
  });

  console.log('Click test result:', result);

  await browser.close();
})();

