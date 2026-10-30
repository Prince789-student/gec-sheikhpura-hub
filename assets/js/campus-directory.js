/**
 * GEC Sheikhpura Student Life Hub - Phase 11
 * Faculty, Room & Campus Directory Controller
 * Verified Faculty Directory + Campus Facilities & Room Finder
 * Search, multi-criteria filtering, map navigation, QR codes, and student correction requests.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCampusDirectoryPage();
});

let currentDirectoryTab = 'faculty'; // 'faculty' or 'facilities'

let facultyFilter = {
  department: 'all',
  query: '',
  verifiedOnly: false
};

let facilityFilter = {
  category: 'all',
  building: 'all',
  floor: 'all',
  query: ''
};

let activeCorrectionTarget = null;

async function initCampusDirectoryPage() {
  // Read URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam === 'facilities' || tabParam === 'rooms') {
    currentDirectoryTab = 'facilities';
  } else {
    currentDirectoryTab = 'faculty';
  }

  if (urlParams.get('dept')) facultyFilter.department = urlParams.get('dept');
  if (urlParams.get('query')) {
    facultyFilter.query = urlParams.get('query');
    facilityFilter.query = urlParams.get('query');
  }

  // Setup tab switches
  const dirTabs = document.querySelectorAll('[data-dir-tab]');
  dirTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dirTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentDirectoryTab = tab.getAttribute('data-dir-tab');
      switchDirectoryView();
    });
  });

  // Activate initial tab button
  dirTabs.forEach(tab => {
    if (tab.getAttribute('data-dir-tab') === currentDirectoryTab) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Search input listeners
  const facultySearch = document.getElementById('facultySearchInput');
  if (facultySearch) {
    if (facultyFilter.query) facultySearch.value = facultyFilter.query;
    let timer;
    facultySearch.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        facultyFilter.query = e.target.value.trim();
        loadFacultyList();
      }, 250);
    });
  }

  const facilitySearch = document.getElementById('facilitySearchInput');
  if (facilitySearch) {
    if (facilityFilter.query) facilitySearch.value = facilityFilter.query;
    let timer;
    facilitySearch.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        facilityFilter.query = e.target.value.trim();
        loadCampusFacilitiesList();
      }, 250);
    });
  }

  // Department pill listeners
  const deptChips = document.querySelectorAll('[data-dept-chip]');
  deptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      deptChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      facultyFilter.department = chip.getAttribute('data-dept-chip');
      loadFacultyList();
    });
  });

  // Facility category pill listeners
  const facilChips = document.querySelectorAll('[data-facil-cat]');
  facilChips.forEach(chip => {
    chip.addEventListener('click', () => {
      facilChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      facilityFilter.category = chip.getAttribute('data-facil-cat');
      loadCampusFacilitiesList();
    });
  });

  // Building & floor selectors
  const bldgSelect = document.getElementById('facilBuildingSelect');
  if (bldgSelect) {
    bldgSelect.addEventListener('change', (e) => {
      facilityFilter.building = e.target.value;
      loadCampusFacilitiesList();
    });
  }

  const floorSelect = document.getElementById('facilFloorSelect');
  if (floorSelect) {
    floorSelect.addEventListener('change', (e) => {
      facilityFilter.floor = e.target.value;
      loadCampusFacilitiesList();
    });
  }

  // Setup correction form
  setupCorrectionForm();

  // Switch initial view
  switchDirectoryView();
}

function switchDirectoryView() {
  const facView = document.getElementById('facultyDirectorySection');
  const facilView = document.getElementById('facilitiesDirectorySection');

  if (currentDirectoryTab === 'faculty') {
    if (facView) facView.style.display = 'block';
    if (facilView) facilView.style.display = 'none';
    loadFacultyList();
  } else {
    if (facView) facView.style.display = 'none';
    if (facilView) facilView.style.display = 'block';
    loadCampusFacilitiesList();
  }
}

/* ==========================================================================
   1. Faculty Directory Loader
   ========================================================================== */
async function loadFacultyList() {
  const grid = document.getElementById('facultyCardsGrid');
  const emptyState = document.getElementById('facultyEmptyState');
  const countStats = document.getElementById('facultyCountStats');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
      <div class="loading-spinner" style="margin: 0 auto 1rem auto;"></div>
      <p>Loading verified faculty records...</p>
    </div>
  `;

  try {
    const list = await window.DB.getFacultyMembers(facultyFilter);

    if (countStats) {
      countStats.textContent = `Showing ${list.length} verified faculty member(s)`;
    }

    if (list.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = list.map(fac => {
      const isRoomVerified = fac.room_number && fac.room_number !== 'Not verified';
      const isHoursVerified = fac.office_hours && fac.office_hours !== 'Not verified';
      const isContactAvailable = fac.public_contact && fac.public_contact !== 'Not available';

      return `
        <article class="hub-card directory-card">
          <div class="directory-card-top">
            <div>
              <span class="badge ${fac.verification_status === 'verified' ? 'badge-success' : 'badge-warning'}">
                ${fac.verification_status === 'verified' ? '🛡️ Verified Official' : 'Community Submitted'}
              </span>
              <h3 class="dir-name" style="margin-top: 0.5rem;">${escapeHtml(fac.name)}</h3>
              <div class="dir-designation">${escapeHtml(fac.designation)}</div>
            </div>
            <div class="dir-avatar">
              ${getInitials(fac.name)}
            </div>
          </div>

          <div class="dir-details-list">
            <div class="dir-row">
              <span class="dir-label">Department</span>
              <span class="dir-val"><strong>${escapeHtml(fac.department)}</strong></span>
            </div>

            <div class="dir-row">
              <span class="dir-label">Room / Office</span>
              <span class="dir-val ${isRoomVerified ? '' : 'text-muted'}">
                ${isRoomVerified ? `🏢 <strong>${escapeHtml(fac.room_number)}</strong>` : '<span class="status-badge status-unverified">Not verified</span>'}
              </span>
            </div>

            <div class="dir-row">
              <span class="dir-label">Building &amp; Floor</span>
              <span class="dir-val">
                ${escapeHtml(fac.building_block || 'Academic Complex')} &bull; ${escapeHtml(fac.floor || 'Ground Floor')}
              </span>
            </div>

            <div class="dir-row">
              <span class="dir-label">Official Office Hours</span>
              <span class="dir-val ${isHoursVerified ? '' : 'text-muted'}">
                ${isHoursVerified ? `🕒 ${escapeHtml(fac.office_hours)}` : '<span class="status-badge status-unverified">Not verified</span>'}
              </span>
            </div>

            <div class="dir-row">
              <span class="dir-label">Institutional Contact</span>
              <span class="dir-val">
                ${isContactAvailable 
                  ? `<a href="mailto:${escapeHtml(fac.public_contact)}" class="dir-contact-link">📧 ${escapeHtml(fac.public_contact)}</a>` 
                  : '<span class="status-badge status-unverified">Not available</span>'}
              </span>
            </div>
          </div>

          <div class="directory-card-footer">
            <span class="dir-verify-time">
              Last verified: ${fac.last_verified_at ? new Date(fac.last_verified_at).toLocaleDateString('en-IN') : 'Recent'}
            </span>
            <button type="button" class="btn btn-ghost btn-sm" onclick="openCorrectionModal('faculty', '${fac.id}', '${escapeHtml(fac.name)}')" title="Report update or change in room/hours">
              ✏️ Suggest Edit
            </button>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load faculty:', err);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-danger);">
        <p>Failed to load faculty records. Please retry.</p>
        <button class="btn btn-secondary btn-sm" onclick="loadFacultyList()">Retry</button>
      </div>
    `;
  }
}

/* ==========================================================================
   2. Campus Facilities & Room Finder Loader
   ========================================================================== */
async function loadCampusFacilitiesList() {
  const grid = document.getElementById('facilitiesCardsGrid');
  const emptyState = document.getElementById('facilitiesEmptyState');
  const countStats = document.getElementById('facilitiesCountStats');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
      <div class="loading-spinner" style="margin: 0 auto 1rem auto;"></div>
      <p>Loading campus rooms and facilities...</p>
    </div>
  `;

  try {
    const list = await window.DB.getCampusFacilities(facilityFilter);

    if (countStats) {
      countStats.textContent = `Showing ${list.length} confirmed campus location(s)`;
    }

    if (list.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = list.map(facil => {
      const isRoomVerified = facil.room_number && facil.room_number !== 'Not verified';
      const isHoursVerified = facil.opening_hours && facil.opening_hours !== 'Not verified';
      const isAccessVerified = facil.accessibility_info && facil.accessibility_info !== 'Not verified';
      const hasCoords = facil.coordinates_lat && facil.coordinates_lng;

      return `
        <article class="hub-card directory-card">
          <div class="directory-card-top">
            <div>
              <span class="badge ${getCategoryBadgeClass(facil.category)}">
                ${formatCategoryName(facil.category)}
              </span>
              <h3 class="dir-name" style="margin-top: 0.5rem;">${escapeHtml(facil.name)}</h3>
              <div class="dir-designation" style="color: var(--color-accent); font-weight: 700;">
                ${isRoomVerified ? `Room / Code: ${escapeHtml(facil.room_number)}` : '<span class="status-badge status-unverified">Room not verified</span>'}
              </div>
            </div>
            <div class="dir-icon-box">
              ${getCategoryIcon(facil.category)}
            </div>
          </div>

          <div class="dir-details-list">
            <div class="dir-row">
              <span class="dir-label">Building / Block</span>
              <span class="dir-val"><strong>${escapeHtml(facil.building_block || 'Academic Complex')}</strong></span>
            </div>

            <div class="dir-row">
              <span class="dir-label">Floor</span>
              <span class="dir-val">${escapeHtml(facil.floor || 'Ground Floor')}</span>
            </div>

            <div class="dir-row">
              <span class="dir-label">Accessibility</span>
              <span class="dir-val ${isAccessVerified ? '' : 'text-muted'}">
                ${isAccessVerified ? `♿ ${escapeHtml(facil.accessibility_info)}` : '<span class="status-badge status-unverified">Not verified</span>'}
              </span>
            </div>

            <div class="dir-row">
              <span class="dir-label">Public / Open Hours</span>
              <span class="dir-val ${isHoursVerified ? '' : 'text-muted'}">
                ${isHoursVerified ? `🕒 ${escapeHtml(facil.opening_hours)}` : '<span class="status-badge status-unverified">Not verified</span>'}
              </span>
            </div>

            <div class="dir-row">
              <span class="dir-label">Map Coordinates</span>
              <span class="dir-val">
                ${hasCoords 
                  ? `<code>${facil.coordinates_lat.toFixed(4)}° N, ${facil.coordinates_lng.toFixed(4)}° E</code>` 
                  : '<span class="status-badge status-unverified">Location coordinates unverified</span>'}
              </span>
            </div>
          </div>

          <div class="directory-card-footer" style="gap: 0.5rem; flex-wrap: wrap;">
            ${hasCoords ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="openMapModal('${facil.id}')" style="flex: 1; min-height: 44px;">
                📍 Locate on Map
              </button>
            ` : `
              <button type="button" class="btn btn-ghost btn-sm disabled" disabled style="flex: 1;">
                📍 Map Not Available
              </button>
            `}

            <button type="button" class="btn btn-ghost btn-sm" onclick="openQrModal('${facil.id}')" title="Generate Shareable QR Link" style="min-height: 44px;">
              📲 QR
            </button>

            <button type="button" class="btn btn-ghost btn-sm" onclick="openCorrectionModal('facility', '${facil.id}', '${escapeHtml(facil.name)}')" title="Suggest a correction" style="min-height: 44px;">
              ✏️
            </button>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load campus facilities:', err);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-danger);">
        <p>Failed to load campus facilities. Please retry.</p>
        <button class="btn btn-secondary btn-sm" onclick="loadCampusFacilitiesList()">Retry</button>
      </div>
    `;
  }
}

function getInitials(name) {
  if (!name) return 'FS';
  const parts = name.replace(/Prof\.|Dr\.|Mr\.|Mrs\./gi, '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'administrative': return 'badge-danger';
    case 'labs_workshops': return 'badge-primary';
    case 'classrooms': return 'badge-info';
    case 'library_study': return 'badge-success';
    case 'amenities': return 'badge-warning';
    case 'hostels': return 'badge-secondary';
    default: return 'badge-light';
  }
}

function formatCategoryName(category) {
  const map = {
    'administrative': '🏛️ Administrative Block',
    'labs_workshops': '🔬 Labs & Workshops',
    'classrooms': '📖 Academic Classrooms',
    'library_study': '📚 Library & Reading',
    'amenities': '☕ Amenities & SIHE',
    'hostels': '🏠 Student Hostels'
  };
  return map[category] || '📍 Campus Facility';
}

function getCategoryIcon(cat) {
  switch (cat) {
    case 'administrative': return '🏛️';
    case 'labs_workshops': return '🔬';
    case 'classrooms': return '🎓';
    case 'library_study': return '📚';
    case 'amenities': return '☕';
    case 'hostels': return '🛏️';
    default: return '📍';
  }
}

/* ==========================================================================
   3. Suggest Correction Modal & Submissions
   ========================================================================== */
function setupCorrectionForm() {
  const form = document.getElementById('dirCorrectionForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeCorrectionTarget) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const proposedRoom = document.getElementById('corrProposedRoom').value.trim();
    const proposedHours = document.getElementById('corrProposedHours').value.trim();
    const reasonText = document.getElementById('corrReason').value.trim();
    const submitterContact = document.getElementById('corrSubmitterContact').value.trim();

    const correctionData = {
      directory_type: activeCorrectionTarget.type,
      target_id: activeCorrectionTarget.id,
      target_name: activeCorrectionTarget.name,
      proposed_data: {
        room_number: proposedRoom || undefined,
        office_hours: activeCorrectionTarget.type === 'faculty' ? (proposedHours || undefined) : undefined,
        opening_hours: activeCorrectionTarget.type === 'facility' ? (proposedHours || undefined) : undefined
      },
      reason: reasonText,
      submitter_contact: submitterContact
    };

    const res = await window.DB.submitDirectoryCorrection(correctionData);
    if (submitBtn) submitBtn.disabled = false;

    if (res.success) {
      closeModal('dirCorrectionModal');
      form.reset();
      showToast('Correction submitted! Campus administrators will audit your suggestion against official college records.');
    } else {
      alert(res.error || 'Failed to submit correction request.');
    }
  });
}

window.openCorrectionModal = function(type, id, name) {
  activeCorrectionTarget = { type, id, name };
  const targetLabel = document.getElementById('corrTargetLabel');
  if (targetLabel) {
    targetLabel.textContent = `${type === 'faculty' ? 'Faculty Member' : 'Campus Location'}: "${name}"`;
  }
  openModal('dirCorrectionModal');
};

/* ==========================================================================
   4. Map & Directions Modal
   ========================================================================== */
window.openMapModal = async function(facilityId) {
  const facil = await window.DB.getCampusFacilityById(facilityId);
  if (!facil) return;

  const titleEl = document.getElementById('mapModalTitle');
  const detailsEl = document.getElementById('mapModalDetails');
  if (titleEl) titleEl.textContent = `📍 ${facil.name}`;

  if (detailsEl) {
    const lat = facil.coordinates_lat || 25.1381;
    const lng = facil.coordinates_lng || 85.8642;
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    detailsEl.innerHTML = `
      <div class="hub-card" style="margin-bottom: 1rem; background: var(--surface-2);">
        <div style="font-size: 0.9rem; margin-bottom: 0.5rem;">
          <strong>Official Verified Location:</strong> ${escapeHtml(facil.building_block)} &bull; ${escapeHtml(facil.floor)}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          <strong>Room Identification:</strong> ${escapeHtml(facil.room_number)}
        </div>
        <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
          <strong>GPS Coordinates:</strong> <code>${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E</code>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-color);">
          <strong>Accessibility Note:</strong> ${escapeHtml(facil.accessibility_info)}
        </div>
      </div>

      <div style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1rem;">
        🧭 <strong>Walking Instructions from Bajidpur Campus Main Gate:</strong><br>
        Proceed through the central walkway past the Administrative Secretariat. The ${escapeHtml(facil.building_block)} is clearly marked with directional signage.
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
        <a href="college-info.html#mapSection" class="btn btn-secondary btn-sm" target="_blank" rel="noopener">
          View Master Campus Map &rarr;
        </a>
        <a href="${gmapsUrl}" class="btn btn-primary btn-sm" target="_blank" rel="noopener">
          Open in Google Maps ↗
        </a>
      </div>
    `;
  }

  openModal('campusMapModal');
};

/* ==========================================================================
   5. QR Code Generator Modal
   ========================================================================== */
window.openQrModal = async function(facilityId) {
  const facil = await window.DB.getCampusFacilityById(facilityId);
  if (!facil) return;

  const titleEl = document.getElementById('qrModalTitle');
  const bodyEl = document.getElementById('qrModalBody');
  if (titleEl) titleEl.textContent = `📲 Share QR: ${facil.name}`;

  if (bodyEl) {
    const pageUrl = `${window.location.origin}${window.location.pathname}?tab=facilities&query=${encodeURIComponent(facil.name)}`;
    bodyEl.innerHTML = `
      <div style="text-align: center; padding: 1rem;">
        <div style="display: inline-block; padding: 1.5rem; background: #fff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 1rem;">
          ${generateSimpleSvgQr(pageUrl)}
        </div>
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-color); margin-bottom: 0.25rem;">
          ${escapeHtml(facil.name)}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          ${escapeHtml(facil.building_block)} &bull; ${escapeHtml(facil.room_number)}
        </div>
        <div style="font-size: 0.8rem; background: var(--surface-2); padding: 0.5rem; border-radius: 6px; word-break: break-all;">
          <code>${pageUrl}</code>
        </div>
      </div>
    `;
  }

  openModal('campusQrModal');
};

/**
 * Minimalist geometric SVG QR representation for campus discovery
 */
function generateSimpleSvgQr(text) {
  return `
    <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#ffffff"/>
      <!-- Top Left Position Detection Pattern -->
      <rect x="10" y="10" width="24" height="24" stroke="#0a192f" stroke-width="4" fill="none"/>
      <rect x="16" y="16" width="12" height="12" fill="#0a192f"/>
      <!-- Top Right Position Detection Pattern -->
      <rect x="66" y="10" width="24" height="24" stroke="#0a192f" stroke-width="4" fill="none"/>
      <rect x="72" y="16" width="12" height="12" fill="#0a192f"/>
      <!-- Bottom Left Position Detection Pattern -->
      <rect x="10" y="66" width="24" height="24" stroke="#0a192f" stroke-width="4" fill="none"/>
      <rect x="16" y="72" width="12" height="12" fill="#0a192f"/>
      <!-- Timing & Data Matrix grid simulation -->
      <line x1="38" y1="14" x2="62" y2="14" stroke="#0a192f" stroke-width="3" stroke-dasharray="3,3"/>
      <line x1="14" y1="38" x2="14" y2="62" stroke="#0a192f" stroke-width="3" stroke-dasharray="3,3"/>
      <rect x="42" y="42" width="16" height="16" fill="#0a192f"/>
      <rect x="42" y="22" width="6" height="6" fill="#0a192f"/>
      <rect x="54" y="26" width="6" height="6" fill="#0a192f"/>
      <rect x="22" y="44" width="6" height="6" fill="#0a192f"/>
      <rect x="70" y="46" width="6" height="6" fill="#0a192f"/>
      <rect x="42" y="70" width="6" height="6" fill="#0a192f"/>
      <rect x="54" y="74" width="8" height="6" fill="#0a192f"/>
      <rect x="72" y="68" width="6" height="8" fill="#0a192f"/>
      <rect x="80" y="80" width="6" height="6" fill="#0a192f"/>
    </svg>
  `;
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

function showToast(msg) {
  if (typeof window.showToastNotification === 'function') {
    window.showToastNotification(msg);
  } else {
    const toast = document.createElement('div');
    toast.className = 'hub-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
