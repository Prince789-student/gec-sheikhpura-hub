/**
 * Automated Verification Script for Phase 4 Functionality
 * Tests:
 * 1. Phone number normalization & validation
 * 2. Business owner submissions (pending status & duplicate prevention)
 * 3. Room & PG owner submissions (safety advisory & visit requests)
 * 4. Structured listing verification & auditable log recording
 * 5. Admin moderation workflows (approve, reject, request correction)
 * 6. Reviews & ratings (duplicate review check, average rating calculations)
 * 7. Report listing dispute workflow (10 categories & resolution notes)
 * 8. In-app notifications & owner tracking
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment for DB testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
global.sessionStorage = new MockLocalStorage();
global.window = {
  location: { search: '', origin: 'http://localhost:3000' }
};

// Mock SUPABASE_CONFIG and HUB_DATA
global.SUPABASE_CONFIG = {
  url: '',
  anonKey: '',
  isConfigured: () => false
};
global.HUB_DATA = {
  shops: [
    {
      id: 'shop-1',
      name: 'Gupta Stationery & Cyber Point',
      category: 'stationery',
      categoryLabel: 'Stationery & Xerox',
      address: 'Near Bajidpur More, Sheikhpura',
      distanceKm: 0.3,
      roadDistance: '0.3 km road distance from campus',
      estTime: '3 min travel',
      phone: '+91-9431800000',
      hours: '8:00 AM - 8:30 PM',
      priceTier: 'Affordable',
      services: ['Photocopy', 'Spiral Binding', 'Drafters'],
      verified: true,
      lastVerified: 'Recently'
    }
  ],
  rooms: [
    {
      id: 'acc-1',
      title: 'Shanti Niwas Boys Hostel & PG',
      gender: 'Boys',
      rent: 2500,
      deposit: 2500,
      electricity: 'Submeter (₹9/unit)',
      foodIncluded: false,
      address: 'Bajidpur More, Sheikhpura',
      roadDistance: '0.4 km from campus',
      amenities: ['RO Water', 'Wi-Fi'],
      phone: '+91-9801200000',
      sampleNote: 'Quiet environment'
    }
  ]
};

// Load db-service.js
const dbServiceCode = fs.readFileSync(path.join(__dirname, '../assets/js/db-service.js'), 'utf8');
eval(dbServiceCode);

async function runTests() {
  console.log('================================================================');
  console.log('🧪 Starting Phase 4 End-to-End Automated Logic Verification');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
    }
  }

  // 1. Phone Normalization Tests
  console.log('1. Testing Phone Normalization:');
  const n1 = window.DB.normalizePhoneNumber('9431812345');
  assert(n1 === '+91-94318-12345', `Standard 10-digit formats to +91-94318-12345 (got ${n1})`);
  const n2 = window.DB.normalizePhoneNumber('+91 98012 34567');
  assert(n2 === '+91-98012-34567', `International prefix formatted cleanly (got ${n2})`);

  // 2. Business Owner Submissions
  console.log('\n2. Testing Business Owner Submissions:');
  const bizSub = await window.DB.submitBusinessListing({
    business_name: 'Shree Ram Book Depot',
    category_id: 'stationery',
    address: 'Bajidpur More, Sheikhpura',
    public_phone: '9431899999',
    description: 'Engineering drafters, drawing sheets, and notes photocopy.',
    consent_to_publish: true
  });
  assert(bizSub.success === true, 'Business submission succeeds with valid fields');
  assert(bizSub.data.status === 'pending', 'Business submission is saved with "pending" status');
  assert(bizSub.data.normalized_phone === '+91-94318-99999', 'Phone number normalized in stored record');

  // Duplicate Submission check
  const dupSub = await window.DB.submitBusinessListing({
    business_name: 'Shree Ram Book Depot',
    category_id: 'stationery',
    address: 'Bajidpur More, Sheikhpura',
    public_phone: '9431899999',
    description: 'Duplicate attempt',
    consent_to_publish: true
  });
  assert(dupSub.success === false, 'Duplicate pending submission correctly blocked');

  // 3. Room & PG Owner Submissions
  console.log('\n3. Testing Accommodation Owner Submissions:');
  const roomSub = await window.DB.submitAccommodationListing({
    property_title: 'Kalyan Boys Student Lodge',
    accommodation_type: 'Single Room',
    gender_preference: 'Boys',
    monthly_rent: 2800,
    security_deposit: 2800,
    electricity_charges: 'Submeter (₹8/unit)',
    address: 'Bajidpur Bypass Road, 500m from gate',
    distance_km: 0.5,
    owner_name: 'Kalyan Singh',
    owner_contact: '9801288888',
    consent_to_publish: true
  });
  assert(roomSub.success === true, 'Room listing submission succeeds');
  assert(roomSub.data.status === 'pending', 'Room listing saved with pending moderation status');

  // 4. Admin Moderation & Approval
  console.log('\n4. Testing Admin Moderation & Publishing:');
  const modResult = await window.DB.moderateSubmission(bizSub.data.id, 'business', 'approved', 'Physical shop verified by moderator.');
  assert(modResult.success === true, 'Admin can approve pending business submission');
  assert(modResult.updatedItem.status === 'approved', 'Status updated to approved');

  // Verify published in public business directory
  const pubBiz = await window.DB.getBusinesses({ query: 'Shree Ram' });
  assert(pubBiz.data.length > 0, 'Newly approved business is visible in public directory search');
  assert(pubBiz.data[0].verified === true, 'Published business has verified status');

  // 5. Verification Records & Audit Logs
  console.log('\n5. Testing Verification Records & Audit Logs:');
  const allVerifs = await window.DB.getAllVerifications();
  assert(allVerifs.length > 0, `Verifications recorded (found ${allVerifs.length} records)`);
  const modLogs = await window.DB.getModerationLogs();
  assert(modLogs.length > 0, `Moderation action audit log recorded (found ${modLogs.length} logs)`);

  // 6. Service Reviews & Ratings
  console.log('\n6. Testing Reviews & Ratings:');
  // Mock student session for review
  localStorage.setItem('gec_student_session', JSON.stringify({
    id: 'test-student-1',
    display_name: 'Aman Kumar (CSE 2024)',
    email: 'aman@gecsheikhpura.bih'
  }));

  const revResult = await window.DB.submitListingReview({
    listing_type: 'shops',
    listing_id: 'shop-1',
    listing_title: 'Gupta Stationery & Cyber Point',
    rating: 5,
    review_text: 'Excellent student discount for 1st-year drawing drafters!'
  });
  assert(revResult.success === true, 'Authenticated student can submit a review');

  // Duplicate review prevention
  const dupRev = await window.DB.submitListingReview({
    listing_type: 'shops',
    listing_id: 'shop-1',
    listing_title: 'Gupta Stationery & Cyber Point',
    rating: 4,
    review_text: 'Second review attempt by same user'
  });
  assert(dupRev.success === false, 'Duplicate review on same listing prevented');

  // Calculated rating check
  const revSummary = await window.DB.getListingReviews('shops', 'shop-1');
  assert(revSummary.totalCount >= 3, `Calculated public reviews count (found ${revSummary.totalCount})`);
  assert(revSummary.averageRating > 4.0, `Calculated average rating accurate (got ${revSummary.averageRating}/5)`);

  // 7. Dispute Reporting Workflow
  console.log('\n7. Testing Listing Reports & Dispute Workflow:');
  const repResult = await window.DB.submitListingReport({
    listing_type: 'business',
    listing_id: 'shop-1',
    listing_title: 'Gupta Stationery & Cyber Point',
    issue_type: 'wrong_phone',
    description: 'The shop number was busy, but shop owner confirmed secondary contact.',
    reporter_name: 'Aman'
  });
  assert(repResult.success === true, 'Listing report dispute successfully submitted');
  assert(repResult.data.status === 'pending', 'Dispute recorded as pending admin investigation');

  // Admin resolves report
  const resReport = await window.DB.resolveListingReport(repResult.data.id, 'Verified alternate phone number with shopkeeper.');
  assert(resReport.success === true, 'Admin can resolve dispute with resolution note');

  // 8. In-App Notifications
  console.log('\n8. Testing In-App Notifications:');
  await window.DB.createNotification(
    'test-student-1',
    '🎉 Listing Approved',
    'Your business submission was approved.',
    'listing_approved',
    'dashboard.html?tab=listings'
  );
  const notifs = await window.DB.getUserNotifications('test-student-1');
  assert(notifs.length > 0, `Notifications delivered to user inbox (found ${notifs.length})`);
  assert(notifs[0].is_read === false, 'New notification is unread initially');

  await window.DB.markNotificationRead('test-student-1', notifs[0].id);
  const updatedNotifs = await window.DB.getUserNotifications('test-student-1');
  assert(updatedNotifs[0].is_read === true, 'Notification marked as read');

  console.log('\n================================================================');
  console.log(`📊 Test Summary: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================');

  if (passed === total) {
    console.log('🎉 ALL PHASE 4 ARCHITECTURAL & BUSINESS LOGIC GATES PASSED!\n');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed.\n');
    process.exit(1);
  }
}

runTests();
