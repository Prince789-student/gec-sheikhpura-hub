const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:3000/food-tiffin.html', { waitUntil: 'networkidle0' });

  const scripts = await page.evaluate(() => {
    return {
      hasDB: typeof window.DB !== 'undefined',
      hasHUB_DATA: typeof window.HUB_DATA !== 'undefined',
      loadedScripts: Array.from(document.querySelectorAll('script')).map(s => s.src)
    };
  });

  console.log('Food Page Scripts Status:', scripts);

  await browser.close();
})();

