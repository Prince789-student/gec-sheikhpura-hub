const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

  // 1. Check Desktop Nav items
  const navSummary = await page.evaluate(() => {
    const desktopLinks = Array.from(document.querySelectorAll('.desktop-nav > a.nav-link')).map(a => a.innerText.trim());
    const dropdownTrigger = document.querySelector('.desktop-nav .dropdown-trigger')?.innerText.trim();
    const dropdownItems = Array.from(document.querySelectorAll('.desktop-nav .dropdown-menu .dropdown-item')).map(a => ({
      text: a.innerText.trim(),
      href: a.getAttribute('href')
    }));

    return {
      desktopLinks,
      dropdownTrigger,
      dropdownItems
    };
  });

  console.log('--- MARKETPLACE FOLDER VERIFICATION ---');
  console.log('Dropdown Trigger Label:', navSummary.dropdownTrigger);
  console.log('Items Inside Marketplace Folder:');
  navSummary.dropdownItems.forEach((it, idx) => {
    console.log(`  ${idx + 1}. ${it.text} -> ${it.href}`);
  });

  await browser.close();
})();

