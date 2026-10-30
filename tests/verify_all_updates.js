const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 1. Verify Website Community Page
  console.log('--- 1. Testing Website Community Page (localhost:3000/community.html) ---');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:3000/community.html?tab=clubs', { waitUntil: 'networkidle2' });
  
  const websiteChecks = await page.evaluate(function() {
    var logoEl = document.querySelector('.brand-crest img');
    var logoImg = logoEl ? logoEl.getAttribute('src') : null;
    var tabPills = Array.from(document.querySelectorAll('.community-tab-btn')).map(function(b) { return b.textContent.trim(); });
    var activeEl = document.querySelector('.community-tab-btn.active');
    var activeTab = activeEl ? activeEl.textContent.trim() : null;
    return {
      logoImg: logoImg,
      tabPills: tabPills,
      activeTab: activeTab
    };
  });
  console.log('Website Community State:', websiteChecks);
  await page.screenshot({ path: path.resolve(__dirname, 'website_community_verified.png') });

  // 2. Test Tab Click and URL Sync
  console.log('--- 2. Testing Community Tab Click (Sports) ---');
  await page.click('button[data-community-tab="sportsTab"]');
  await new Promise(function(r) { setTimeout(r, 600); });
  var newUrl = page.url();
  console.log('URL after clicking Sports tab:', newUrl);

  var sportsText = await page.evaluate(function() {
    var sportsGrid = document.getElementById('sportsGrid');
    return sportsGrid ? sportsGrid.innerText : '';
  });
  var hasRawEnum = sportsText.includes('PRACTICE_SESSION') || sportsText.includes('TEAM_RECRUITMENT');
  console.log('Contains raw unformatted enums (should be false):', hasRawEnum);
  await page.screenshot({ path: path.resolve(__dirname, 'website_sports_verified.png') });

  // 3. Verify Flutter Mobile App at localhost:5000
  console.log('\n--- 3. Testing Flutter Web App (localhost:5000) ---');
  await page.goto('http://localhost:5000/', { waitUntil: 'networkidle2' });
  await new Promise(function(r) { setTimeout(r, 2500); }); // wait for flutter canvas/dom

  await page.screenshot({ path: path.resolve(__dirname, 'flutter_app_home_verified.png') });
  console.log('Saved screenshot of flutter app to flutter_app_home_verified.png');

  await browser.close();
  console.log('Verification Complete!');
})();
