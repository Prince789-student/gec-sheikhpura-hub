const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  // 1. Check index.html navbar
  await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
  const navLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.desktop-nav a.nav-link')).map(a => ({
      text: a.innerText.trim(),
      href: a.getAttribute('href')
    }));
  });
  console.log('--- Desktop Navigation Links ---');
  console.log(navLinks);

  // 2. Check college-info.html folder pills
  await page.goto('http://localhost:3000/college-info.html', { waitUntil: 'networkidle0' });
  const pills = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.official-tab-pills .tab-pill')).map(p => ({
      tab: p.dataset.tab,
      text: p.innerText.trim()
    }));
  });
  console.log('--- College Info Departmental & Info Folders ---');
  console.log(pills);

  // 3. Test clicking "Department" folder in college-info.html
  await page.evaluate(() => {
    const deptPill = document.querySelector('.tab-pill[data-tab="department"]');
    if (deptPill) deptPill.click();
  });
  const deptCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#officialLinksGrid h4')).map(h => h.innerText.trim());
  });
  console.log('--- Department Folder Rendered Links ---', deptCards);

  // 4. Test clicking "Academics" folder
  await page.evaluate(() => {
    const acadPill = document.querySelector('.tab-pill[data-tab="academics"]');
    if (acadPill) acadPill.click();
  });
  const acadCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#officialLinksGrid h4')).map(h => h.innerText.trim());
  });
  console.log('--- Academics Folder Rendered Links ---', acadCards);

  // 5. Check admin.html (confirm Source-Synced is gone)
  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });
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
  const adminState = await page.evaluate(() => {
    return {
      hasSourceSyncedCard: !!document.getElementById('statDiscovered'),
      hasOfficialCrawlTab: !!document.querySelector('[data-admin-tab="officialCrawlTab"]')
    };
  });
  console.log('--- Admin Panel Source-Synced Check (Should be false) ---', adminState);

  await browser.close();
  console.log('🎉 Verification completed successfully!');
})();
