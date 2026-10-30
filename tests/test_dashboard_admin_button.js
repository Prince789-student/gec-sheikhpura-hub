const puppeteer = require('puppeteer-core');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login.html?force=1', { waitUntil: 'networkidle0' });

  // Set mock session
  await page.evaluate(() => {
    const user = { id: 'admin-test-user', email: 'prince86944@gmail.com', display_name: 'Prince Kumar' };
    localStorage.setItem('gec_student_session', JSON.stringify(user));
    localStorage.setItem('gec_profile_' + user.id, JSON.stringify({
      id: user.id,
      name: 'Prince Kumar',
      college_name: 'Government Engineering College, Sheikhpura',
      registration_no: '22105128099',
      dob: '2003-05-15',
      phone: '9801234567',
      home_district: 'Sheikhpura',
      profile_completed: true
    }));
  });

  await page.goto('http://localhost:3000/dashboard.html', { waitUntil: 'networkidle0' });
  console.log('Current URL on dashboard:', page.url());

  const adminLinkSidebar = await page.$eval('#dashAdminPortalLink', el => el.innerText.trim());
  const adminLinkHeader = await page.$eval('#headerAdminQuickBtn', el => el.innerText.trim());
  console.log('Sidebar Admin Link found:', adminLinkSidebar);
  console.log('Header Admin Link found:', adminLinkHeader);
  assert(adminLinkSidebar.includes('Admin'));
  assert(adminLinkHeader.includes('Admin'));

  await browser.close();
  console.log('🎉 Dashboard admin links verified successfully!');
})();
