const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });

  // Login as admin
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

  // Test opening modals
  const testResults = await page.evaluate(async () => {
    const results = {};

    // 1. Faculty Modal
    try {
      if (typeof window.openAddFacultyModal === 'function') {
        window.openAddFacultyModal();
        const m = document.getElementById('adminFacultyModal');
        results.facultyModal = {
          exists: !!m,
          display: m ? window.getComputedStyle(m).display : 'none',
          hasShowClass: m ? m.classList.contains('show') : false
        };
      } else {
        results.facultyModal = 'function not found';
      }
    } catch (e) { results.facultyModal = e.message; }

    // 2. Facility Modal
    try {
      if (typeof window.openAddFacilityModal === 'function') {
        window.openAddFacilityModal();
        const m = document.getElementById('adminFacilityModal');
        results.facilityModal = {
          exists: !!m,
          display: m ? window.getComputedStyle(m).display : 'none',
          hasShowClass: m ? m.classList.contains('show') : false
        };
      } else {
        results.facilityModal = 'function not found';
      }
    } catch (e) { results.facilityModal = e.message; }

    // 3. Food Mess Modal
    try {
      if (typeof window.openFoodMessModal === 'function') {
        window.openFoodMessModal();
        const m = document.getElementById('foodMessModal');
        results.foodMessModal = {
          exists: !!m,
          display: m ? window.getComputedStyle(m).display : 'none',
          hasShowClass: m ? m.classList.contains('show') || m.classList.contains('open') : false
        };
      } else {
        results.foodMessModal = 'function not found';
      }
    } catch (e) { results.foodMessModal = e.message; }

    // 4. Auto Driver Modal
    try {
      if (typeof window.openAddAutoDriverModal === 'function') {
        window.openAddAutoDriverModal();
        const m = document.getElementById('adminAutoDriverModal');
        results.autoDriverModal = {
          exists: !!m,
          display: m ? window.getComputedStyle(m).display : 'none',
          hasShowClass: m ? m.classList.contains('show') || m.classList.contains('open') : false
        };
      } else {
        results.autoDriverModal = 'function not found';
      }
    } catch (e) { results.autoDriverModal = e.message; }

    // 5. Business Modal
    try {
      const btn = document.getElementById('addNewBusinessBtn');
      if (btn) btn.click();
      const m = document.getElementById('businessModal');
      results.businessModal = {
        exists: !!m,
        display: m ? window.getComputedStyle(m).display : 'none',
        hasShowClass: m ? m.classList.contains('show') || m.classList.contains('open') : false
      };
    } catch (e) { results.businessModal = e.message; }

    // 6. Accommodation Modal
    try {
      const btn = document.getElementById('addNewRoomBtn');
      if (btn) btn.click();
      const m = document.getElementById('accommodationModal');
      results.accommodationModal = {
        exists: !!m,
        display: m ? window.getComputedStyle(m).display : 'none',
        hasShowClass: m ? m.classList.contains('show') || m.classList.contains('open') : false
      };
    } catch (e) { results.accommodationModal = e.message; }

    return results;
  });

  console.log('--- MODAL VISIBILITY DIAGNOSTICS ---');
  console.log(JSON.stringify(testResults, null, 2));

  await browser.close();
})();

