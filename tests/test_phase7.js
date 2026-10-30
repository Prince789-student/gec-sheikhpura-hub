/**
 * Phase 7 Automated Logic Verification Suite
 * GEC Sheikhpura Student Life Hub - Student Community, Events, Clubs, Sports & Campus Life
 *
 * Verifies:
 * 1. Event discovery, search, category filters, and IST time formatting.
 * 2. Event registration, duplicate prevention, and capacity enforcement.
 * 3. Attendee privacy protection (no private phone or email leakage).
 * 4. Registration cancellation and spot reclamation.
 * 5. Student clubs & societies directory and suggestion moderation workflow.
 * 6. Sports & recreation activities listings.
 * 7. Campus-life announcements board with query-time auto-expiry filtering.
 * 8. Admin moderation queue and audit logging.
 * 9. Strict academic platform separation with Apna College Bihar.
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment for Node.js
class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

global.localStorage = new LocalStorageMock();
global.sessionStorage = new LocalStorageMock();
global.window = { location: { search: '', origin: 'http://localhost:3000' } };

// Mock SUPABASE_CONFIG
global.SUPABASE_CONFIG = {
  url: '',
  anonKey: '',
  isConfigured: () => false
};

// Mock HUB_DATA
global.HUB_DATA = { shops: [], accommodations: [], foodServices: [], emergency: [], transport: [] };

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
  console.log('🎪 Starting Phase 7 Student Community, Events, Clubs & Sports Tests');
  console.log('================================================================');

  // 1. Initial Storage & Data Seeding
  console.log('\n1. Testing Phase 7 Initial Storage & Data Seeding:');
  const initialEventsRes = await window.DB.getEvents({ status: 'all' });
  const initialEvents = initialEventsRes.data || [];
  assert(initialEvents.length >= 3, `Seeded ${initialEvents.length} initial community events`);
  assert(initialEvents.some(e => e.category === 'cultural'), 'Includes cultural festival event');
  assert(initialEvents.some(e => e.category === 'sports'), 'Includes sports tournament event');

  const initialClubsRes = await window.DB.getClubs({ category: 'all' });
  const initialClubs = initialClubsRes.data || [];
  assert(initialClubs.length >= 4, `Seeded ${initialClubs.length} student clubs & societies`);
  assert(initialClubs.some(c => c.name.includes('Natraj')), 'Includes Natraj Cultural Society');
  assert(initialClubs.some(c => c.name.includes('Shaurya')), 'Includes Shaurya Sports Club');

  const initialSportsRes = await window.DB.getSportsActivities({ sport: 'all' });
  const initialSports = initialSportsRes.data || [];
  assert(initialSports.length >= 4, `Seeded ${initialSports.length} recreational sports activities`);

  // 2. Events Discovery, Search & Category Filters
  console.log('\n2. Testing Event Discovery, Search & Category Filters:');
  const culturalEventsRes = await window.DB.getEvents({ category: 'cultural' });
  const culturalEvents = culturalEventsRes.data || [];
  assert(culturalEvents.every(e => e.category === 'cultural'), 'Filtered cultural events correctly');

  const searchResultsRes = await window.DB.getEvents({ query: 'Shaurya' });
  const searchResults = searchResultsRes.data || [];
  assert(searchResults.length >= 1 && searchResults[0].title.includes('Shaurya'), 'Search by title finds Shaurya Cup Tournament');

  const upcomingOnlyRes = await window.DB.getEvents({ timeframe: 'upcoming' });
  const upcomingOnly = upcomingOnlyRes.data || [];
  const allEventsAfterNow = upcomingOnly.every(e => new Date(e.startTime).getTime() >= (Date.now() - 86400000));
  assert(allEventsAfterNow, 'Upcoming timeframe filter returns future/active events');

  // IST Date Formatting Check
  const sampleTime = '2026-11-14T10:00:00+05:30';
  const istFormatted = window.DB.formatISTDateTime(sampleTime);
  assert(istFormatted.includes('IST') || istFormatted.includes('am') || istFormatted.includes('pm') || istFormatted.includes('Nov'), `Formatted IST timestamp properly: "${istFormatted}"`);

  // 3. Event Participation, Registration & Duplicate Prevention
  console.log('\n3. Testing Event Registration & Duplicate Prevention:');
  const targetEvent = initialEvents.find(e => e.status === 'published' && e.capacity > e.registeredCount);
  assert(Boolean(targetEvent), 'Found an open event for registration test');

  const testStudentId = 'student-test-777';
  const regRes1 = await window.DB.registerForEvent(targetEvent.id, {
    name: 'Aman Kumar',
    email: 'aman.cse@gecsheikhpura.ac.in',
    userId: testStudentId,
    branch: 'CSE',
    batch: '2024-2028'
  });
  assert(regRes1.success === true, `Successfully registered student for event: ${targetEvent.title}`);

  // Check that registeredCount increased by 1
  const refreshedEvent = await window.DB.getEventById(targetEvent.id);
  assert(refreshedEvent.registeredCount === targetEvent.registeredCount + 1, `Attendee count incremented to ${refreshedEvent.registeredCount}`);

  // Test Duplicate Registration Prevention (Unique constraint)
  const regResDuplicate = await window.DB.registerForEvent(targetEvent.id, {
    name: 'Aman Kumar',
    email: 'aman.cse@gecsheikhpura.ac.in',
    userId: testStudentId
  });
  assert(regResDuplicate.success === false, 'Duplicate registration attempt is strictly blocked');
  assert(regResDuplicate.error.includes('already registered'), 'Duplicate error message correctly alerts student');

  // Verify registration retrieval for user
  const userRegs = await window.DB.getUserEventRegistrations(testStudentId);
  assert(userRegs.length === 1, 'User registrations query returns 1 active pass');
  assert(userRegs[0].eventId === targetEvent.id, 'Pass matches target event ID');

  // 4. Attendee Privacy & Personal Data Isolation
  console.log('\n4. Testing Attendee Privacy Protection:');
  const publicEventDetails = await window.DB.getEventById(targetEvent.id);
  assert(!publicEventDetails.attendees, 'Public event object does not expose raw attendee roster');
  assert(!JSON.stringify(publicEventDetails).includes('9876543210'), 'Public event object never leaks student phone number');
  assert(!JSON.stringify(publicEventDetails).includes('aman.cse@gecsheikhpura.ac.in'), 'Public event object never leaks student email');

  // 5. Capacity Limit Enforcement
  console.log('\n5. Testing Capacity Limit Enforcement:');
  // Create small test event with capacity of 1
  const limitedEventRes = await window.DB.submitEvent({
    title: 'Closed Chess Blitz (Test)',
    category: 'sports',
    shortDescription: '1 spot test',
    fullDescription: 'Capacity test',
    venue: 'Room 102',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    organizerName: 'Chess Council',
    capacity: 1,
    isOfficial: false
  }, 'admin-tester');

  // Manually approve for testing
  await window.DB.moderateCommunitySubmission('event', limitedEventRes.event.id, 'approved');

  // Register first user (fills capacity 1/1)
  const regFirst = await window.DB.registerForEvent(limitedEventRes.event.id, { name: 'First User', userId: 'user-slot-1' });
  assert(regFirst.success === true, 'First user filled the last remaining spot');

  // Register second user (should be rejected for capacity)
  const regSecond = await window.DB.registerForEvent(limitedEventRes.event.id, { name: 'Second User', userId: 'user-slot-2' });
  assert(regSecond.success === false, 'Registration beyond capacity limit was strictly rejected');
  assert(regSecond.error.includes('capacity') || regSecond.error.includes('Full'), `Received capacity rejection error: "${regSecond.error}"`);

  // 6. Registration Cancellation & Spot Reclaim
  console.log('\n6. Testing Registration Cancellation:');
  const cancelRes = await window.DB.cancelEventRegistration(limitedEventRes.event.id, 'user-slot-1');
  assert(cancelRes.success === true, 'Successfully cancelled registration');

  const reFreedEvent = await window.DB.getEventById(limitedEventRes.event.id);
  assert(reFreedEvent.registeredCount === 0, 'Capacity decremented back to 0 on cancellation');

  // Now user 2 can register since spot was freed
  const regSecondRetry = await window.DB.registerForEvent(limitedEventRes.event.id, { name: 'Second User', userId: 'user-slot-2' });
  assert(regSecondRetry.success === true, 'Second user was able to claim the newly freed spot');

  // 7. Student Clubs & Societies Directory & Proposals
  console.log('\n7. Testing Clubs Directory & Suggestion Workflow:');
  const photographyClubsRes = await window.DB.getClubs({ category: 'photography' });
  const photographyClubs = photographyClubsRes.data || [];
  assert(photographyClubs.length >= 1, 'Found photography club');

  // Submit a club proposal
  const clubPropRes = await window.DB.submitClubSuggestion({
    name: 'Sheikhpura Robotics & Makers Club',
    category: 'innovation',
    description: 'Student hardware and drone prototyping club for campus life',
    focusActivities: '3D printing, Arduino workshops, Roborace competitions',
    meetingSchedule: 'Saturday afternoons',
    meetingLocation: 'Maker Lab 2',
    contactMethod: 'robotics@gecsheikhpura.ac.in',
    socialLinks: { instagram: '@gec_robotics' }
  }, 'student-lead-1');
  assert(clubPropRes.success === true, 'Successfully submitted club proposal');
  assert(clubPropRes.club.verificationStatus === 'pending_proposal', 'Club proposal initially placed in "pending_proposal" status');
  assert(clubPropRes.club.isActive === false, 'Unapproved club proposal is not active yet');

  // Ensure unapproved proposal is excluded from default public list
  const publicClubsRes = await window.DB.getClubs({ category: 'all' });
  const publicClubs = publicClubsRes.data || [];
  assert(!publicClubs.some(c => c.id === clubPropRes.club.id), 'Pending club proposal is not visible to public visitors');

  // 8. Sports & Recreation Activities
  console.log('\n8. Testing Sports Activities Directory:');
  const cricketActivitiesRes = await window.DB.getSportsActivities({ sport: 'cricket' });
  const cricketActivities = cricketActivitiesRes.data || [];
  assert(cricketActivities.length >= 1, 'Found cricket sparring activities');

  const newMatchRes = await window.DB.submitSportsActivity({
    title: 'Sunday Morning Friendly Cricket',
    sportCategory: 'cricket',
    activityType: 'friendly_match',
    venue: 'College Main Ground',
    dateTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    organizerContact: 'cricket.captain@gecsheikhpura.ac.in',
    spotsAvailable: 4,
    notes: 'Bring your own shoes. Bat & balls provided.'
  }, 'cricket-organizer');
  assert(newMatchRes.success === true, 'Successfully posted recreational sports activity');

  // 9. Campus-Life Announcements & Query-Time Auto-Expiry
  console.log('\n9. Testing Announcements Board & Auto-Expiry:');
  // Post an active announcement (expires in 5 days)
  const activeNotice = await window.DB.submitCommunityAnnouncement({
    title: 'Lost Calculator (Casio fx-991CW)',
    content: 'Left in Computer Lab 3 on Monday afternoon. Has blue name sticker.',
    category: 'lost_found',
    expiresInDays: 5
  }, 'student-owner-1');
  assert(activeNotice.success === true, 'Successfully posted campus announcement');

  // Post an already expired announcement (expires in -1 day)
  const expiredAnnouncement = {
    id: 'ann-expired-test',
    title: 'Expired Meeting from Yesterday',
    content: 'This announcement has expired.',
    category: 'general',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    expiresAt: new Date(Date.now() - 86400000).toISOString(), // expired yesterday
    status: 'published',
    submittedBy: 'old-user'
  };
  const currentAnnouncements = JSON.parse(localStorage.getItem('gec_community_announcements') || '[]');
  currentAnnouncements.push(expiredAnnouncement);
  localStorage.setItem('gec_community_announcements', JSON.stringify(currentAnnouncements));

  // Fetch active announcements (should exclude expired ones)
  const visibleAnnouncementsRes = await window.DB.getCommunityAnnouncements({ activeOnly: true });
  const visibleAnnouncements = visibleAnnouncementsRes.data || [];
  assert(visibleAnnouncements.some(a => a.id === activeNotice.announcement.id), 'Active announcement is visible in feed');
  assert(!visibleAnnouncements.some(a => a.id === 'ann-expired-test'), 'Expired announcement is automatically hidden from public feed');

  // 10. Admin Moderation & Audit Logging
  console.log('\n10. Testing Admin Moderation Workflow & Audit Logs:');
  const pendingSubmissions = await window.DB.getPendingCommunitySubmissions();
  assert(pendingSubmissions.clubs.some(c => c.id === clubPropRes.club.id), 'Admin queue sees pending club proposal');

  // Admin approves club proposal
  const modRes = await window.DB.moderateCommunitySubmission('club', clubPropRes.club.id, 'approved', 'Valid student group proposal.');
  assert(modRes.success === true, 'Admin successfully approved club proposal');
  assert(modRes.item.verificationStatus === 'student_group', 'Club status set to "student_group" (honest unofficial label)');
  assert(modRes.item.isActive === true, 'Approved club is now active');

  // Verify club now appears in public catalog
  const updatedPublicClubsRes = await window.DB.getClubs({ category: 'all' });
  const updatedPublicClubs = updatedPublicClubsRes.data || [];
  assert(updatedPublicClubs.some(c => c.id === clubPropRes.club.id), 'Newly approved club is now visible in public directory');

  // Verify moderation audit log
  const auditLogs = JSON.parse(localStorage.getItem('gec_moderation_logs') || '[]');
  assert(auditLogs.some(log => log.target_id === clubPropRes.club.id && log.action_type === 'approve_club'), 'Moderation action was recorded in persistent audit log');

  // 11. Mandatory Platform Separation (Apna College Bihar)
  console.log('\n11. Testing Platform Separation from Apna College Bihar:');
  const communityHtml = fs.readFileSync(path.join(__dirname, '../community.html'), 'utf8');
  assert(communityHtml.includes('https://www.apnacollegebihar.online/'), 'Community page contains link to Apna College Bihar');
  assert(communityHtml.includes('apna-college-banner') || communityHtml.includes('apna-college'), 'Community page has dedicated Apna College Bihar banner for academics');
  assert(!communityHtml.includes('handwritten notes library') && !communityHtml.includes('syllabus tracker'), 'Does not duplicate academic notes or syllabus LMS on GEC Hub');

  console.log('\n================================================================');
  console.log(`Phase 7 Test Results: ${passed} passed, ${failed} failed (${Math.round((passed / (passed + failed)) * 100)}% success)`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution threw exception:", err);
  process.exit(1);
});
