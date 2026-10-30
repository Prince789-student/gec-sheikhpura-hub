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

  const hierarchy = await page.evaluate(() => {
    const m = document.getElementById('adminFacultyModal');
    const parents = [];
    let p = m.parentElement;
    while (p) {
      parents.push({
        tagName: p.tagName,
        id: p.id,
        className: p.className,
        display: window.getComputedStyle(p).display,
        width: p.offsetWidth,
        height: p.offsetHeight
      });
      p = p.parentElement;
    }
    return parents;
  });

  console.log('Hierarchy of adminFacultyModal parents:', hierarchy);

  await browser.close();
})();

