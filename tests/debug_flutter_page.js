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
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', req => console.log('FAILED REQ:', req.url(), req.failure()?.errorText));

  console.log('Navigating to http://localhost:5000/ ...');
  await page.goto('http://localhost:5000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));

  const bodyHtml = await page.evaluate(() => document.body.innerHTML);
  console.log('Body HTML length:', bodyHtml.length);
  console.log('Body snippet:', bodyHtml.slice(0, 300));

  await page.screenshot({ path: path.resolve(__dirname, 'flutter_debug.png') });
  console.log('Saved flutter_debug.png, size:', require('fs').statSync(path.resolve(__dirname, 'flutter_debug.png')).size);

  await browser.close();
})();

