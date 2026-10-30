const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => {
    console.log('PAGE ERROR MESSAGE:', err.message);
    console.log('PAGE ERROR STACK:', err.stack);
  });
  page.on('requestfailed', req => console.log('FAILED REQ:', req.url(), req.failure()?.errorText));

  console.log('Navigating to http://localhost:5000/ ...');
  await page.goto('http://localhost:5000/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 4000));

  await browser.close();
})();

