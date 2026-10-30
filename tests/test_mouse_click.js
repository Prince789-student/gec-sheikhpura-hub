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

  // Check what element is at the center of the "+ Add Faculty Member" button
  const hitTest = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Faculty Member'));
    if (!btn) return { error: 'button not found' };

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const elAtPoint = document.elementFromPoint(x, y);

    return {
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      btnText: btn.textContent.trim(),
      btnDisabled: btn.disabled,
      btnPointerEvents: window.getComputedStyle(btn).pointerEvents,
      elementFromPoint: elAtPoint ? {
        tagName: elAtPoint.tagName,
        id: elAtPoint.id,
        className: elAtPoint.className,
        outerHTML: elAtPoint.outerHTML.slice(0, 150)
      } : null,
      isButtonDirectlyHit: elAtPoint === btn
    };
  });

  console.log('Hit test for + Add Faculty Member button:', hitTest);

  // Now use Puppeteer's real native mouse click at the coordinates
  const btn = await page.waitForSelector('button::-p-text(Add Faculty Member)');
  await btn.click();

  const modalAfterClick = await page.evaluate(() => {
    const m = document.getElementById('adminFacultyModal');
    return {
      display: window.getComputedStyle(m).display,
      visibility: window.getComputedStyle(m).visibility,
      opacity: window.getComputedStyle(m).opacity,
      className: m.className
    };
  });
  console.log('Modal status after native user mouse click:', modalAfterClick);

  await browser.close();
})();

