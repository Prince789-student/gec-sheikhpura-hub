const puppeteer = require('puppeteer-core');
const assert = require('assert');

(async () => {
  console.log('Testing transport.html Auto Driver Directory...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/transport.html', { waitUntil: 'networkidle0' });

  const count = await page.$$eval('#autoDriverCardsContainer .hub-card', els => els.length);
  console.log('Found Auto Driver Cards count:', count);
  assert(count >= 5, 'Should have at least 5 verified auto drivers');

  const names = await page.$$eval('#autoDriverCardsContainer .hub-card .card-title', els => els.map(e => e.textContent.trim()));
  console.log('Verified Drivers in Directory:', names);
  assert(names.includes('Ramesh Yadav'));
  assert(names.includes('Pappu Kumar'));
  assert(names.includes('Santosh Paswan'));

  const phones = await page.$$eval('#autoDriverCardsContainer .hub-card a[href^="tel:"]', els => els.map(e => e.textContent.trim()));
  console.log('Verified Driver Phone Buttons:', phones);
  assert(phones.length >= 5);

  const waLinks = await page.$$eval('#autoDriverCardsContainer .hub-card a[href*="wa.me"]', els => els.length);
  console.log('WhatsApp Direct Links count:', waLinks);
  assert(waLinks >= 5);

  await browser.close();
  console.log('🎉 transport.html Auto Driver Directory verified 100%!');
})();
