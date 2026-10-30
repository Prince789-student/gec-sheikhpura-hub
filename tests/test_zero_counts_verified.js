const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });

  // Clear local storage and login as admin
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('gec_admin_session', JSON.stringify({
      id: 'admin-prince-super-id',
      email: 'prince86944@gmail.com',
      role: 'super_admin',
      display_name: 'Prince Kumar (Super Admin)',
      created_at: new Date().toISOString()
    }));
  });

  await page.reload({ waitUntil: 'networkidle0' });

  // Check counts
  const counts = await page.evaluate(async () => {
    const fac = await window.DB.getFacultyMembers();
    const facil = await window.DB.getCampusFacilities();
    const mess = typeof getActiveFoodMessList === 'function' ? getActiveFoodMessList() : [];
    
    const facBadge = document.getElementById('tabFacultyCount')?.innerText;
    const facilBadge = document.getElementById('tabFacilityCount')?.innerText;
    const messBadge = document.getElementById('tabFoodMessCount')?.innerText;

    return {
      facultyListCount: fac.length,
      facilityListCount: facil.length,
      messListCount: mess.length,
      facBadge,
      facilBadge,
      messBadge
    };
  });

  console.log('--- ADMIN COUNTS AFTER COMPLETE ZEROING ---');
  console.log(JSON.stringify(counts, null, 2));

  await browser.close();
})();

