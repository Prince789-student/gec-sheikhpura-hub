const puppeteer = require('C:/Users/princ/OneDrive/Pictures/Desktop/my poject/Apna College Bihar/client/node_modules/puppeteer');

const viewports = [
  { name: 'Android Small', width: 360, height: 740 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone Standard', width: 390, height: 844 },
  { name: 'iPhone Pro Max', width: 430, height: 932 }
];

const testPages = [
  'index.html',
  'rooms-pg.html',
  'food-tiffin.html',
  'explore-nearby.html',
  'community.html',
  'grievance.html',
  'privacy.html'
];

async function runMobileAudit() {
  console.log('--- STARTING MOBILE RESPONSIVENESS & UI/UX AUDIT ---');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalFailures = 0;

  for (const pageName of testPages) {
    const url = `http://localhost:3000/${pageName}`;
    console.log(`\nTesting Page: ${pageName}`);

    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewport(vp);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 600));

        // 1. Check Horizontal Overflow
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const bodyScrollWidth = document.body.scrollWidth;
          return {
            hasOverflow: scrollWidth > docWidth || bodyScrollWidth > docWidth,
            docWidth,
            scrollWidth,
            bodyScrollWidth
          };
        });

        if (overflow.hasOverflow) {
          console.error(`  ❌ [${vp.name} (${vp.width}px)] Horizontal Overflow detected: docWidth=${overflow.docWidth}, scrollWidth=${overflow.scrollWidth}`);
          totalFailures++;
        } else {
          console.log(`  ✓ [${vp.name} (${vp.width}px)] Zero Horizontal Overflow (${overflow.docWidth}px)`);
        }

        // 2. Check Bottom Nav presence & visibility
        const bottomNav = await page.evaluate(() => {
          const el = document.querySelector('.mobile-bottom-nav');
          if (!el) return { exists: false };
          const style = window.getComputedStyle(el);
          const items = el.querySelectorAll('.mobile-bottom-item');
          return {
            exists: true,
            visible: style.display !== 'none',
            itemCount: items.length
          };
        });

        if (!bottomNav.exists || !bottomNav.visible || bottomNav.itemCount !== 5) {
          console.error(`  ❌ [${vp.name}] Bottom Nav issue: exists=${bottomNav.exists}, visible=${bottomNav.visible}, items=${bottomNav.itemCount}`);
          totalFailures++;
        } else {
          console.log(`  ✓ [${vp.name}] Mobile Bottom Nav active with ${bottomNav.itemCount} quick-access items`);
        }

      } catch (err) {
        console.error(`  ❌ [${vp.name}] Navigation/render error:`, err.message);
        totalFailures++;
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  console.log('\n--- MOBILE AUDIT SUMMARY ---');
  if (totalFailures === 0) {
    console.log('✅ ALL MOBILE VIEWPORTS & PAGES PASSED WITH 0 DEFECTS!');
  } else {
    console.error(`❌ Total failures: ${totalFailures}`);
    process.exit(1);
  }
}

runMobileAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
