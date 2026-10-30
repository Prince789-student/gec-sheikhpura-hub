const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });

  // Auto login prince
  await page.evaluate(() => {
    localStorage.setItem('gec_admin_auth', JSON.stringify({
      id: 'admin-prince-super-id',
      email: 'prince86944@gmail.com',
      role: 'super_admin',
      display_name: 'Prince Kumar (Super Admin)',
      created_at: new Date().toISOString()
    }));
  });

  await page.reload({ waitUntil: 'networkidle0' });

  // Evaluate all badges and counts
  const data = await page.evaluate(() => {
    const ids = [
      'statOwnerSubs', 'statReviews', 'statReports', 'statVerifications', 
      'statMarketplace', 'statFaculty', 'statDiscovered', 'statAcademicLinks',
      'tabOwnerSubsCount', 'tabReviewsCount', 'tabReportCount', 'tabMarketplaceCount',
      'tabFeedbackCount', 'tabDuplicatesCount', 'tabFoodMessCount', 'tabFacultyCount',
      'tabFacilityCount', 'tabCorrectionsCount', 'tabPartnerCount', 'tabCrawlCount',
      'tabCommunityCount', 'tabLostFoundCount'
    ];

    const results = {};
    ids.forEach(id => {
      const el = document.getElementById(id);
      results[id] = el ? el.textContent.trim() : 'NOT FOUND';
    });

    // Check Unverified Coords table
    const unvTbody = document.getElementById('unverifiedCoordsTableBody');
    results['unverifiedCoordsCount'] = unvTbody ? unvTbody.querySelectorAll('tr').length : 0;
    results['unverifiedCoordsText'] = unvTbody ? unvTbody.innerText : '';

    // Check Student Feedback container
    const fbCont = document.getElementById('adminFeedbackListContainer');
    results['feedbackCount'] = fbCont ? fbCont.children.length : 0;
    results['feedbackText'] = fbCont ? fbCont.innerText.substring(0, 100) : '';

    return results;
  });

  console.log('--- ADMIN PAGE CURRENT LIVE COUNTS ---');
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
})();

