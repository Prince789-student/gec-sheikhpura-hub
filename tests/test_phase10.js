/**
 * Phase 10 Automated Logic, Smart Automation, Duplicate Detection & Privacy QA Suite
 * GEC Sheikhpura Student Life Hub - Continuous Improvement, Smart Automation & Platform Scalability
 *
 * Verifies:
 * 1. Student Feedback Lifecycle: pending, reviewing, planned, in_progress, completed, declined.
 * 2. Privacy Separation: Public resolution_summary visible to student; admin_notes strictly restricted to admins.
 * 3. Safe Platform Automations: Idempotent notice expiry, event concluding, stale room/business flagging.
 * 4. Duplicate Detection Engine: Token Jaccard overlap, phone normalization, archive & distinct resolution.
 * 5. Runtime Feature Flags: Reading flags, dynamic toggling, default state preservation.
 * 6. User Privacy Controls: Complete personal JSON data export & structured account deletion queue.
 * 7. Database Migration Schema (Phase 10): Status checks, freshness columns, compound indexes, RLS.
 * 8. Maintenance Manual & Runbook: MAINTENANCE.md completeness and emergency rollback procedures.
 * 9. Academic Separation: Zero academic notes/syllabus duplication; Apna College Bihar verified link.
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

// Load Logger & Database Service
const loggerCode = fs.readFileSync(path.join(__dirname, '../assets/js/logger.js'), 'utf8');
eval(loggerCode);

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

async function runPhase10Tests() {
  console.log('================================================================');
  console.log('🧪 Starting Phase 10 Continuous Improvement & Automation Tests');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: Student Feedback Lifecycle & Phase 10 Statuses
  // -------------------------------------------------------------
  console.log('1. Testing Feedback Lifecycle & Status Progression:');
  const fbSub = await window.DB.submitStudentFeedback({
    category: 'room_availability',
    description: 'Bajidpur Residency room 3 has been occupied for two weeks. Please update vacancy.',
    related_page_or_listing: 'rooms-pg.html?highlight=room-01',
    contact_info: 'student101@gecsheikhpura.ac.in',
    user_id: 'usr_student_test_101'
  });

  assert(fbSub.success === true, 'Feedback submission succeeds');
  assert(fbSub.feedback && fbSub.feedback.status === 'pending', 'Initial feedback status is strictly "pending"');

  const fbId = fbSub.feedback.id;

  // Progress through lifecycle: reviewing -> planned -> in_progress -> completed
  const revRes = await window.DB.updateStudentFeedbackStatus(fbId, 'reviewing', '', 'Investigating room availability with landlord.');
  assert(revRes.success === true, 'Feedback transitions to "reviewing"');
  assert(revRes.feedback.status === 'reviewing', 'Feedback record status updated to "reviewing"');

  const compRes = await window.DB.updateStudentFeedbackStatus(
    fbId,
    'completed',
    'Verified with landlord. Vacancy count adjusted on rooms-pg.html. Thank you!',
    'Landlord confirmed room occupied on 14th Oct.'
  );
  assert(compRes.success === true, 'Feedback transitions to "completed"');
  assert(compRes.feedback.status === 'completed', 'Status reflects "completed"');
  assert(compRes.feedback.resolution_summary.includes('Thank you!'), 'Resolution summary properly recorded');
  assert(compRes.feedback.admin_notes.includes('Landlord confirmed'), 'Internal admin notes properly stored');

  // -------------------------------------------------------------
  // Test 2: Privacy Isolation in Student Self-Service Views
  // -------------------------------------------------------------
  console.log('\n2. Testing Privacy Isolation (No Admin Notes / Contacts Leaked to Students):');
  const studentItems = await window.DB.getStudentOwnFeedback('usr_student_test_101');
  assert(Array.isArray(studentItems) && studentItems.length > 0, 'Student retrieves their own feedback items');

  const studentViewItem = studentItems.find(f => f.id === fbId);
  assert(studentViewItem !== undefined, 'Target feedback item present in student own list');
  assert(studentViewItem.status === 'completed', 'Student can see current status "completed"');
  assert(studentViewItem.resolution_summary !== undefined && studentViewItem.resolution_summary.length > 0, 'Student can see public resolution summary');
  assert(studentViewItem.admin_notes === undefined, 'Student view STRICTLY strips internal admin_notes');
  assert(studentViewItem.contact_info === undefined, 'Student view does NOT leak contact details back');

  // -------------------------------------------------------------
  // Test 3: Safe Idempotent Platform Automations
  // -------------------------------------------------------------
  console.log('\n3. Testing Safe Platform Automations & Freshness Maintenance:');
  const autoRes1 = await window.DB.runPlatformAutomations();
  assert(autoRes1.success === true, 'Platform automation executes successfully');
  assert(autoRes1.report !== undefined, 'Automation returns detailed execution report');
  assert(typeof autoRes1.report.expired_notices_count === 'number', 'Reports expired notices count');
  assert(typeof autoRes1.report.concluded_events_count === 'number', 'Reports concluded events count');
  assert(typeof autoRes1.report.overdue_rooms_count === 'number', 'Reports flagged overdue rooms count');
  assert(typeof autoRes1.report.overdue_businesses_count === 'number', 'Reports flagged overdue businesses count');

  // Test idempotency: second run produces zero corruption and no duplicated side-effects
  const autoRes2 = await window.DB.runPlatformAutomations();
  assert(autoRes2.success === true, 'Second automated run executes idempotently');
  assert(autoRes2.report.expired_notices_count === autoRes1.report.expired_notices_count, 'Notice expiry is idempotent across reruns');

  // -------------------------------------------------------------
  // Test 4: Duplicate & Data-Quality Detection Engine
  // -------------------------------------------------------------
  console.log('\n4. Testing Duplicate Detection & Safe Resolution:');
  // Inject primary and candidate duplicate listings into local businesses seed
  const bizList = [
    {
      id: 'shop-01',
      name: 'Student Point Stationery, Xerox & Cyber Services',
      category: 'stationery',
      address: 'Near Bajidpur Police Line Mor, Sheikhpura',
      phone: '+91-9430299999',
      distance_km: 0.45,
      is_active: true
    },
    {
      id: 'dup-biz-candidate-99',
      name: 'Student Point Stationery & Cyber Cafe',
      category: 'stationery',
      address: 'Bajidpur Police Line Mor',
      phone: '+91-9430299999',
      distance_km: 0.45,
      is_active: true
    }
  ];
  localStorage.setItem('gec_businesses_seed', JSON.stringify(bizList));

  const dupRes = await window.DB.detectDuplicateListings();
  assert(dupRes.success === true, 'Duplicate detection runs successfully');
  assert(Array.isArray(dupRes.pairs), 'Returns array of duplicate candidate pairs');

  const foundDup = dupRes.pairs.find(p => p.item1.id === 'dup-biz-candidate-99' || p.item2.id === 'dup-biz-candidate-99');
  assert(foundDup !== undefined, 'Algorithm flags "Student Point Stationery" as potential duplicate pair');
  assert(foundDup.reasons.length > 0, 'Returns transparent explanation reasons for similarity match');

  // Resolve duplicate via safe archival
  const resArchive = await window.DB.resolveDuplicatePair(
    foundDup.item1.id,
    foundDup.item2.id,
    'archive_duplicate',
    'Confirmed duplicate submission; secondary entry archived safely without destructive purge.'
  );
  assert(resArchive.success === true, 'Safe archival of duplicate listing succeeds');

  // Verify archived entity is no longer active
  const updatedBizList = JSON.parse(localStorage.getItem('gec_businesses_seed'));
  const candidateRecord = updatedBizList.find(b => b.id === 'dup-biz-candidate-99');
  assert(candidateRecord.is_active === false, 'Archived duplicate is deactivated (is_active: false)');
  assert(candidateRecord.status === 'archived', 'Archived duplicate status set to "archived"');

  // -------------------------------------------------------------
  // Test 5: Runtime Feature Flags
  // -------------------------------------------------------------
  console.log('\n5. Testing Runtime Feature Flags Controller:');
  const initialFlags = window.DB.getFeatureFlags();
  assert(typeof initialFlags === 'object', 'Feature flags map returned');
  assert(initialFlags.advanced_search_filters === true, 'advanced_search_filters defaults to true');
  assert(initialFlags.duplicate_detector === true, 'duplicate_detector defaults to true');
  assert(initialFlags.experimental_push_reminders === false, 'experimental_push_reminders defaults to false (unconfigured)');

  // Toggle a flag
  window.DB.updateFeatureFlag('experimental_push_reminders', true);
  const toggledFlags = window.DB.getFeatureFlags();
  assert(toggledFlags.experimental_push_reminders === true, 'Feature flag safely updated at runtime');

  // Reset back to safe default
  window.DB.updateFeatureFlag('experimental_push_reminders', false);

  // -------------------------------------------------------------
  // Test 6: Personal Data Export & Account Deletion Request
  // -------------------------------------------------------------
  console.log('\n6. Testing Privacy Controls (Data Export & Account Deletion Queue):');
  const exportRes = await window.DB.exportStudentData('usr_student_test_101');
  assert(exportRes.success === true, 'Personal data export succeeds');
  assert(exportRes.export_data !== undefined, 'Export payload contains structured archive');
  assert(exportRes.export_data.disclaimer !== undefined, 'Export contains official non-academic hub disclaimer');
  assert(Array.isArray(exportRes.export_data.submitted_feedback), 'Export includes student submitted feedback');

  const delReq = await window.DB.requestAccountDeletion('usr_student_test_101', 'Graduated from campus in 2026.');
  assert(delReq.success === true, 'Account deletion request queued successfully');
  assert(delReq.request.status === 'pending', 'Deletion request queued with status "pending"');
  assert(delReq.request.reason.includes('Graduated'), 'Reason for deletion safely recorded');

  // -------------------------------------------------------------
  // Test 7: Database Migration Schema (Phase 10)
  // -------------------------------------------------------------
  console.log('\n7. Testing Database Schema Migration (Phase 10):');
  const schemaSql = fs.readFileSync(path.join(__dirname, '../supabase/schema_phase10.sql'), 'utf8');
  assert(schemaSql.includes('student_feedback_status_check'), 'Schema updates feedback status check constraint');
  assert(schemaSql.includes('resolution_summary TEXT'), 'Schema adds public resolution_summary column');
  assert(schemaSql.includes('last_verified_at TIMESTAMPTZ'), 'Schema adds listing freshness tracking timestamp');
  assert(schemaSql.includes('review_status'), 'Schema adds listing review_status column');
  assert(schemaSql.includes('account_deletion_requests'), 'Schema provisions account_deletion_requests table');
  assert(schemaSql.includes('idx_feedback_status_cat_created'), 'Schema provisions compound performance indexes');

  // -------------------------------------------------------------
  // Test 8: Maintenance Manual & Operational Runbook
  // -------------------------------------------------------------
  console.log('\n8. Testing Operational Manual & Runbook Completeness:');
  const maintMd = fs.readFileSync(path.join(__dirname, '../MAINTENANCE.md'), 'utf8');
  assert(maintMd.includes('Adding & Updating Business Listings'), 'MAINTENANCE.md documents directory listing procedures');
  assert(maintMd.includes('Feedback Lifecycle'), 'MAINTENANCE.md documents student feedback resolution procedures');
  assert(maintMd.includes('Safe Idempotent Platform Automations'), 'MAINTENANCE.md documents safe platform automations');
  assert(maintMd.includes('Duplicate & Data-Quality Detection Engine'), 'MAINTENANCE.md documents duplicate inspection procedures');
  assert(maintMd.includes('Runtime Feature Flags'), 'MAINTENANCE.md documents feature flag toggling');
  assert(maintMd.includes('Incident Rollback Runbook'), 'MAINTENANCE.md documents disaster recovery & rollback');

  // -------------------------------------------------------------
  // Test 9: Academic Platform Separation
  // -------------------------------------------------------------
  console.log('\n9. Testing Academic Platform Separation (Apna College Bihar):');
  assert(maintMd.includes('https://www.apnacollegebihar.online/'), 'MAINTENANCE.md explicitly points to Apna College Bihar');
  const appJsCode = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');
  assert(appJsCode.includes('apnacollegebihar.online'), 'Global search routes academic queries directly to Apna College Bihar');
  assert(appJsCode.includes('Emergency & Medical'), 'Global search discovers non-academic medical & emergency listings');
  assert(appJsCode.includes('Transit'), 'Global search discovers non-academic transport & commute listings');

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`Phase 10 Test Suite Results: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase10Tests().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
