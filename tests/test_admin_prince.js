const puppeteer = require('puppeteer-core');
const assert = require('assert');

(async () => {
  console.log('Testing GEC Sheikhpura Hub admin.html for prince86944@gmail.com...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });

  // Clear previous session
  await page.evaluate(() => localStorage.removeItem('gec_admin_session'));
  await page.reload({ waitUntil: 'networkidle0' });

  // Verify auth section is visible
  const authDisplay = await page.$eval('#adminAuthSection', el => window.getComputedStyle(el).display);
  console.log('Auth section display:', authDisplay);
  assert.strictEqual(authDisplay, 'block');

  // Click 1-Click Super Admin Login button
  console.log('Clicking 1-Click Super Admin login button...');
  await page.click('button[onclick="loginAsPrinceAdmin()"]');
  await new Promise(r => setTimeout(r, 600));

  // Verify Dashboard section is visible
  const dashDisplay = await page.$eval('#adminDashboardSection', el => window.getComputedStyle(el).display);
  console.log('Dashboard section display after login:', dashDisplay);
  assert.strictEqual(dashDisplay, 'block');

  const session = await page.evaluate(() => JSON.parse(localStorage.getItem('gec_admin_session') || '{}'));
  console.log('Admin session data:', session);
  assert.strictEqual(session.email, 'prince86944@gmail.com');
  assert.strictEqual(session.role, 'super_admin');

  await browser.close();
  console.log('🎉 GEC Sheikhpura Hub admin.html verified successfully for prince86944@gmail.com!');
})();
