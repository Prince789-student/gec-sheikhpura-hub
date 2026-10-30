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

  // Add Business
  await page.evaluate(async () => {
    document.getElementById('addNewBusinessBtn').click();
    document.getElementById('busName').value = 'GEC Fast Xerox & Cyber';
    document.getElementById('busCategory').value = 'stationery';
    document.getElementById('busAddress').value = 'Near Bajidpur Gate';

    const form = document.getElementById('businessForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise(r => setTimeout(r, 150));
  });

  // Add Room
  await page.evaluate(async () => {
    document.getElementById('addNewRoomBtn').click();
    document.getElementById('accTitle').value = 'Bajidpur Verified Boys PG';
    document.getElementById('accType').value = 'PG / Student Room';
    document.getElementById('accRent').value = '2500';
    document.getElementById('accAddress').value = 'Opposite College Gate';

    const form = document.getElementById('accommodationForm');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise(r => setTimeout(r, 150));
  });

  // Check explore-nearby.html with correct selector #shopsGrid
  await page.goto('http://localhost:3000/explore-nearby.html', { waitUntil: 'networkidle0' });
  const publicExplore = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#shopsGrid h3, #shopsGrid .card-title, #shopsGrid strong')).map(el => el.innerText.trim()).filter(Boolean);
    const badge = document.getElementById('shopCountBadge')?.innerText;
    return { badge, cards };
  });
  console.log('Public Explore-Nearby Page:', publicExplore);

  // Check rooms-pg.html with correct selector #roomsGrid
  await page.goto('http://localhost:3000/rooms-pg.html', { waitUntil: 'networkidle0' });
  const publicRooms = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#roomsGrid h3, #roomsGrid .card-title, #roomsGrid strong')).map(el => el.innerText.trim()).filter(Boolean);
    const badge = document.getElementById('roomCountBadge')?.innerText;
    return { badge, cards };
  });
  console.log('Public Rooms-PG Page:', publicRooms);

  await browser.close();
})();

