/**
 * Automated Verification: Phase 13 Admin Completeness, Deep-Link Hub & Campus Services
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 Starting Phase 13 Admin Completeness & Deep-Link Hub Verification');
console.log('================================================================\n');

let passCount = 0;
let totalCount = 0;

function it(desc, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${desc}`);
    console.error(`     Reason: ${err.message}`);
  }
}

const baseDir = path.resolve(__dirname, '..');
const adminHtml = fs.readFileSync(path.join(baseDir, 'admin.html'), 'utf-8');
const adminJs = fs.readFileSync(path.join(baseDir, 'assets/js/admin.js'), 'utf-8');
const toolsJs = fs.readFileSync(path.join(baseDir, 'assets/js/tools.js'), 'utf-8');
const dashHtml = fs.readFileSync(path.join(baseDir, 'dashboard.html'), 'utf-8');

console.log('1. Testing Admin Top Statistics Strip (8 Key Metrics):');
it('Contains all 8 top stat card element IDs', () => {
  const statIds = [
    'statOwnerSubs', 'statReviews', 'statReports', 'statVerifications',
    'statMarketplace', 'statFaculty', 'statDiscovered', 'statAcademicLinks'
  ];
  statIds.forEach(id => {
    assert(adminHtml.includes(`id="${id}"`), `Missing stat card ID: ${id}`);
  });
});

console.log('\n2. Testing Tab Category Switcher & Ergonomic Navigation:');
it('Contains tab category filter bar with 6 group buttons', () => {
  assert(adminHtml.includes('class="tab-category-filter-bar"'), 'Missing tab-category-filter-bar class');
  const cats = ['all', 'moderation', 'directory', 'academic', 'alerts', 'system'];
  cats.forEach(c => {
    assert(adminHtml.includes(`data-tab-cat="${c}"`), `Missing category button for: ${c}`);
  });
});

it('Contains 24 categorized admin navigation buttons', () => {
  const tabs = [
    'ownerSubmissionsTab', 'reviewsTab', 'reportsTab', 'marketplaceTab', 'feedbackTab', 'duplicatesTab',
    'locationTab', 'businessesTab', 'accommodationsTab', 'foodMessTab', 'facultyManagerTab', 'facilityManagerTab', 'correctionsTab',
    'academicPartnerTab', 'officialCrawlTab', 'expenseBenchmarksTab',
    'broadcastTab', 'noticesTab', 'communityTab', 'emergencyTransportTab', 'lostFoundTab',
    'analyticsTab', 'operationalTab', 'verificationsTab'
  ];
  assert.strictEqual(tabs.length, 24, 'Tab count must be exactly 24');
  tabs.forEach(tab => {
    assert(adminHtml.includes(`data-admin-tab="${tab}"`), `Missing tab button: ${tab}`);
  });
});

console.log('\n3. Testing New Tab Panels in admin.html:');
it('Contains academicPartnerTab panel with route search & health tester', () => {
  assert(adminHtml.includes('id="academicPartnerTab"'), 'Missing academicPartnerTab');
  assert(adminHtml.includes('id="partnerRoutesTableBody"'), 'Missing partnerRoutesTableBody');
  assert(adminHtml.includes('id="btnTestPartnerEndpoints"'), 'Missing btnTestPartnerEndpoints');
  assert(adminHtml.includes('id="chkPartnerBannerActive"'), 'Missing chkPartnerBannerActive');
  assert(adminHtml.includes('id="searchPartnerRoutes"'), 'Missing searchPartnerRoutes');
});

it('Contains expenseBenchmarksTab panel with rates form & history', () => {
  assert(adminHtml.includes('id="expenseBenchmarksTab"'), 'Missing expenseBenchmarksTab');
  assert(adminHtml.includes('id="expenseBenchmarksForm"'), 'Missing expenseBenchmarksForm');
  assert(adminHtml.includes('id="benchRentSingle"'), 'Missing benchRentSingle');
  assert(adminHtml.includes('id="benchRentShared"'), 'Missing benchRentShared');
  assert(adminHtml.includes('id="benchMess"'), 'Missing benchMess');
  assert(adminHtml.includes('id="benchmarksAuditHistoryTableBody"'), 'Missing benchmarksAuditHistoryTableBody');
});

it('Contains foodMessTab panel & foodMessModal', () => {
  assert(adminHtml.includes('id="foodMessTab"'), 'Missing foodMessTab');
  assert(adminHtml.includes('id="foodMessTableBody"'), 'Missing foodMessTableBody');
  assert(adminHtml.includes('id="foodMessModal"'), 'Missing foodMessModal');
  assert(adminHtml.includes('id="foodMessForm"'), 'Missing foodMessForm');
});

console.log('\n4. Testing Academic Partner Deep-Link Matrix in admin.js:');
it('Defines 42 distinct routes pointing to Apna College Bihar', () => {
  assert(adminJs.includes('const APNA_COLLEGE_PARTNER_ROUTES = ['), 'Missing APNA_COLLEGE_PARTNER_ROUTES array');
  const countMatch = adminJs.match(/route:\s*"([^"]+)"/g);
  assert(countMatch && countMatch.length === 42, `Expected 42 routes, found ${countMatch ? countMatch.length : 0}`);
});

it('Covers essential academic routes (syllabus, pyq, cgpa-calculator, attendance)', () => {
  assert(adminJs.includes('route: "/syllabus"'), 'Missing /syllabus');
  assert(adminJs.includes('route: "/pyq"'), 'Missing /pyq');
  assert(adminJs.includes('route: "/cgpa-calculator"'), 'Missing /cgpa-calculator');
  assert(adminJs.includes('route: "/attendance-tracker"'), 'Missing /attendance-tracker');
  assert(adminJs.includes('route: "/mentorship"'), 'Missing /mentorship');
});

console.log('\n5. Testing Student Expense Benchmarks & Tools Synchronization:');
it('Admin benchmark logic defines baseline parameters', () => {
  assert(adminJs.includes('const DEFAULT_EXPENSE_BENCHMARKS = {'), 'Missing DEFAULT_EXPENSE_BENCHMARKS');
  assert(adminJs.includes('rentSingle: 2500'), 'Default single rent should be 2500');
  assert(adminJs.includes('mess: 2400'), 'Default mess should be 2400');
});

it('Student tools calculator syncs with admin benchmark overrides in localStorage', () => {
  assert(toolsJs.includes("localStorage.getItem('gec_expense_benchmarks')"), 'tools.js should check for admin benchmark overrides');
  assert(toolsJs.includes("'expRent'"), 'tools.js should set expRent');
  assert(toolsJs.includes("'expMess'"), 'tools.js should set expMess');
});

console.log('\n6. Testing Student Dashboard Quick Badges:');
it('Dashboard banner contains direct badges to top Apna College Bihar tools', () => {
  assert(dashHtml.includes('https://www.apnacollegebihar.online/syllabus'), 'Dashboard should link to syllabus');
  assert(dashHtml.includes('https://www.apnacollegebihar.online/pyq'), 'Dashboard should link to pyq');
  assert(dashHtml.includes('https://www.apnacollegebihar.online/cgpa-calculator'), 'Dashboard should link to cgpa-calculator');
  assert(dashHtml.includes('https://www.apnacollegebihar.online/attendance-tracker'), 'Dashboard should link to attendance-tracker');
  assert(dashHtml.includes('https://www.apnacollegebihar.online/mentorship'), 'Dashboard should link to mentorship');
});

console.log('\n================================================================');
console.log(`📊 Test Summary: ${passCount} / ${totalCount} tests passed (${Math.round((passCount/totalCount)*100)}%)`);
console.log('================================================================');

if (passCount === totalCount) {
  console.log('🎉 ALL PHASE 13 ADMIN COMPLETENESS & PARTNER GATES PASSED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
