/**
 * GEC Sheikhpura Student Life Hub - Interactive Nearby Map Controller (Phase 6)
 * Features:
 * - Leaflet.js with OpenStreetMap standard tiles (Zero API key required, 100% free)
 * - Haversine straight-line distance calculations with explicit road route distinction
 * - Campus Reference Point vs User Geolocation (Mode A: Campus Gate, Mode B: Near Me)
 * - Multi-category unified places (stationery, grocery, rooms, food, medical, transport, libraries)
 * - Synchronized map markers and list cards
 * - Search keyword interception directing academic queries to Apna College Bihar
 * - Distance radius filtering (1km, 3km, 5km, 10km, All)
 * - Mobile map/list view switcher
 */

document.addEventListener('DOMContentLoaded', () => {
  initNearbyMapPage();
});

let mapInstance = null;
let markersLayer = null;
let campusMarker = null;
let userMarker = null;
let currentOrigin = null; // { lat, lng, name, isCustom }
let currentListings = [];
let activeMarkerId = null;

async function initNearbyMapPage() {
  const mapElement = document.getElementById('nearbyMap');
  if (!mapElement) return;

  // Initialize Default Origin (Campus Bajidpur Gate)
  currentOrigin = window.DB.getCollegeReferencePoint();

  // Setup DOM elements
  const searchInput = document.getElementById('nearbySearchInput');
  const catFilter = document.getElementById('nearbyCategoryFilter');
  const radiusFilter = document.getElementById('nearbyRadiusFilter');
  const sortFilter = document.getElementById('nearbySortFilter');
  const btnModeCampus = document.getElementById('btnModeCampus');
  const btnModeNearMe = document.getElementById('btnModeNearMe');
  const viewToggleMap = document.getElementById('viewToggleMap');
  const viewToggleList = document.getElementById('viewToggleList');

  // Initialize Leaflet Map
  initLeafletMap(currentOrigin);

  // Setup Geolocation & Mode Buttons
  if (btnModeCampus) {
    btnModeCampus.addEventListener('click', () => {
      setModeCampus();
    });
  }

  if (btnModeNearMe) {
    btnModeNearMe.addEventListener('click', () => {
      requestUserLocation();
    });
  }

  // Setup Mobile View Toggles
  if (viewToggleMap && viewToggleList) {
    viewToggleMap.addEventListener('click', () => {
      switchMobileView('map');
    });
    viewToggleList.addEventListener('click', () => {
      switchMobileView('list');
    });
  }

  // Bind Filter Events
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => filterAndRender(), 300));
  }
  if (catFilter) {
    catFilter.addEventListener('change', () => filterAndRender());
  }
  if (radiusFilter) {
    radiusFilter.addEventListener('change', () => filterAndRender());
  }
  if (sortFilter) {
    sortFilter.addEventListener('change', () => filterAndRender());
  }

  // Check URL parameters for pre-selected category or search
  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');
  const catParam = urlParams.get('category');
  if (qParam && searchInput) searchInput.value = qParam;
  if (catParam && catFilter) catFilter.value = catParam;

  // Initial Load
  await filterAndRender();
}

/**
 * Initializes the Leaflet Map instance with OpenStreetMap tiles
 */
function initLeafletMap(center) {
  if (typeof L === 'undefined') {
    console.warn('[Map] Leaflet not yet loaded from CDN');
    return;
  }

  if (mapInstance) {
    mapInstance.remove();
  }

  // Center around Bajidpur Campus
  mapInstance = L.map('nearbyMap', {
    center: [center.lat, center.lng],
    zoom: 14,
    scrollWheelZoom: false
  });

  // OpenStreetMap standard tile layer with mandatory attribution
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInstance);

  // Markers layer group
  markersLayer = L.layerGroup().addTo(mapInstance);

  // Render Campus Gate Reference Marker
  renderCampusReferenceMarker(center);
}

/**
 * Renders the permanent College Gate anchor pin
 */
function renderCampusReferenceMarker(center) {
  if (!mapInstance || typeof L === 'undefined') return;

  if (campusMarker) {
    mapInstance.removeLayer(campusMarker);
  }

  const campusIcon = L.divIcon({
    className: 'map-marker-pin campus-marker',
    html: '🏛️',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22]
  });

  campusMarker = L.marker([center.lat, center.lng], { icon: campusIcon })
    .addTo(mapInstance)
    .bindPopup(`
      <div class="map-popup-card">
        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-accent); margin-bottom: 2px;">
          Reference Point
        </div>
        <h4 class="map-popup-title">${escapeHtml(center.name)}</h4>
        <div class="map-popup-meta">${escapeHtml(center.address)}</div>
        <div class="map-popup-dist">📍 Coordinate Origin (25.1380° N, 85.8640° E)</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.35;">
          All straight-line student distances around Bajidpur &amp; Sheikhpura are measured from this entrance.
        </div>
      </div>
    `);
}

/**
 * Handles Mode A: Browse from College (Default)
 */
function setModeCampus() {
  currentOrigin = window.DB.getCollegeReferencePoint();
  if (userMarker && mapInstance) {
    mapInstance.removeLayer(userMarker);
    userMarker = null;
  }

  const btnCampus = document.getElementById('btnModeCampus');
  const btnNearMe = document.getElementById('btnModeNearMe');
  if (btnCampus) btnCampus.classList.add('active');
  if (btnNearMe) btnNearMe.classList.remove('active');

  updateOriginLabel('GEC Bajidpur Gate (25.1380° N, 85.8640° E)');

  if (mapInstance) {
    mapInstance.flyTo([currentOrigin.lat, currentOrigin.lng], 14);
  }

  filterAndRender();
  showToast('📍 Distances calculated from GEC Sheikhpura campus gate.');
}

/**
 * Handles Mode B: Browse Near Me (Browser Geolocation API)
 * Strictly requested only upon explicit user button click.
 */
function requestUserLocation() {
  if (!navigator.geolocation) {
    showToast('⚠️ Geolocation is not supported by your browser.');
    return;
  }

  showToast('🔍 Requesting your current location...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      currentOrigin = {
        lat,
        lng,
        name: 'My Current Location',
        isCustom: true
      };

      const btnCampus = document.getElementById('btnModeCampus');
      const btnNearMe = document.getElementById('btnModeNearMe');
      if (btnCampus) btnCampus.classList.remove('active');
      if (btnNearMe) btnNearMe.classList.add('active');

      updateOriginLabel(`Your Position (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);

      // Add or move user position pin
      if (mapInstance && typeof L !== 'undefined') {
        if (userMarker) mapInstance.removeLayer(userMarker);

        const userIcon = L.divIcon({
          className: 'map-marker-pin',
          html: '📍',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18]
        });

        userMarker = L.marker([lat, lng], { icon: userIcon })
          .addTo(mapInstance)
          .bindPopup(`
            <div class="map-popup-card">
              <h4 class="map-popup-title">Your Current Location</h4>
              <div class="map-popup-dist">Straight-line distances measured from here</div>
            </div>
          `);

        mapInstance.flyTo([lat, lng], 15);
      }

      filterAndRender();
      showToast('🎯 Location calibrated! Distances now measured from your spot.');
    },
    (err) => {
      console.warn('[Geolocation] Access denied or timed out:', err.message);
      showToast('⚠️ Location access was denied. Retaining college campus gate.');
      setModeCampus();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function updateOriginLabel(label) {
  const el = document.getElementById('activeOriginLabel');
  if (el) el.textContent = label;
}

/**
 * Core Filter, Academic Interception, and Render Coordinator
 */
async function filterAndRender() {
  const searchInput = document.getElementById('nearbySearchInput');
  const catFilter = document.getElementById('nearbyCategoryFilter');
  const radiusFilter = document.getElementById('nearbyRadiusFilter');
  const sortFilter = document.getElementById('nearbySortFilter');
  const gridContainer = document.getElementById('nearbyListingsGrid');
  const countBadge = document.getElementById('nearbyCountBadge');
  const academicNotice = document.getElementById('academicNoticeContainer');

  const query = searchInput ? searchInput.value.trim() : '';
  const category = catFilter ? catFilter.value : 'all';
  const radiusKm = radiusFilter && radiusFilter.value !== 'all' ? Number(radiusFilter.value) : null;
  const sortBy = sortFilter ? sortFilter.value : 'distance';

  // 1. Mandatory Platform Separation Guard: Academic Query Interception
  const academicMatch = window.DB.detectAcademicQuery(query);
  if (academicNotice) {
    if (academicMatch) {
      academicNotice.style.display = 'block';
      academicNotice.innerHTML = `
        <div class="academic-intercept-banner">
          <div class="academic-intercept-content">
            <div class="academic-intercept-title">📚 Looking for "${escapeHtml(query)}"?</div>
            <div class="academic-intercept-desc">
              All official B.Tech notes, BEU semester syllabus, previous year question papers (PYQs), and academic dashboards are exclusively maintained on <strong>Apna College Bihar</strong>. GEC Sheikhpura Hub handles campus living, local shops, and student services.
            </div>
          </div>
          <a href="${academicMatch.platformUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            ${academicMatch.actionText}
          </a>
        </div>
      `;
    } else {
      academicNotice.style.display = 'none';
      academicNotice.innerHTML = '';
    }
  }

  // 2. Fetch Unified Nearby Locations
  const { data, totalCount, originName } = await window.DB.getUnifiedNearbyLocations({
    category,
    radiusKm,
    query,
    sortBy,
    userOrigin: currentOrigin.isCustom ? currentOrigin : null
  });

  currentListings = data;

  // 3. Update Results Count Badge
  if (countBadge) {
    const radiusLabel = radiusKm ? `within ${radiusKm} km` : 'all distances';
    countBadge.innerHTML = `
      <span>Found ${data.length} verified locations (${radiusLabel})</span>
      <span class="status-badge status-verified" style="margin-left: 0.5rem;">
        📍 From ${escapeHtml(originName)}
      </span>
    `;
  }

  // 4. Update Map Markers
  updateMapMarkers(data);

  // 5. Render Listing Cards
  renderListingCards(data, gridContainer);
}

/**
 * Updates Leaflet map markers synchronized with the filtered listings
 */
function updateMapMarkers(listings) {
  if (!mapInstance || !markersLayer || typeof L === 'undefined') return;

  markersLayer.clearLayers();

  const bounds = L.latLngBounds();
  // Include campus reference in bounds
  if (currentOrigin && currentOrigin.lat) {
    bounds.extend([currentOrigin.lat, currentOrigin.lng]);
  }

  listings.forEach((item) => {
    if (item.lat === null || item.lng === null) return;

    bounds.extend([item.lat, item.lng]);

    const markerIcon = L.divIcon({
      className: `map-marker-pin ${activeMarkerId === item.id ? 'active-highlight' : ''}`,
      html: item.icon || '📍',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    const marker = L.marker([item.lat, item.lng], { icon: markerIcon })
      .bindPopup(`
        <div class="map-popup-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span class="directory-category" style="font-size:0.75rem;">${escapeHtml(item.categoryLabel)}</span>
            <span style="font-size:0.75rem; font-weight:700; color:var(--color-warning);">★ ${item.rating || 4.5}</span>
          </div>
          <h4 class="map-popup-title">${escapeHtml(item.name)}</h4>
          <div class="map-popup-meta">${escapeHtml(item.address)}</div>
          <div class="map-popup-dist">
            📏 ${escapeHtml(item.straightLineDistance)}
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.6rem;">
            🛣️ ${escapeHtml(item.roadDistance)}
          </div>
          <div style="display:flex; gap:0.4rem;">
            <a href="${item.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="flex:1; text-align:center;">
              🧭 Get Directions
            </a>
            <button type="button" class="btn btn-secondary btn-sm" onclick="focusListingCard('${item.id}')">
              Card ↗
            </button>
          </div>
        </div>
      `);

    marker.on('click', () => {
      highlightActiveListing(item.id);
    });

    markersLayer.addLayer(marker);
  });

  // Fit bounds if multiple locations exist
  if (listings.length > 0 && bounds.isValid()) {
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }
}

/**
 * Highlights a listing card when a map marker is tapped
 */
function highlightActiveListing(listingId) {
  activeMarkerId = listingId;
  const cards = document.querySelectorAll('.nearby-listing-card');
  cards.forEach(c => c.classList.remove('highlighted-border'));

  const targetCard = document.getElementById(`listing-${listingId}`);
  if (targetCard) {
    targetCard.classList.add('highlighted-border');
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Zooms and pans map to a listing when "Show on Map" is clicked on card
 */
window.focusMapOnListing = function(listingId) {
  const item = currentListings.find(x => x.id === listingId);
  if (!item || item.lat === null || item.lng === null || !mapInstance) return;

  activeMarkerId = listingId;

  // If in mobile view, switch to map
  if (window.innerWidth <= 992) {
    switchMobileView('map');
  }

  mapInstance.flyTo([item.lat, item.lng], 16, { animate: true, duration: 1 });

  // Open corresponding marker popup
  markersLayer.eachLayer(layer => {
    if (layer.getLatLng && layer.getLatLng().lat === item.lat && layer.getLatLng().lng === item.lng) {
      setTimeout(() => layer.openPopup(), 600);
    }
  });

  highlightActiveListing(listingId);
};

window.focusListingCard = function(listingId) {
  if (window.innerWidth <= 992) {
    switchMobileView('list');
  }
  highlightActiveListing(listingId);
};

/**
 * Renders verified listings in the split layout list container
 */
function renderListingCards(listings, container) {
  if (!container) return;

  if (listings.length === 0) {
    container.innerHTML = `
      <div class="state-container" style="padding: 2.5rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h3 class="state-title">No locations match your filters</h3>
        <p class="state-desc">Try expanding your distance radius or search for other services in Sheikhpura.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetNearbyFilters()" style="margin-top: 0.75rem;">
          Reset Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = listings.map(item => {
    const isSaved = isBookmarked('shops', item.id) || isBookmarked('rooms', item.id);
    const servicesTags = item.services && item.services.length
      ? item.services.slice(0, 3).map(s => `<span class="room-amenity" style="font-size: 0.725rem;">${escapeHtml(s)}</span>`).join('')
      : '';

    return `
      <article class="directory-card nearby-listing-card ${activeMarkerId === item.id ? 'highlighted-border' : ''}" id="listing-${item.id}">
        <div class="directory-content">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="font-size: 1.25rem;">${item.icon || '📍'}</span>
              <span class="directory-category">${escapeHtml(item.categoryLabel)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-warning);">
                ★ ${item.rating || 4.6}
              </span>
              <span class="status-badge status-verified">
                🛡️ Verified
              </span>
            </div>
          </div>

          <h3 class="directory-name" style="margin-bottom: 0.25rem;">${escapeHtml(item.name)}</h3>
          <p class="directory-address" style="margin-bottom: 0.5rem;">${escapeHtml(item.address)}</p>

          <!-- Distance Distinction: Straight-Line vs Road Route -->
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; margin-bottom: 0.65rem;">
            <span class="distance-badge-straight" title="Calculated using Haversine formula from campus gate">
              📐 ${escapeHtml(item.straightLineDistance)}
            </span>
            <span class="distance-badge-road" title="Estimated street distance">
              🛣️ ${escapeHtml(item.roadDistance)}
            </span>
          </div>

          <!-- Services / Tags -->
          ${servicesTags ? `<div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.75rem;">${servicesTags}</div>` : ''}

          <!-- Details & Hours -->
          <div class="directory-details" style="font-size: 0.8rem; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-subtle);">Operating Hours:</span>
              <span style="font-weight: 600; color: var(--text-main);">${escapeHtml(item.hours)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-subtle);">Pricing / Fare:</span>
              <span style="font-weight: 600; color: var(--color-primary-700);">${escapeHtml(item.priceTier)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-subtle);">Phone:</span>
              <a href="tel:${item.phone.replace(/[^0-9+]/g, '')}" style="font-family: var(--font-mono); font-weight: 600; color: var(--color-primary-700);">
                ${escapeHtml(item.phone)}
              </a>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; pt: 0.5rem; border-top: 1px solid var(--border-light);">
            <button type="button" class="btn btn-secondary btn-sm" onclick="focusMapOnListing('${item.id}')" style="flex: 1; min-width: 100px;">
              🗺️ Show on Map
            </button>
            <a href="${item.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="flex: 1; min-width: 110px; text-align: center;">
              🧭 Get Directions
            </a>
            <button type="button" class="btn btn-secondary btn-sm trigger-report-btn" data-target="${escapeHtml(item.name)}" title="Report incorrect location or contact" style="padding: 0.35rem 0.6rem;">
              ⚠️ Report
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

window.resetNearbyFilters = function() {
  const searchInput = document.getElementById('nearbySearchInput');
  const catFilter = document.getElementById('nearbyCategoryFilter');
  const radiusFilter = document.getElementById('nearbyRadiusFilter');
  const sortFilter = document.getElementById('nearbySortFilter');

  if (searchInput) searchInput.value = '';
  if (catFilter) catFilter.value = 'all';
  if (radiusFilter) radiusFilter.value = 'all';
  if (sortFilter) sortFilter.value = 'distance';

  filterAndRender();
};

/**
 * Mobile Switcher (Toggle between Map View and List View)
 */
function switchMobileView(view) {
  const mapContainer = document.getElementById('mapColumn');
  const listContainer = document.getElementById('listColumn');
  const btnMap = document.getElementById('viewToggleMap');
  const btnList = document.getElementById('viewToggleList');

  if (view === 'map') {
    if (mapContainer) mapContainer.style.display = 'block';
    if (listContainer) listContainer.style.display = 'none';
    if (btnMap) btnMap.classList.add('active');
    if (btnList) btnList.classList.remove('active');
    if (mapInstance) {
      setTimeout(() => mapInstance.invalidateSize(), 200);
    }
  } else {
    if (mapContainer) mapContainer.style.display = 'none';
    if (listContainer) listContainer.style.display = 'block';
    if (btnMap) btnMap.classList.remove('active');
    if (btnList) btnList.classList.add('active');
  }
}

function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
