const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  console.log('Navigating to Flutter App on localhost:5000 ...');
  await page.goto('http://localhost:5000/', { waitUntil: 'networkidle2' });
  await new Promise(function(r) { setTimeout(r, 2500); });

  await page.screenshot({ path: path.resolve(__dirname, 'flutter_google_auth_live.png') });
  console.log('Screenshot saved to flutter_google_auth_live.png');

  await browser.close();
  console.log('Test complete!');
})();
