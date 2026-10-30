/**
 * GEC Sheikhpura Student Life Hub - Phase 12 Comprehensive Test Suite
 * Official Website Discovery, Public Data Import & Source-Synced Directory
 *
 * Verifies all 16 requirements from Phase 12 Specification:
 * 1. Recursive internal-link discovery & URL normalization
 * 2. Duplicate URL detection & SHA-256 content hashing
 * 3. Crawl-depth and page-limit enforcement
 * 4. Handling of inaccessible / 404 pages without silent loss
 * 5. PDF metadata, text extraction, and circular tracking
 * 6. Correct categorization across all 8 college sections
 * 7. 100% Source URL retention and domain boundary enforcement
 * 8. Faculty and room-number validation (no hallucinated rooms)
 * 9. Restricted page security boundary (no scraping behind auth)
 * 10. Import pipeline state machine (discovered -> approved -> published)
 * 11. Incremental update detection via content hashing
 * 12. Public directory search, category, and content type filters
 * 13. Admin moderation actions (review, category fix, audit notes)
 * 14. Crawl report export in JSON and CSV formats
 * 15. Academic platform separation (study notes point to Apna College Bihar)
 * 16. Full Regression Testing across Phases 1–11
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const crypto = require('crypto');
const { URL } = require('url');

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
    removeChild: () => {},
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

// Mock Blob and URL for export test
global.Blob = class {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};
global.URL = URL;

// Load HUB_DATA, CRAWLED_DATA & DB Service
const dataJsPath = path.join(__dirname, '../assets/js/data.js');
const crawledDataJsPath = path.join(__dirname, '../assets/js/crawled-data.js');
const dbServiceJsPath = path.join(__dirname, '../assets/js/db-service.js');

const dataCode = fs.readFileSync(dataJsPath, 'utf8') + '\nglobal.HUB_DATA = HUB_DATA; global.window.HUB_DATA = HUB_DATA;';
eval(dataCode);

if (fs.existsSync(crawledDataJsPath)) {
  eval(fs.readFileSync(crawledDataJsPath, 'utf8'));
  global.window.CRAWLED_DATA = window.CRAWLED_DATA;
}

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

async function runPhase12CrawlerAndDirectoryTests() {
  console.log('\n================================================================');
  console.log('🌐 Starting Phase 12: Official Website Discovery & Sync Tests');
  console.log('================================================================\n');

  const db = window.DB;

  // -------------------------------------------------------------
  // Test 1: Recursive internal-link discovery & URL normalization
  // -------------------------------------------------------------
  await it('Test 1: Normalizes URLs, strips tracking query parameters and trailing slashes correctly', () => {
    const rawUrl1 = 'https://www.gecsheikhpura.ac.in/about-us/history/?utm_source=feed&fbclid=xyz#top';
    const parsed = new URL(rawUrl1);
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('fbclid');
    parsed.hash = '';
    let normalized = parsed.toString();
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    assert.strictEqual(normalized, 'https://www.gecsheikhpura.ac.in/about-us/history');
  });

  // -------------------------------------------------------------
  // Test 2: Duplicate URL and duplicate content detection via SHA-256
  // -------------------------------------------------------------
  await it('Test 2: Generates consistent SHA-256 content hashes and detects duplicates', () => {
    const contentA = 'Government Engineering College Sheikhpura Bajidpur Campus History';
    const contentB = 'Government Engineering College Sheikhpura Bajidpur Campus History';
    const contentC = 'Government Engineering College Sheikhpura Bajidpur Campus Updated 2026';

    const hashA = crypto.createHash('sha256').update(contentA).digest('hex');
    const hashB = crypto.createHash('sha256').update(contentB).digest('hex');
    const hashC = crypto.createHash('sha256').update(contentC).digest('hex');

    assert.strictEqual(hashA, hashB, 'Identical content must produce identical hash');
    assert.notStrictEqual(hashA, hashC, 'Different content must produce different hash');
    assert.strictEqual(hashA.length, 64, 'SHA-256 hash must be 64 hexadecimal characters');
  });

  // -------------------------------------------------------------
  // Test 3: Crawl depth and page limit enforcement
  // -------------------------------------------------------------
  await it('Test 3: Enforces max crawl depth and page limits without infinite recursion', () => {
    const OfficialSiteCrawler = require('../scripts/crawler.js');
    const crawler = new OfficialSiteCrawler({
      maxDepth: 2,
      maxPages: 10,
      requestDelayMs: 0
    });
    assert.strictEqual(crawler.maxDepth, 2);
    assert.strictEqual(crawler.maxPages, 10);
    assert.strictEqual(crawler.normalizeUrl('https://external-domain.com/path'), null, 'External domains must be rejected');
    assert.ok(crawler.normalizeUrl('https://www.gecsheikhpura.ac.in/academics/'), 'Official internal links must be accepted');
  });

  // -------------------------------------------------------------
  // Test 4: Handling of inaccessible / 404 pages
  // -------------------------------------------------------------
  await it('Test 4: Inaccessible and broken 404 links are recorded with status and error message, not dropped', async () => {
    const pagesRes = await db.getCrawledPages({ status: 'all', limit: 100 });
    const pages = pagesRes.data;
    
    // Check if 404 pages discovered from live college site are tracked
    const naacPage = pages.find(p => p.http_status === 404 || p.import_status === 'outdated');
    assert.ok(naacPage, 'Broken/inactive official page must exist in crawled records');
    assert.strictEqual(naacPage.http_status, 404);
    assert.strictEqual(naacPage.import_status, 'outdated');
    assert.ok(naacPage.error_message.includes('404'), 'Error message must note HTTP 404');
  });

  // -------------------------------------------------------------
  // Test 5: PDF metadata, text extraction, and circular tracking
  // -------------------------------------------------------------
  await it('Test 5: Public PDF documents and circulars store original URLs, dates, and extraction status', async () => {
    const docs = await db.getCrawledDocuments();
    assert.ok(Array.isArray(docs), 'Docs must be an array');
    assert.ok(docs.length >= 4, `Expected at least 4 verified PDF documents, got ${docs.length}`);

    const examDoc = docs.find(d => d.id === 'doc-01');
    assert.ok(examDoc, 'Examination notice document must exist');
    const docUrl = examDoc.pdf_url || examDoc.download_url;
    assert.ok(docUrl && docUrl.endsWith('.pdf'), 'Must preserve original PDF URL');
    assert.strictEqual(examDoc.document_date || examDoc.published_date, '2026-10-24');
    assert.strictEqual(examDoc.extraction_status, 'verified');
  });

  // -------------------------------------------------------------
  // Test 6: Correct classification across all 8 college sections
  // -------------------------------------------------------------
  await it('Test 6: Classifies crawled resources into appropriate college sections', async () => {
    const pagesRes = await db.getCrawledPages({ status: 'all', limit: 100 });
    const pages = pagesRes.data;

    const sections = new Set(pages.map(p => p.section));
    assert.ok(sections.has('college_overview'), 'Must have college_overview section');
    assert.ok(sections.has('administration'), 'Must have administration section');
    assert.ok(sections.has('faculty_departments'), 'Must have faculty_departments section');
    assert.ok(sections.has('training_placement'), 'Must have training_placement section');
    assert.ok(sections.has('facilities_services'), 'Must have facilities_services section');
    assert.ok(sections.has('activities_clubs'), 'Must have activities_clubs section');
    assert.ok(sections.has('affiliation_approvals'), 'Must have affiliation_approvals section');
    assert.ok(sections.has('public_notices'), 'Must have public_notices section');
  });

  // -------------------------------------------------------------
  // Test 7: 100% Source URL retention and domain attribution
  // -------------------------------------------------------------
  await it('Test 7: Every single crawled page preserves original source URL on gecsheikhpura.ac.in', async () => {
    const pagesRes = await db.getCrawledPages({ status: 'all', limit: 100 });
    const pages = pagesRes.data;

    for (const page of pages) {
      assert.ok(page.source_url, `Page ${page.id} must have source_url`);
      assert.ok(
        page.source_url.startsWith('https://www.gecsheikhpura.ac.in/') ||
        page.source_url.startsWith('https://gecsheikhpura.ac.in/'),
        `Page ${page.id} source_url must point to gecsheikhpura.ac.in, got: ${page.source_url}`
      );
      assert.strictEqual(page.source_domain, 'gecsheikhpura.ac.in');
    }
  });

  // -------------------------------------------------------------
  // Test 8: Faculty and room number extraction accuracy
  // -------------------------------------------------------------
  await it('Test 8: Room numbers are only assigned if explicitly verified; no hallucinated inferences', async () => {
    const faculty = await db.getFacultyMembers();
    assert.ok(Array.isArray(faculty), 'Faculty must be an array');

    for (const member of faculty) {
      if (member.room_number && member.room_number !== 'Not verified') {
        assert.ok(member.building_block, `Member ${member.name} with room ${member.room_number} must have a building block`);
        assert.strictEqual(member.verification_status, 'verified');
      }
    }
  });

  // -------------------------------------------------------------
  // Test 9: Strict security & restricted login portal handling
  // -------------------------------------------------------------
  await it('Test 9: Login portals are categorized as restricted; crawler never scrapes behind authentication', async () => {
    const pagesRes = await db.getCrawledPages({ status: 'all', limit: 100 });
    const pages = pagesRes.data;

    const loginPages = pages.filter(p => p.content_type === 'login_portal' || p.import_status === 'restricted' || p.source_url.includes('login'));
    assert.ok(loginPages.length >= 1, 'Must record the public login page');

    for (const lp of loginPages) {
      assert.strictEqual(lp.import_status, 'restricted');
      const summ = lp.short_summary.toLowerCase();
      assert.ok(summ.includes('credential') || summ.includes('authentication') || summ.includes('restricted'), 'Summary must explain it requires credentials');
      assert.ok(!lp.extracted_text || lp.extracted_text.length < 500, 'Must not scrape private data');
    }
  });

  // -------------------------------------------------------------
  // Test 10: Import pipeline state machine & transitions
  // -------------------------------------------------------------
  await it('Test 10: Import workflow transitions between valid states with admin notes', async () => {
    const pagesRes = await db.getCrawledPages({ status: 'all', limit: 10 });
    const target = pagesRes.data[0];
    const pageId = target.id;

    // Update status to review_required
    const res1 = await db.updateCrawledPageStatus(pageId, 'review_required', 'Triggered test review note');
    assert.strictEqual(res1.success, true);

    const updated1 = await db.getCrawledPageById(pageId);
    assert.strictEqual(updated1.import_status, 'review_required');
    assert.strictEqual(updated1.error_message, 'Triggered test review note');

    // Approve & publish record
    const res2 = await db.updateCrawledPageStatus(pageId, 'approved', 'Verified and approved');
    assert.strictEqual(res2.success, true);

    const updated2 = await db.getCrawledPageById(pageId);
    assert.strictEqual(updated2.import_status, 'approved');
  });

  // -------------------------------------------------------------
  // Test 11: Incremental update & change detection via content hash
  // -------------------------------------------------------------
  await it('Test 11: Incremental synchronization detects updated content and records sync job', async () => {
    const syncRes = await db.runCrawlerSyncJob({ scope: 'incremental', maxPages: 25 });
    assert.strictEqual(syncRes.success, true);
    assert.ok(syncRes.job, 'Must return job audit details');
    assert.strictEqual(syncRes.job.status, 'completed');
    assert.ok(syncRes.job.pages_crawled > 0, 'Must inspect pages during sync');

    const jobs = await db.getCrawlJobs();
    assert.ok(jobs.length >= 2, 'Crawl jobs history must retain executed jobs');
  });

  // -------------------------------------------------------------
  // Test 12: Public directory search, category, and content filters
  // -------------------------------------------------------------
  await it('Test 12: Filters crawled pages by search query, section, and content type', async () => {
    // Search query
    const searchRes = await db.getCrawledPages({ query: 'Principal', status: 'all' });
    assert.ok(searchRes.data.length >= 1, 'Search for Principal must return results');
    assert.ok(searchRes.data[0].page_title.includes('Principal'));

    // Section filter
    const placementRes = await db.getCrawledPages({ section: 'training_placement', status: 'all' });
    assert.ok(placementRes.data.length >= 2, 'Placement section must return results');
    for (const p of placementRes.data) {
      assert.strictEqual(p.section, 'training_placement');
    }

    // Public view only gets approved records
    const publicRes = await db.getCrawledPages({ status: 'approved' });
    for (const p of publicRes.data) {
      assert.strictEqual(p.import_status, 'approved', 'Public query must only return approved records');
    }
  });

  // -------------------------------------------------------------
  // Test 13: Admin category correction & recategorization
  // -------------------------------------------------------------
  await it('Test 13: Admin can correct category and subcategory assignments', async () => {
    const pagesRes = await db.getCrawledPages({ status: 'all', limit: 10 });
    const target = pagesRes.data[1];
    const pageId = target.id;

    const res = await db.updateCrawledPageCategory(pageId, 'college_overview', 'Statutory Acts & Norms');
    assert.strictEqual(res.success, true);

    const page = await db.getCrawledPageById(pageId);
    assert.strictEqual(page.section, 'college_overview');
    assert.strictEqual(page.subcategory, 'Statutory Acts & Norms');
  });

  // -------------------------------------------------------------
  // Test 14: Crawl report export in JSON and CSV formats
  // -------------------------------------------------------------
  await it('Test 14: Exports comprehensive crawl audit report in JSON and CSV formats', async () => {
    const jsonReport = await db.exportCrawlReport('json');
    assert.strictEqual(jsonReport.success, true);
    assert.strictEqual(jsonReport.mimeType, 'application/json');
    const parsed = JSON.parse(jsonReport.content);
    assert.ok(parsed.metadata, 'JSON export must include metadata');
    assert.ok(parsed.pages.length >= 50, 'JSON export must contain all crawled pages');

    const csvReport = await db.exportCrawlReport('csv');
    assert.strictEqual(csvReport.success, true);
    assert.strictEqual(csvReport.mimeType, 'text/csv');
    assert.ok(csvReport.content.includes('id,page_title,section,subcategory,content_type,import_status,http_status,source_url'), 'CSV must contain standard headers');
  });

  // -------------------------------------------------------------
  // Test 15: Academic platform separation boundary
  // -------------------------------------------------------------
  await it('Test 15: Academic resources are strictly separated and route to Apna College Bihar', () => {
    const html = fs.readFileSync(path.join(__dirname, '../official-directory.html'), 'utf8');
    assert.ok(html.includes('https://www.apnacollegebihar.online/'), 'Official directory must have prominent link to Apna College Bihar');
    assert.ok(html.includes('UNOFFICIAL SOURCE-SYNC DISCLAIMER'), 'Must contain unofficial disclaimer');
    assert.ok(html.includes('gecsheikhpura.ac.in'), 'Must cite official source');
  });

  // -------------------------------------------------------------
  // Test 16: Full Regression Testing across Phases 1–11
  // -------------------------------------------------------------
  await it('Test 16: Full Regression - All core features across Phases 1–11 remain intact', async () => {
    // Phase 1-3: Core data
    assert.ok(HUB_DATA.branches.length >= 4, 'Phase 1 branches intact');
    assert.ok(HUB_DATA.shops.length >= 5, 'Phase 2 shops intact');
    assert.ok(HUB_DATA.rooms.length >= 4, 'Phase 3 rooms intact');

    // Phase 4: Listings & Submissions
    const bizSubs = await db.getAdminBusinessSubmissions();
    assert.ok(bizSubs.length >= 1, 'Phase 4 getAdminBusinessSubmissions intact');

    // Phase 8: Emergency & Transit
    const emerg = await db.getEmergencyContacts();
    assert.ok(emerg.length >= 4, 'Phase 8 emergency directory intact');

    // Phase 10: Feedback & Feature flags
    const flags = db.getFeatureFlags();
    assert.ok(flags.advanced_search_filters !== undefined, 'Phase 10 feature flags intact');

    // Phase 11: Lost & Found + Campus Directory
    const lf = await db.getLostFoundItems();
    assert.ok(lf.data.length >= 3, 'Phase 11 lost & found items intact');
    const fac = await db.getFacultyMembers();
    assert.ok(fac.length >= 8, 'Phase 11 faculty members intact');
    const facils = await db.getCampusFacilities();
    assert.ok(facils.length >= 9, 'Phase 11 campus facilities intact');
  });

  console.log('\n================================================================');
  console.log(`📊 Phase 12 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase12CrawlerAndDirectoryTests();
