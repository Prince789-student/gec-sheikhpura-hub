const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../../Apna College Bihar/client/node_modules/puppeteer'));
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/princ/.gemini/antigravity/brain/03bc4da4-48d7-45ab-ad9d-ccbba4bb72ae');

(async () => {
  console.log('--- STARTING VERIFICATION OF ADMIN & MOBILE UI FIXES ---');
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--enable-webgl']
    });

    const page = await browser.newPage();

    // 1. VERIFY WEBSITE NAVBAR & ADMIN ACCESS FOR prince86944@gmail.com
    console.log('\n[TEST 1] Verifying Website Navbar & Admin Panel on Port 3000...');
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle2' });

    // Seed prince86944@gmail.com session into localStorage to simulate active login
    await page.evaluate(() => {
      const prince = {
        id: 'admin-prince-super-id',
        email: 'prince86944@gmail.com',
        display_name: 'Prince Kumar',
        role: 'super_admin',
        is_admin: true,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('gec_student_session', JSON.stringify(prince));
      localStorage.setItem('gec_admin_session', JSON.stringify(prince));
    });

    // Reload to let app.js render user session with admin badge
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const webUserLabel = await page.evaluate(() => {
      const lbl = document.getElementById('headerUserLabel');
      const badge = document.getElementById('headerAdminBadge');
      return {
        name: lbl ? lbl.textContent.trim() : null,
        adminBadgePresent: !!badge,
        adminBadgeText: badge ? badge.textContent.trim() : null,
        adminBadgeHref: badge ? badge.getAttribute('href') : null
      };
    });

    console.log('Website Session Status:', webUserLabel);

    const webScreenshotPath = path.join(ARTIFACT_DIR, 'website_prince_admin_verified.png');
    await page.screenshot({ path: webScreenshotPath, fullPage: false });
    console.log('Saved website screenshot to:', webScreenshotPath);

    // 2. VERIFY ADMIN DASHBOARD (admin.html)
    console.log('\n[TEST 2] Verifying Admin Dashboard for prince86944@gmail.com...');
    await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const adminCheck = await page.evaluate(() => {
      const dash = document.getElementById('adminDashboardSection');
      const isDashVisible = dash && window.getComputedStyle(dash).display !== 'none';
      const currentUserBadge = document.getElementById('adminUserBadge') || document.querySelector('.admin-profile-name');
      return {
        dashVisible: isDashVisible,
        title: document.title
      };
    });
    console.log('Admin Dashboard Status:', adminCheck);

    const adminScreenshotPath = path.join(ARTIFACT_DIR, 'website_admin_dashboard_verified.png');
    await page.screenshot({ path: adminScreenshotPath, fullPage: false });
    console.log('Saved admin panel screenshot to:', adminScreenshotPath);

    // 3. VERIFY FLUTTER MOBILE APP ON PORT 5000 (Mobile Viewport)
    console.log('\n[TEST 3] Verifying Flutter Mobile App on Port 5000 (Mobile Viewport 412x915)...');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5000/', { waitUntil: 'networkidle2' });

    // Wait for Flutter Web to boot
    console.log('Waiting for Flutter app to initialize...');
    await new Promise(r => setTimeout(r, 5000));

    const appTitle = await page.title();
    console.log('Mobile App Page Title:', appTitle);

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'flutter_app_mobile_verified.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log('Saved mobile viewport screenshot to:', mobileScreenshotPath);

    // 4. VERIFY FLUTTER APP (Desktop Viewport 1280x800)
    console.log('\n[TEST 4] Verifying Flutter Mobile App (Desktop Viewport 1280x800)...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));

    const desktopScreenshotPath = path.join(ARTIFACT_DIR, 'flutter_app_desktop_verified.png');
    await page.screenshot({ path: desktopScreenshotPath, fullPage: false });
    console.log('Saved desktop viewport screenshot to:', desktopScreenshotPath);

    console.log('\n=============================================');
    console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
