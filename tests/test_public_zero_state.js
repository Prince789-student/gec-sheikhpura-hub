const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  const pagesToTest = [
    { url: 'http://localhost:3000/food-tiffin.html', name: 'Food & Mess' },
    { url: 'http://localhost:3000/rooms-pg.html', name: 'Rooms & PGs' },
    { url: 'http://localhost:3000/explore-nearby.html', name: 'Explore Nearby' },
    { url: 'http://localhost:3000/marketplace.html', name: 'Marketplace' }
  ];

  for (const p of pagesToTest) {
    await page.goto(p.url, { waitUntil: 'networkidle0' });
    const count = await page.evaluate(() => {
      // Check rendered cards or list items
      const cards = document.querySelectorAll('.listing-card, .room-card, .food-card, .marketplace-card, .shop-card');
      return cards.length;
    });
    console.log(`${p.name} rendered cards count: ${count}`);
  }

  await browser.close();
})();

