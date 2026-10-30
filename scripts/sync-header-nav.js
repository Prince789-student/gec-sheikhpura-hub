const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// All HTML files that have a site header (excluding admin.html which has admin header, and offline/404 if different)
const targetFiles = [
  'about.html',
  'academics.html',
  'admissions.html',
  'campus-directory.html',
  'college-info.html',
  'community-guidelines.html',
  'community.html',
  'contact.html',
  'dashboard.html',
  'emergency.html',
  'explore-nearby.html',
  'food-tiffin.html',
  'index.html',
  'login.html',
  'lost-found.html',
  'marketplace.html',
  'notices.html',
  'official-directory.html',
  'placement.html',
  'privacy.html',
  'rooms-pg.html',
  'saved-items.html',
  'student-tools.html',
  'submit-listing.html',
  'terms.html',
  'transport.html'
];

function generateNav(filename) {
  const isHome = filename === 'index.html';
  const isCollege = filename === 'college-info.html';
  const isAdmissions = filename === 'admissions.html';
  const isAcademics = filename === 'academics.html';
  const isMarketplace = filename === 'marketplace.html';
  const isTools = filename === 'student-tools.html';
  const isPlacement = filename === 'placement.html';
  const isNotices = filename === 'notices.html';

  // Campus life dropdown items
  const isRooms = filename === 'rooms-pg.html';
  const isFood = filename === 'food-tiffin.html';
  const isNearby = filename === 'explore-nearby.html';
  const isTransport = filename === 'transport.html';
  const isEmergency = filename === 'emergency.html';
  const isCommunity = filename === 'community.html';
  const isLostFound = filename === 'lost-found.html';
  const isCampusDir = filename === 'campus-directory.html';
  const isOfficialDir = filename === 'official-directory.html';
  const isSubmit = filename === 'submit-listing.html';

  const isDropdownActive = isRooms || isFood || isNearby || isTransport || isEmergency || isCommunity || isLostFound || isCampusDir || isOfficialDir || isSubmit;

  return `      <!-- Desktop Nav -->
      <nav class="desktop-nav" aria-label="Primary Navigation">
        <a href="index.html" class="nav-link${isHome ? ' active' : ''}">Home</a>
        <a href="college-info.html" class="nav-link${isCollege ? ' active' : ''}">College Info</a>
        <a href="admissions.html" class="nav-link${isAdmissions ? ' active' : ''}">Admissions</a>
        <a href="academics.html" class="nav-link${isAcademics ? ' active' : ''}">Academics</a>
        
        <!-- Explore Dropdown -->
        <div class="nav-dropdown">
          <button class="nav-link dropdown-trigger${isDropdownActive ? ' active' : ''}" aria-haspopup="true">
            Campus Life
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="dropdown-menu">
            <a href="rooms-pg.html" class="dropdown-item${isRooms ? ' active' : ''}">🏠 Rooms &amp; PG Rentals</a>
            <a href="food-tiffin.html" class="dropdown-item${isFood ? ' active' : ''}">🍱 Food &amp; Tiffin Services</a>
            <a href="explore-nearby.html" class="dropdown-item${isNearby ? ' active' : ''}">🏪 Explore Nearby Shops</a>
            <a href="transport.html" class="dropdown-item${isTransport ? ' active' : ''}">🚌 Transport &amp; Bus/Train</a>
            <a href="emergency.html" class="dropdown-item${isEmergency ? ' active' : ''}">🚑 Medical &amp; Emergency</a>
            <a href="community.html" class="dropdown-item${isCommunity ? ' active' : ''}">🎪 Student Community &amp; Events</a>
            <a href="lost-found.html" class="dropdown-item${isLostFound ? ' active' : ''}">🎒 Lost &amp; Found Desk</a>
            <a href="campus-directory.html" class="dropdown-item${isCampusDir ? ' active' : ''}">🏛️ Faculty &amp; Room Directory</a>
            <a href="official-directory.html" class="dropdown-item${isOfficialDir ? ' active' : ''}">🌐 Source-Synced Vault</a>
            <a href="submit-listing.html" class="dropdown-item${isSubmit ? ' active' : ''}" style="color: var(--color-accent); font-weight: 600;">+ List Business / Room (Owner)</a>
          </div>
        </div>

        <a href="marketplace.html" class="nav-link${isMarketplace ? ' active' : ''}">Marketplace</a>
        <a href="student-tools.html" class="nav-link${isTools ? ' active' : ''}">Student Tools</a>
        <a href="placement.html" class="nav-link${isPlacement ? ' active' : ''}">Placements</a>
        <a href="notices.html" class="nav-link${isNotices ? ' active' : ''}">Notices</a>
      </nav>`;
}

const navRegex = /<!--\s*Desktop Nav\s*-->[\s\S]*?<\/nav>|<nav class="desktop-nav"[\s\S]*?<\/nav>/i;

let updatedCount = 0;
for (const file of targetFiles) {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  if (navRegex.test(content)) {
    const newNav = generateNav(file);
    const newContent = content.replace(navRegex, newNav);
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated nav in ${file}`);
      updatedCount++;
    } else {
      console.log(`Already up to date: ${file}`);
    }
  } else {
    console.log(`No desktop-nav matched in ${file}`);
  }
}

console.log(`\nDone! Updated ${updatedCount} files.`);
