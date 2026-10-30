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

  // Test adding Faculty Member
  const addFacultyResult = await page.evaluate(async () => {
    window.openAddFacultyModal();
    document.getElementById('adminFacName').value = 'Test Prof Sharma';
    document.getElementById('adminFacDept').value = 'Civil Engineering';
    document.getElementById('adminFacDesignation').value = 'Assistant Professor';
    document.getElementById('adminFacRoom').value = 'Room 205';

    const fakeEvent = { preventDefault: () => {} };
    await window.handleAdminFacultySubmit(fakeEvent);

    const list = await window.DB.getFacultyMembers();
    return {
      success: list.some(f => f.name === 'Test Prof Sharma'),
      count: list.length
    };
  });
  console.log('Add Faculty Result:', addFacultyResult);

  // Test adding Campus Facility
  const addFacilityResult = await page.evaluate(async () => {
    window.openAddFacilityModal();
    document.getElementById('adminFacilName').value = 'New IoT Lab';
    document.getElementById('adminFacilCategory').value = 'academic';
    document.getElementById('adminFacilRoom').value = 'Room 301';

    const fakeEvent = { preventDefault: () => {} };
    await window.handleAdminFacilitySubmit(fakeEvent);

    const list = await window.DB.getCampusFacilities();
    return {
      success: list.some(f => f.name === 'New IoT Lab'),
      count: list.length
    };
  });
  console.log('Add Facility Result:', addFacilityResult);

  await browser.close();
})();

