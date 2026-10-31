/**
 * GEC Sheikhpura Student Life Hub - Personalized Student Dashboard
 * Manages profile, living preferences, cross-device saved listings,
 * monthly expense calculator, and platform integration.
 */

let currentUser = null;
let currentProfile = null;
let cachedSavedItems = [];
let activeSavedCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  await initDashboard();
});

async function initDashboard() {
  if (!window.DB) {
    console.error("Database service not loaded");
    return;
  }

  // 1. Session check
  currentUser = await window.DB.getStudentSession();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Load Profile
  currentProfile = await window.DB.getStudentProfile(currentUser.id);

  // If user is pk3334238@gmail.com or prince86944@gmail.com, ensure name displays Prince Kumar and show Super Admin badge
  if (currentUser.email === 'pk3334238@gmail.com' || currentUser.email === 'prince86944@gmail.com') {
    if (!currentProfile.name || currentProfile.name.toLowerCase().includes('ankot') || currentProfile.name === 'Student') {
      currentProfile.name = 'Prince Kumar';
      currentProfile.display_name = 'Prince Kumar';
      if (window.DB && typeof window.DB.updateStudentProfile === 'function') {
        window.DB.updateStudentProfile(currentUser.id, { name: 'Prince Kumar', display_name: 'Prince Kumar' }).catch(() => {});
      }
    }
  }

  renderProfileUI(currentProfile);

  // Control Admin Portal Link Visibility strictly for pk3334238@gmail.com
  const isPrinceAdmin = (currentUser && currentUser.email && (currentUser.email.toLowerCase() === 'pk3334238@gmail.com' || currentUser.email.toLowerCase() === 'prince86944@gmail.com'));
  const dashAdminLink = document.getElementById('dashAdminPortalLink');
  const headerAdminBtn = document.getElementById('headerAdminQuickBtn');
  if (isPrinceAdmin) {
    if (dashAdminLink) dashAdminLink.style.display = 'flex';
    if (headerAdminBtn) headerAdminBtn.style.display = 'inline-flex';
  } else {
    if (dashAdminLink) dashAdminLink.style.display = 'none';
    if (headerAdminBtn) headerAdminBtn.style.display = 'none';
  }

  // 3. Load Saved Listings
  await loadSavedItems();

  // 4. Load Monthly Living Expenses
  await loadLivingExpenses();

  // 5. Phase 4, 5 & 8: Load User's Listings, In-App Notifications, Marketplace & Preferences
  await loadUserListings();
  await loadUserNotifications();
  await loadNotifPreferences();
  await loadUserMarketplace();
  await loadUserEnquiries();

  // 6. Phase 7: Load Registered Campus Events
  await loadUserRegisteredEvents();

  // Check URL parameters for active tab
  const urlTab = new URLSearchParams(window.location.search).get('tab');
  if (urlTab) {
    switchDashboardTab(urlTab);
  }
}

/* ==========================================================================
   Tab Navigation
   ========================================================================== */
function switchDashboardTab(tabId) {
  const panes = ['overview', 'saved', 'expenses', 'preferences', 'community', 'listings', 'notifications', 'marketplace', 'feedback'];
  panes.forEach(p => {
    const pane = document.getElementById(`section${p.charAt(0).toUpperCase() + p.slice(1)}`);
    const navBtn = document.getElementById(`tabNav${p.charAt(0).toUpperCase() + p.slice(1)}`);
    if (pane) pane.style.display = (p === tabId) ? 'block' : 'none';
    if (navBtn) navBtn.classList.toggle('active', p === tabId);
  });
  if (tabId === 'feedback') {
    loadMyFeedback();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   Profile & Preferences Rendering
   ========================================================================== */
function toggleDashCustomCollege(value) {
  const custom = document.getElementById('profCustomCollege');
  if (custom) {
    custom.style.display = (value === 'other') ? 'block' : 'none';
    if (value === 'other') custom.focus();
  }
}
window.toggleDashCustomCollege = toggleDashCustomCollege;

function renderProfileUI(profile) {
  if (!profile) return;

  const displayName = profile.display_name || profile.name || currentUser.display_name || currentUser.email.split('@')[0];
  const initial = displayName.charAt(0).toUpperCase();

  // Avatar & Headers
  const avatarEl = document.getElementById('dashAvatar');
  if (avatarEl) avatarEl.textContent = initial;

  const studentNameEl = document.getElementById('dashStudentName');
  if (studentNameEl) studentNameEl.textContent = displayName;

  const welcomeNameEl = document.getElementById('welcomeStudentName');
  if (welcomeNameEl) welcomeNameEl.textContent = displayName;

  const branchEl = document.getElementById('dashStudentBranch');
  if (branchEl) branchEl.textContent = `${profile.branch || 'Engineering'} • ${profile.semester || 'Session'}`;

  // Badges
  const bBranch = document.getElementById('badgeBranch');
  if (bBranch) bBranch.textContent = profile.branch || 'CSE';

  const bSem = document.getElementById('badgeSemester');
  if (bSem) bSem.textContent = profile.semester || '3rd Sem';

  const bBatch = document.getElementById('badgeBatch');
  if (bBatch) bBatch.textContent = profile.admission_batch || '2024-2028';

  // Render Student ID Card Visual
  const idCol = document.getElementById('idCardCollege');
  if (idCol) idCol.textContent = profile.college_name || 'Government Engineering College, Sheikhpura';

  const idAv = document.getElementById('idCardAvatar');
  if (idAv) idAv.textContent = initial;

  const idNm = document.getElementById('idCardName');
  if (idNm) idNm.textContent = displayName;

  const idReg = document.getElementById('idCardReg');
  if (idReg) idReg.textContent = profile.registration_no ? `REG: ${profile.registration_no}` : 'REG: PENDING VERIFICATION';

  const idBr = document.getElementById('idCardBranch');
  if (idBr) idBr.textContent = `${profile.branch || 'CSE'} (${profile.semester || '3rd Sem'})`;

  const idDob = document.getElementById('idCardDob');
  if (idDob) {
    if (profile.dob) {
      try {
        idDob.textContent = new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        idDob.textContent = profile.dob;
      }
    } else {
      idDob.textContent = 'Not provided';
    }
  }

  const idPh = document.getElementById('idCardPhone');
  if (idPh) idPh.textContent = profile.phone ? `+91-${profile.phone}` : 'Not provided';

  const idDist = document.getElementById('idCardDistrict');
  if (idDist) idDist.textContent = profile.home_district ? `${profile.home_district}, Bihar` : 'Sheikhpura, Bihar';

  const idEm = document.getElementById('idCardEmail');
  if (idEm) idEm.textContent = currentUser.email || 'student@gecsheikhpura.ac.in';

  // Preferences Preview
  const tagsContainer = document.getElementById('preferredTagsPreview');
  if (tagsContainer && profile.preferred_categories) {
    tagsContainer.innerHTML = profile.preferred_categories.map(cat => `
      <span class="semester-badge">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
    `).join('');
  }

  // Populate Preferences Form Inputs
  const fName = document.getElementById('profDisplayName');
  if (fName) fName.value = displayName;

  const fEmail = document.getElementById('profEmail');
  if (fEmail) fEmail.value = currentUser.email || '';

  const fCol = document.getElementById('profCollegeName');
  if (fCol && profile.college_name) {
    const exists = Array.from(fCol.options).some(o => o.value === profile.college_name);
    if (exists) {
      fCol.value = profile.college_name;
    } else {
      fCol.value = 'other';
      toggleDashCustomCollege('other');
      const customCol = document.getElementById('profCustomCollege');
      if (customCol) customCol.value = profile.college_name;
    }
  }

  const fReg = document.getElementById('profRegNo');
  if (fReg && profile.registration_no) fReg.value = profile.registration_no;

  const fDob = document.getElementById('profDob');
  if (fDob && profile.dob) fDob.value = profile.dob;

  const fPh = document.getElementById('profPhone');
  if (fPh && profile.phone) fPh.value = profile.phone;

  const fDist = document.getElementById('profHomeDistrict');
  if (fDist && profile.home_district) fDist.value = profile.home_district;

  const fBranch = document.getElementById('profBranch');
  if (fBranch && profile.branch) fBranch.value = profile.branch;

  const fSem = document.getElementById('profSemester');
  if (fSem && profile.semester) fSem.value = profile.semester;

  const fBatch = document.getElementById('profBatch');
  if (fBatch && profile.admission_batch) fBatch.value = profile.admission_batch;

  const fAcc = document.getElementById('profAccType');
  if (fAcc && profile.preferred_accommodation_type) fAcc.value = profile.preferred_accommodation_type;

  const fFood = document.getElementById('profFoodOpt');
  if (fFood && profile.preferred_food_options) fFood.value = profile.preferred_food_options;

  // Selected Category Chips
  if (profile.preferred_categories) {
    const chips = document.querySelectorAll('.pref-chip');
    chips.forEach(chip => {
      const cat = chip.getAttribute('data-cat');
      chip.classList.toggle('selected', profile.preferred_categories.includes(cat));
    });
  }
}

function togglePrefChip(el) {
  el.classList.toggle('selected');
}

async function handleUpdateProfile(event) {
  event.preventDefault();
  const btn = document.getElementById('btnUpdateProfile');
  btn.disabled = true;
  btn.textContent = 'Saving Profile...';

  const selectedChips = Array.from(document.querySelectorAll('.pref-chip.selected')).map(c => c.getAttribute('data-cat'));

  let collegeName = document.getElementById('profCollegeName').value;
  if (collegeName === 'other') {
    collegeName = document.getElementById('profCustomCollege').value.trim() || 'Other Technical College';
  }

  const updates = {
    display_name: document.getElementById('profDisplayName').value.trim(),
    name: document.getElementById('profDisplayName').value.trim(),
    college_name: collegeName,
    registration_no: document.getElementById('profRegNo').value.trim(),
    dob: document.getElementById('profDob').value,
    phone: document.getElementById('profPhone').value.trim(),
    home_district: document.getElementById('profHomeDistrict').value,
    branch: document.getElementById('profBranch').value,
    semester: document.getElementById('profSemester').value,
    admission_batch: document.getElementById('profBatch').value,
    preferred_accommodation_type: document.getElementById('profAccType').value,
    preferred_food_options: document.getElementById('profFoodOpt').value,
    preferred_categories: selectedChips,
    profile_completed: true
  };

  const res = await window.DB.updateStudentProfile(currentUser.id, updates);
  currentProfile = res.profile || { ...currentProfile, ...updates };
  renderProfileUI(currentProfile);

  // Control Admin Portal Link Visibility strictly for pk3334238@gmail.com
  const isPrinceAdmin = (currentUser && currentUser.email && (currentUser.email.toLowerCase() === 'pk3334238@gmail.com' || currentUser.email.toLowerCase() === 'prince86944@gmail.com'));
  const dashAdminLink = document.getElementById('dashAdminPortalLink');
  const headerAdminBtn = document.getElementById('headerAdminQuickBtn');
  if (isPrinceAdmin) {
    if (dashAdminLink) dashAdminLink.style.display = 'flex';
    if (headerAdminBtn) headerAdminBtn.style.display = 'inline-flex';
  } else {
    if (dashAdminLink) dashAdminLink.style.display = 'none';
    if (headerAdminBtn) headerAdminBtn.style.display = 'none';
  }

  btn.disabled = false;
  btn.textContent = 'Save Profile & Preferences';
  showToast('Verified Student ID Card & profile saved successfully!');
}

/* ==========================================================================
   Saved Listings (Bookmarking)
   ========================================================================== */
async function loadSavedItems() {
  cachedSavedItems = await window.DB.getUserSavedItems(currentUser.id);
  
  // Also sync with any offline local storage bookmarks
  const localBm = typeof getBookmarks === 'function' ? getBookmarks() : null;
  if (localBm) {
    // If user has local items not in cloud, add them
    if (localBm.rooms && localBm.rooms.length > 0) {
      for (const r of localBm.rooms) {
        if (!cachedSavedItems.some(x => x.item_type === 'rooms' && x.item_id === r.id)) {
          cachedSavedItems.push({
            id: 'local-' + r.id,
            user_id: currentUser.id,
            item_type: 'rooms',
            item_id: r.id,
            item_title: r.title,
            item_meta: { rent: r.rent, address: r.address, gender: r.gender },
            created_at: new Date().toISOString()
          });
        }
      }
    }
    if (localBm.shops && localBm.shops.length > 0) {
      for (const s of localBm.shops) {
        if (!cachedSavedItems.some(x => x.item_type === 'shops' && x.item_id === s.id)) {
          cachedSavedItems.push({
            id: 'local-' + s.id,
            user_id: currentUser.id,
            item_type: 'shops',
            item_id: s.id,
            item_title: s.name,
            item_meta: { categoryLabel: s.categoryLabel, address: s.address },
            created_at: new Date().toISOString()
          });
        }
      }
    }
  }

  // Update counts
  const total = cachedSavedItems.length;
  const countEl = document.getElementById('dashSavedCount');
  if (countEl) countEl.textContent = total;
  const previewCountEl = document.getElementById('previewSavedCount');
  if (previewCountEl) previewCountEl.textContent = total;

  renderSavedItems(cachedSavedItems);
  renderSavedOverview(cachedSavedItems.slice(0, 4));
}

function renderSavedItems(items) {
  const container = document.getElementById('dashboardSavedGrid');
  if (!container) return;

  const filtered = items.filter(it => {
    const matchCat = activeSavedCategory === 'all' || it.item_type === activeSavedCategory;
    const searchInput = document.getElementById('savedSearchInput');
    const searchVal = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase();
    const matchSearch = !searchVal || (it.item_title && it.item_title.toLowerCase().includes(searchVal));
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="state-container" style="grid-column: 1 / -1; padding: 2.5rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔖</div>
        <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem;">No saved listings in this category</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">
          Bookmark accommodations, food services, or local shops as you explore Sheikhpura.
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="rooms-pg.html" class="btn btn-primary btn-sm">Browse Rooms &amp; PGs</a>
          <a href="food-tiffin.html" class="btn btn-secondary btn-sm">Explore Food &amp; Mess</a>
          <a href="explore-nearby.html" class="btn btn-secondary btn-sm">Find Local Shops</a>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const meta = item.item_meta || {};
    let linkUrl = 'explore-nearby.html';
    let typeBadge = 'Local Service';

    if (item.item_type === 'rooms') {
      linkUrl = `rooms-pg.html?highlight=${item.item_id}`;
      typeBadge = meta.gender ? `${meta.gender} Living` : 'Accommodation';
    } else if (item.item_type === 'shops') {
      linkUrl = `explore-nearby.html?highlight=${item.item_id}`;
      typeBadge = meta.categoryLabel || 'Local Shop';
    } else if (item.item_type === 'food') {
      linkUrl = `food-tiffin.html?highlight=${item.item_id}`;
      typeBadge = 'Food & Tiffin';
    }

    return `
      <article class="directory-card" style="margin-bottom: 0;">
        <div class="directory-content">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 0.5rem;">
            <span class="status-badge status-verified">${typeBadge}</span>
            ${meta.rent ? `<span style="font-weight:800; font-size:1.15rem; color:var(--color-primary-800);">₹${meta.rent}/mo</span>` : ''}
          </div>
          <h3 class="directory-title" style="font-size: 1.1rem; margin-bottom: 0.35rem;">${escapeHtml(item.item_title)}</h3>
          <div class="directory-address" style="margin-bottom: 1rem;">
            <span>${escapeHtml(meta.address || 'Bajidpur / Sheikhpura')}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
            <a href="${linkUrl}" class="btn btn-secondary btn-sm" style="flex: 1; text-align: center;">View Listing</a>
            <button type="button" class="btn btn-secondary btn-sm" onclick="removeDashboardItem('${item.item_type}', '${item.item_id}')" style="color: var(--color-danger); border-color: var(--color-danger-border);" title="Remove">
              Remove
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderSavedOverview(items) {
  const container = document.getElementById('overviewSavedList');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="state-container" style="grid-column: 1 / -1; padding: 1.5rem;">
        <p style="color: var(--text-muted); font-size: 0.9rem;">No shortlisted rooms or shops yet.</p>
        <a href="rooms-pg.html" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem;">Explore Rooms &amp; PGs</a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div style="background-color: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem;">
      <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-accent); margin-bottom: 0.25rem;">
        ${item.item_type.toUpperCase()}
      </div>
      <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.25rem;">
        ${escapeHtml(item.item_title)}
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        ${escapeHtml((item.item_meta && item.item_meta.address) || 'Bajidpur, Sheikhpura')}
      </div>
      <a href="${item.item_type === 'rooms' ? 'rooms-pg.html' : 'explore-nearby.html'}" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">
        View Listing ↗
      </a>
    </div>
  `).join('');
}

function filterSavedCategory(cat, btn) {
  activeSavedCategory = cat;
  document.querySelectorAll('#sectionSaved .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSavedItems(cachedSavedItems);
}

function filterSavedItems() {
  renderSavedItems(cachedSavedItems);
}

async function removeDashboardItem(itemType, itemId) {
  await window.DB.removeUserItem(currentUser.id, itemType, itemId);
  
  // Also sync with localStorage bookmarks
  if (typeof toggleBookmark === 'function') {
    const bms = getBookmarks();
    if (bms[itemType]) {
      bms[itemType] = bms[itemType].filter(x => x.id !== itemId);
      saveBookmarks(bms);
    }
  }

  cachedSavedItems = cachedSavedItems.filter(x => !(x.item_type === itemType && x.item_id === itemId));
  
  // Update counts
  const total = cachedSavedItems.length;
  const countEl = document.getElementById('dashSavedCount');
  if (countEl) countEl.textContent = total;
  const previewCountEl = document.getElementById('previewSavedCount');
  if (previewCountEl) previewCountEl.textContent = total;

  renderSavedItems(cachedSavedItems);
  renderSavedOverview(cachedSavedItems.slice(0, 4));
  showToast('Item removed from saved list.');
}

/* ==========================================================================
   Monthly Living-Expense Planner
   ========================================================================== */
async function loadLivingExpenses() {
  const saved = await window.DB.getMonthlyExpenses(currentUser.id);
  if (saved) {
    if (saved.room_rent !== undefined) document.getElementById('expRoomRent').value = saved.room_rent;
    if (saved.mess_food !== undefined) document.getElementById('expMessFood').value = saved.mess_food;
    if (saved.electricity_charges !== undefined) document.getElementById('expElectricity').value = saved.electricity_charges;
    if (saved.local_transit !== undefined) document.getElementById('expTransit').value = saved.local_transit;
    if (saved.stationery_xerox !== undefined) document.getElementById('expStationery').value = saved.stationery_xerox;
    if (saved.utilities_recharge !== undefined) document.getElementById('expRecharge').value = saved.utilities_recharge;
    if (saved.laundry !== undefined) document.getElementById('expLaundry').value = saved.laundry;
    if (saved.medical !== undefined) document.getElementById('expMedical').value = saved.medical;
    if (saved.personal_snacks !== undefined) document.getElementById('expPersonal').value = saved.personal_snacks;
  }
  calculateExpenses();
}

function calculateExpenses() {
  const getNumVal = function(id) {
    const el = document.getElementById(id);
    return parseInt((el && el.value) || '0', 10);
  };
  const rent = getNumVal('expRoomRent');
  const food = getNumVal('expMessFood');
  const elec = getNumVal('expElectricity');
  const transit = getNumVal('expTransit');
  const stat = getNumVal('expStationery');
  const recharge = getNumVal('expRecharge');
  const laundry = getNumVal('expLaundry');
  const med = getNumVal('expMedical');
  const pers = getNumVal('expPersonal');

  // Update label values
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₹${v.toLocaleString('en-IN')}`;
  };
  setVal('labelRentVal', rent);
  setVal('labelFoodVal', food);
  setVal('labelElecVal', elec);
  setVal('labelTransitVal', transit);
  setVal('labelStatVal', stat);
  setVal('labelRechargeVal', recharge);
  setVal('labelLaundryVal', laundry);
  setVal('labelMedVal', med);
  setVal('labelPersVal', pers);

  const total = rent + food + elec + transit + stat + recharge + laundry + med + pers;
  const totalEl = document.getElementById('totalExpenseDisplay');
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

  const dailyRateEl = document.getElementById('dailyExpenseRate');
  if (dailyRateEl) dailyRateEl.textContent = Math.round(total / 30).toLocaleString('en-IN');

  return total;
}

async function saveLivingExpenses() {
  const btn = document.getElementById('btnSaveExpense');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const expenses = {
    room_rent: parseInt(document.getElementById('expRoomRent').value || '0', 10),
    mess_food: parseInt(document.getElementById('expMessFood').value || '0', 10),
    electricity_charges: parseInt(document.getElementById('expElectricity').value || '0', 10),
    local_transit: parseInt(document.getElementById('expTransit').value || '0', 10),
    stationery_xerox: parseInt(document.getElementById('expStationery').value || '0', 10),
    utilities_recharge: parseInt(document.getElementById('expRecharge').value || '0', 10),
    laundry: parseInt(document.getElementById('expLaundry').value || '0', 10),
    medical: parseInt(document.getElementById('expMedical').value || '0', 10),
    personal_snacks: parseInt(document.getElementById('expPersonal').value || '0', 10),
    total_monthly: calculateExpenses()
  };

  await window.DB.saveMonthlyExpenses(currentUser.id, expenses);
  btn.disabled = false;
  btn.textContent = '💾 Save Living Budget to Profile';
  showToast('Monthly living budget saved to your account!');
}

function resetExpenses() {
  document.getElementById('expRoomRent').value = 3000;
  document.getElementById('expMessFood').value = 2400;
  document.getElementById('expElectricity').value = 300;
  document.getElementById('expTransit').value = 400;
  document.getElementById('expStationery').value = 250;
  document.getElementById('expRecharge').value = 350;
  document.getElementById('expLaundry').value = 300;
  document.getElementById('expMedical').value = 200;
  document.getElementById('expPersonal').value = 500;
  calculateExpenses();
  showToast('Reset to typical Sheikhpura student averages.');
}

/* ==========================================================================
   Account Deletion & Sign Out
   ========================================================================== */
async function confirmAccountDeletion() {
  const reason = prompt("Please confirm why you would like to delete your account (e.g. Graduated, Left Sheikhpura):");
  if (reason !== null) {
    if (confirm("Are you sure? This will remove all your private profile data, saved items, and expense records.")) {
      await window.DB.requestAccountDeletion(currentUser.id, reason || 'Student request');
      alert("Your account deletion request has been submitted and your session has been purged.");
      window.location.href = 'index.html';
    }
  }
}

async function handleSignOut() {
  if (confirm("Sign out of GEC Sheikhpura Student Life Hub?")) {
    await window.DB.studentSignOut();
    window.location.href = 'index.html';
  }
}

/* ==========================================================================
   Phase 4: My Submitted Listings & Owner Status
   ========================================================================== */
async function loadUserListings() {
  const container = document.getElementById('userListingsContainer');
  const countBadge = document.getElementById('dashListingsCount');
  if (!container || !currentUser) return;

  const { businesses, accommodations } = await window.DB.getUserSubmissions(currentUser.id);
  const totalListings = businesses.length + accommodations.length;

  if (countBadge) {
    countBadge.textContent = totalListings;
    countBadge.style.display = totalListings > 0 ? 'inline-block' : 'none';
  }

  if (totalListings === 0) {
    container.innerHTML = `
      <div class="state-container" style="background: var(--bg-surface); padding: 3rem 1.5rem; text-align: center; border: 1px dashed var(--border-medium); border-radius: var(--radius-md);">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📋</div>
        <h3 class="state-title" style="margin-bottom: 0.5rem;">You Have Not Submitted Any Listings Yet</h3>
        <p class="state-desc" style="max-width: 500px; margin: 0 auto 1.5rem; color: var(--text-muted);">
          Are you a room owner, PG manager, or running a student service in Sheikhpura? Register your listing for student discovery.
        </p>
        <a href="submit-listing.html" class="btn btn-primary">+ Submit Business or Room Listing</a>
      </div>
    `;
    return;
  }

  const allItems = [
    ...businesses.map(b => ({ ...b, itemKind: 'Business / Shop', title: b.business_name, sub: b.category_id, date: b.created_at })),
    ...accommodations.map(a => ({ ...a, itemKind: 'Room / Accommodation', title: a.property_title, sub: `₹${a.monthly_rent}/mo`, date: a.created_at }))
  ];

  container.innerHTML = allItems.map(item => {
    const isApproved = item.status === 'approved';
    const isCorrection = item.status === 'correction_requested';
    const isPending = item.status === 'pending';
    const statusClass = isApproved ? 'status-verified' : (isCorrection ? 'status-urgent' : (isPending ? 'status-sample' : 'status-flagged'));
    const statusText = isApproved ? 'Approved & Live' : (isCorrection ? 'Correction Needed' : (isPending ? 'Under Moderator Review' : 'Declined'));

    return `
      <div class="calc-card" style="margin-bottom: 1rem; border-left: 4px solid ${isApproved ? 'var(--color-primary-600)' : (isCorrection ? '#d97706' : 'var(--border-medium)')};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div>
            <span class="branch-badge" style="font-size: 0.7rem;">${item.itemKind}</span>
            <h3 style="font-size: 1.15rem; margin: 0.25rem 0 0.15rem 0;">${escapeHtml(item.title)}</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(item.address)}</span>
          </div>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>

        <div style="font-size: 0.825rem; color: var(--text-subtle); margin-bottom: 0.75rem;">
          Submitted: ${new Date(item.date).toLocaleDateString()} | Phone: ${item.normalized_phone || item.public_phone || item.owner_contact}
        </div>

        ${item.admin_feedback ? `
          <div style="background-color: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 0.65rem 0.85rem; border-radius: var(--radius-xs); font-size: 0.8125rem; margin-bottom: 0.75rem;">
            <strong>Moderator Note:</strong> ${escapeHtml(item.admin_feedback)}
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 0.65rem; margin-top: 0.5rem;">
          <span style="font-size: 0.78rem; color: var(--text-muted);">
            ${isApproved ? 'Publicly visible to students in GEC Hub directory' : 'Visible only to you and moderators'}
          </span>
          <div style="display: flex; gap: 0.5rem;">
            ${isApproved ? `
              <a href="${item.itemKind.includes('Room') ? 'rooms-pg.html' : 'explore-nearby.html'}" class="btn btn-secondary btn-sm" target="_blank">
                View in Directory ↗
              </a>
            ` : ''}
            <a href="submit-listing.html" class="btn btn-secondary btn-sm">
              Update Details
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   Phase 4 & Phase 8: In-App Notifications, Filtering & Preferences
   ========================================================================== */
let activeNotifFilter = 'all';
let notifPageLimit = 15;

function setNotifFilter(filter) {
  activeNotifFilter = filter;
  const btnAll = document.getElementById('btnNotifFilterAll');
  const btnUnread = document.getElementById('btnNotifFilterUnread');

  if (btnAll && btnUnread) {
    btnAll.style.fontWeight = filter === 'all' ? '700' : 'normal';
    btnAll.style.backgroundColor = filter === 'all' ? 'var(--bg-muted)' : 'transparent';
    btnUnread.style.fontWeight = filter === 'unread' ? '700' : 'normal';
    btnUnread.style.backgroundColor = filter === 'unread' ? 'var(--bg-muted)' : 'transparent';
  }

  loadUserNotifications();
}

async function loadUserNotifications() {
  const container = document.getElementById('userNotificationsContainer');
  const badge = document.getElementById('dashNotifCount');
  if (!container || !currentUser) return;

  const notifs = await window.DB.getUserNotifications(currentUser.id, {
    limit: notifPageLimit,
    unreadOnly: activeNotifFilter === 'unread'
  });

  // Calculate unread across all
  const allNotifs = await window.DB.getUserNotifications(currentUser.id, { limit: 100 });
  const unreadCount = allNotifs.filter(n => !n.is_read).length;

  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  }

  if (notifs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: var(--radius-md); color: var(--text-muted);">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔕</div>
        <p style="margin: 0; font-size: 0.9rem;">
          ${activeNotifFilter === 'unread' ? 'No unread notifications.' : 'You have no notifications yet.'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div class="hub-card" style="margin-bottom: 0.75rem; border-left: 4px solid ${n.is_read ? 'var(--border-medium)' : 'var(--color-primary-600)'}; background-color: ${n.is_read ? 'var(--bg-surface)' : 'var(--bg-muted)'}; padding: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
        <h4 style="font-size: 0.95rem; margin: 0; color: var(--text-main); font-weight: 700;">
          ${n.is_read ? '' : '<span style="color: var(--color-primary-600); margin-right: 4px;">●</span>'}
          ${escapeHtml(n.title)}
        </h4>
        <span style="font-size: 0.75rem; color: var(--text-subtle);">${new Date(n.created_at).toLocaleDateString()}</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.25rem 0 0.5rem 0;">
        ${escapeHtml(n.message)}
      </p>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem;">
        ${n.target_link ? `<a href="${n.target_link}" style="color: var(--color-primary-700); font-weight: 600;">View Details →</a>` : '<span></span>'}
        ${!n.is_read ? `<button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;" onclick="markSingleNotifRead('${n.id}')">Mark Read</button>` : '<span style="color: var(--text-subtle);">Read ✓</span>'}
      </div>
    </div>
  `).join('');
}

async function markSingleNotifRead(notifId) {
  if (!currentUser) return;
  await window.DB.markNotificationRead(currentUser.id, notifId);
  await loadUserNotifications();
}

async function markAllNotificationsAsRead() {
  if (!currentUser) return;
  await window.DB.markAllNotificationsRead(currentUser.id);
  showToast("All notifications marked as read.");
  await loadUserNotifications();
}

/* --------------------------------------------------------------------------
   Notification Preferences & Push Consent
   -------------------------------------------------------------------------- */
async function loadNotifPreferences() {
  if (!currentUser || !window.DB) return;
  const prefs = await window.DB.getNotificationPreferences(currentUser.id);

  const prefListing = document.getElementById('prefListingAlerts');
  const prefEvents = document.getElementById('prefEventReminders');
  const prefMkt = document.getElementById('prefMarketplace');
  const pushBadge = document.getElementById('pushStatusBadge');
  const btnPush = document.getElementById('btnTogglePush');

  if (prefListing) prefListing.checked = prefs.listing_alerts !== false;
  if (prefEvents) prefEvents.checked = prefs.event_reminders !== false;
  if (prefMkt) prefMkt.checked = prefs.marketplace_enquiries !== false;

  // Browser push support check
  const hasPushSupport = 'Notification' in window && 'serviceWorker' in navigator;
  if (!hasPushSupport) {
    if (pushBadge) {
      pushBadge.textContent = 'Unsupported in this Browser';
      pushBadge.className = 'status-badge status-sample';
    }
    if (btnPush) btnPush.disabled = true;
    return;
  }

  const perm = Notification.permission;
  if (pushBadge && btnPush) {
    if (perm === 'granted' && prefs.browser_push) {
      pushBadge.textContent = 'Active (Subscribed)';
      pushBadge.className = 'status-badge status-verified';
      btnPush.textContent = 'Disable Device Alerts';
    } else if (perm === 'denied') {
      pushBadge.textContent = 'Blocked in Browser Settings';
      pushBadge.className = 'status-badge status-danger';
      btnPush.textContent = 'Permission Blocked';
      btnPush.disabled = true;
    } else {
      pushBadge.textContent = 'Opt-In Available';
      pushBadge.className = 'status-badge status-sample';
      btnPush.textContent = 'Enable Browser Alerts';
      btnPush.disabled = false;
    }
  }
}

async function saveNotifPrefs() {
  if (!currentUser || !window.DB) return;
  const prefListing = document.getElementById('prefListingAlerts');
  const prefEvents = document.getElementById('prefEventReminders');
  const prefMkt = document.getElementById('prefMarketplace');

  await window.DB.updateNotificationPreferences(currentUser.id, {
    listing_alerts: prefListing ? prefListing.checked : true,
    event_reminders: prefEvents ? prefEvents.checked : true,
    marketplace_enquiries: prefMkt ? prefMkt.checked : true
  });

  showToast('Notification preferences saved.');
}

async function togglePushNotifications() {
  if (!('Notification' in window)) {
    alert('Browser push notifications are not supported in your current browser.');
    return;
  }

  const prefs = await window.DB.getNotificationPreferences(currentUser.id);

  if (prefs.browser_push && Notification.permission === 'granted') {
    // Revoke preference
    await window.DB.updateNotificationPreferences(currentUser.id, { browser_push: false });
    showToast('Browser notifications disabled.');
    await loadNotifPreferences();
    return;
  }

  // Request user permission explicitly after click
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await window.DB.updateNotificationPreferences(currentUser.id, { browser_push: true });
    // Display confirmation test notification
    try {
      new Notification('GEC Sheikhpura Student Hub', {
        body: 'Browser alerts enabled. You will receive updates about listing reviews and campus passes.',
        icon: 'assets/images/icons/icon-192.png'
      });
    } catch (e) {
      console.log('Local notification dispatched:', e);
    }
    showToast('Browser alerts enabled successfully!');
  } else {
    showToast('Permission not granted.');
  }

  await loadNotifPreferences();
}

/* ==========================================================================
   Phase 5: Marketplace Listings & Received Enquiries
   ========================================================================== */
function switchMktSubtab(subtab) {
  const itemsContainer = document.getElementById('userMktItemsContainer');
  const enqContainer = document.getElementById('userMktEnquiriesContainer');
  const itemsBtn = document.getElementById('subtabMktItemsBtn');
  const enqBtn = document.getElementById('subtabMktEnqBtn');

  if (subtab === 'items') {
    if (itemsContainer) itemsContainer.style.display = 'block';
    if (enqContainer) enqContainer.style.display = 'none';
    if (itemsBtn) itemsBtn.style.fontWeight = '700';
    if (enqBtn) enqBtn.style.fontWeight = 'normal';
  } else {
    if (itemsContainer) itemsContainer.style.display = 'none';
    if (enqContainer) enqContainer.style.display = 'block';
    if (itemsBtn) itemsBtn.style.fontWeight = 'normal';
    if (enqBtn) enqBtn.style.fontWeight = '700';
  }
}

async function loadUserMarketplace() {
  const container = document.getElementById('userMktItemsContainer');
  const countBadge = document.getElementById('dashMarketplaceCount');
  const itemsCountEl = document.getElementById('mktItemsCount');
  if (!container || !currentUser || !window.DB) return;

  const res = await window.DB.getMarketplaceListings({
    sellerId: currentUser.id,
    limit: 50
  });

  const items = res.data || [];
  if (itemsCountEl) itemsCountEl.textContent = items.length;
  if (countBadge) {
    countBadge.textContent = items.length;
    countBadge.style.display = items.length > 0 ? 'inline-flex' : 'none';
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="state-container" style="padding: 2.5rem 1rem; text-align: center;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🛍️</span>
        <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem;">No Marketplace Listings Yet</h4>
        <p style="color: var(--text-muted); font-size: 0.875rem; max-width: 440px; margin: 0 auto 1.25rem;">
          Have used books, a calculator, cycle, or hostel furniture you no longer need? Post it on the GEC Sheikhpura student marketplace!
        </p>
        <a href="marketplace.html" class="btn btn-primary btn-sm">+ Post Item for Sale</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; gap: 1rem;">
      ${items.map(item => `
        <div class="hub-card" style="padding: 1rem; border: 1px solid var(--border-light); background-color: var(--bg-surface); border-radius: var(--radius-sm); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <div style="width: 60px; height: 60px; border-radius: var(--radius-xs); overflow: hidden; background-color: var(--bg-muted); flex-shrink: 0;">
              <img src="${escapeHtml((item.image_urls && item.image_urls[0]) || 'assets/images/calculator.jpg')}" alt="${escapeHtml(item.title)}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <h4 style="font-size: 1rem; margin: 0; color: var(--text-main); font-weight: 700;">
                  ${escapeHtml(item.title)}
                </h4>
                <span class="status-badge status-${item.status === 'available' ? 'verified' : (item.status === 'reserved' ? 'reserved' : 'sold')}" style="font-size: 0.7rem; padding: 0.15rem 0.45rem;">
                  ${item.status.toUpperCase()}
                </span>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                <strong>₹${item.price}</strong> • Condition: ${escapeHtml(item.item_condition)} • 📍 ${escapeHtml(item.approximate_location || 'Campus')}
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            ${item.status !== 'sold' ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="handleUpdateItemStatus('${item.id}', 'sold')">
                ✓ Mark as Sold
              </button>
            ` : ''}
            ${item.status === 'available' ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="handleUpdateItemStatus('${item.id}', 'reserved')">
                ⏳ Mark Reserved
              </button>
            ` : (item.status === 'reserved' ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="handleUpdateItemStatus('${item.id}', 'available')">
                🔄 Mark Available
              </button>
            ` : '')}
            <a href="marketplace.html?id=${item.id}" class="btn btn-secondary btn-sm">
              View
            </a>
            <button type="button" class="btn btn-secondary btn-sm" style="color: var(--color-danger); border-color: var(--color-danger-border);" onclick="handleDeleteMarketplaceItem('${item.id}')">
              Delete
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function handleUpdateItemStatus(id, newStatus) {
  if (!confirm(`Are you sure you want to change this item status to "${newStatus}"?`)) return;
  const res = await window.DB.updateMarketplaceStatus(id, newStatus, currentUser ? currentUser.id : null);
  if (res.success) {
    showToast(`Status updated to ${newStatus}.`);
    await loadUserMarketplace();
  } else {
    alert(res.error || 'Failed to update status.');
  }
}

async function handleDeleteMarketplaceItem(id) {
  if (!confirm('Are you sure you want to delete this listing from the marketplace?')) return;
  const res = await window.DB.deleteMarketplaceListing(id, currentUser ? currentUser.id : null);
  if (res.success) {
    showToast('Listing removed.');
    await loadUserMarketplace();
  } else {
    alert(res.error || 'Failed to delete listing.');
  }
}

async function loadUserEnquiries() {
  const container = document.getElementById('userMktEnquiriesContainer');
  const countEl = document.getElementById('mktEnqCount');
  if (!container || !currentUser || !window.DB) return;

  const enquiries = await window.DB.getSellerEnquiries(currentUser.id);
  if (countEl) countEl.textContent = enquiries.length;

  if (enquiries.length === 0) {
    container.innerHTML = `
      <div class="state-container" style="padding: 2.5rem 1rem; text-align: center;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">💬</span>
        <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem;">No Buyer Enquiries Yet</h4>
        <p style="color: var(--text-muted); font-size: 0.875rem;">
          When other students enquire about your marketplace products, their private messages and contact numbers will appear here.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; gap: 1rem;">
      ${enquiries.map(enq => `
        <div class="hub-card" style="padding: 1.15rem; border: 1px solid var(--border-light); background-color: var(--bg-surface); border-radius: var(--radius-sm);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <strong style="color: var(--text-main); font-size: 1rem;">${escapeHtml(enq.buyer_name)}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
                📞 Contact: <a href="tel:${escapeHtml(enq.buyer_contact)}" style="color: var(--color-primary-700); font-weight: 600;">${escapeHtml(enq.buyer_contact)}</a>
                ${enq.offered_price ? ` • Offered: <strong>₹${enq.offered_price}</strong>` : ''}
              </div>
            </div>
            <div style="text-align: right;">
              <span class="status-badge ${enq.status === 'unread' ? 'status-sample' : 'status-verified'}" style="font-size: 0.7rem;">
                ${enq.status.toUpperCase()}
              </span>
              <div style="font-size: 0.725rem; color: var(--text-subtle); margin-top: 0.25rem;">
                ${new Date(enq.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div style="background-color: var(--bg-muted); padding: 0.75rem 1rem; border-radius: var(--radius-xs); font-size: 0.875rem; color: var(--text-main); margin-bottom: 0.75rem; line-height: 1.45;">
            "${escapeHtml(enq.message)}"
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
            <span style="color: var(--text-subtle);">Item Ref: ${escapeHtml(enq.listing_id)}</span>
            ${enq.status === 'unread' ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="handleMarkEnquiryRead('${enq.id}')">
                Mark as Read ✓
              </button>
            ` : '<span style="color: var(--text-muted);">Read ✓</span>'}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function handleMarkEnquiryRead(enquiryId) {
  await window.DB.markEnquiryRead(enquiryId);
  showToast('Enquiry marked as read.');
  await loadUserEnquiries();
}

/* ==========================================================================
   Phase 7: Registered Campus Events & Meetups
   ========================================================================== */
async function loadUserRegisteredEvents() {
  const container = document.getElementById('userRegisteredEventsContainer');
  if (!container || !currentUser) return;

  const regRes = await window.DB.getUserEventRegistrations(currentUser.id);
  const regs = regRes.registrations || [];

  if (regs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); background: var(--bg-muted); border-radius: var(--radius-sm);">
        <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🎟️</span>
        <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">No Event Registrations Yet</h4>
        <p style="margin: 0 0 1rem 0; font-size: 0.8125rem;">You haven't signed up for any college festivals, cultural activities, or sports tournaments.</p>
        <a href="community.html" class="btn btn-secondary btn-sm">Explore Campus Events</a>
      </div>
    `;
    return;
  }

  // Fetch full details of each registered event
  const eventsWithReg = await Promise.all(regs.map(async r => {
    const ev = await window.DB.getEventById(r.eventId);
    if (!ev) return null;
    return { ...ev, regDate: r.registeredAt, regStatus: r.status };
  }));

  const validEvents = eventsWithReg.filter(Boolean);

  container.innerHTML = `
    <div style="display: grid; gap: 0.875rem;">
      ${validEvents.map(e => {
        const dateStr = window.DB.formatISTDateTime ? window.DB.formatISTDateTime(e.startTime) : new Date(e.startTime).toLocaleString('en-IN');
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-sm); flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                <span class="status-badge status-verified">Confirmed Pass</span>
                <span class="branch-badge">${escapeHtml(window.DB.getCategoryLabel ? window.DB.getCategoryLabel(e.category) : e.category)}</span>
              </div>
              <h4 style="font-size: 1rem; font-weight: 700; margin: 0 0 0.25rem 0; color: var(--text-main);">${escapeHtml(e.title)}</h4>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                📅 ${dateStr} • 📍 ${escapeHtml(e.venue || 'Campus Grounds')}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <a href="community.html" class="btn btn-secondary btn-sm">View Details</a>
              <button type="button" class="btn btn-secondary btn-sm" style="color: var(--color-danger); border-color: rgba(239, 68, 68, 0.3);" onclick="handleCancelRegistration('${e.id}')">Cancel Pass</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.handleCancelRegistration = async function(eventId) {
  if (!confirm('Are you sure you want to cancel your pass for this event? Your spot will be released to fellow students.')) return;
  const res = await window.DB.cancelEventRegistration(eventId, currentUser.id);
  if (res.success) {
    showToast('Registration pass cancelled.');
    await loadUserRegisteredEvents();
  } else {
    alert(res.error || 'Failed to cancel registration.');
  }
};

/* ==========================================================================
   Phase 10: Student Data Export & Self-Service Privacy Controls
   ========================================================================== */
window.downloadMyData = async function() {
  if (!currentUser || !currentUser.id) {
    alert("Please sign in to export your account data.");
    return;
  }
  try {
    const res = await window.DB.exportStudentData(currentUser.id);
    if (res.success) {
      const blob = new Blob([JSON.stringify(res.exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my_gec_hub_data_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Personal account data exported.');
    } else {
      alert('Error exporting data: ' + (res.error || 'Failed.'));
    }
  } catch (err) {
    console.error('Export error:', err);
    alert('Failed to generate export file.');
  }
};

/* ==========================================================================
   Phase 10: My Submitted Feedback & Suggestions Viewer
   ========================================================================== */
window.loadMyFeedback = async function() {
  const container = document.getElementById('myFeedbackContainer');
  if (!container) return;

  try {
    const items = await window.DB.getStudentOwnFeedback(currentUser ? currentUser.id : null);
    if (!items || items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: var(--radius-sm);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">💡</div>
          <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">No Feedback Submitted Yet</div>
          <p style="font-size: 0.85rem; margin: 0 0 1rem 0;">Have an idea for a student tool, noticed an outdated room, or found a missing shop?</p>
          <a href="contact.html" class="btn btn-primary btn-sm">Submit Suggestion or Correction →</a>
        </div>
      `;
      return;
    }

    const categoryLabels = {
      missing_service: '🏪 Missing Local Service',
      incorrect_details: '✏️ Incorrect Details',
      room_availability: '🏠 Outdated Room Vacancy',
      map_location: '📍 Map Location Error',
      marketplace_issue: '🛍️ Marketplace Issue',
      event_info: '🎪 Event Info Correction',
      accessibility: '♿ Accessibility / Usability',
      bug_broken: '🐞 Bug / Broken Page',
      feature_suggestion: '💡 Feature Suggestion'
    };

    const statusPills = {
      pending: '<span class="status-badge status-sample">Pending Review</span>',
      reviewing: '<span class="status-badge status-badge">Reviewing</span>',
      planned: '<span class="status-badge" style="background:#e0e7ff; color:#3730a3;">Planned 🗓️</span>',
      in_progress: '<span class="status-badge" style="background:#fef3c7; color:#92400e;">In Progress ⚙️</span>',
      completed: '<span class="status-badge status-verified">Completed ✅</span>',
      declined: '<span class="status-badge status-danger">Declined</span>',
      under_review: '<span class="status-badge status-badge">Reviewing</span>',
      resolved: '<span class="status-badge status-verified">Completed ✅</span>',
      rejected: '<span class="status-badge status-danger">Declined</span>'
    };

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${items.map(item => `
          <div class="hub-card" style="padding: 1.25rem; border: 1px solid var(--border-light); background: var(--bg-surface); border-radius: var(--radius-sm);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary-700); background: var(--bg-muted); padding: 0.2rem 0.5rem; border-radius: var(--radius-xs); margin-right: 0.5rem;">
                  ${categoryLabels[item.category] || item.category}
                </span>
                ${statusPills[item.status] || `<span class="status-badge">${item.status}</span>`}
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">
                📅 ${new Date(item.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </div>
            </div>

            <div style="font-size: 0.92rem; color: var(--text-main); margin-bottom: 0.75rem; line-height: 1.5;">
              ${escapeHtml(item.description)}
            </div>

            ${item.related_page_or_listing ? `
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                <strong>Related Target:</strong> <span style="color: var(--color-primary-600);">${escapeHtml(item.related_page_or_listing)}</span>
              </div>
            ` : ''}

            ${item.resolution_summary ? `
              <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; padding: 0.5rem 0.75rem; border-radius: var(--radius-xs); font-size: 0.82rem; color: var(--text-main); margin-top: 0.5rem;">
                <strong>Moderator Resolution:</strong> ${escapeHtml(item.resolution_summary)}
              </div>
            ` : `
              <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; margin-top: 0.5rem;">
                No public response yet. The volunteer team reviews requests periodically.
              </div>
            `}
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Error loading my feedback:', err);
    container.innerHTML = `<p style="color: var(--color-danger); padding: 1rem;">Failed to load feedback records.</p>`;
  }
};


