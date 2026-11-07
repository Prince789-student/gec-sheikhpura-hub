const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('=== STARTING AUTOMATED LIVE DOM & BEHAVIOR AUDIT ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  console.log('\n[1] Loading http://localhost:5000/login.html ...');
  await page.goto('http://localhost:5000/login.html', { waitUntil: 'networkidle0' });

  // 1. Audit Header Navigation Dropdowns
  console.log('\n[2] Testing Header Folder Dropdowns...');
  const dropdownTriggers = await page.$$('.nav-dropdown .dropdown-trigger');
  console.log(`Found ${dropdownTriggers.length} folder dropdown triggers.`);

  for (let i = 0; i < dropdownTriggers.length; i++) {
    const trigger = dropdownTriggers[i];
    const triggerText = await page.evaluate(el => el.innerText.trim(), trigger);
    console.log(`Testing click on folder: "${triggerText}"...`);

    // Click trigger
    await trigger.click();
    await new Promise(r => setTimeout(r, 200));

    // Check if parent has .open class
    const isOpen = await page.evaluate(el => {
      const parent = el.closest('.nav-dropdown');
      const menu = parent.querySelector('.dropdown-menu');
      const style = window.getComputedStyle(menu);
      return {
        hasOpenClass: parent.classList.contains('open'),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity
      };
    }, trigger);

    console.log(` -> Folder "${triggerText}" state after click:`, JSON.stringify(isOpen));
    if (!isOpen.hasOpenClass || isOpen.display === 'none') {
      console.error(`FAILED: Folder "${triggerText}" did not stick open!`);
    } else {
      console.log(`SUCCESS: Folder "${triggerText}" is sticking open (display: ${isOpen.display})`);
    }
  }

  // Click outside to test closing
  console.log('\nTesting click outside to close dropdowns...');
  await page.click('body', { offset: { x: 10, y: 10 } });
  await new Promise(r => setTimeout(r, 200));
  const anyOpen = await page.evaluate(() => document.querySelectorAll('.nav-dropdown.open').length);
  console.log('Open dropdowns count after clicking outside:', anyOpen);

  // 2. Audit Continue with Google Button
  console.log('\n[3] Testing "Continue with Google" button behavior...');
  const googleBtn = await page.$('#btnSingleGoogleSignIn');
  if (!googleBtn) {
    console.error('FAILED: #btnSingleGoogleSignIn not found in DOM!');
  } else {
    console.log('Found #btnSingleGoogleSignIn. Clicking it now...');
    await googleBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Check modal or popup state
    const authModalState = await page.evaluate(() => {
      const modal = document.getElementById('googleDirectAuthModal');
      const alertBox = document.getElementById('authAlert');
      return {
        hasModal: Boolean(modal),
        modalDisplay: modal ? window.getComputedStyle(modal).display : null,
        modalText: modal ? modal.innerText : null,
        alertText: alertBox ? alertBox.innerText : null,
        alertDisplay: alertBox ? window.getComputedStyle(alertBox).display : null
      };
    });

    console.log('Google Auth Click Result:', JSON.stringify(authModalState, null, 2));

    // If modal appeared, test clicking Prince Kumar (Super Admin) account
    if (authModalState.hasModal) {
      console.log('\nTesting 1-click select on Prince Kumar Admin account...');
      const adminBtn = await page.$('button[onclick*="pk3334238@gmail.com"]');
      if (adminBtn) {
        console.log('Clicking Prince Kumar admin button...');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(e => console.log('Navigation event:', e.message)),
          adminBtn.click()
        ]);
        console.log('Current URL after admin Google selection:', page.url());
      }
    }
  }

  // 3. Test Student Google login flow
  console.log('\n[4] Testing Student User Google Login Flow...');
  await page.goto('http://localhost:5000/login.html?notice=logout', { waitUntil: 'networkidle0' });
  await page.click('#btnSingleGoogleSignIn');
  await new Promise(r => setTimeout(r, 400));
  const studentBtn = await page.$('button[onclick*="student.gec@gmail.com"]');
  if (studentBtn) {
    console.log('Clicking Student Account selection...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(e => console.log('Navigation event:', e.message)),
      studentBtn.click()
    ]);
    console.log('Current URL after Student Google selection:', page.url());
  }

  await browser.close();
  console.log('\n=== AUDIT COMPLETE ===');
})();
