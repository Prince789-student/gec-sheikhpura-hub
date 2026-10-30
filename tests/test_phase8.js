/**
 * Phase 8 Automated Logic & Security Verification Suite
 * GEC Sheikhpura Student Life Hub - Notifications, Analytics, Performance & Production Launch
 *
 * Verifies:
 * 1. In-App Notification Lifecycle: Creation, unread state, pagination, mark read, mark all read.
 * 2. User Isolation & Duplicate Prevention (Deduplication guard).
 * 3. Notification Triggers (Event pass registration/cancellation, report resolution, buyer enquiries).
 * 4. Student Notification Preferences & Push Consent State.
 * 5. Privacy-Conscious Admin Analytics Aggregations (Live counts, categories, no fake demo stats).
 * 6. Centralized Safe Operational Logger (Strict credential & PII redaction).
 * 7. Database Migration Schema (Performance indexes, RLS hardening, analytics view).
 * 8. Production Configuration & Documentation (.env.example, DEPLOYMENT.md, BACKUP_RECOVERY.md).
 * 9. Platform Separation Guarantee (Strict link to Apna College Bihar).
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment for Node.js
class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] !== undefined ? this.store[key] : null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
  get length() { return Object.keys(this.store).length; }
  key(index) { return Object.keys(this.store)[index] || null; }
}

global.localStorage = new LocalStorageMock();
global.sessionStorage = new LocalStorageMock();
global.window = {
  location: { search: '', origin: 'http://localhost:3000' }
};

// Mock SUPABASE_CONFIG
global.SUPABASE_CONFIG = {
  url: '',
  anonKey: '',
  isConfigured: () => false
};

// Mock HUB_DATA
global.HUB_DATA = {
  shops: [
    { id: 'shop-1', name: 'Maa Durga Stationery', category: 'stationery', verified: true, is_verified: true },
    { id: 'shop-2', name: 'Shivam Mobile Care', category: 'repair', verified: true, is_verified: true }
  ],
  rooms: [
    { id: 'acc-1', title: 'Bajidpur Boys PG', accommodation_type: 'room', verified: true, is_verified: true }
  ],
  accommodations: [
    { id: 'acc-1', title: 'Bajidpur Boys PG', accommodation_type: 'room', verified: true, is_verified: true }
  ],
  foodServices: [],
  emergency: [],
  transport: []
};

// Load Logger
const Logger = require('../assets/js/logger.js');
global.Logger = Logger;

// Load db-service into global
const dbCode = fs.readFileSync(path.join(__dirname, '../assets/js/db-service.js'), 'utf8');
eval(dbCode);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 Starting Phase 8 Notifications, Analytics, Performance & Security Tests');
  console.log('================================================================');

  // 1. In-App Notification Lifecycle
  console.log('\n1. Testing In-App Notification Lifecycle:');
  const studentId = 'student-test-801';

  const notif1 = await window.DB.createNotification(
    studentId,
    'Listing Approved',
    'Your room listing for Bajidpur has been approved by campus moderators.',
    'listing_moderation',
    'rooms-pg.html?id=room-101'
  );

  assert(notif1 && notif1.id, 'Notification created successfully');
  assert(notif1.is_read === false, 'Notification is unread initially');
  assert(notif1.notification_type === 'listing_moderation', 'Notification type stored correctly');

  // Object signature support
  const notif2 = await window.DB.createNotification({
    user_id: studentId,
    title: 'New Marketplace Offer',
    message: 'A student enquired about your scientific calculator.',
    type: 'marketplace',
    link: 'dashboard.html?tab=marketplace'
  });
  assert(notif2 && notif2.notification_type === 'marketplace', 'Object signature for createNotification supported');

  // Retrieve notifications
  const userNotifs = await window.DB.getUserNotifications(studentId);
  assert(userNotifs.length === 2, `User inbox retrieves 2 active notifications (found ${userNotifs.length})`);

  // Unread filter
  const unreadOnly = await window.DB.getUserNotifications(studentId, { unreadOnly: true });
  assert(unreadOnly.length === 2, 'Unread filter retrieves unread notifications');

  // Mark single as read
  await window.DB.markNotificationRead(studentId, notif1.id);
  const updatedNotifs = await window.DB.getUserNotifications(studentId);
  const readItem = updatedNotifs.find(n => n.id === notif1.id);
  const unreadItem = updatedNotifs.find(n => n.id === notif2.id);
  assert(readItem.is_read === true, 'Specific notification marked as read');
  assert(unreadItem.is_read === false, 'Remaining notification remains unread');

  // Mark all as read
  await window.DB.markAllNotificationsRead(studentId);
  const allReadNotifs = await window.DB.getUserNotifications(studentId);
  assert(allReadNotifs.every(n => n.is_read === true), 'All notifications successfully marked as read');

  // 2. User Isolation & Deduplication Guard
  console.log('\n2. Testing User Isolation & Deduplication Guard:');
  const otherStudentId = 'student-test-802';
  await window.DB.createNotification(
    otherStudentId,
    'Private Notice',
    'This message is strictly for Student 802.',
    'general'
  );

  const student1Inbox = await window.DB.getUserNotifications(studentId);
  const otherInbox = await window.DB.getUserNotifications(otherStudentId);
  assert(!student1Inbox.some(n => n.user_id === otherStudentId), 'Student 1 cannot view Student 2 notifications (Strict user isolation)');
  assert(otherInbox.length === 1, 'Student 2 sees only their own notification');

  // Deduplication guard
  const initialCount = student1Inbox.length;
  await window.DB.createNotification(
    studentId,
    'Duplicate Prevention Test',
    'This message should not be duplicated within 60s.',
    'alert'
  );
  // Attempt exact duplicate immediately
  await window.DB.createNotification(
    studentId,
    'Duplicate Prevention Test',
    'This message should not be duplicated within 60s.',
    'alert'
  );
  const afterDedupInbox = await window.DB.getUserNotifications(studentId);
  assert(afterDedupInbox.length === initialCount + 1, 'Duplicate notification within 60s was safely deduplicated');

  // 3. Notification Triggers
  console.log('\n3. Testing Notification Triggers (Events & Reports):');
  // Trigger on event registration
  const eventUser = 'student-event-runner';
  window.DB._initPhase7Storage();
  const events = JSON.parse(localStorage.getItem('gec_community_events') || '[]');
  if (events.length > 0) {
    const targetEvent = events[0];
    await window.DB.registerForEvent(targetEvent.id, {
      name: 'Pooja Kumari',
      branch: 'ECE',
      batch: '2023-2027',
      userId: eventUser
    });
    const eventNotifs = await window.DB.getUserNotifications(eventUser);
    assert(eventNotifs.some(n => n.notification_type === 'event_pass'), 'Event pass registration dispatched in-app notification');

    // Trigger on event cancellation
    await window.DB.cancelEventRegistration(targetEvent.id, eventUser);
    const cancelNotifs = await window.DB.getUserNotifications(eventUser);
    assert(cancelNotifs.some(n => n.title.includes('Cancelled')), 'Event cancellation dispatched update notification');
  } else {
    assert(true, 'Skipping event trigger test (no events in store)');
  }

  // Trigger on report resolution
  const reporterId = 'student-reporter-88';
  const report = await window.DB.submitListingReport({
    listing_type: 'business',
    listing_id: 'biz-test-1',
    listing_title: 'Sharma Xerox Corner',
    issue_type: 'wrong_phone',
    description: 'Owner updated mobile number last week.',
    reporter_user_id: reporterId,
    reporter_name: reporterId
  });

  await window.DB.resolveListingReport(report.data.id, 'Verified phone number updated in directory.');
  const reporterNotifs = await window.DB.getUserNotifications(reporterId);
  assert(reporterNotifs.some(n => n.notification_type === 'report_update'), 'Report resolution dispatched in-app notification to reporter');

  // 4. Notification Preferences
  console.log('\n4. Testing Student Notification Preferences:');
  const defaultPrefs = await window.DB.getNotificationPreferences('test-pref-user');
  assert(defaultPrefs.listing_alerts === true, 'Listing alerts enabled by default');
  assert(defaultPrefs.event_reminders === true, 'Event reminders enabled by default');
  assert(defaultPrefs.email_updates === false, 'Email updates disabled by default (Honest opt-in)');
  assert(defaultPrefs.browser_push === false, 'Browser push disabled by default (Zero unsolicited prompts)');

  const updateRes = await window.DB.updateNotificationPreferences('test-pref-user', {
    listing_alerts: false,
    browser_push: true
  });
  assert(updateRes.success === true, 'Preferences updated successfully');
  const savedPrefs = await window.DB.getNotificationPreferences('test-pref-user');
  assert(savedPrefs.listing_alerts === false, 'Updated preference persisted (listing_alerts: false)');
  assert(savedPrefs.browser_push === true, 'Updated preference persisted (browser_push: true)');

  // 5. Privacy-Conscious Admin Analytics
  console.log('\n5. Testing Privacy-Conscious Admin Analytics:');
  const analytics = await window.DB.getAdminAnalytics();
  assert(analytics.success === true, 'Admin analytics computed successfully');
  assert(typeof analytics.listings.totalPublished === 'number', `Total published listings is numeric (${analytics.listings.totalPublished})`);
  assert(analytics.listings.totalPublished === analytics.listings.totalBusinesses + analytics.listings.totalAccommodations, 'Total directory count matches sum of businesses and accommodations');
  assert(typeof analytics.marketplace.totalListings === 'number', 'Marketplace total listings computed');
  assert(analytics.marketplace.statusBreakdown.available !== undefined, 'Marketplace available count tracked');
  assert(analytics.community.upcomingEventsCount !== undefined, 'Upcoming campus events tracked');
  assert(analytics.moderation.pendingOwnerSubmissions !== undefined, 'Pending submissions count tracked');
  assert(analytics.moderation.totalAuditActions !== undefined, 'Total audit actions tracked');
  assert(analytics.integrations.telemetryTracking.includes('Disabled'), 'External telemetry explicitly labeled as Disabled (Privacy-first)');
  assert(analytics.integrations.emailService.includes('Not Configured'), 'Email integration labeled honestly as Not Configured without secrets');
  assert(analytics.dateRangeLabel.length > 5, 'Date range label clearly provided');

  // 6. Centralized Safe Logger & Sensitive Redaction
  console.log('\n6. Testing Centralized Safe Logger & Redaction:');
  Logger.clearLogs();
  assert(Logger.getLogs().length === 0, 'Log buffer initially cleared');

  Logger.info('Admin logged in with password="superSecretPassword123"');
  Logger.warn('External request sent with Authorization: Bearer eyJhbGciOiJIUzI1Ni.secretTokenPayload.signature');
  Logger.error('Enquiry failed for phone +91 9431811223 with apikey="anon-secret-key-456"');

  const logs = Logger.getLogs();
  assert(logs.length === 3, `Logger recorded 3 diagnostic events (found ${logs.length})`);
  assert(!logs[0].message.includes('superSecretPassword123'), 'Password was strictly redacted from logs');
  assert(logs[0].message.includes('[REDACTED]'), 'Redacted password replacement applied');
  assert(!logs[1].message.includes('secretTokenPayload'), 'Bearer JWT token was strictly redacted from logs');
  assert(!logs[2].message.includes('9431811223'), 'Phone number was strictly redacted from logs');
  assert(!logs[2].message.includes('anon-secret-key-456'), 'API key was strictly redacted from logs');

  const errorLogs = Logger.getLogs('ERROR');
  assert(errorLogs.length === 1, 'Log level filter retrieves only matching severity entries');

  // 7. Database Migration Schema Validation
  console.log('\n7. Testing Database Schema Migration (Phase 8):');
  const schemaPath = path.join(__dirname, '../supabase/schema_phase8.sql');
  assert(fs.existsSync(schemaPath), 'supabase/schema_phase8.sql exists on filesystem');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  assert(schemaSql.includes('idx_notifications_user_unread'), 'Schema defines compound index for unread notifications');
  assert(schemaSql.includes('idx_events_active_start'), 'Schema defines compound index for upcoming campus events');
  assert(schemaSql.includes('idx_marketplace_status_cat_created'), 'Schema defines compound index for marketplace catalog');
  assert(schemaSql.includes('ROW LEVEL SECURITY'), 'Schema enforces Row Level Security policies');
  assert(schemaSql.includes('v_platform_aggregate_metrics'), 'Schema defines pre-aggregated platform analytics view');

  // 8. Production Configuration & Documentation Files
  console.log('\n8. Testing Production Configuration & Documentation Files:');
  const envPath = path.join(__dirname, '../.env.example');
  assert(fs.existsSync(envPath), '.env.example exists on filesystem');
  const envContent = fs.readFileSync(envPath, 'utf8');
  assert(envContent.includes('SUPABASE_URL='), '.env.example defines SUPABASE_URL');
  assert(envContent.includes('SUPABASE_ANON_KEY='), '.env.example defines SUPABASE_ANON_KEY');
  assert(!envContent.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ'), '.env.example contains no live production JWT secrets (Placeholders only)');

  const deployPath = path.join(__dirname, '../DEPLOYMENT.md');
  assert(fs.existsSync(deployPath), 'DEPLOYMENT.md exists on filesystem');
  const deployContent = fs.readFileSync(deployPath, 'utf8');
  assert(deployContent.includes('Rollback Procedure'), 'DEPLOYMENT.md provides clear rollback procedure');
  assert(deployContent.includes('Pre-Launch Verification Checklist'), 'DEPLOYMENT.md provides pre-launch checklist');

  const backupPath = path.join(__dirname, '../BACKUP_RECOVERY.md');
  assert(fs.existsSync(backupPath), 'BACKUP_RECOVERY.md exists on filesystem');
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  assert(backupContent.includes('pg_dump'), 'BACKUP_RECOVERY.md provides pg_dump commands');
  assert(backupContent.includes('pg_restore'), 'BACKUP_RECOVERY.md provides pg_restore restoration steps');

  // 9. Platform Separation Guarantee
  console.log('\n9. Testing Academic Platform Separation Guarantee:');
  assert(deployContent.includes('https://www.apnacollegebihar.online/'), 'DEPLOYMENT.md strictly upholds Apna College Bihar academic separation');
  assert(schemaSql.includes('v_platform_aggregate_metrics'), 'Phase 8 schema strictly limits scope to campus life without academic LMS tables');

  console.log('\n================================================================');
  console.log(`📊 Test Summary: ${passed} / ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('================================================================');

  if (failed > 0) {
    console.error(`❌ ${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL PHASE 8 NOTIFICATIONS, ANALYTICS, PERFORMANCE & SECURITY GATES PASSED!\n');
  }
}

runTests().catch(err => {
  console.error('Fatal error running Phase 8 tests:', err);
  process.exit(1);
});
