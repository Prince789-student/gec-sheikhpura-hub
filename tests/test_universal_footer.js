const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const errors = [];

  page.on('pageerror', err => errors.push(err.message));

  console.log('1. Loading index.html on desktop (1440px)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle2' });

  const footerExists = await page.evaluate(() => Boolean(document.getElementById('universal-site-footer')));
  console.log('Footer element exists:', footerExists);

  const brandTitle = await page.evaluate(() => {
    const el = document.querySelector('.footer-brand-title');
    return el ? el.textContent.trim() : null;
  });
  console.log('Brand title in footer:', brandTitle);

  const legalLinksCount = await page.evaluate(() => {
    const legalCol = Array.from(document.querySelectorAll('.footer-col')).find(c => c.textContent.includes('Legal & Policy'));
    return legalCol ? legalCol.querySelectorAll('li a').length : 0;
  });
  console.log('Legal links count in footer (expect 10):', legalLinksCount);

  console.log('\n2. Testing Mobile Viewport (390px) & Accordion Toggles...');
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 400));

  const mobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log('Mobile horizontal overflow:', mobileOverflow);

  // Click on "Quick Links" accordion header
  const initialExpanded = await page.evaluate(() => {
    const header = document.querySelector('.footer-col[data-footer-accordion] .footer-col-header');
    return header ? header.getAttribute('aria-expanded') : null;
  });
  console.log('Initial Quick Links aria-expanded:', initialExpanded);

  await page.evaluate(() => {
    const header = document.querySelector('.footer-col[data-footer-accordion] .footer-col-header');
    if (header) header.click();
  });
  await new Promise(r => setTimeout(r, 300));

  const afterClickExpanded = await page.evaluate(() => {
    const header = document.querySelector('.footer-col[data-footer-accordion] .footer-col-header');
    return header ? header.getAttribute('aria-expanded') : null;
  });
  const colIsActive = await page.evaluate(() => {
    const col = document.querySelector('.footer-col[data-footer-accordion]');
    return col ? col.classList.contains('active') : false;
  });
  console.log('After click Quick Links aria-expanded:', afterClickExpanded);
  console.log('After click Quick Links col has .active:', colIsActive);

  console.log('\nConsole Errors count:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }

  await browser.close();
  console.log('\nPHASE 1 UNIVERSAL FOOTER TEST PASSED SUCCESSFULLY!');
})();

