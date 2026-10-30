const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('assert');

// Create a simulated Google JWT ID Token for "Prince Kumar"
function createSimulatedGoogleJwt(email, name, picture) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    iss: 'https://accounts.google.com',
    sub: '109876543210987654321',
    azp: '818059891079-kh6vpef04bkov0ic1ajk7a5g100oaejt.apps.googleusercontent.com',
    aud: '818059891079-kh6vpef04bkov0ic1ajk7a5g100oaejt.apps.googleusercontent.com',
    email: email,
    email_verified: true,
    name: name,
    picture: picture || 'https://lh3.googleusercontent.com/a/default-user',
    given_name: name.split(' ')[0],
    family_name: name.split(' ').slice(1).join(' '),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64').replace(/=/g, '');
  const signature = 'simulated_google_signature_test';
  return `${header}.${payload}.${signature}`;
}

async function runTest() {
  console.log('================================================================');
  console.log('🧪 Testing Google OAuth Popup Login & 6 Student Fields Flow');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.text().includes('Google') || msg.text().includes('OAuth') || msg.text().includes('Profile')) {
      console.log('  [Browser Log]:', msg.text());
    }
  });

  console.log('1. Loading http://localhost:3000/login.html?force=1 ...');
  await page.goto('http://localhost:3000/login.html?force=1', { waitUntil: 'networkidle0' });

  // Clear previous session
  await page.evaluate(() => {
    localStorage.removeItem('gec_student_session');
  });
  await page.reload({ waitUntil: 'networkidle0' });

  console.log('2. Verifying Google Popup button presence...');
  const btnText = await page.$eval('#btnGoogleSignIn', el => el.innerText);
  console.log('  Button text found:\n' + btnText.split('\n').map(l => '    ' + l).join('\n'));
  assert(btnText.includes('Google'), 'Must include Google branding');

  console.log('\n3. Simulating Google OAuth Popup return via postMessage...');
  const testEmail = 'prince.kumar.beu@gmail.com';
  const testName = 'Prince Kumar';
  const mockJwt = createSimulatedGoogleJwt(testEmail, testName);
  const hashWithToken = `#id_token=${mockJwt}&access_token=mock_access_token_123&token_type=Bearer&expires_in=3600`;

  // Trigger the postMessage as if Google OAuth popup redirected to login.html and sent message
  await page.evaluate((hash) => {
    window.postMessage({
      type: 'GOOGLE_AUTH_POPUP_HASH',
      hash: hash
    }, window.location.origin);
  }, hashWithToken);

  // Wait for Onboarding Modal to appear
  console.log('4. Waiting for Student Identity Verification Modal (#profileOnboardModal)...');
  await page.waitForFunction(() => {
    const m = document.getElementById('profileOnboardModal');
    return m && window.getComputedStyle(m).display === 'flex';
  }, { timeout: 5000 });

  const modalName = await page.$eval('#onboardName', el => el.value);
  console.log('  ✓ Modal opened! Student name pre-filled from Google:', modalName);
  assert.strictEqual(modalName, 'Prince Kumar');

  console.log('\n5. Entering 6 Mandatory Student Identity Fields...');
  await page.select('#onboardCollege', 'Government Engineering College, Sheikhpura');
  await page.type('#onboardRegNo', '22105128099');
  await page.type('#onboardDob', '2003-05-15');
  await page.type('#onboardPhone', '9801234567');
  await page.select('#onboardDistrict', 'Sheikhpura');

  const artifactDir = 'C:\\Users\\princ\\.gemini\\antigravity\\brain\\03bc4da4-48d7-45ab-ad9d-ccbba4bb72ae';
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_popup_onboarding_modal.png') });
  console.log('  Saved artifact: screenshot_popup_onboarding_modal.png');

  console.log('\n6. Submitting Onboarding Form (#btnSaveOnboard)...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('#btnSaveOnboard')
  ]);

  console.log('  Navigated to:', page.url());
  assert(page.url().includes('dashboard.html'), 'Should land on dashboard.html');

  console.log('\n7. Verifying Student ID Card on Dashboard...');
  const cardName = await page.$eval('#idCardName', el => el.textContent.trim());
  const cardCollege = await page.$eval('#idCardCollege', el => el.textContent.trim());
  const cardReg = await page.$eval('#idCardReg', el => el.textContent.trim());
  const cardDob = await page.$eval('#idCardDob', el => el.textContent.trim());
  const cardPhone = await page.$eval('#idCardPhone', el => el.textContent.trim());
  const cardDistrict = await page.$eval('#idCardDistrict', el => el.textContent.trim());

  console.log('  ✓ ID Card Name:', cardName);
  console.log('  ✓ ID Card College:', cardCollege);
  console.log('  ✓ ID Card Reg No:', cardReg);
  console.log('  ✓ ID Card DOB:', cardDob);
  console.log('  ✓ ID Card Phone:', cardPhone);
  console.log('  ✓ ID Card District:', cardDistrict);

  assert(cardName.includes('Prince Kumar'), 'Card Name match');
  assert(cardCollege.includes('Government Engineering College, Sheikhpura'), 'Card College match');
  assert(cardReg.includes('22105128099'), 'Card Reg match');
  assert(cardPhone.includes('9801234567'), 'Card Phone match');
  assert(cardDistrict.includes('Sheikhpura'), 'Card District match');

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_popup_dashboard_verified.png') });
  console.log('  Saved artifact: screenshot_popup_dashboard_verified.png');

  console.log('\n8. Verifying Header Profile click opens Student Profile Modal...');
  await page.click('#headerUserBtn');
  await new Promise(r => setTimeout(r, 600));

  const gModalDisplay = await page.$eval('#globalStudentProfileModal', el => window.getComputedStyle(el).display);
  const gName = await page.$eval('#gProfileName', el => el.textContent.trim());
  const gCollege = await page.$eval('#gProfileCollege', el => el.textContent.trim());
  const gReg = await page.$eval('#gProfileReg', el => el.textContent.trim());
  const gDob = await page.$eval('#gProfileDob', el => el.textContent.trim());
  const gPhone = await page.$eval('#gProfilePhone', el => el.textContent.trim());
  const gDistrict = await page.$eval('#gProfileDistrict', el => el.textContent.trim());

  console.log('  ✓ Header Modal display:', gModalDisplay);
  console.log('  ✓ Header Modal Name:', gName);
  console.log('  ✓ Header Modal College:', gCollege);
  console.log('  ✓ Header Modal Reg:', gReg);
  console.log('  ✓ Header Modal DOB:', gDob);
  console.log('  ✓ Header Modal Phone:', gPhone);
  console.log('  ✓ Header Modal District:', gDistrict);

  assert(gName.includes('Prince Kumar'), 'gName match');
  assert(gCollege.includes('Government Engineering College, Sheikhpura'), 'gCollege match');
  assert(gReg.includes('22105128099'), 'gReg match');

  await page.screenshot({ path: path.join(artifactDir, 'screenshot_popup_header_modal.png') });
  console.log('  Saved artifact: screenshot_popup_header_modal.png');

  await browser.close();
  console.log('\n================================================================');
  console.log('🎉 POPUP GOOGLE LOGIN & 6 STUDENT FIELDS VERIFICATION PASSED 100%!');
  console.log('================================================================');
}

runTest().catch(err => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
