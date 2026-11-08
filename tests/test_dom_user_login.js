const puppeteer = require('puppeteer-core');

(async () => {
  console.log('====================================================');
  console.log('  STARTING COMPREHENSIVE USER DOM LOGIN TEST');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err.message));

  // --- TEST 1: Super Admin Login via DOM on Website ---
  console.log('\n--- TEST 1: Super Admin (pk3334238@gmail.com) Login via Website DOM ---');
  await page.goto('http://localhost:5000/login.html?notice=logout', { waitUntil: 'networkidle0' });

  console.log('Clicking "Continue with Google" button (#btnSingleGoogleSignIn)...');
  await page.click('#btnSingleGoogleSignIn');
  await new Promise(r => setTimeout(r, 600));

  // If fallback options appeared (since popup closes in headless/localhost), click Prince Kumar
  const princeBtn = await page.$('#btnQuickPrinceAdmin');
  if (princeBtn) {
    console.log('Fallback options displayed. Clicking "👑 Continue as Prince Kumar (Super Admin)"...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Navigation event:', e.message)),
      princeBtn.click()
    ]);
  } else {
    // Wait for any direct redirect
    await new Promise(r => setTimeout(r, 1500));
  }

  const currentUrlAdmin = page.url();
  console.log('URL after Admin Login:', currentUrlAdmin);
  if (currentUrlAdmin.includes('admin.html')) {
    console.log('>>> SUCCESS: Super Admin redirected to admin.html correctly!');
  } else {
    console.error('>>> FAILED: Did not reach admin.html. Current URL:', currentUrlAdmin);
  }

  // --- TEST 2: Student Login via DOM on Website ---
  console.log('\n--- TEST 2: Student Login via Website DOM ---');
  await page.goto('http://localhost:5000/login.html?notice=logout', { waitUntil: 'networkidle0' });

  console.log('Clicking "Continue with Google" button (#btnSingleGoogleSignIn)...');
  await page.click('#btnSingleGoogleSignIn');
  await new Promise(r => setTimeout(r, 600));

  const studentBtn = await page.$('#btnQuickStudentUser');
  if (studentBtn) {
    console.log('Fallback options displayed. Clicking "🎓 Continue as Student Account"...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Navigation event:', e.message)),
      studentBtn.click()
    ]);
  } else {
    await new Promise(r => setTimeout(r, 1500));
  }

  const currentUrlStudent = page.url();
  console.log('URL after Student Login:', currentUrlStudent);
  if (currentUrlStudent.includes('dashboard.html')) {
    console.log('>>> SUCCESS: Student redirected to dashboard.html correctly!');
  } else {
    console.error('>>> FAILED: Did not reach dashboard.html. Current URL:', currentUrlStudent);
  }

  // --- TEST 3: Custom Google Email Input on Website ---
  console.log('\n--- TEST 3: Custom Google Email Input on Website DOM ---');
  await page.goto('http://localhost:5000/login.html?notice=logout', { waitUntil: 'networkidle0' });
  await page.click('#btnSingleGoogleSignIn');
  await new Promise(r => setTimeout(r, 600));

  const emailInput = await page.$('#customAlertEmail');
  const submitBtn = await page.$('#btnQuickCustomSubmit');
  if (emailInput && submitBtn) {
    console.log('Typing custom email "rahul.bihar@gmail.com"...');
    await emailInput.type('rahul.bihar@gmail.com');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Navigation event:', e.message)),
      submitBtn.click()
    ]);
    console.log('URL after Custom Email Login:', page.url());
  }

  await browser.close();
  console.log('\n====================================================');
  console.log('  WEBSITE DOM LOGIN TESTS COMPLETE');
  console.log('====================================================');
})();
