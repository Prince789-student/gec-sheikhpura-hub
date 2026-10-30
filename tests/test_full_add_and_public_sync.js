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

  // 1. Check initial faculty and facility counts
  const initialCounts = await page.evaluate(async () => {
    const fac = await window.DB.getFacultyMembers();
    const facil = await window.DB.getCampusFacilities();
    const mess = typeof getActiveFoodMessList === 'function' ? getActiveFoodMessList() : [];
    return {
      faculty: fac.length,
      facility: facil.length,
      mess: mess.length
    };
  });
  console.log('Initial counts on empty local storage:', initialCounts);

  // 2. Add Faculty
  const facultyAddResult = await page.evaluate(async () => {
    window.openAddFacultyModal();
    document.getElementById('adminFacName').value = 'Er. Amit Verma';
    document.getElementById('adminFacDept').value = 'Computer Science & Engineering';
    document.getElementById('adminFacDesignation').value = 'Assistant Professor';
    document.getElementById('adminFacRoom').value = 'Room 102';

    // Submit
    const form = document.getElementById('adminFacultyForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    // Wait a brief moment
    await new Promise(r => setTimeout(r, 200));

    const fac = await window.DB.getFacultyMembers();
    return {
      total: fac.length,
      added: fac.find(f => f.name === 'Er. Amit Verma')
    };
  });
  console.log('Faculty Add Result:', facultyAddResult);

  // 3. Add Campus Facility
  const facilityAddResult = await page.evaluate(async () => {
    window.openAddFacilityModal();
    document.getElementById('adminFacilName').value = 'Smart Computing Center';
    document.getElementById('adminFacilCategory').value = 'academic';
    document.getElementById('adminFacilRoom').value = 'Lab 204';

    const form = document.getElementById('adminFacilityForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await new Promise(r => setTimeout(r, 200));

    const facil = await window.DB.getCampusFacilities();
    return {
      total: facil.length,
      added: facil.find(f => f.name === 'Smart Computing Center')
    };
  });
  console.log('Facility Add Result:', facilityAddResult);

  // 4. Add Mess Service
  const messAddResult = await page.evaluate(async () => {
    window.openFoodMessModal();
    document.getElementById('foodMessName').value = 'New Campus Canteen';
    document.getElementById('foodMessType').value = 'Campus Food Stall';
    document.getElementById('foodMessDiet').value = 'Veg & Non-Veg';

    const form = document.getElementById('foodMessForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await new Promise(r => setTimeout(r, 200));

    const mess = getActiveFoodMessList();
    return {
      total: mess.length,
      added: mess.find(m => m.name === 'New Campus Canteen')
    };
  });
  console.log('Mess Add Result:', messAddResult);

  // Now verify that public food-tiffin page displays the new mess service!
  await page.goto('http://localhost:3000/food-tiffin.html', { waitUntil: 'networkidle0' });
  const publicFoodCards = await page.evaluate(() => {
    return {
      badge: document.getElementById('foodCountBadge')?.innerText,
      renderedCards: Array.from(document.querySelectorAll('#foodGrid h3, #foodGrid .title, #foodGrid strong')).map(el => el.innerText.trim()).filter(Boolean)
    };
  });
  console.log('Public Food-Tiffin Page with Real Added Mess:', publicFoodCards);

  await browser.close();
})();

