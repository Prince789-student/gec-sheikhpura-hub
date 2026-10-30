const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  // Accept all dialogs automatically
  page.on('dialog', async dialog => {
    console.log('Dialog popped up:', dialog.message());
    await dialog.accept();
  });

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

  // 1. Add Faculty
  const facultyAdd = await page.evaluate(async () => {
    window.openAddFacultyModal();
    document.getElementById('adminFacName').value = 'Er. Rakesh Ranjan';
    document.getElementById('adminFacDept').value = 'Computer Science & Engineering';
    document.getElementById('adminFacDesignation').value = 'Assistant Professor';
    document.getElementById('adminFacRoom').value = 'Lab 2';

    const form = document.getElementById('adminFacultyForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await new Promise(r => setTimeout(r, 100));
    const list = await window.DB.getFacultyMembers();
    return { count: list.length, item: list[0] };
  });
  console.log('Faculty Add Result:', facultyAdd);

  // 2. Add Facility
  const facilityAdd = await page.evaluate(async () => {
    window.openAddFacilityModal();
    document.getElementById('adminFacilName').value = 'Central Advanced Library';
    document.getElementById('adminFacilCategory').value = 'academic';
    document.getElementById('adminFacilRoom').value = 'Room 201';

    const form = document.getElementById('adminFacilityForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await new Promise(r => setTimeout(r, 100));
    const list = await window.DB.getCampusFacilities();
    return { count: list.length, item: list[0] };
  });
  console.log('Facility Add Result:', facilityAdd);

  // 3. Add Mess Service
  const messAdd = await page.evaluate(async () => {
    window.openFoodMessModal();
    document.getElementById('foodMessName').value = 'Annapurna Student Mess';
    document.getElementById('foodMessType').value = 'Sit-in Mess & Takeaway';
    document.getElementById('foodMessDiet').value = 'Pure Veg';

    const form = document.getElementById('foodMessForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await new Promise(r => setTimeout(r, 100));
    const list = getActiveFoodMessList();
    return { count: list.length, item: list[0] };
  });
  console.log('Mess Add Result:', messAdd);

  // 4. Verify public food-tiffin page displays the new mess service!
  await page.goto('http://localhost:3000/food-tiffin.html', { waitUntil: 'networkidle0' });
  const publicFood = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#foodGrid h3, #foodGrid .title, #foodGrid strong')).map(el => el.innerText.trim()).filter(Boolean);
    const badge = document.getElementById('foodCountBadge')?.innerText;
    return { badge, cards };
  });
  console.log('Public Food Page Live Content:', publicFood);

  await browser.close();
})();

