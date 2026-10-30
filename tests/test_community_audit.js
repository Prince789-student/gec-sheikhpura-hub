const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errors.push(err.message));

  console.log('1. Loading community.html?tab=sports...');
  await page.goto('http://localhost:3000/community.html?tab=sports', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const url1 = page.url();
  const sportsHtml = await page.evaluate(() => document.getElementById('sportsGrid').innerHTML);
  console.log('Current URL:', url1);
  console.log('Sports Grid Empty State rendered:', sportsHtml.includes('No sports matches'));

  console.log('\n2. Testing tab click to Announcements...');
  await page.evaluate(() => document.querySelector('[data-community-tab="announcementsTab"]').click());
  await new Promise(r => setTimeout(r, 400));
  const url2 = page.url();
  console.log('Updated URL after click:', url2);
  const annHtml = await page.evaluate(() => document.getElementById('announcementsGrid').innerHTML);
  console.log('Announcements Grid Empty State rendered:', annHtml.includes('No active community announcements'));

  console.log('\n3. Testing tab click to Events Directory...');
  await page.evaluate(() => document.querySelector('[data-community-tab="eventsTab"]').click());
  await new Promise(r => setTimeout(r, 400));
  const url3 = page.url();
  console.log('Updated URL after click:', url3);
  const badgeText = await page.evaluate(() => document.getElementById('eventsCountBadge').textContent.trim());
  console.log('Events Count Badge text:', JSON.stringify(badgeText));

  console.log('\n4. Testing Host Sports Modal Open & Submit...');
  await page.evaluate(() => document.querySelector('[data-community-tab="sportsTab"]').click());
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => window.openHostSportsModal());
  const modalDisplay = await page.evaluate(() => document.getElementById('hostSportsModal').style.display);
  console.log('Modal display when opened:', modalDisplay);

  await page.type('#sportsTitle', 'Hostel Volleyball Inter-Wing Match');
  await page.select('#sportsCategorySelect', 'volleyball');
  await page.select('#sportsActivityTypeSelect', 'team_recruitment');
  await page.type('#sportsVenue', 'Volleyball Court Near Gym');
  await page.type('#sportsOrganizerName', 'Sunil Captain');
  await page.type('#sportsContactInfo', 'Hostel 1 Common Room');
  await page.type('#sportsDescription', 'Open sparring for players.');
  
  await page.evaluate(() => {
    document.getElementById('hostSportsForm').dispatchEvent(new Event('submit', { cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 800));

  const newSportsHtml = await page.evaluate(() => document.getElementById('sportsGrid').innerHTML);
  console.log('\nRendered Sports Card contains formatted label:');
  console.log('Has "Volleyball • Team Recruitment":', newSportsHtml.includes('Volleyball • Team Recruitment'));
  console.log('Has raw "TEAM_RECRUITMENT":', newSportsHtml.includes('TEAM_RECRUITMENT'));

  console.log('\nConsole Errors count:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }
  await browser.close();
})();
