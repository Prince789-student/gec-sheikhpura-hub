/**
 * Phase 5 Automated Logic Verification Suite
 * GEC Sheikhpura Student Life Hub - Student Marketplace, Buy/Sell/Exchange & Deals
 * Tests: Categories, Platform Separation, Listing Creation, Filtering, Buyer Enquiries,
 * Seller Status Updates, Watchlist, and Moderation Controls.
 */

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
global.HUB_DATA = { shops: [], accommodations: [], food: [] };

// Load db-service into global
const fs = require('fs');
const path = require('path');
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
  console.log('🧪 Starting Phase 5 Marketplace Automated Logic Verification');
  console.log('================================================================');

  // 1. Categories & Platform Separation
  console.log('\n1. Testing Marketplace Categories & Platform Separation:');
  const categories = window.DB.getMarketplaceCategories();
  assert(categories.length >= 10, `Loaded ${categories.length} physical student categories`);
  assert(categories.some(c => c.id === 'calculators'), 'Contains scientific calculators category');
  assert(categories.some(c => c.id === 'cycles'), 'Contains cycles & commute category');

  // Test strict platform separation (block digital exam notes/PDF selling)
  const piratedAttempt = await window.DB.createMarketplaceListing({
    title: 'BEU 3rd Sem Mathematics PYQ PDF Drive Link',
    category_id: 'books_materials',
    price: 99,
    description: 'Complete solved exam cheat sheets and scanned PYQ notes drive link.',
    item_condition: 'new'
  });
  assert(piratedAttempt.success === false, 'Strictly blocked selling digital notes/PDF drive links');
  assert(piratedAttempt.error.includes('Apna College Bihar'), 'Error explicitly redirects academic notes to Apna College Bihar');

  // 2. Listing Creation & Validation
  console.log('\n2. Testing Physical Item Listing Creation:');
  const validListing = await window.DB.createMarketplaceListing({
    seller_user_id: 'student-tester-1',
    seller_name: 'Anish Kumar (Civil 3rd Year)',
    seller_contact_public: '9431811223',
    consent_to_publish_contact: true,
    title: 'Casio fx-991MS Scientific Calculator with Hard Case',
    category_id: 'calculators',
    price: 650,
    is_negotiable: true,
    item_condition: 'like_new',
    approximate_location: 'GEC Sheikhpura Boys Hostel Block A',
    description: 'Used for two semesters only. All buttons and dual power solar display working 100%. Comes with hard case.',
    image_urls: ['assets/images/calculator.jpg']
  });

  assert(validListing.success === true, 'Valid physical product listing created successfully');
  assert(validListing.data.status === 'available', 'Initial listing status is "available"');
  assert(validListing.data.seller_contact_public === '+91-94318-11223', 'Public phone normalized properly');
  assert(validListing.data.price === 650, 'Price stored as numeric ₹650');

  // Validation checks: title too short, negative price
  const shortTitle = await window.DB.createMarketplaceListing({
    title: 'Pen',
    category_id: 'books_materials',
    price: 10,
    description: 'Good blue ballpoint pen for exam.',
    item_condition: 'good'
  });
  assert(shortTitle.success === false, 'Blocked listing with title shorter than 5 chars');

  const negPrice = await window.DB.createMarketplaceListing({
    title: 'Student Bicycle in Good Shape',
    category_id: 'cycles',
    price: -500,
    description: 'Moving out of Sheikhpura and selling fast.',
    item_condition: 'good'
  });
  assert(negPrice.success === false, 'Blocked listing with negative price');

  // 3. Search & Multi-Criteria Filtering
  console.log('\n3. Testing Search & Filtering:');
  const searchByKeyword = await window.DB.getMarketplaceListings({ query: 'Casio' });
  assert(searchByKeyword.data.length > 0, `Keyword search found ${searchByKeyword.data.length} item(s)`);

  const filterByCategory = await window.DB.getMarketplaceListings({ category: 'cycles' });
  assert(filterByCategory.data.every(x => x.category_id === 'cycles'), 'Category filter returns only bicycles & commute items');

  const filterByBudget = await window.DB.getMarketplaceListings({ minPrice: 500, maxPrice: 1000 });
  assert(filterByBudget.data.every(x => x.price >= 500 && x.price <= 1000), 'Budget filter accurately bounds price (₹500 - ₹1000)');

  const sortByPrice = await window.DB.getMarketplaceListings({ sort: 'price_asc' });
  const isAscending = sortByPrice.data.every((val, i, arr) => !i || arr[i - 1].price <= val.price);
  assert(isAscending, 'Sort by Price: Low to High accurately orders listings');

  // 4. Safe Buyer Enquiries Workflow
  console.log('\n4. Testing Safe Buyer Enquiries Workflow:');
  const enquiry = await window.DB.submitMarketplaceEnquiry({
    listingId: validListing.data.id,
    sellerId: validListing.data.seller_user_id,
    buyerName: 'Rohan Sharma (1st Sem CSE)',
    buyerContact: '9801299887',
    offeredPrice: 600,
    message: 'Hello, can I inspect the calculator near the campus gate today?'
  });
  assert(enquiry.success === true, 'Buyer enquiry submitted successfully');
  assert(enquiry.data.status === 'unread', 'Enquiry initial status is "unread"');
  assert(enquiry.data.offered_price === 600, 'Buyer offer price recorded accurately');

  // Retrieve seller enquiries
  const sellerEnquiries = await window.DB.getSellerEnquiries(validListing.data.seller_user_id);
  assert(sellerEnquiries.some(e => e.id === enquiry.data.id), 'Seller inbox retrieves new enquiry');

  // Mark enquiry as read
  await window.DB.markEnquiryRead(enquiry.data.id);
  const updatedEnqs = await window.DB.getSellerEnquiries(validListing.data.seller_user_id);
  const readEnq = updatedEnqs.find(e => e.id === enquiry.data.id);
  assert(readEnq.status === 'read', 'Enquiry marked as read by seller');

  // 5. Seller Listing Management (Reserve, Sold, Delete)
  console.log('\n5. Testing Seller Status Operations:');
  // Mark as reserved
  const reserved = await window.DB.updateMarketplaceStatus(validListing.data.id, 'reserved', 'student-tester-1');
  assert(reserved.data.status === 'reserved', 'Listing successfully marked as "reserved"');

  // Mark as sold
  const sold = await window.DB.updateMarketplaceStatus(validListing.data.id, 'sold', 'student-tester-1');
  assert(sold.data.status === 'sold', 'Listing successfully marked as "sold"');
  assert(Boolean(sold.data.sold_at), 'sold_at timestamp recorded');

  // Deleted/archived
  const deleted = await window.DB.deleteMarketplaceListing(validListing.data.id, 'student-tester-1');
  assert(deleted.success === true, 'Listing successfully deleted / removed by owner');

  const afterDelete = await window.DB.getMarketplaceListingById(validListing.data.id);
  assert(afterDelete === null, 'Deleted listing no longer accessible');

  // 6. Watchlist / Saved Items
  console.log('\n6. Testing Marketplace Watchlist:');
  const toggle1 = await window.DB.toggleMarketplaceSaved('student-tester-1', 'mkt-seed-2');
  assert(toggle1.isSaved === true, 'Item saved to watchlist');

  const savedList = await window.DB.getMarketplaceSavedItems('student-tester-1');
  assert(savedList.length === 1 && savedList[0].listing_id === 'mkt-seed-2', 'Watchlist contains saved listing');

  const toggle2 = await window.DB.toggleMarketplaceSaved('student-tester-1', 'mkt-seed-2');
  assert(toggle2.isSaved === false, 'Item removed from watchlist upon second toggle');

  // 7. Admin Moderation & Dispute Controls
  console.log('\n7. Testing Admin Moderation & Dispute Controls:');
  const adminQueue = await window.DB.getAdminMarketplaceQueue();
  assert(adminQueue.length > 0, `Admin queue retrieves items (${adminQueue.length} listings)`);

  const modAction = await window.DB.moderateMarketplaceListing('mkt-seed-1', 'suspended', 'Flagged for inspection');
  assert(modAction.success === true, 'Admin can moderate listing');
  assert(modAction.updatedItem.moderation_status === 'suspended', 'Listing status updated to suspended');

  // Marketplace Dispute Report
  const report = await window.DB.submitListingReport({
    listing_type: 'marketplace',
    listing_id: 'mkt-seed-1',
    listing_title: 'Casio fx-991EX ClassWiz',
    issue_type: 'price_discrepancy',
    description: 'Seller changed price from agreed amount.',
    reporter_name: 'Pooja (ECE)'
  });
  assert(report.success === true, 'Marketplace listing report filed successfully');

  // Summary
  console.log('\n================================================================');
  console.log(`📊 Test Summary: ${passed} / ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('================================================================');

  if (failed === 0) {
    console.log('🎉 ALL PHASE 5 MARKETPLACE LOGIC & SAFETY GATES PASSED!\n');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed.\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution exception:", err);
  process.exit(1);
});
