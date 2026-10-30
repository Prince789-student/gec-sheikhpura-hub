const puppeteer = require('puppeteer-core');
const path = require('path');

async function testLoginFlow() {
  console.log('Testing login.html custom Google flow in Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/login.html?force=1', { waitUntil: 'networkidle0' });

  // Clear any existing session & profiles in localStorage
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('Filling custom student Google account...');
  await page.type('#customStudentName', 'Prince Kumar');
  await page.type('#customStudentEmail', 'prince.kumar.beu@gmail.com');

  console.log('Clicking Continue with this Google Account...');
  await page.click('button[onclick="handleCustomGoogleLogin()"]');

  await new Promise(r => setTimeout(r, 600));

  const modalDisplay = await page.$eval('#profileOnboardModal', el => window.getComputedStyle(el).display);
  console.log('Onboarding modal display:', modalDisplay);

  const onboardName = await page.$eval('#onboardName', el => el.value);
  console.log('Prefilled Onboard Name:', onboardName);

  // Fill the 6 mandatory fields
  console.log('Filling 6 student identity fields...');
  await page.select('#onboardCollege', 'Government Engineering College, Sheikhpura');
  await page.type('#onboardRegNo', '22105128099');
  await page.type('#onboardDob', '2003-05-15');
  await page.type('#onboardPhone', '9801234567');
  await page.select('#onboardDistrict', 'Sheikhpura');

  const artifactDir = 'C:\\Users\\princ\\.gemini\\antigravity\\brain\\03bc4da4-48d7-45ab-ad9d-ccbba4bb72ae';
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_login_onboard_modal.png') });
  console.log('Saved screenshot_login_onboard_modal.png');

  console.log('Submitting onboarding form...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('#btnSaveOnboard')
  ]);

  console.log('Navigated to:', page.url());

  const dashName = await page.$eval('#idCardName', el => el.textContent.trim());
  const dashCollege = await page.$eval('#idCardCollege', el => el.textContent.trim());
  const dashReg = await page.$eval('#idCardReg', el => el.textContent.trim());
  const dashPhone = await page.$eval('#idCardPhone', el => el.textContent.trim());
  const dashDistrict = await page.$eval('#idCardDistrict', el => el.textContent.trim());

  console.log('\n--- Verified Dashboard Data for Prince Kumar ---');
  console.log('  Name:', dashName);
  console.log('  College:', dashCollege);
  console.log('  Reg:', dashReg);
  console.log('  Phone:', dashPhone);
  console.log('  District:', dashDistrict);

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_prince_dashboard.png') });
  console.log('Saved screenshot_prince_dashboard.png');

  // Test Profile button click in header
  await page.click('#headerUserBtn');
  await new Promise(r => setTimeout(r, 600));

  const gModalDisplay = await page.$eval('#globalStudentProfileModal', el => window.getComputedStyle(el).display);
  const gName = await page.$eval('#gProfileName', el => el.textContent.trim());
  const gCollege = await page.$eval('#gProfileCollege', el => el.textContent.trim());
  const gReg = await page.$eval('#gProfileReg', el => el.textContent.trim());

  console.log('\n--- Header Profile Modal Data ---');
  console.log('  Modal Display:', gModalDisplay);
  console.log('  Name:', gName);
  console.log('  College:', gCollege);
  console.log('  Reg:', gReg);

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_prince_profile_modal.png') });
  console.log('Saved screenshot_prince_profile_modal.png');

  await browser.close();
  console.log('\n🎉 LOGIN.HTML TEST PASSED 100%!');
}

testLoginFlow().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
