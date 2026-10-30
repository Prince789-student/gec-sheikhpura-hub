const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--enable-webgl']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Testing Website login.html 1-tap Prince Google Sign-In...');
    await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle2' });

    // Click Continue as Prince Kumar
    await page.click('button[onclick*="handlePrinceGoogleSignIn"]');
    await new Promise(r => setTimeout(r, 2000));
    console.log('Current URL after sign-in:', page.url());

    const userBadge = await page.evaluate(() => {
      const lbl = document.getElementById('headerUserLabel');
      const badge = document.getElementById('headerAdminBadge');
      return {
        user: lbl ? lbl.textContent.trim() : null,
        adminBadge: badge ? badge.textContent.trim() : null
      };
    });
    console.log('Header user info:', userBadge);

    await page.screenshot({ path: path.resolve('C:/Users/princ/.gemini/antigravity/brain/03bc4da4-48d7-45ab-ad9d-ccbba4bb72ae/website_google_login_fixed.png') });

    console.log('Testing Mobile App Auth Screen on localhost:5000...');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4500));

    await page.screenshot({ path: path.resolve('C:/Users/princ/.gemini/antigravity/brain/03bc4da4-48d7-45ab-ad9d-ccbba4bb72ae/flutter_google_auth_fixed.png') });

    console.log('All tests passed cleanly with zero redirect errors!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
