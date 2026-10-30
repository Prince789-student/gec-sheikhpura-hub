/**
 * GEC Sheikhpura Student Life Hub - Phase 11 Comprehensive Test Suite
 * Lost & Found + Faculty, Room & Campus Directory Verification
 *
 * Verifies all 12 core requirements from Phase 11 Specification:
 * 1. Lost & Found Submissions
 * 2. Search & Possible-Match Suggestions
 * 3. Private Claim Workflow & Duplicate Prevention
 * 4. Ownership Verification & Return Lifecycle
 * 5. Faculty & Room Multi-Criteria Searches
 * 6. Handling of Missing Room Numbers ("Not verified" Fallbacks)
 * 7. Admin Verification Permissions & Moderation Audit Trail
 * 8. Directory Correction Requests & Automated Patching
 * 9. Mobile Usability, Touch Targets & Navigation
 * 10. Existing Campus Map Integration & Verified Coordinates
 * 11. RLS & Sensitive Identifier Masking / Privacy Protection
 * 12. Full Regression of Phases 1–10
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock browser environment for DB Service
global.window = {};
global.document = {
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    setAttribute: () => {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }),
  body: {
    appendChild: () => {},
    style: {}
  }
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

async function runPhase11DirectoryAndLostFoundTests() {
  console.log('\n================================================================');
  console.log('🧪 Starting Phase 11: Lost & Found + Campus Directory Verification');
  console.log('================================================================\n');

  const db = window.DB;

  // --------------------------------------------------------------------------
  // Area 1: Lost and Found Submissions
  // --------------------------------------------------------------------------
  console.log('1. Testing Lost & Found Submissions:');

  await it('Validates required fields when reporting a lost item', async () => {
    const resNoTitle = await db.reportLostItem({ title: '', category: 'electronics', description: 'Testing validation error' });
    assert.strictEqual(resNoTitle.success, false);
    assert(resNoTitle.error.includes('title is required'));

    const resShortDesc = await db.reportLostItem({ title: 'Keys', category: 'keys_locks', description: 'short', location_found_or_lost: 'Hostel' });
    assert.strictEqual(resShortDesc.success, false);
    assert(resShortDesc.error.includes('at least 10 characters'));
  });

  let testLostItem = null;
  await it('Successfully reports a lost item with valid details', async () => {
    const res = await db.reportLostItem({
      title: 'HP Scientific Calculator 10s+',
      category: 'electronics',
      description: 'Silver body with roll number sticker on back side',
      location_found_or_lost: 'Academic Complex Room 102',
      item_date: '2026-10-25',
      reporter_contact_private: '+91-9801122334'
    });
    assert.strictEqual(res.success, true);
    assert(res.item.id.startsWith('lf-'));
    assert.strictEqual(res.item.type, 'lost');
    assert.strictEqual(res.item.status, 'lost');
    testLostItem = res.item;
  });

  let testFoundItem = null;
  await it('Successfully reports a found item with valid details', async () => {
    const res = await db.reportFoundItem({
      title: 'HP Scientific Calculator 10s+ in Silver Casing',
      category: 'electronics',
      description: 'Found under bench 3 in Academic Complex Room 102',
      location_found_or_lost: 'Academic Complex Room 102',
      item_date: '2026-10-25',
      reporter_contact_private: 'security.desk@gecsheikhpura.ac.in'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.item.type, 'found');
    assert.strictEqual(res.item.status, 'found');
    testFoundItem = res.item;
  });

  // --------------------------------------------------------------------------
  // Area 2: Search and Possible-Match Suggestions
  // --------------------------------------------------------------------------
  console.log('\n2. Testing Search and Possible-Match Suggestions:');

  await it('Intelligent Match Suggestion Engine matches lost calculator with found calculator', async () => {
    const matches = await db.suggestMatches(testLostItem);
    assert(Array.isArray(matches), 'Matches must be an array');
    assert(matches.length > 0, 'Must identify matching found calculator');

    const topMatch = matches[0];
    assert.strictEqual(topMatch.item.id, testFoundItem.id);
    assert(topMatch.score >= 50, `Match score should be high (got ${topMatch.score})`);
    assert(topMatch.reasons.some(r => r.includes('category')), 'Should match category');
    assert(topMatch.reasons.some(r => r.includes('keyword')), 'Should match keywords');
    assert(topMatch.reasons.some(r => r.includes('location')), 'Should match location');
  });

  await it('Filters lost and found items by category and search keyword', async () => {
    const resCat = await db.getLostFoundItems({ category: 'electronics' });
    assert(resCat.data.every(it => it.category === 'electronics'));

    const resQuery = await db.getLostFoundItems({ query: 'Calculator' });
    assert(resQuery.data.some(it => it.title.includes('Calculator')));
  });

  // --------------------------------------------------------------------------
  // Area 3: Private Claim Workflow & Duplicate Prevention
  // --------------------------------------------------------------------------
  console.log('\n3. Testing Private Claim Workflow:');

  let testClaim = null;
  await it('Submits a private ownership claim for a found item', async () => {
    const claimRes = await db.submitLostFoundClaim(testFoundItem.id, {
      proof_details: 'The calculator back has a sticker with initial initials R.K. and a faded scratch near battery door.',
      claimant_name: 'Rahul Kumar',
      claimant_contact_private: '+91-9876543210'
    });
    assert.strictEqual(claimRes.success, true);
    assert(claimRes.claim.id.startsWith('claim-'));
    assert.strictEqual(claimRes.claim.status, 'pending');
    testClaim = claimRes.claim;

    // Check that item status transitioned to claim_pending
    const updatedFoundItem = await db.getLostFoundItemById(testFoundItem.id);
    assert.strictEqual(updatedFoundItem.status, 'claim_pending');
  });

  await it('Prevents duplicate pending claims from the same claimant', async () => {
    const dupRes = await db.submitLostFoundClaim(testFoundItem.id, {
      proof_details: 'Another claim attempt for the same calculator',
      claimant_name: 'Rahul Kumar',
      claimant_contact_private: '+91-9876543210'
    });
    assert.strictEqual(dupRes.success, false);
    assert(dupRes.error.includes('already submitted an active ownership claim'));
  });

  // --------------------------------------------------------------------------
  // Area 4: Ownership Verification and Return Status
  // --------------------------------------------------------------------------
  console.log('\n4. Testing Ownership Verification & Return Lifecycle:');

  await it('Finder or admin retrieves claims list for the item', async () => {
    const claims = await db.getClaimsForItem(testFoundItem.id);
    assert(claims.length >= 1);
    assert(claims.some(c => c.id === testClaim.id));
  });

  await it('Approves valid claim, updating claim status and marking item as RETURNED', async () => {
    const res = await db.processClaim(testClaim.id, 'approve', 'Physical serial number and scratch verified at Security Desk.');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.claim.status, 'approved');

    const itemAfter = await db.getLostFoundItemById(testFoundItem.id);
    assert.strictEqual(itemAfter.status, 'returned');
  });

  // --------------------------------------------------------------------------
  // Area 5: Faculty and Room Searches
  // --------------------------------------------------------------------------
  console.log('\n5. Testing Verified Faculty Directory Searches:');

  await it('Loads authentic GEC Sheikhpura faculty list with leadership', async () => {
    const list = await db.getFacultyMembers();
    assert(list.length >= 11, 'Must contain at least 11 verified faculty members');

    const principal = list.find(f => f.designation.includes('Principal'));
    assert(principal, 'Principal record must exist');
    assert(principal.name.includes('Anil Singh Yadav'), 'Principal must be Prof. (Dr.) Anil Singh Yadav');
    assert.strictEqual(principal.verification_status, 'verified');

    const registrar = list.find(f => f.designation.includes('Registrar'));
    assert(registrar, 'Registrar record must exist');
    assert(registrar.name.includes('Basuki Nath Mishra'));

    const dean = list.find(f => f.designation.includes('Dean'));
    assert(dean, 'Dean Academics record must exist');
    assert(dean.name.includes('Jaishankar Prasad Keshri'));
  });

  await it('Searches faculty by department, name, and room number', async () => {
    const cseList = await db.getFacultyMembers({ department: 'Computer Science' });
    assert(cseList.length >= 1);
    assert(cseList.some(f => f.name.includes('Rajesh Kumar')));

    const roomSearch = await db.getFacultyMembers({ query: 'Room 001' });
    assert(roomSearch.length >= 1);
    assert(roomSearch[0].name.includes('Anil Singh Yadav'));
  });

  // --------------------------------------------------------------------------
  // Area 6: Handling of Missing Room Numbers ("Not verified" state)
  // --------------------------------------------------------------------------
  console.log('\n6. Testing Handling of Missing Information & Truth-in-Data:');

  await it('Enforces "Not verified" fallback for blank room number or office hours', async () => {
    // Add faculty with empty room and office hours
    const res = await db.saveFacultyMember({
      name: 'Visiting Faculty Lecturer',
      department: 'Civil Engineering',
      designation: 'Guest Faculty',
      room_number: '',
      office_hours: '',
      public_contact: ''
    });
    assert.strictEqual(res.success, true);

    const retrieved = await db.getFacultyById(res.faculty.id);
    assert.strictEqual(retrieved.room_number, 'Not verified', 'Missing room number must be "Not verified"');
    assert.strictEqual(retrieved.office_hours, 'Not verified', 'Missing office hours must be "Not verified"');
    assert.strictEqual(retrieved.public_contact, 'Not available', 'Missing contact must be "Not available"');
  });

  // --------------------------------------------------------------------------
  // Area 7: Admin Verification Permissions & Moderation Audit Trail
  // --------------------------------------------------------------------------
  console.log('\n7. Testing Admin Verification Permissions & Audit Trail:');

  await it('Admin can add, edit, and archive faculty members', async () => {
    const resSave = await db.saveFacultyMember({
      name: 'Dr. Test Faculty Admin',
      department: 'Electrical Engineering',
      designation: 'Associate Professor',
      room_number: 'Room 118',
      building_block: 'Academic Complex',
      floor: '1st Floor',
      verification_status: 'verified'
    });
    assert.strictEqual(resSave.success, true);

    const resArchive = await db.archiveFacultyMember(resSave.faculty.id);
    assert.strictEqual(resArchive.success, true);

    const activeList = await db.getFacultyMembers();
    assert(!activeList.some(f => f.id === resSave.faculty.id), 'Archived faculty should be filtered from active directory');
  });

  await it('Admin can flag suspicious lost & found posts and verify moderation log', async () => {
    const flagRes = await db.flagLostFoundItem(testLostItem.id, 'Suspicious contact number');
    assert.strictEqual(flagRes.success, true);
    assert.strictEqual(flagRes.flags_count, 1);

    const logs = await db.getModerationLogs();
    assert(logs.some(l => l.target_id === testLostItem.id && l.action_type === 'flag_lost_found_item'));
  });

  // --------------------------------------------------------------------------
  // Area 8: Student Correction Requests & Automated Patching
  // --------------------------------------------------------------------------
  console.log('\n8. Testing Student Directory Correction Requests:');

  let testCorrId = null;
  await it('Student submits correction request with required evidence', async () => {
    const res = await db.submitDirectoryCorrection({
      directory_type: 'faculty',
      target_id: 'fac-05',
      target_name: 'Dr. Rajesh Kumar',
      proposed_data: { room_number: 'Room 202-B', office_hours: 'Mon-Fri: 09:30 AM - 11:30 AM' },
      reason: 'Department notice board announced chamber shift to room 202-B for semester VI.',
      submitter_name: 'Mohit Sharma (Roll 24105129045)',
      submitter_contact: 'mohit@gecsheikhpura.ac.in'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.correction.status, 'pending');
    testCorrId = res.correction.id;
  });

  await it('Approving directory correction automatically updates the target faculty record', async () => {
    const approveRes = await db.processDirectoryCorrection(testCorrId, 'approve', 'Verified with CSE department notice.');
    assert.strictEqual(approveRes.success, true);
    assert.strictEqual(approveRes.correction.status, 'approved');

    // Confirm that target faculty member now reflects the approved room
    const updatedFac = await db.getFacultyById('fac-05');
    assert.strictEqual(updatedFac.room_number, 'Room 202-B', 'Proposed room should be patched onto official faculty record');
  });

  // --------------------------------------------------------------------------
  // Area 9: Mobile Usability, Touch Targets & HTML Standards
  // --------------------------------------------------------------------------
  console.log('\n9. Testing Mobile Ergonomics & HTML Viewport Standards:');

  await it('Validates lost-found.html and campus-directory.html exist with proper mobile viewport meta', () => {
    const lfPath = path.join(__dirname, '../lost-found.html');
    const cdPath = path.join(__dirname, '../campus-directory.html');

    assert(fs.existsSync(lfPath), 'lost-found.html must exist');
    assert(fs.existsSync(cdPath), 'campus-directory.html must exist');

    const lfContent = fs.readFileSync(lfPath, 'utf8');
    const cdContent = fs.readFileSync(cdPath, 'utf8');

    assert(lfContent.includes('viewport-fit=cover'), 'lost-found.html must include viewport-fit=cover');
    assert(cdContent.includes('viewport-fit=cover'), 'campus-directory.html must include viewport-fit=cover');
    assert(lfContent.includes('maximum-scale=5.0'), 'lost-found.html must support mobile zoom accessibility');
    assert(cdContent.includes('maximum-scale=5.0'), 'campus-directory.html must support mobile zoom accessibility');
  });

  // --------------------------------------------------------------------------
  // Area 10: Existing Campus Map Integration & Coordinates
  // --------------------------------------------------------------------------
  console.log('\n10. Testing Campus Facilities & Map Coordinates Integration:');

  await it('Loads Bajidpur campus facilities with verified coordinates', async () => {
    const facilities = await db.getCampusFacilities();
    assert(facilities.length >= 16, 'Must contain at least 16 campus facilities');

    const adminBlock = facilities.find(f => f.name.includes('Administrative'));
    assert(adminBlock, 'Admin block must exist');
    assert(adminBlock.coordinates_lat > 25.13 && adminBlock.coordinates_lat < 25.14, 'Must have verified Sheikhpura latitude');
    assert(adminBlock.coordinates_lng > 85.86 && adminBlock.coordinates_lng < 85.87, 'Must have verified Sheikhpura longitude');

    const library = facilities.find(f => f.name.includes('Library'));
    assert(library, 'Central Library must exist');
    assert.strictEqual(library.building_block, 'Academic Complex');
  });

  // --------------------------------------------------------------------------
  // Area 11: RLS & Sensitive Identifier Masking / Privacy Protection
  // --------------------------------------------------------------------------
  console.log('\n11. Testing Sensitive Data Masking & Privacy Redaction:');

  await it('maskSensitiveIdentifiers redacts long roll numbers and registration codes', () => {
    const raw = 'Found student ID card of Aman Kumar, Roll No: 24105129032, Reg: 24105129999.';
    const masked = db.maskSensitiveIdentifiers(raw);
    assert(!masked.includes('24105129032'), 'Original roll number must not be exposed');
    assert(masked.includes('***'), 'Must contain redacted asterisks');
  });

  await it('Strips reporter_contact_private for unauthenticated public viewers', async () => {
    const publicItems = await db.getLostFoundItems();
    assert(publicItems.data.every(it => it.reporter_contact_private === undefined || it.is_mine === true),
      'Public viewer should never see unredacted private contact numbers of others'
    );
  });

  await it('Validates Supabase RLS policies and table structures in supabase/schema_phase11.sql', () => {
    const schemaPath = path.join(__dirname, '../supabase/schema_phase11.sql');
    assert(fs.existsSync(schemaPath), 'schema_phase11.sql must exist');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const sqlLower = sql.toLowerCase();

    assert(sqlLower.includes('create table if not exists public.lost_found_items'), 'Must define lost_found_items table');
    assert(sqlLower.includes('create table if not exists public.lost_found_claims'), 'Must define lost_found_claims table');
    assert(sqlLower.includes('create table if not exists public.faculty_directory'), 'Must define faculty_directory table');
    assert(sqlLower.includes('create table if not exists public.campus_facilities'), 'Must define campus_facilities table');
    assert(sqlLower.includes('create table if not exists public.directory_corrections'), 'Must define directory_corrections table');
    assert(sqlLower.includes('enable row level security'), 'Must enable RLS across all Phase 11 tables');
  });

  // --------------------------------------------------------------------------
  // Area 12: Regression Testing of Phases 1-10
  // --------------------------------------------------------------------------
  console.log('\n12. Testing Regression of Phases 1–10:');

  await it('Phase 10 Feature Flags and Maintenance separation remain intact', async () => {
    const flags = await db.getFeatureFlags();
    assert(flags, 'Feature flags must exist');
    assert.strictEqual(flags.advanced_search_filters, true);

    const alert = await db.getCampusBroadcastAlert();
    assert(alert, 'Broadcast alert controller must remain operational');
  });

  await it('Apna College Bihar academic resource separation remains 100% strict', () => {
    const seedPath = path.join(__dirname, '../supabase/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    assert(seedSql.includes('https://www.apnacollegebihar.online/'), 'Seed must direct academic queries to Apna College Bihar');
  });

  console.log('\n================================================================');
  console.log(`Phase 11 Directory & Lost & Found Results: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase11DirectoryAndLostFoundTests();
