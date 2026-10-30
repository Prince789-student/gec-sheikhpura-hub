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

  // Check window.openAddFacultyModal in global scope
  const checkGlobal = await page.evaluate(() => {
    return {
      typeofOpenAddFaculty: typeof window.openAddFacultyModal,
      typeofCloseAdminFaculty: typeof window.closeAdminFacultyModal,
      typeofHandleAdminFaculty: typeof window.handleAdminFacultySubmit,
      buttonOnclick: document.querySelector('button[onclick*="openAddFacultyModal"]')?.getAttribute('onclick')
    };
  });
  console.log('Global function check in page:', checkGlobal);

  await browser.close();
})();

