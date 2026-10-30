const puppeteer = require('C:/Users/princ/OneDrive/Pictures/Desktop/my poject/Apna College Bihar/client/node_modules/puppeteer');

async function debugOverflow() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 740 });

  for (const pageName of ['index.html', 'rooms-pg.html', 'community.html']) {
    console.log(`\nDebugging: ${pageName} on 360px`);
    await page.goto(`http://localhost:3000/${pageName}`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    const result = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const docScrollW = document.documentElement.scrollWidth;
      const bodyScrollW = document.body.scrollWidth;

      const wideElements = [];
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > docW + 1 || rect.width > docW + 1) {
          wideElements.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            width: Math.round(rect.width),
            right: Math.round(rect.right),
            outerHTML: el.outerHTML.substring(0, 80)
          });
        }
      });

      return {
        docW,
        docScrollW,
        bodyScrollW,
        wideElements: wideElements.slice(0, 10)
      };
    });

    console.log('Result:', JSON.stringify(result, null, 2));
  }

  await browser.close();
}

debugOverflow().catch(console.error);

