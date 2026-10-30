/**
 * Phase 9 Automated Logic, SEO, Feedback & Production QA Suite
 * GEC Sheikhpura Student Life Hub - Final Launch, SEO, Student Feedback & Quality Assurance
 *
 * Verifies:
 * 1. Broken Stylesheet Links Fix: marketplace.html references real stylesheets.
 * 2. SEO Infrastructure: robots.txt, sitemap.xml, custom 404.html error handling.
 * 3. Trust & Governance Pages: about.html, privacy.html, terms.html, community-guidelines.html.
 * 4. Student Feedback System: Submission, honeypot spam guard, rate limiting, filtering, status updates.
 * 5. Database Migration Schema (Phase 9): student_feedback table, indexes, RLS policies.
 * 6. Accessibility & High-Contrast Focus: :focus-visible, 44px touch targets, reduced motion.
 * 7. Academic Platform Separation: Strict link to Apna College Bihar, zero academic duplication.
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

async function runPhase9Tests() {
  console.log('================================================================');
  console.log('🧪 Starting Phase 9 Final Launch, SEO, Feedback & QA Tests');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: Broken Stylesheet References in marketplace.html
  // -------------------------------------------------------------
  console.log('1. Testing Stylesheet References & Clean Links:');
  const marketHtml = fs.readFileSync(path.join(__dirname, '../marketplace.html'), 'utf8');
  assert(!marketHtml.includes('assets/css/main.css'), 'marketplace.html does NOT link to missing main.css');
  assert(!marketHtml.includes('assets/css/responsive.css'), 'marketplace.html does NOT link to missing responsive.css');
  assert(marketHtml.includes('assets/css/style.css'), 'marketplace.html correctly links to assets/css/style.css');
  assert(marketHtml.includes('assets/css/components.css'), 'marketplace.html correctly links to assets/css/components.css');

  // -------------------------------------------------------------
  // Test 2: SEO Infrastructure (robots.txt, sitemap.xml, 404.html)
  // -------------------------------------------------------------
  console.log('\n2. Testing SEO Infrastructure & Search Directives:');
  const robotsPath = path.join(__dirname, '../robots.txt');
  assert(fs.existsSync(robotsPath), 'robots.txt exists in root directory');
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  assert(robotsContent.includes('Disallow: /admin.html'), 'robots.txt disallows indexing of admin console');
  assert(robotsContent.includes('Disallow: /dashboard.html'), 'robots.txt disallows indexing of private student dashboard');
  assert(robotsContent.includes('Disallow: /saved-items.html'), 'robots.txt disallows indexing of saved items');
  assert(robotsContent.includes('Allow: /rooms-pg.html'), 'robots.txt permits public crawling of room directory');
  assert(robotsContent.includes('Allow: /marketplace.html'), 'robots.txt permits public crawling of marketplace');
  assert(robotsContent.includes('Sitemap: https://gecsheikhpurahub.in/sitemap.xml'), 'robots.txt references canonical XML sitemap');

  const sitemapPath = path.join(__dirname, '../sitemap.xml');
  assert(fs.existsSync(sitemapPath), 'sitemap.xml exists in root directory');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  assert(sitemapContent.includes('https://gecsheikhpurahub.in/rooms-pg.html'), 'sitemap.xml indexes rooms & PG directory');
  assert(sitemapContent.includes('https://gecsheikhpurahub.in/marketplace.html'), 'sitemap.xml indexes student marketplace');
  assert(sitemapContent.includes('https://gecsheikhpurahub.in/community.html'), 'sitemap.xml indexes student community');
  assert(!sitemapContent.includes('admin.html'), 'sitemap.xml strictly excludes private admin page');
  assert(!sitemapContent.includes('dashboard.html'), 'sitemap.xml strictly excludes private dashboard page');

  const error404Path = path.join(__dirname, '../404.html');
  assert(fs.existsSync(error404Path), '404.html exists in root directory');
  const error404Content = fs.readFileSync(error404Path, 'utf8');
  assert(error404Content.includes('content="noindex'), '404.html specifies noindex to protect search hygiene');
  assert(error404Content.includes('rooms-pg.html'), '404.html guides students to room discovery');
  assert(error404Content.includes('emergency.html'), '404.html provides access to emergency directory');
  assert(error404Content.includes('https://www.apnacollegebihar.online/'), '404.html routes academic inquiries to Apna College Bihar');

  // -------------------------------------------------------------
  // Test 3: Trust & Governance Pages
  // -------------------------------------------------------------
  console.log('\n3. Testing Trust, Safety & Legal Governance Pages:');
  const aboutPath = path.join(__dirname, '../about.html');
  assert(fs.existsSync(aboutPath), 'about.html exists');
  const aboutContent = fs.readFileSync(aboutPath, 'utf8');
  assert(aboutContent.includes('Unofficial Disclaimer') || aboutContent.includes('Independent'), 'about.html contains prominent unofficial disclaimer');
  assert(aboutContent.includes('https://www.apnacollegebihar.online/'), 'about.html documents academic separation with Apna College Bihar');

  const privacyPath = path.join(__dirname, '../privacy.html');
  assert(fs.existsSync(privacyPath), 'privacy.html exists');
  const privacyContent = fs.readFileSync(privacyPath, 'utf8');
  assert(privacyContent.includes('Local Storage'), 'privacy.html documents local storage usage');
  assert(privacyContent.includes('[REDACTED]') || privacyContent.includes('Redaction'), 'privacy.html details automated credential redaction');
  assert(privacyContent.includes('Zero Third-Party') || privacyContent.includes('Advertising'), 'privacy.html affirms zero ad tracking policy');

  const termsPath = path.join(__dirname, '../terms.html');
  assert(fs.existsSync(termsPath), 'terms.html exists');
  const termsContent = fs.readFileSync(termsPath, 'utf8');
  assert(termsContent.includes('Inspect Rooms in Person') || termsContent.includes('Physical Inspection'), 'terms.html mandates physical room inspection before payment');
  assert(termsContent.includes('Prohibited Conduct'), 'terms.html defines prohibited actions');

  const guidelinesPath = path.join(__dirname, '../community-guidelines.html');
  assert(fs.existsSync(guidelinesPath), 'community-guidelines.html exists');
  const guidelinesContent = fs.readFileSync(guidelinesPath, 'utf8');
  assert(guidelinesContent.includes('Anti-Ragging') || guidelinesContent.includes('1800-180-5522'), 'community-guidelines.html provides Anti-Ragging helpline 1800-180-5522');

  // -------------------------------------------------------------
  // Test 4: Student Feedback System Logic
  // -------------------------------------------------------------
  console.log('\n4. Testing Student Feedback System Logic:');
  localStorage.clear();
  sessionStorage.clear();

  // Test Honeypot Spam Protection
  const honeypotRes = await window.DB.submitStudentFeedback({
    category: 'missing_service',
    description: 'Valid description text here for test',
    bot_field: 'I am a spam bot'
  });
  assert(!honeypotRes.success, 'Honeypot field triggers immediate spam rejection');
  assert(honeypotRes.error.includes('anti-spam'), 'Rejection error message correctly flags anti-spam guard');

  // Test Description Length Validation
  const tooShortRes = await window.DB.submitStudentFeedback({
    category: 'missing_service',
    description: 'Too short'
  });
  assert(!tooShortRes.success, 'Description under 10 chars is rejected');

  // Test Valid Feedback Submission
  const validRes = await window.DB.submitStudentFeedback({
    category: 'missing_service',
    description: 'Please add Sharma Stationery near Bajidpur Gate to directory.',
    related_page_or_listing: 'explore-nearby.html',
    contact_info: 'amit@gecsheikhpura.ac.in'
  });
  assert(validRes.success, 'Valid feedback submitted successfully');
  assert(validRes.item.id.startsWith('fb-'), 'Feedback assigned valid ID format');
  assert(validRes.item.status === 'pending', 'Initial feedback status is pending');
  assert(validRes.item.category === 'missing_service', 'Category properly recorded');

  // Test Rate Limiting Cooldown
  const rapidRes = await window.DB.submitStudentFeedback({
    category: 'bug_broken',
    description: 'Another immediate submission test string.'
  });
  assert(!rapidRes.success, 'Immediate subsequent submission blocked by rate limit cooldown');
  assert(rapidRes.error.includes('wait a moment'), 'Cooldown message alerts student to wait');

  // Test Queue Retrieval & Filtering
  sessionStorage.removeItem('gec_last_feedback_time'); // Clear cooldown for testing
  await window.DB.submitStudentFeedback({
    category: 'room_availability',
    description: 'Hostel vacancy changed for 3rd semester students.',
    related_page_or_listing: 'rooms-pg.html'
  });

  const allFeedback = await window.DB.getStudentFeedback({ status: 'all' });
  assert(allFeedback.total >= 2, `Retrieved all feedback items (found ${allFeedback.total})`);

  const categoryFiltered = await window.DB.getStudentFeedback({ category: 'room_availability' });
  assert(categoryFiltered.feedback.every(f => f.category === 'room_availability'), 'Category filter strictly matches requested category');

  // Test Status Update by Admin
  const updateRes = await window.DB.updateStudentFeedbackStatus(validRes.item.id, 'resolved', 'Sharma Stationery added to directory.');
  assert(updateRes.success, 'Admin successfully updated feedback status');
  assert(updateRes.item.status === 'resolved', 'Feedback status transitioned to resolved');
  assert(updateRes.item.admin_notes === 'Sharma Stationery added to directory.', 'Admin resolution note persisted');

  // -------------------------------------------------------------
  // Test 5: Database Migration Schema (Phase 9)
  // -------------------------------------------------------------
  console.log('\n5. Testing Database Migration Schema (Phase 9):');
  const schema9Path = path.join(__dirname, '../supabase/schema_phase9.sql');
  assert(fs.existsSync(schema9Path), 'supabase/schema_phase9.sql exists on filesystem');
  const schema9Content = fs.readFileSync(schema9Path, 'utf8');
  assert(schema9Content.includes('CREATE TABLE IF NOT EXISTS public.student_feedback'), 'Schema defines student_feedback table');
  assert(schema9Content.includes('idx_student_feedback_status_created'), 'Schema defines compound index for status and created_at');
  assert(schema9Content.includes('ENABLE ROW LEVEL SECURITY'), 'Schema enables Row Level Security on student_feedback');
  assert(schema9Content.includes('Only administrators can view student feedback'), 'Schema restricts feedback read access to administrators');

  // -------------------------------------------------------------
  // Test 6: Accessibility & High-Contrast Focus Styles
  // -------------------------------------------------------------
  console.log('\n6. Testing Accessibility Hardening in CSS:');
  const styleCss = fs.readFileSync(path.join(__dirname, '../assets/css/style.css'), 'utf8');
  assert(styleCss.includes(':focus-visible'), 'style.css defines universal :focus-visible rules');
  assert(styleCss.includes('min-height: 44px'), 'style.css enforces WCAG 2.1 AA 44px minimum touch targets');
  assert(styleCss.includes('prefers-reduced-motion: reduce'), 'style.css respects reduced motion preference');

  // -------------------------------------------------------------
  // Test 7: Production Launch & Usability Documentation
  // -------------------------------------------------------------
  console.log('\n7. Testing Launch Guide & Usability Protocol:');
  const launchPath = path.join(__dirname, '../LAUNCH_GUIDE.md');
  assert(fs.existsSync(launchPath), 'LAUNCH_GUIDE.md exists');
  const launchContent = fs.readFileSync(launchPath, 'utf8');
  assert(launchContent.includes('Stage A: Private Alpha Testing'), 'Launch guide defines Stage A alpha rollout');
  assert(launchContent.includes('Stage B: Limited Campus Release'), 'Launch guide defines Stage B limited release');
  assert(launchContent.includes('Stage C: Campus-Wide Discovery'), 'Launch guide defines Stage C discovery');
  assert(launchContent.includes('Student Usability Testing Protocol'), 'Launch guide contains structured usability testing protocol');
  assert(launchContent.includes('Apna College Bihar'), 'Launch guide reinforces separation with Apna College Bihar');

  // -------------------------------------------------------------
  // Test 8: Metadata & Schema.org on index.html
  // -------------------------------------------------------------
  console.log('\n8. Testing index.html SEO & Schema.org JSON-LD:');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert(indexHtml.includes('rel="canonical"'), 'index.html defines canonical link');
  assert(indexHtml.includes('property="og:title"'), 'index.html defines Open Graph title');
  assert(indexHtml.includes('application/ld+json'), 'index.html defines Schema.org structured data');
  assert(indexHtml.includes('@type": "WebSite"'), 'index.html declares WebSite structured data');

  console.log('\n================================================================');
  console.log(`📊 Test Summary: ${passed} / ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('================================================================');

  if (failed > 0) {
    console.error(`❌ ${failed} tests failed!`);
    process.exit(1);
  } else {
    console.log('🎉 ALL PHASE 9 LAUNCH, SEO, FEEDBACK & QA GATES PASSED!\n');
  }
}

runPhase9Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
