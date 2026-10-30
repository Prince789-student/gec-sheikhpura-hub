const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

  const navDropdowns = await page.evaluate(() => {
    const dropdowns = Array.from(document.querySelectorAll('.desktop-nav .nav-dropdown')).map(d => {
      const trigger = d.querySelector('.dropdown-trigger')?.innerText.trim();
      const items = Array.from(d.querySelectorAll('.dropdown-menu a')).map(a => ({
        text: a.innerText.trim(),
        href: a.getAttribute('href')
      }));
      return { trigger, items };
    });

    return dropdowns;
  });

  console.log('--- ALL DESKTOP NAV DROPDOWN FOLDERS ---');
  console.log(JSON.stringify(navDropdowns, null, 2));

  await browser.close();
})();

