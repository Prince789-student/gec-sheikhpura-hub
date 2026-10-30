const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/explore-nearby.html', { waitUntil: 'networkidle0' });

  const result = await page.evaluate(() => {
    return {
      countBadge: document.getElementById('nearbyCountBadge')?.innerText,
      gridCards: Array.from(document.querySelectorAll('#nearbyListingsGrid h3, #nearbyListingsGrid .title')).map(el => el.innerText.trim())
    };
  });

  console.log('Explore Nearby Live Check on clean state:', result);

  await browser.close();
})();

