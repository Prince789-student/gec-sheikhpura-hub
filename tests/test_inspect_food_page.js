const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/food-tiffin.html', { waitUntil: 'networkidle0' });

  const result = await page.evaluate(() => {
    const grid = document.getElementById('foodGrid');
    const badge = document.getElementById('foodCountBadge');
    return {
      gridChildrenCount: grid ? grid.children.length : 0,
      gridHTML: grid ? grid.innerHTML.slice(0, 300) : 'no grid',
      badgeText: badge ? badge.innerText : 'no badge'
    };
  });

  console.log('Result from clean food-tiffin.html:', result);

  await browser.close();
})();
