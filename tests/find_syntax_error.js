const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  page.on('pageerror', err => {
    console.log('PAGE ERROR STACK:', err.stack);
  });

  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });

  await browser.close();
})();

