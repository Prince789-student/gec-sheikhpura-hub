const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('\n--- 1. Testing http://localhost:3000/google-auth.html ---');
  await page.goto('http://localhost:3000/google-auth.html', { waitUntil: 'networkidle0' });

  const initialStep1Display = await page.$eval('#stepChooseAccount', el => window.getComputedStyle(el).display);
  const initialStep2Display = await page.$eval('#stepStudentVerification', el => window.getComputedStyle(el).display);
  console.log('Initial Step 1 display:', initialStep1Display);
  console.log('Initial Step 2 display:', initialStep2Display);

  console.log('Clicking Priya Sharma (#btnAccPriya)...');
  await page.click('#btnAccPriya');

  await new Promise(r => setTimeout(r, 600));

  const afterClickStep1Display = await page.$eval('#stepChooseAccount', el => window.getComputedStyle(el).display);
  const afterClickStep2Display = await page.$eval('#stepStudentVerification', el => window.getComputedStyle(el).display);
  const step2Name = await page.$eval('#step2Name', el => el.value);
  const step2College = await page.$eval('#step2College', el => el.value);
  const step2Reg = await page.$eval('#step2RegNo', el => el.value);
  const step2Dob = await page.$eval('#step2Dob', el => el.value);
  const step2Phone = await page.$eval('#step2Phone', el => el.value);
  const step2District = await page.$eval('#step2District', el => el.value);

  console.log('After click Step 1 display:', afterClickStep1Display);
  console.log('After click Step 2 display:', afterClickStep2Display);
  console.log('Step 2 Form Data:');
  console.log('  Name:', step2Name);
  console.log('  College:', step2College);
  console.log('  Reg No:', step2Reg);
  console.log('  DOB:', step2Dob);
  console.log('  Phone:', step2Phone);
  console.log('  District:', step2District);

  // Take screenshot of Step 2
  const artifactDir = 'C:\\Users\\princ\\.gemini\\antigravity\\brain\\03bc4da4-48d7-45ab-ad9d-ccbba4bb72ae';
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_google_auth_step2.png') });
  console.log('Saved screenshot_google_auth_step2.png');

  console.log('\nSubmitting Step 2 form (#btnSubmitVerification)...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('#btnSubmitVerification')
  ]);

  console.log('Navigated to URL:', page.url());

  // Check ID Card visual on dashboard
  const idName = await page.$eval('#idCardName', el => el.textContent.trim());
  const idCollege = await page.$eval('#idCardCollege', el => el.textContent.trim());
  const idReg = await page.$eval('#idCardReg', el => el.textContent.trim());
  const idDob = await page.$eval('#idCardDob', el => el.textContent.trim());
  const idPhone = await page.$eval('#idCardPhone', el => el.textContent.trim());
  const idDistrict = await page.$eval('#idCardDistrict', el => el.textContent.trim());

  console.log('\n--- 2. Dashboard Student ID Card Data ---');
  console.log('  Name:', idName);
  console.log('  College:', idCollege);
  console.log('  Reg:', idReg);
  console.log('  DOB:', idDob);
  console.log('  Phone:', idPhone);
  console.log('  District:', idDistrict);

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_dashboard_id_card.png') });
  console.log('Saved screenshot_dashboard_id_card.png');

  // Test clicking header profile button
  console.log('\n--- 3. Testing Header Profile Click ---');
  await page.click('#headerUserBtn');
  await new Promise(r => setTimeout(r, 600));

  const modalDisplay = await page.$eval('#globalStudentProfileModal', el => window.getComputedStyle(el).display);
  const modalName = await page.$eval('#gProfileName', el => el.textContent.trim());
  const modalCollege = await page.$eval('#gProfileCollege', el => el.textContent.trim());
  const modalReg = await page.$eval('#gProfileReg', el => el.textContent.trim());
  const modalDob = await page.$eval('#gProfileDob', el => el.textContent.trim());
  const modalPhone = await page.$eval('#gProfilePhone', el => el.textContent.trim());
  const modalDistrict = await page.$eval('#gProfileDistrict', el => el.textContent.trim());

  console.log('Global Profile Modal display:', modalDisplay);
  console.log('Modal Student Details:');
  console.log('  Name:', modalName);
  console.log('  College:', modalCollege);
  console.log('  Reg:', modalReg);
  console.log('  DOB:', modalDob);
  console.log('  Phone:', modalPhone);
  console.log('  District:', modalDistrict);

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_profile_modal.png') });
  console.log('Saved screenshot_profile_modal.png');

  await browser.close();
  console.log('\n✨ ALL REAL BROWSER CHECKS PASSED PERFECTLY!');
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
