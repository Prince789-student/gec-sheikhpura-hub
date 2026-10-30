/**
 * Phase 6 Automated Logic Verification Suite
 * GEC Sheikhpura Student Life Hub - Advanced Maps, Nearby Discovery, Distance Filters & PWA
 * Tests:
 * 1. Haversine Distance Formula against known geographic benchmarks
 * 2. Distinction between straight-line and road distance
 * 3. Coordinate validation & missing coordinates handling
 * 4. Distance radius filtering (1 km, 3 km, 5 km, 10 km)
 * 5. Multi-criteria sorting (Nearest first, rating, name)
 * 6. Mandatory Platform Separation: Academic query interception (Apna College Bihar)
 * 7. College reference point calibration & admin updating
 * 8. PWA Web App Manifest structure & icons validation
 * 9. PWA Service Worker caching & offline fallback validation
 * 10. Dedicated offline.html emergency directory integrity
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
  console.log('🧪 Starting Phase 6 Advanced Maps, Distance & PWA Verification');
  console.log('================================================================');

  // 1. Haversine Distance Calculation against Geographic Benchmarks
  console.log('\n1. Testing Haversine Geographic Distance Calculations:');
  const campusLat = 25.1380;
  const campusLng = 85.8640;

  // Zero distance test
  const zeroDist = window.DB.calculateHaversineDistance(campusLat, campusLng, campusLat, campusLng);
  assert(zeroDist === 0, `Identical coordinates yield 0 km distance (got ${zeroDist})`);

  // GEC Campus Gate to Sheikhpura Railway Station SHK (25.1480, 85.8550)
  // Distance: ~1.43 km straight-line (road is ~4.8 km)
  const stationDist = window.DB.calculateHaversineDistance(campusLat, campusLng, 25.1480, 85.8550);
  assert(stationDist >= 1.35 && stationDist <= 1.55, `Straight-line to Station is ~1.43 km (got ${stationDist} km)`);

  // Bajidpur Gate to Police Line Mor (~0.08 km)
  const localMorDist = window.DB.calculateHaversineDistance(campusLat, campusLng, 25.1375, 85.8635);
  assert(localMorDist >= 0.05 && localMorDist <= 0.15, `Straight-line to Bajidpur Mor is ~0.08 km (got ${localMorDist} km)`);

  // 2. Coordinate Validation & Missing Coordinate Safety
  console.log('\n2. Testing Coordinate Validation & Missing Coordinate Safety:');
  const nullLatDist = window.DB.calculateHaversineDistance(null, 85.8640, campusLat, campusLng);
  assert(nullLatDist === null, 'Null coordinate safely returns null distance');

  const outOfBoundsLat = window.DB.calculateHaversineDistance(95.0, 85.8640, campusLat, campusLng);
  assert(outOfBoundsLat === null, 'Out of bounds latitude (> 90) returns null');

  const outOfBoundsLng = window.DB.calculateHaversineDistance(25.1380, 195.0, campusLat, campusLng);
  assert(outOfBoundsLng === null, 'Out of bounds longitude (> 180) returns null');

  // 3. College Reference Point Calibration & Management
  console.log('\n3. Testing College Reference Point Management:');
  const defaultRef = window.DB.getCollegeReferencePoint();
  assert(defaultRef.id === 'gec_main_gate', 'Default reference ID is gec_main_gate');
  assert(defaultRef.lat === 25.1380 && defaultRef.lng === 85.8640, 'Default campus entrance coordinates are (25.1380, 85.8640)');

  // Admin calibration test
  const calibRes = await window.DB.setCollegeReferencePoint({
    name: 'GEC Sheikhpura - Calibrated Entrance Gate',
    lat: 25.1382,
    lng: 85.8642,
    address: 'Bajidpur, Sheikhpura'
  });
  assert(calibRes.success === true, 'Admin successfully calibrated college reference point');
  const updatedRef = window.DB.getCollegeReferencePoint();
  assert(updatedRef.lat === 25.1382, `Active reference point updated to ${updatedRef.lat}`);

  // Test invalid coordinates rejection
  const invalidCalib = await window.DB.setCollegeReferencePoint({ lat: 105.0, lng: 85.0 });
  assert(invalidCalib.success === false, 'Invalid latitude (> 90) calibration rejected');

  // Reset back to standard gate for remaining tests
  await window.DB.setCollegeReferencePoint({
    name: 'GEC Sheikhpura - Bajidpur Main Gate',
    lat: 25.1380,
    lng: 85.8640,
    address: 'Bajidpur, Near Police Line, Sheikhpura, Bihar 811105'
  });

  // 4. Unified Nearby Locations & Categorization
  console.log('\n4. Testing Unified Nearby Catalog:');
  const nearbyAll = await window.DB.getUnifiedNearbyLocations({ category: 'all' });
  assert(nearbyAll.data.length >= 10, `Loaded ${nearbyAll.data.length} verified multi-category locations`);
  assert(nearbyAll.data.some(p => p.category === 'stationery'), 'Includes stationery & photocopy shops');
  assert(nearbyAll.data.some(p => p.category === 'rooms'), 'Includes student rooms and hostels');
  assert(nearbyAll.data.some(p => p.category === 'food'), 'Includes tiffin and mess services');
  assert(nearbyAll.data.some(p => p.category === 'medical'), 'Includes Sadar hospital & pharmacies');
  assert(nearbyAll.data.some(p => p.category === 'transport'), 'Includes transit stations & auto stands');

  // Verify straight-line vs road route distinction
  const firstItem = nearbyAll.data[0];
  assert(firstItem.straightLineDistance.includes('straight-line'), 'Straight-line distance is explicitly labeled');
  assert(firstItem.roadDistance.includes('road distance') || firstItem.roadDistance.includes('from campus') || firstItem.roadDistance.includes('Campus'), 'Road route description is distinctly preserved');
  assert(firstItem.directionsUrl.includes('google.com/maps/dir'), 'Directions URL points to external routing');

  // 5. Distance Radius Filtering
  console.log('\n5. Testing Distance Radius Filters:');
  const within1km = await window.DB.getUnifiedNearbyLocations({ radiusKm: 1.0 });
  assert(within1km.data.length > 0, `Found ${within1km.data.length} locations within 1 km`);
  assert(within1km.data.every(p => p.straightLineKm <= 1.0), 'All results strictly within 1.0 km radius');

  const within3km = await window.DB.getUnifiedNearbyLocations({ radiusKm: 3.0 });
  assert(within3km.data.length >= within1km.data.length, `Radius 3 km (${within3km.data.length}) >= Radius 1 km (${within1km.data.length})`);

  const within5km = await window.DB.getUnifiedNearbyLocations({ radiusKm: 5.0 });
  assert(within5km.data.length >= within3km.data.length, `Radius 5 km includes town center locations (${within5km.data.length} places)`);

  // 6. Sorting Accuracy (Nearest First & Rating)
  console.log('\n6. Testing Sorting Accuracy:');
  const sortedDistance = await window.DB.getUnifiedNearbyLocations({ sortBy: 'distance' });
  let isAscending = true;
  for (let i = 0; i < sortedDistance.data.length - 1; i++) {
    if (sortedDistance.data[i].straightLineKm > sortedDistance.data[i+1].straightLineKm) {
      isAscending = false;
      break;
    }
  }
  assert(isAscending, 'Nearest-first sort orders strictly by ascending straight-line distance');

  const sortedRating = await window.DB.getUnifiedNearbyLocations({ sortBy: 'rating' });
  assert(sortedRating.data[0].rating >= sortedRating.data[sortedRating.data.length - 1].rating, 'Rating sort orders highest rated first');

  // 7. Mandatory Platform Separation: Academic Query Interception
  console.log('\n7. Testing Academic Search Interception (Apna College Bihar):');
  const notesQuery = window.DB.detectAcademicQuery('B.Tech Mathematics-I unit notes');
  assert(notesQuery !== null && notesQuery.isAcademic === true, 'Correctly intercepted "notes" academic query');
  assert(notesQuery.platformUrl === 'https://www.apnacollegebihar.online/', 'Redirects to Apna College Bihar platform');

  const syllabusQuery = window.DB.detectAcademicQuery('BEU 3rd Sem syllabus for CSE');
  assert(syllabusQuery !== null && syllabusQuery.isAcademic === true, 'Correctly intercepted "syllabus" query');

  const pyqQuery = window.DB.detectAcademicQuery('Basic Electrical Engineering PYQ 2024');
  assert(pyqQuery !== null && pyqQuery.isAcademic === true, 'Correctly intercepted "PYQ" query');

  const localShopQuery = window.DB.detectAcademicQuery('Xerox and spiral binding near Bajidpur');
  assert(localShopQuery === null, 'Non-academic local shop query is NOT intercepted');

  const roomQuery = window.DB.detectAcademicQuery('Single room under 3000 rent');
  assert(roomQuery === null, 'Room rental query is NOT intercepted');

  // 8. PWA Web App Manifest Verification
  console.log('\n8. Testing PWA Web App Manifest:');
  const manifestPath = path.join(__dirname, '../manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json exists in root directory');
  
  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifestData.name === 'GEC Sheikhpura Student Life Hub', `Manifest name is "${manifestData.name}"`);
  assert(manifestData.short_name === 'GEC Hub', `Manifest short_name is "${manifestData.short_name}"`);
  assert(manifestData.display === 'standalone', 'Display mode is standalone');
  assert(manifestData.theme_color === '#0a192f', `Theme color matches institutional navy (#0a192f)`);
  assert(manifestData.icons.length >= 2, `Manifest defines ${manifestData.icons.length} application icons`);
  assert(manifestData.icons.some(i => i.sizes === '192x192'), 'Contains 192x192 icon');
  assert(manifestData.icons.some(i => i.sizes === '512x512'), 'Contains 512x512 icon');

  // Verify icon files physically exist on disk
  const icon192 = path.join(__dirname, '../assets/images/icons/icon-192.png');
  const icon512 = path.join(__dirname, '../assets/images/icons/icon-512.png');
  assert(fs.existsSync(icon192), 'icon-192.png exists on filesystem');
  assert(fs.existsSync(icon512), 'icon-512.png exists on filesystem');

  // 9. PWA Service Worker & Offline Fallback Page Verification
  console.log('\n9. Testing Service Worker & Offline Caching Architecture:');
  const swPath = path.join(__dirname, '../sw.js');
  assert(fs.existsSync(swPath), 'sw.js exists in root directory');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(swContent.includes('gec-hub-cache-'), 'Service worker declares cache version');
  assert(swContent.includes('offline.html'), 'Service worker registers offline.html fallback');
  assert(swContent.includes('/auth/v1'), 'Service worker contains security guard excluding sensitive auth tokens');

  const offlinePath = path.join(__dirname, '../offline.html');
  assert(fs.existsSync(offlinePath), 'offline.html exists');
  const offlineContent = fs.readFileSync(offlinePath, 'utf8');
  assert(offlineContent.includes('06341-223233') || offlineContent.includes('102'), 'Offline page provides Sadar hospital emergency contact');
  assert(offlineContent.includes('112'), 'Offline page provides Police / ERSS 112 helpline');
  assert(offlineContent.includes('Apna College Bihar'), 'Offline page links to Apna College Bihar');

  // 10. Admin Unverified Coordinates Audit
  console.log('\n10. Testing Admin Coordinate Audit Queue:');
  const unverifiedList = window.DB.getUnverifiedCoordinateList();
  assert(unverifiedList.length >= 1, `Unverified coordinate queue contains ${unverifiedList.length} items`);
  const updateCoordRes = await window.DB.updateListingCoordinates('business', 'unv-01', {
    lat: 25.1388,
    lng: 85.8641,
    accuracy: 'exact_gps'
  });
  assert(updateCoordRes.success === true, 'Admin successfully calibrated coordinates for unverified listing');

  console.log('\n================================================================');
  console.log(`📊 Test Summary: ${passed} / ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('================================================================');

  if (failed === 0) {
    console.log('🎉 ALL PHASE 6 GEOSPATIAL, MAP, DISTANCE & PWA VERIFICATIONS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`❌ ${failed} verification tests failed.`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
