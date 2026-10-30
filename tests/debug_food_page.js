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

  // Wait 1 second
  await new Promise(r => setTimeout(r, 1000));

  const content = await page.evaluate(async () => {
    const res = await window.DB.getFoodServices();
    return {
      dbResult: res,
      gridHTML: document.getElementById('foodGrid')?.innerHTML,
      badgeText: document.getElementById('foodCountBadge')?.innerText
    };
  });

  console.log('Food-tiffin debug content:', content);

  await browser.close();
})();

