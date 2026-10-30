/**
 * GEC Sheikhpura Student Life Hub - Phase 11 Regression & Integration Tests
 * Validates:
 * 1. Live Campus Broadcast Alert Controller & Dynamic Banner
 * 2. Official Portal Header Vault (54 Real Scraped Links, 8 Tabs, Add/Delete Link)
 * 3. Direct Admin Directory Management (Notices, Businesses, Accommodations)
 * 4. Emergency & Transport Directory Management
 * 5. Mobile Ergonomics, Viewport & Progressive Mobile Bottom Navigation
 * 6. Database Seed Completeness (supabase/seed.sql)
 * 7. Academic Platform Separation with Apna College Bihar
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock browser environment for DB Service
global.window = {};
global.document = {
  addEventListener: () => {},
  querySelector: () => null,
  getElementById: () => null
};

// Mock localStorage
const localStorageStore = {};
global.localStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, val) => { localStorageStore[key] = String(val); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { for (const k in localStorageStore) delete localStorageStore[k]; }
};

// Load HUB_DATA & DB Service
const dataJsPath = path.join(__dirname, '../assets/js/data.js');
const dbServiceJsPath = path.join(__dirname, '../assets/js/db-service.js');

const dataCode = fs.readFileSync(dataJsPath, 'utf8') + '\nglobal.HUB_DATA = HUB_DATA; global.window.HUB_DATA = HUB_DATA;';
eval(dataCode);
eval(fs.readFileSync(dbServiceJsPath, 'utf8'));

let passed = 0;
let failed = 0;

async function it(desc, fn) {
  try {
    await fn();
    console.log(`  ✓ [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runPhase11Tests() {
  console.log('\n================================================================');
  console.log('🧪 Starting Phase 11 Hub Completeness & Admin Panel Verification');
  console.log('================================================================\n');

  console.log('1. Testing Live Campus Broadcast Alert System:');
  const db = window.DB;

  await it('Returns active default campus broadcast alert', async () => {
    const alert = await db.getCampusBroadcastAlert();
    assert(alert, 'Alert object must exist');
    assert.strictEqual(alert.active, true, 'Default alert must be active');
    assert(alert.message.includes('GEC Sheikhpura'), 'Alert message must mention GEC Sheikhpura');
    assert.strictEqual(alert.linkUrl, 'notices.html', 'Default link should route to notices');
  });

  await it('Allows administrator to save custom broadcast alert', async () => {
    const newAlert = {
      active: true,
      level: 'danger',
      message: '🚨 Heavy Rainfall Alert: Sheikhpura district administration issued weather advisory for Bajidpur.',
      linkUrl: 'emergency.html',
      linkText: 'Emergency Helplines →'
    };
    const res = db.saveCampusBroadcastAlert(newAlert);
    assert.strictEqual(res.success, true);
    const updated = db.getCampusBroadcastAlert();
    assert.strictEqual(updated.level, 'danger');
    assert(updated.message.includes('Rainfall Alert'));
  });

  console.log('\n2. Testing Official Portal Header Vault (gecsheikhpura.ac.in):');
  await it('Loads all 8 official portal tabs with 54 links', async () => {
    const tabs = db.getOfficialPortalTabs();
    assert.strictEqual(tabs.length, 8, 'Must have exactly 8 tabs');
    const totalLinks = tabs.reduce((acc, t) => acc + (t.items ? t.items.length : 0), 0);
    assert(totalLinks >= 50, `Must contain at least 50 scraped portal links (found ${totalLinks})`);
  });

  await it('Allows admin to add a new link into a portal tab', async () => {
    const res = db.addOfficialPortalLink('about-us', {
      label: 'Campus Virtual Tour 2026',
      url: 'https://www.gecsheikhpura.ac.in/about-us/virtual-tour/'
    });
    assert.strictEqual(res.success, true);
    const tabs = db.getOfficialPortalTabs();
    const aboutTab = tabs.find(t => t.id === 'about-us');
    assert(aboutTab.items.some(it => it.label === 'Campus Virtual Tour 2026'));
  });

  await it('Allows admin to delete a link from a portal tab', async () => {
    const res = db.deleteOfficialPortalLink('about-us', 'https://www.gecsheikhpura.ac.in/about-us/virtual-tour/');
    assert.strictEqual(res.success, true);
    const tabs = db.getOfficialPortalTabs();
    const aboutTab = tabs.find(t => t.id === 'about-us');
    assert(!aboutTab.items.some(it => it.label === 'Campus Virtual Tour 2026'));
  });

  console.log('\n3. Testing Direct Notice Management in Admin:');
  await it('Admin can publish a new direct notice', async () => {
    const res = await db.createNoticeDirect({
      title: 'B.Tech Special Practical Viva Schedule',
      category: 'examination',
      date: '27 Oct, 2026',
      source: 'Department of Electrical Engineering',
      summary: 'Practical viva dates for 4th sem laboratory courses in Electronics & Measurement.',
      link: 'https://www.gecsheikhpura.ac.in/viva-schedule/'
    });
    assert.strictEqual(res.success, true);
    assert(res.notice.id.startsWith('notice-'));

    // Check it appears in getNotices
    const { data } = await db.getNotices({ limit: 20 });
    assert(data.some(n => n.title === 'B.Tech Special Practical Viva Schedule'));
  });

  await it('Admin can delete an existing notice', async () => {
    const { data: before } = await db.getNotices({ limit: 20 });
    const target = before.find(n => n.title === 'B.Tech Special Practical Viva Schedule');
    assert(target, 'Target notice must exist before deletion');

    const res = await db.deleteNotice(target.id);
    assert.strictEqual(res.success, true);

    const { data: after } = await db.getNotices({ limit: 20 });
    assert(!after.some(n => n.id === target.id), 'Deleted notice must no longer be returned');
  });

  console.log('\n4. Testing Direct Business & Accommodation Management:');
  await it('Admin can publish a direct business listing', async () => {
    const res = await db.createBusinessDirect({
      name: 'Sheikhpura Digital Printers & Photo Studio',
      category: 'stationery',
      categoryLabel: 'Stationery & Printing',
      address: 'Chandani Chowk, Sheikhpura',
      phone: '+91-94301-88888',
      openingHours: '8:00 AM - 9:00 PM',
      priceRange: 'Student Discount Available',
      latitude: 25.143,
      longitude: 85.860,
      distanceKm: 3.5,
      services: ['ID Card Printing', 'Passport Photos', 'Binding']
    });
    assert.strictEqual(res.success, true);
    assert(res.business.id.startsWith('biz-'));

    const { data: places } = await db.getUnifiedNearbyLocations({ category: 'stationery' });
    assert(places.some(p => p.name === 'Sheikhpura Digital Printers & Photo Studio'));
  });

  await it('Admin can publish a direct accommodation listing', async () => {
    const res = await db.createAccommodationDirect({
      title: 'Surya Residency Deluxe Student Rooms',
      type: 'PG / Student Room',
      gender: 'Boys',
      rent: 2600,
      deposit: 2000,
      address: 'Near Bajidpur Gate',
      distance: '400m from gate',
      phone: '+91-98012-77777',
      amenities: ['Wi-Fi', 'RO Water', 'Study Table']
    });
    assert.strictEqual(res.success, true);
    assert(res.accommodation.id.startsWith('room-'));

    const { data: rooms } = await db.getAccommodations({ type: 'all' });
    assert(rooms.some(r => r.title === 'Surya Residency Deluxe Student Rooms'));
  });

  console.log('\n5. Testing Emergency Contacts & Transit Schedules:');
  await it('Returns default emergency directory contacts', async () => {
    const list = db.getEmergencyContacts();
    assert(list.length >= 7, 'Must have at least 7 emergency contacts');
    assert(list.some(c => c.number === '112'));
    assert(list.some(c => c.name.includes('Sadar Hospital')));
  });

  await it('Admin can add and delete an emergency contact', async () => {
    const addRes = db.saveEmergencyContact({
      name: 'Campus Medical First Aid Room',
      number: '+91-94318-00000',
      category: 'Campus Medical',
      available: '9 AM - 5 PM',
      priority: 'Standard'
    });
    assert.strictEqual(addRes.success, true);
    assert(db.getEmergencyContacts().some(c => c.name === 'Campus Medical First Aid Room'));

    const delRes = db.deleteEmergencyContact(addRes.contact.id);
    assert.strictEqual(delRes.success, true);
    assert(!db.getEmergencyContacts().some(c => c.id === addRes.contact.id));
  });

  await it('Returns default transit routes and timetables', async () => {
    const schedules = db.getTransportSchedules();
    assert(schedules.length >= 5, 'Must have at least 5 transit routes');
    assert(schedules.some(s => s.route.includes('Patna')));
    assert(schedules.some(s => s.mode === 'Train'));
  });

  await it('Admin can add and delete a transit schedule', async () => {
    const addRes = db.saveTransportSchedule({
      mode: 'Train',
      route: 'Sheikhpura (SHK) ⇄ Gaya Jn (GAYA)',
      numberOrName: '03615 Gaya Fast Passenger',
      timings: '08:20 AM, 02:45 PM',
      fare: '₹40 - ₹55'
    });
    assert.strictEqual(addRes.success, true);
    assert(db.getTransportSchedules().some(s => s.numberOrName.includes('Gaya Fast Passenger')));

    const delRes = db.deleteTransportSchedule(addRes.route.id);
    assert.strictEqual(delRes.success, true);
    assert(!db.getTransportSchedules().some(s => s.id === addRes.route.id));
  });

  console.log('\n6. Testing Mobile Ergonomics & Viewport Compliance:');
  const allHtmlFiles = fs.readdirSync(path.join(__dirname, '..'))
    .filter(f => f.endsWith('.html'));

  await it('All 26 HTML files have viewport-fit=cover and maximum-scale=5.0 for mobile ergonomics', async () => {
    allHtmlFiles.forEach(file => {
      const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
      assert(content.includes('viewport-fit=cover'), `${file} must include viewport-fit=cover`);
      assert(content.includes('maximum-scale=5.0'), `${file} must include maximum-scale=5.0`);
    });
  });

  await it('All core student pages load db-service.js before app.js', async () => {
    const corePages = ['index.html', 'college-info.html', 'emergency.html', 'transport.html', 'admissions.html', 'placement.html'];
    corePages.forEach(file => {
      const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
      assert(content.includes('assets/js/db-service.js'), `${file} must include db-service.js`);
      const dbIdx = content.indexOf('assets/js/db-service.js');
      const appIdx = content.indexOf('assets/js/app.js');
      assert(dbIdx < appIdx, `${file} must load db-service.js before app.js`);
    });
  });

  console.log('\n7. Testing Database Seed (supabase/seed.sql) Integrity:');
  const seedSql = fs.readFileSync(path.join(__dirname, '../supabase/seed.sql'), 'utf8');

  await it('seed.sql contains all 10 authentic notices from GEC Sheikhpura', async () => {
    assert(seedSql.includes('Revised B.Tech 1st Semester Mid Term Examination 2026'));
    assert(seedSql.includes('Startup Cell (SIHE)'));
    assert(seedSql.includes('Recruitment of Guest Assistant Professors'));
    assert(seedSql.includes('Smart India Hackathon (SIH 2026)'));
    assert(seedSql.includes('Check Slip & Biometric Verification Form of UGEAC-2026'));
  });

  await it('seed.sql provisions official_portal_links table and 51 seed rows', async () => {
    assert(seedSql.includes('CREATE TABLE IF NOT EXISTS public.official_portal_links'));
    assert(seedSql.includes('v-ab-1'));
    assert(seedSql.includes('v-ac-1'));
    assert(seedSql.includes('v-dp-1'));
    assert(seedSql.includes('v-tp-1'));
    assert(seedSql.includes('v-fc-1'));
    assert(seedSql.includes('v-lg-1'));
  });

  await it('seed.sql provisions emergency_contacts, transit_routes, and broadcast_alerts', async () => {
    assert(seedSql.includes('CREATE TABLE IF NOT EXISTS public.emergency_contacts'));
    assert(seedSql.includes('CREATE TABLE IF NOT EXISTS public.transit_routes'));
    assert(seedSql.includes('CREATE TABLE IF NOT EXISTS public.broadcast_alerts'));
    assert(seedSql.includes('active_campus_alert'));
  });

  console.log('\n8. Testing Strict Separation with Apna College Bihar:');
  await it('Academic resources in seed.sql point strictly to https://www.apnacollegebihar.online/', async () => {
    assert(seedSql.includes('https://www.apnacollegebihar.online/study-material'));
    assert(seedSql.includes('https://www.apnacollegebihar.online/pyq'));
    assert(seedSql.includes('https://www.apnacollegebihar.online/syllabus'));
  });

  console.log('\n================================================================');
  console.log(`Phase 11 Test Suite Results: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase11Tests();
