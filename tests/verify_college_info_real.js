const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/college-info.html', { waitUntil: 'networkidle0' });

  const pageReport = await page.evaluate(() => {
    const hasOldVaultGrid = !!document.getElementById('officialLinksGrid');
    const hasOldTabPills = !!document.getElementById('officialTabPills');
    const sections = Array.from(document.querySelectorAll('h2, h3.calc-title, th[colspan]')).map(el => el.innerText.trim()).filter(Boolean);
    const tablesCount = document.querySelectorAll('table.hub-table').length;
    const cardsCount = document.querySelectorAll('.hub-card').length;

    return {
      hasOldVaultGrid,
      hasOldTabPills,
      tablesCount,
      cardsCount,
      sections
    };
  });

  console.log('--- COLLEGE-INFO.HTML PAGE AUDIT ---');
  console.log(JSON.stringify(pageReport, null, 2));

  await page.screenshot({ path: 'college_info_updated.png' });
  console.log('Screenshot saved to college_info_updated.png');

  await browser.close();
})();

