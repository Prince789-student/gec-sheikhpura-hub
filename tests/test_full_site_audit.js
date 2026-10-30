const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));

const BASE_URL = 'http://localhost:3000';
const PAGES = [
  'index.html',
  'college-info.html',
  'admissions.html',
  'academics.html',
  'community.html',
  'rooms-pg.html',
  'food-tiffin.html',
  'explore-nearby.html',
  'transport.html',
  'emergency.html',
  'marketplace.html',
  'student-tools.html',
  'placement.html',
  'notices.html',
  'campus-directory.html',
  'lost-found.html',
  'submit-listing.html',
  'about.html',
  'contact.html',
  'dashboard.html',
  'login.html',
  'admin.html',
  'saved-items.html',
  'community-guidelines.html',
  'privacy.html',
  'terms.html',
  '404.html'
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const results = [];

  console.log(`Auditing all ${PAGES.length} pages on ${BASE_URL} for First-Party Code & Mobile Responsiveness...\n`);

  for (const pageName of PAGES) {
    const page = await browser.newPage();
    const localErrors = [];
    const failedRequests = [];

    const client = await page.target().createCDPSession();
    await client.send('Runtime.enable');
    client.on('Runtime.exceptionThrown', event => {
      const url = event.exceptionDetails.url || '';
      if (!url.includes('@supabase') && !url.includes('cdn.jsdelivr')) {
        localErrors.push({
          url,
          line: event.exceptionDetails.lineNumber,
          msg: event.exceptionDetails.exception ? event.exceptionDetails.exception.description : event.exceptionDetails.text
        });
      }
    });

    page.on('response', resp => {
      if (resp.status() >= 400 && !resp.url().includes('favicon.ico')) {
        failedRequests.push(`${resp.status()} ${resp.url()}`);
      }
    });

    try {
      // 1. Desktop Test (1440x900)
      await page.setViewport({ width: 1440, height: 900 });
      const res = await page.goto(`${BASE_URL}/${pageName}`, { waitUntil: 'networkidle2', timeout: 10000 });
      const status = res ? res.status() : 0;

      const desktopOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // 2. Mobile Test (390x844 iPhone 12/13/14)
      await page.setViewport({ width: 390, height: 844 });
      await new Promise(r => setTimeout(r, 200));

      const mobileOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // 3. Check for broken internal links on this page
      const brokenLinks = await page.evaluate((pages) => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        const internal = links
          .map(a => a.getAttribute('href'))
          .filter(h => h && h.endsWith('.html') && !h.startsWith('http') && !h.startsWith('//'));
        return internal.filter(h => {
          const clean = h.split('?')[0].split('#')[0];
          return !pages.includes(clean);
        });
      }, PAGES);

      results.push({
        page: pageName,
        status,
        desktopOverflow,
        mobileOverflow,
        errorsCount: localErrors.length,
        localErrors,
        failedRequests,
        brokenLinks
      });

      const pass = status === 200 && localErrors.length === 0 && failedRequests.length === 0 && !mobileOverflow && brokenLinks.length === 0;
      console.log(`[${pass ? 'PASS' : 'WARN'}] ${pageName} - Status: ${status}, Local Errors: ${localErrors.length}, 404s: ${failedRequests.length}, Mobile Overflow: ${mobileOverflow}, Broken Links: ${brokenLinks.length}`);
    } catch (e) {
      console.log(`[FAIL] ${pageName} - Exception: ${e.message}`);
      results.push({
        page: pageName,
        status: 'EXCEPTION',
        error: e.message
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n--- AUDIT SUMMARY MATRIX ---');
  let totalLocalErrors = 0;
  let totalFailedReqs = 0;
  let totalOverflows = 0;
  let totalBrokenLinks = 0;

  results.forEach(r => {
    if (r.errorsCount) totalLocalErrors += r.errorsCount;
    if (r.failedRequests && r.failedRequests.length) totalFailedReqs += r.failedRequests.length;
    if (r.mobileOverflow) totalOverflows++;
    if (r.brokenLinks && r.brokenLinks.length) totalBrokenLinks += r.brokenLinks.length;
  });

  console.log(`Total Pages Tested: ${results.length}`);
  console.log(`Total First-Party Local JS Errors: ${totalLocalErrors}`);
  console.log(`Total Failed Network Requests (404/500): ${totalFailedReqs}`);
  console.log(`Total Mobile Viewport Overflows: ${totalOverflows}`);
  console.log(`Total Broken Internal Links: ${totalBrokenLinks}`);

  fs.writeFileSync(path.resolve(__dirname, 'audit_results.json'), JSON.stringify(results, null, 2));
})();
