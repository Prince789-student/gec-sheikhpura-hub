/**
 * GEC Sheikhpura Student Life Hub - Core Application Logic
 * Pure Vanilla JS: Theme Toggle, Mobile Navigation, Global Search,
 * Bookmark Management, Report Modals, and Micro-interactions.
 */

// Complete auto-purge of legacy mock/demo records so platform starts at pure 0
(function enforceCleanZeroState() {
  const PURGE_KEY = 'gec_purged_mock_v16';
  const wipeArrayKeys = [
    'gec_food_services_override',
    'gec_accommodations_override',
    'gec_businesses_override',
    'gec_unverified_coords',
    'gec_student_feedback_queue',
    'gec_custom_faculty',
    'gec_faculty',
    'gec_custom_facilities',
    'gec_facilities',
    'gec_community_events',
    'gec_student_clubs',
    'gec_sports_activities',
    'gec_community_announcements',
    'gec_reports_queue',
    'gec_service_reviews',
    'gec_verifications',
    'gec_marketplace_listings',
    'gec_published_businesses',
    'gec_published_accommodations'
  ];

  if (!localStorage.getItem(PURGE_KEY)) {
    wipeArrayKeys.forEach(function(k) {
      try {
        localStorage.setItem(k, JSON.stringify([]));
      } catch(e) {}
    });
    try {
      localStorage.removeItem('gec_official_crawls');
      localStorage.removeItem('gec_crawl_stats');
      localStorage.setItem(PURGE_KEY, 'true');
    } catch(e) {}
  } else {
    // Continuous defensive cleanup for any demo activities
    const mockCheckList = ['gec_sports_activities', 'gec_student_clubs', 'gec_community_events', 'gec_community_announcements'];
    const mockKeywords = ['weekend friendly', 'evening doubles', 'volleyball team', 'blitz chess', 'aarohan', 'natraj', 'shaurya'];
    mockCheckList.forEach(function(k) {
      try {
        const val = localStorage.getItem(k);
        if (val && mockKeywords.some(mk => val.toLowerCase().includes(mk))) {
          localStorage.setItem(k, JSON.stringify([]));
        }
      } catch(e) {}
    });
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initBookmarksBadge();
  initGlobalSearch();
  initReportModal();
  initUserSessionHeader();
  initPWA();
  initOnlineOfflineStatus();
  initMobileBottomNav();
  initCampusBroadcastBanner();
});

/* ==========================================================================
   User Session Navigation Link & Student Profile Modal
   ========================================================================== */
function closeStudentProfileModal() {
  const modal = document.getElementById('globalStudentProfileModal');
  if (modal) {
    modal.classList.remove('open', 'show', 'active');
    modal.style.display = 'none';
  }
}
window.closeStudentProfileModal = closeStudentProfileModal;

async function handleUniversalSignOut() {
  if (window.DB) {
    await window.DB.studentSignOut();
  } else {
    localStorage.removeItem('gec_student_session');
  }
  window.location.href = 'login.html';
}
window.handleUniversalSignOut = handleUniversalSignOut;

async function openGlobalStudentProfileModal(user) {
  if (!user || !window.DB) return;
  const profile = await window.DB.getStudentProfile(user.id);

  // If user is pk3334238@gmail.com, direct to admin.html
  if (user.email && user.email.toLowerCase() === 'pk3334238@gmail.com') {
    window.location.href = 'admin.html';
    return;
  }

  // If profile is not complete, redirect to dashboard.html to view and update details
  if (!window.DB.isProfileComplete(profile)) {
    window.location.href = 'dashboard.html';
    return;
  }

  let modal = document.getElementById('globalStudentProfileModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'globalStudentProfileModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-box-card" style="max-width: 520px; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.25rem;">🎓</span>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text-main);">Student Identity Card</h3>
          </div>
          <button type="button" class="modal-close-btn" onclick="closeStudentProfileModal()" style="font-size: 1.25rem; background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.2rem 0.5rem;">✕</button>
        </div>

        <!-- Student ID Card Visual -->
        <div class="student-id-card" style="margin-bottom: 1.25rem;">
          <div class="student-id-header">
            <div>
              <div class="student-id-college" id="gProfileCollege">Government Engineering College, Sheikhpura</div>
              <div class="student-id-univ">Bihar Engineering University (BEU) Patna</div>
            </div>
            <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #86efac; font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.45rem; border-radius: 4px; text-transform: uppercase;">
              ✓ Verified Student
            </div>
          </div>

          <div class="student-id-body">
            <div class="student-id-avatar" id="gProfileAvatar">S</div>
            <div class="student-id-info">
              <div class="student-id-name" id="gProfileName">Student Name</div>
              <div class="student-id-reg" id="gProfileReg">REG: 22105128001</div>
              <div style="font-size: 0.8rem; color: #cbd5e1;" id="gProfileBranch">Computer Science &amp; Engg</div>
            </div>
          </div>

          <div class="student-id-grid">
            <div class="student-id-item">
              <span class="student-id-label">Date of Birth</span>
              <span class="student-id-val" id="gProfileDob">--</span>
            </div>
            <div class="student-id-item">
              <span class="student-id-label">Mobile Number</span>
              <span class="student-id-val" id="gProfilePhone">--</span>
            </div>
            <div class="student-id-item">
              <span class="student-id-label">Home District</span>
              <span class="student-id-val" id="gProfileDistrict">--</span>
            </div>
            <div class="student-id-item">
              <span class="student-id-label">Registered Email</span>
              <span class="student-id-val" id="gProfileEmail">--</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="dashboard.html?tab=preferences" class="btn btn-primary btn-sm" style="flex: 1; text-align: center; text-decoration: none;">
            ✏️ Edit Profile Details
          </a>
          <a href="dashboard.html" class="btn btn-secondary btn-sm" style="flex: 1; text-align: center; text-decoration: none;">
            📊 Student Dashboard
          </a>
          <button type="button" onclick="handleUniversalSignOut()" class="btn btn-secondary btn-sm" style="color: var(--color-danger); border-color: var(--color-danger-border);">
            Sign Out
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeStudentProfileModal();
    });
  }

  const displayName = profile.name || profile.display_name || user.display_name || user.email.split('@')[0];
  const initial = displayName.charAt(0).toUpperCase();

  document.getElementById('gProfileCollege').textContent = profile.college_name || 'Government Engineering College, Sheikhpura';
  document.getElementById('gProfileAvatar').textContent = initial;
  document.getElementById('gProfileName').textContent = displayName;
  document.getElementById('gProfileReg').textContent = profile.registration_no ? `REG: ${profile.registration_no}` : 'REG: PENDING VERIFICATION';
  document.getElementById('gProfileBranch').textContent = `${profile.branch || 'CSE'} • ${profile.semester || '3rd Sem'}`;

  let dobStr = 'Not provided';
  if (profile.dob) {
    try {
      dobStr = new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      dobStr = profile.dob;
    }
  }
  document.getElementById('gProfileDob').textContent = dobStr;
  document.getElementById('gProfilePhone').textContent = profile.phone ? `+91-${profile.phone}` : 'Not provided';
  document.getElementById('gProfileDistrict').textContent = profile.home_district ? `${profile.home_district}, Bihar` : 'Sheikhpura, Bihar';
  document.getElementById('gProfileEmail').textContent = user.email || 'Not provided';

  // Super Admin Action in Student Profile Modal (Strictly pk3334238@gmail.com)
  const isSuperAdmin = user.email && (user.email.toLowerCase() === 'pk3334238@gmail.com');
  const existingAdminBtn = document.getElementById('gProfileSuperAdminBtn');
  if (isSuperAdmin) {
    if (!existingAdminBtn) {
      const adminBtn = document.createElement('a');
      adminBtn.id = 'gProfileSuperAdminBtn';
      adminBtn.href = 'admin.html';
      adminBtn.className = 'btn btn-block';
      adminBtn.style.cssText = 'background: linear-gradient(135deg, #b45309, #d97706); color: #fff; margin-top: 12px; font-weight: 800; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; border-radius: 8px; box-shadow: 0 4px 12px rgba(217,119,6,0.25);';
      adminBtn.innerHTML = '👑 Open Super Admin Panel (' + (user.email || 'pk3334238@gmail.com') + ')';
      const body = modal.querySelector('.modal-body') || modal.querySelector('.form-card') || modal.firstElementChild;
      if (body) body.appendChild(adminBtn);
    }
  } else if (existingAdminBtn) {
    existingAdminBtn.remove();
  }

  modal.classList.add('open', 'show', 'active');
  modal.style.display = 'flex';
}
window.openGlobalStudentProfileModal = openGlobalStudentProfileModal;

async function initUserSessionHeader() {
  const userBtn = document.getElementById('headerUserBtn');
  const userLabel = document.getElementById('headerUserLabel');
  const mobileUserLink = document.getElementById('mobileUserLink');

  if (window.DB) {
    const user = await window.DB.getStudentSession();
    if (user) {
      const displayName = user.display_name || user.email.split('@')[0];
      if (userBtn) {
        userBtn.href = '#profile';
        userBtn.title = 'View Student Profile (' + displayName + ')';
        userBtn.classList.add('user-logged-in');
        userBtn.onclick = (e) => {
          e.preventDefault();
          openGlobalStudentProfileModal(user);
        };
      }
      if (userLabel) {
        userLabel.textContent = displayName;
        userLabel.style.display = 'inline';
      }

      // Strictly only pk3334238@gmail.com gets 👑 Admin Panel badge directly in the navbar
      const isSuperAdminUser = user.email && (user.email.toLowerCase() === 'pk3334238@gmail.com');
      let navAdminBadge = document.getElementById('headerAdminBadge');
      if (isSuperAdminUser) {
        if (!navAdminBadge && userBtn && userBtn.parentElement) {
          navAdminBadge = document.createElement('a');
          navAdminBadge.id = 'headerAdminBadge';
          navAdminBadge.href = 'admin.html';
          navAdminBadge.className = 'nav-admin-badge';
          navAdminBadge.innerHTML = '👑 Admin Panel';
          navAdminBadge.title = 'Super Admin Control Panel (' + (user.email || 'pk3334238@gmail.com') + ')';
          navAdminBadge.style.cssText = 'background: linear-gradient(135deg, #b45309, #d97706); color: #fff; padding: 4px 10px; border-radius: 16px; font-size: 11px; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(217,119,6,0.3); margin-left: 8px; vertical-align: middle; transition: transform 0.15s ease;';
          navAdminBadge.onmouseover = () => navAdminBadge.style.transform = 'translateY(-1px)';
          navAdminBadge.onmouseout = () => navAdminBadge.style.transform = 'none';
          userBtn.parentElement.insertBefore(navAdminBadge, userBtn.nextSibling);
        }
      } else if (navAdminBadge) {
        navAdminBadge.remove();
      }
      if (mobileUserLink) {
        mobileUserLink.href = '#profile';
        mobileUserLink.innerHTML = '👤 My Student Profile &amp; ID';
        mobileUserLink.onclick = (e) => {
          e.preventDefault();
          openGlobalStudentProfileModal(user);
        };
      }
      // Initialize Header Notification Bell
      await initNotificationBell(user);
    } else {
      if (userBtn) {
        userBtn.href = 'login.html';
        userBtn.title = 'Student Sign In / Register';
        userBtn.classList.remove('user-logged-in');
        userBtn.onclick = null;
      }
      if (userLabel) {
        userLabel.textContent = 'Sign In';
        userLabel.style.display = 'inline';
      }
      if (mobileUserLink) {
        mobileUserLink.href = 'login.html';
        mobileUserLink.innerHTML = '🔐 Student Sign In / Register';
        mobileUserLink.onclick = null;
      }
      const existingBell = document.getElementById('headerNotifBellWrapper');
      if (existingBell) existingBell.remove();
    }
  }
}

/* ==========================================================================
   Phase 8: Universal In-App Notification Bell & Debounce Utilities
   ========================================================================== */
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
window.debounce = debounce;

async function initNotificationBell(user) {
  if (!user || !window.DB) return;

  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;

  let wrapper = document.getElementById('headerNotifBellWrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'notif-bell-wrapper';
    wrapper.id = 'headerNotifBellWrapper';
    wrapper.innerHTML = `
      <button type="button" class="btn-notif-nav" id="headerNotifBell" aria-label="Notifications" title="In-App Notifications" aria-expanded="false" aria-haspopup="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="badge-count" id="headerNotifBadge" style="display: none;">0</span>
      </button>
      <div class="notif-dropdown-menu" id="headerNotifDropdown" role="region" aria-label="Notifications Dropdown">
        <div class="notif-dropdown-header">
          <h3 class="notif-dropdown-title">🔔 Notifications</h3>
          <button type="button" class="btn btn-secondary btn-sm" id="headerNotifMarkAllBtn" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">Mark all read</button>
        </div>
        <div class="notif-dropdown-body" id="headerNotifList">
          <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.8125rem;">
            Loading updates...
          </div>
        </div>
        <div class="notif-dropdown-footer">
          <a href="dashboard.html?tab=notifications">View All in Dashboard →</a>
        </div>
      </div>
    `;

    // Insert right before user button
    const userBtn = document.getElementById('headerUserBtn');
    if (userBtn) {
      headerActions.insertBefore(wrapper, userBtn);
    } else {
      headerActions.appendChild(wrapper);
    }
  }

  const bellBtn = document.getElementById('headerNotifBell');
  const dropdown = document.getElementById('headerNotifDropdown');
  const badge = document.getElementById('headerNotifBadge');
  const listEl = document.getElementById('headerNotifList');
  const markAllBtn = document.getElementById('headerNotifMarkAllBtn');

  // Update badge count
  async function refreshBadge() {
    try {
      const notifs = await window.DB.getUserNotifications(user.id, { limit: 10 });
      const unreadCount = notifs.filter(n => !n.is_read).length;
      if (badge) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }
      return notifs;
    } catch (e) {
      console.warn("Notification badge refresh error:", e);
      return [];
    }
  }

  await refreshBadge();

  // Populate dropdown items
  async function renderDropdownItems() {
    if (!listEl) return;
    listEl.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.8125rem;">
        Loading updates...
      </div>
    `;
    const notifs = await window.DB.getUserNotifications(user.id, { limit: 6 });

    if (notifs.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted);">
          <span style="font-size: 1.8rem; display: block; margin-bottom: 0.25rem;">🔕</span>
          <p style="font-size: 0.8125rem; margin: 0;">No notifications yet.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = notifs.map(n => `
      <a href="${n.target_link || 'dashboard.html?tab=notifications'}" class="notif-dropdown-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-item-header">
          <strong class="notif-item-title">${escapeHtml(n.title)}</strong>
          <span class="notif-item-time">${formatRelativeTime(n.created_at)}</span>
        </div>
        <p class="notif-item-message">${escapeHtml(n.message)}</p>
      </a>
    `).join('');

    // Attach click to mark individual as read
    listEl.querySelectorAll('.notif-dropdown-item').forEach(item => {
      item.addEventListener('click', async () => {
        const notifId = item.getAttribute('data-id');
        if (notifId) {
          await window.DB.markNotificationRead(user.id, notifId);
          await refreshBadge();
        }
      });
    });
  }

  if (bellBtn && dropdown) {
    bellBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      if (isOpen) {
        dropdown.classList.remove('open');
        bellBtn.setAttribute('aria-expanded', 'false');
        bellBtn.classList.remove('active');
      } else {
        dropdown.classList.add('open');
        bellBtn.setAttribute('aria-expanded', 'true');
        bellBtn.classList.add('active');
        await renderDropdownItems();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (wrapper && !wrapper.contains(e.target)) {
        dropdown.classList.remove('open');
        bellBtn.setAttribute('aria-expanded', 'false');
        bellBtn.classList.remove('active');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        bellBtn.setAttribute('aria-expanded', 'false');
        bellBtn.classList.remove('active');
        bellBtn.focus();
      }
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      markAllBtn.disabled = true;
      markAllBtn.textContent = 'Marking...';
      await window.DB.markAllNotificationsRead(user.id);
      await refreshBadge();
      await renderDropdownItems();
      markAllBtn.disabled = false;
      markAllBtn.textContent = 'Mark all read';
      showToast('All notifications marked as read.');
    });
  }
}

/* ==========================================================================
   1. Theme Management (Light / Dark Mode with LocalStorage)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('gec_hub_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('gec_hub_theme', nextTheme);
      updateThemeIcon(nextTheme);
      showToast(`Switched to ${nextTheme} theme`);
    });
  }
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) return;
  
  if (theme === 'dark') {
    themeBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Switch to light mode">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
    themeBtn.setAttribute('title', 'Switch to Light Mode');
  } else {
    themeBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Switch to dark mode">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
    themeBtn.setAttribute('title', 'Switch to Dark Mode');
  }
}

/* ==========================================================================
   2. Responsive Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const mobileToggle = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerCloseBtn');

  if (mobileToggle && drawer) {
    const openDrawer = () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
      mobileToggle.setAttribute('aria-expanded', 'true');
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
      mobileToggle.setAttribute('aria-expanded', 'false');
    };

    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });

    if (drawerClose) {
      drawerClose.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
      });
    }

    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        closeDrawer();
      }
    });

    // Auto-close drawer when any link inside is tapped on mobile
    drawer.querySelectorAll('.drawer-nav-item').forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }
}

/* ==========================================================================
   3. Bookmark Storage & Hub Counter
   ========================================================================== */
function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem('gec_hub_bookmarks')) || { academics: [], rooms: [], shops: [], marketplace: [] };
  } catch (e) {
    return { academics: [], rooms: [], shops: [], marketplace: [] };
  }
}

function saveBookmarks(data) {
  localStorage.setItem('gec_hub_bookmarks', JSON.stringify(data));
  initBookmarksBadge();
}

function toggleBookmark(type, item) {
  const bookmarks = getBookmarks();
  if (!bookmarks[type]) bookmarks[type] = [];

  const existingIndex = bookmarks[type].findIndex(x => x.id === item.id);
  let added = false;

  if (existingIndex > -1) {
    bookmarks[type].splice(existingIndex, 1);
    added = false;
  } else {
    bookmarks[type].push(item);
    added = true;
  }

  saveBookmarks(bookmarks);
  showToast(added ? `Saved to My Hub` : `Removed from My Hub`);

  // Cloud sync for authenticated users
  if (window.DB) {
    window.DB.getStudentSession().then(user => {
      if (user) {
        if (added) {
          window.DB.saveUserItem(user.id, {
            itemType: type,
            itemId: item.id,
            itemTitle: item.title || item.name || 'Listing',
            itemMeta: item
          });
        } else {
          window.DB.removeUserItem(user.id, type, item.id);
        }
      }
    }).catch(e => console.warn("Cloud sync bookmark error:", e));
  }

  return added;
}

function isBookmarked(type, id) {
  const bookmarks = getBookmarks();
  return bookmarks[type] ? bookmarks[type].some(x => x.id === id) : false;
}

function initBookmarksBadge() {
  const badge = document.getElementById('bookmarkCountBadge');
  if (!badge) return;
  const bookmarks = getBookmarks();
  const total = ((bookmarks.academics && bookmarks.academics.length) || 0) + 
                ((bookmarks.rooms && bookmarks.rooms.length) || 0) + 
                ((bookmarks.shops && bookmarks.shops.length) || 0) +
                ((bookmarks.marketplace && bookmarks.marketplace.length) || 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

/* ==========================================================================
   4. Global Search Across Hub
   ========================================================================== */
function initGlobalSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const searchResults = document.getElementById('globalSearchResults');
  const categoryTabs = document.querySelectorAll('.search-category-tabs .tab-btn');

  if (!searchInput || !searchResults) return;

  let activeTab = 'all';

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.getAttribute('data-tab') || 'all';
      performSearch(searchInput.value.trim(), activeTab);
    });
  });

  const debouncedSearch = debounce((query, category) => {
    performSearch(query, category);
  }, 250);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value.trim(), activeTab);
  });

  function performSearch(query, category) {
    if (!query && category === 'all') {
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
      return;
    }

    const q = query.toLowerCase();
    const hits = [];

    // Check if query is academic-related
    const academicKeywords = ['note', 'notes', 'syllabus', 'pyq', 'pyqs', 'lecture', 'lectures', 'mentorship', 'study', 'exam', 'preparation', 'dsa', 'maths', 'mathematics', 'gate', 'physics', 'chemistry', 'beu syllabus', 'cgpa', 'sgpa', 'attendance', 'bunk', 'timetable', 'routine', 'calculator', 'ugeac', 'predictor', 'hackathon', 'sih', 'result', 'download app', 'apk'];
    const isAcademicSearch = academicKeywords.some(kw => q.includes(kw)) || category === 'academics';

    // If searching specifically for academics or query matches academic concepts
    if (isAcademicSearch) {
      let targetUrl = 'https://www.apnacollegebihar.online/notes';
      let targetBtn = 'Explore Subject Notes ↗';

      if (q.includes('pyq') || q.includes('question') || q.includes('paper')) {
        targetUrl = 'https://www.apnacollegebihar.online/pyq';
        targetBtn = 'Open BEU PYQs Archive ↗';
      } else if (q.includes('syllab') || q.includes('curriculum')) {
        targetUrl = 'https://www.apnacollegebihar.online/syllabus';
        targetBtn = 'Open AICTE/BEU Syllabus ↗';
      } else if (q.includes('cgpa') || q.includes('sgpa') || q.includes('grade')) {
        targetUrl = 'https://www.apnacollegebihar.online/cgpa';
        targetBtn = 'Launch BEU CGPA Calculator ↗';
      } else if (q.includes('attend') || q.includes('bunk')) {
        targetUrl = 'https://www.apnacollegebihar.online/attendance';
        targetBtn = 'Launch 75% Attendance Tool ↗';
      } else if (q.includes('calc') || q.includes('matrix')) {
        targetUrl = 'https://www.apnacollegebihar.online/calculator';
        targetBtn = 'Open Scientific & Matrix Calc ↗';
      } else if (q.includes('timetable') || q.includes('routine')) {
        targetUrl = 'https://www.apnacollegebihar.online/timetable';
        targetBtn = 'Open Semester Timetable ↗';
      } else if (q.includes('mentor') || q.includes('doubt')) {
        targetUrl = 'https://www.apnacollegebihar.online/free-mentorship';
        targetBtn = 'Request Senior Mentorship ↗';
      } else if (q.includes('group') || q.includes('communit')) {
        targetUrl = 'https://www.apnacollegebihar.online/groups';
        targetBtn = 'Join Peer Study Groups ↗';
      } else if (q.includes('predict') || q.includes('ugeac') || q.includes('cutoff')) {
        targetUrl = 'https://www.apnacollegebihar.online/ugeac-predictor';
        targetBtn = 'Launch UGEAC Predictor ↗';
      } else if (q.includes('hackathon') || q.includes('sih')) {
        targetUrl = 'https://www.apnacollegebihar.online/hackathons';
        targetBtn = 'Open Bihar Hackathon Hub ↗';
      } else if (q.includes('result')) {
        targetUrl = 'https://www.apnacollegebihar.online/beu-result';
        targetBtn = 'Check BEU Exam Results ↗';
      } else if (q.includes('download') || q.includes('app') || q.includes('apk')) {
        targetUrl = 'https://www.apnacollegebihar.online/download';
        targetBtn = 'Download Mobile / Desktop App ↗';
      } else if (q.includes('cse')) {
        targetUrl = 'https://www.apnacollegebihar.online/notes/cse';
        targetBtn = 'Open CSE Notes & Hub ↗';
      } else if (q.includes('civil')) {
        targetUrl = 'https://www.apnacollegebihar.online/notes/civil';
        targetBtn = 'Open Civil Notes & Hub ↗';
      } else if (q.includes('electrical') || q === 'ee') {
        targetUrl = 'https://www.apnacollegebihar.online/notes/ee';
        targetBtn = 'Open EE Notes & Hub ↗';
      } else if (q.includes('mechanical') || q === 'me') {
        targetUrl = 'https://www.apnacollegebihar.online/notes/me';
        targetBtn = 'Open ME Notes & Hub ↗';
      } else if (q.includes('ece')) {
        targetUrl = 'https://www.apnacollegebihar.online/notes/ece';
        targetBtn = 'Open ECE Notes & Hub ↗';
      }

      searchResults.innerHTML = `
        <div style="background-color: var(--bg-surface); border: 2px solid var(--color-accent); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); padding: 1.5rem 1.25rem; margin-top: 0.5rem; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 0.35rem; background-color: rgba(217, 119, 6, 0.1); color: var(--color-accent); padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">
            📚 Dedicated Academic Platform
          </div>
          <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.85rem; line-height: 1.5;">
            Ye study resources Apna College Bihar par available hain.
          </p>
          <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem;">
            <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 0.5rem; background-color: var(--color-accent); border-color: var(--color-accent); font-weight: 700;">
              <span>${targetBtn}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            <a href="https://www.apnacollegebihar.online/" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              Visit Apna College Bihar Homepage ↗
            </a>
          </div>
          <div style="display: flex; gap: 0.4rem; justify-content: center; flex-wrap: wrap; border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
            <a href="https://www.apnacollegebihar.online/notes" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">Notes</a>
            <a href="https://www.apnacollegebihar.online/pyq" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">PYQs</a>
            <a href="https://www.apnacollegebihar.online/syllabus" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">Syllabus</a>
            <a href="https://www.apnacollegebihar.online/cgpa" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">CGPA</a>
            <a href="https://www.apnacollegebihar.online/attendance" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">Attendance</a>
            <a href="https://www.apnacollegebihar.online/timetable" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">Timetable</a>
            <a href="https://www.apnacollegebihar.online/calculator" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">Calculator</a>
            <a href="https://www.apnacollegebihar.online/free-mentorship" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">Mentorship</a>
            <a href="https://www.apnacollegebihar.online/ugeac-predictor" target="_blank" rel="noopener noreferrer" class="tag" style="background: var(--bg-surface); border: 1px solid var(--border-light); font-size: 0.75rem; font-weight: 600; text-decoration: none;">UGEAC Predictor</a>
          </div>
        </div>
      `;
      searchResults.style.display = 'block';
      return;
    }

    // Search Rooms & PG
    if (category === 'all' || category === 'rooms') {
      HUB_DATA.rooms.forEach(item => {
        if (!q || item.title.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) || item.address.toLowerCase().includes(q)) {
          hits.push({
            type: 'Accommodation',
            title: item.title,
            sub: `₹${item.rent}/mo • ${item.roadDistance} • ${item.gender}`,
            url: `rooms-pg.html?highlight=${item.id}`,
            badge: `₹${item.rent}`
          });
        }
      });
    }

    // Search Shops
    if (category === 'all' || category === 'shops') {
      HUB_DATA.shops.forEach(item => {
        if (!q || item.name.toLowerCase().includes(q) || item.categoryLabel.toLowerCase().includes(q) || item.services.some(s => s.toLowerCase().includes(q))) {
          hits.push({
            type: 'Local Shop',
            title: item.name,
            sub: `${item.categoryLabel} • ${item.roadDistance}`,
            url: `explore-nearby.html?highlight=${item.id}`,
            badge: item.categoryLabel
          });
        }
      });
    }

    // Search Food / Tiffin
    if (category === 'all' || category === 'food') {
      HUB_DATA.foodServices.forEach(item => {
        if (!q || item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) || item.menuSample.toLowerCase().includes(q)) {
          hits.push({
            type: 'Food & Mess',
            title: item.name,
            sub: `${item.diet} • ${item.timings}`,
            url: `food-tiffin.html?highlight=${item.id}`,
            badge: `₹${item.pricePerMonth}/mo`
          });
        }
      });
    }

    // Search Transport & Commute
    if (category === 'all' || category === 'transport') {
      if (HUB_DATA.transport && Array.isArray(HUB_DATA.transport)) {
        HUB_DATA.transport.forEach(item => {
          if (!q || item.station.toLowerCase().includes(q) || item.routes.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)) {
            hits.push({
              type: 'Transit',
              title: item.station,
              sub: `${item.distance} • ${item.autoFare}`,
              url: `transport.html`,
              badge: item.type
            });
          }
        });
      }
    }

    // Search Medical & Emergency Services
    if (category === 'all' || category === 'emergency' || category === 'medical') {
      if (HUB_DATA.emergency && Array.isArray(HUB_DATA.emergency)) {
        HUB_DATA.emergency.forEach(item => {
          if (!q || item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) || (item.available && item.available.toLowerCase().includes(q))) {
            hits.push({
              type: 'Emergency & Medical',
              title: item.name,
              sub: `${item.distance} • Call: ${item.phone}`,
              url: `emergency.html`,
              badge: '24x7 Help'
            });
          }
        });
      }
    }

    // Search Second-hand Marketplace
    if (category === 'all' || category === 'marketplace') {
      try {
        const rawMkt = localStorage.getItem('gec_marketplace_seed');
        if (rawMkt) {
          const mktList = JSON.parse(rawMkt);
          mktList.forEach(m => {
            if (m.status === 'active' && (!q || m.title.toLowerCase().includes(q) || (m.category && m.category.toLowerCase().includes(q)))) {
              hits.push({
                type: 'Marketplace',
                title: m.title,
                sub: `₹${m.price} • ${m.category} • ${m.pickup_location || 'Campus'}`,
                url: `marketplace.html?id=${m.id}`,
                badge: `₹${m.price}`
              });
            }
          });
        }
      } catch (err) {}
    }

    renderSearchResults(hits, query);
  }

  function renderSearchResults(hits, query) {
    if (hits.length === 0) {
      searchResults.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          No local listings found matching "<strong>${escapeHtml(query)}</strong>". Try searching for <em>PG</em>, <em>Hostel</em>, <em>Stationery</em>, <em>Tiffin</em>, or <em>Laundry</em>.
        </div>
      `;
      searchResults.style.display = 'block';
      return;
    }

    const itemsHtml = hits.slice(0, 8).map(h => `
      <a href="${h.url}" class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-light); text-decoration: none; transition: background 0.15s ease;">
        <div style="min-width: 0;">
          <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-accent);">${h.type}</div>
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${h.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${h.sub}</div>
        </div>
        <span class="status-badge status-verified" style="flex-shrink: 0; margin-left: 0.5rem;">${h.badge}</span>
      </a>
    `).join('');

    searchResults.innerHTML = `
      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); overflow: hidden; margin-top: 0.5rem;">
        ${itemsHtml}
        ${hits.length > 8 ? `<div style="padding: 0.5rem; text-align: center; font-size: 0.8rem; background-color: var(--bg-muted); color: var(--text-subtle);">Showing 8 of ${hits.length} matches</div>` : ''}
      </div>
    `;
    searchResults.style.display = 'block';
  }
}

/* ==========================================================================
   5. Report Correction Modal
   ========================================================================== */
function initReportModal() {
  const modal = document.getElementById('reportModal');
  const closeBtn = document.getElementById('closeReportModal');
  const cancelBtn = document.getElementById('cancelReportBtn');
  const form = document.getElementById('reportCorrectionForm');

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('open', 'show', 'active');
    modal.style.display = 'none';
  };
  window.closeReportModal = closeModal;

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your correction report has been logged for community review.');
      form.reset();
      closeModal();
    });
  }

  // Bind all report trigger buttons across the site
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.trigger-report-btn');
    if (trigger) {
      const targetName = trigger.getAttribute('data-target') || 'General Listing';
      const input = document.getElementById('reportListingName');
      if (input) input.value = targetName;
      modal.classList.add('open');
      modal.style.display = 'flex';
    }
  });

  // Global Escape Key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (modal.classList.contains('open') || modal.style.display === 'flex')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. Toast Utilities
   ========================================================================== */
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

window.escapeHtml = escapeHtml;
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

/* ==========================================================================
   7. Progressive Web App (PWA) & Offline Handlers (Phase 6)
   ========================================================================== */
let deferredPrompt = null;

function initPWA() {
  // 1. Register Service Worker
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }

  // 2. Capture Install Prompt Event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showPWAInstallPrompt();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hidePWAInstallPrompt();
    showToast('🎉 GEC Sheikhpura Hub installed successfully!');
  });
}

function showPWAInstallPrompt() {
  const dismissedTime = localStorage.getItem('gec_pwa_dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000) {
    return; // Dismissed within 7 days
  }

  if (document.getElementById('pwaInstallBanner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwaInstallBanner';
  banner.className = 'pwa-install-banner';
  banner.innerHTML = `
    <div class="pwa-install-content">
      <div class="pwa-install-icon">
        <img src="assets/images/icons/icon-192.png" alt="GEC Hub" width="40" height="40" style="border-radius: 8px;">
      </div>
      <div class="pwa-install-text">
        <div class="pwa-install-title">Install GEC Sheikhpura Hub</div>
        <div class="pwa-install-sub">Instant access to nearby maps, room rentals &amp; offline emergency guide</div>
      </div>
    </div>
    <div class="pwa-install-actions">
      <button type="button" class="btn btn-primary btn-sm" id="btnInstallPwa">Install App</button>
      <button type="button" class="btn-pwa-dismiss" id="btnDismissPwa" aria-label="Dismiss install prompt">✕</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('btnInstallPwa').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice outcome:', outcome);
    deferredPrompt = null;
    hidePWAInstallPrompt();
  });

  document.getElementById('btnDismissPwa').addEventListener('click', () => {
    localStorage.setItem('gec_pwa_dismissed', Date.now().toString());
    hidePWAInstallPrompt();
  });
}

function hidePWAInstallPrompt() {
  const banner = document.getElementById('pwaInstallBanner');
  if (banner) {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(100%)';
    banner.style.transition = 'all 0.3s ease';
    setTimeout(() => banner.remove(), 300);
  }
}

function initOnlineOfflineStatus() {
  window.addEventListener('online', () => {
    showToast('🟢 Internet connection restored. Live features active.');
  });

  window.addEventListener('offline', () => {
    showToast('📡 You are offline. Cached contacts & saved items remain available.');
  });
}

/* ==========================================================================
   Phase 11: Progressive Mobile Bottom Navigation Bar (Quick-Access Mobile App Bar)
   ========================================================================== */
function initMobileBottomNav() {
  if (document.querySelector('.mobile-bottom-nav')) return;

  const currentPath = window.location.pathname.toLowerCase();
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  const navItems = [
    {
      page: 'home',
      href: 'index.html',
      match: ['index.html', '', 'about.html'],
      label: 'Home',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
    },
    {
      page: 'explore',
      href: 'explore-nearby.html',
      match: ['explore-nearby.html', 'rooms-pg.html', 'food-tiffin.html', 'transport.html', 'emergency.html', 'marketplace.html', 'submit-listing.html'],
      label: 'Explore',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`
    },
    {
      page: 'community',
      href: 'community.html',
      match: ['community.html', 'lost-found.html', 'campus-directory.html', 'official-directory.html'],
      label: 'Community',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    },
    {
      page: 'academics',
      href: 'academics.html',
      match: ['academics.html', 'college-info.html', 'admissions.html', 'placement.html', 'student-tools.html', 'notices.html'],
      label: 'Academics',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
    },
    {
      page: 'saved',
      href: 'saved-items.html',
      match: ['saved-items.html', 'dashboard.html', 'login.html', 'contact.html', 'admin.html'],
      label: 'Saved Hub',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`
    }
  ];

  const bottomNav = document.createElement('nav');
  bottomNav.className = 'mobile-bottom-nav';
  bottomNav.setAttribute('aria-label', 'Mobile Quick Navigation');

  bottomNav.innerHTML = navItems.map(item => {
    const isActive = item.match.includes(currentFile);
    return `
      <a href="${item.href}" class="mobile-bottom-item ${isActive ? 'active' : ''}" ${isActive ? 'aria-current="page"' : ''}>
        ${item.icon}
        <span>${item.label}</span>
      </a>
    `;
  }).join('');

  document.body.appendChild(bottomNav);
}

/* ==========================================================================
   Phase 11: Dynamic Campus Broadcast & Emergency Banner
   ========================================================================== */
async function initCampusBroadcastBanner() {
  if (!window.DB || typeof window.DB.getCampusBroadcastAlert !== 'function') return;
  try {
    const alert = await window.DB.getCampusBroadcastAlert();
    const existing = document.getElementById('globalCampusBroadcastBanner');
    if (!alert || !alert.active || !alert.message) {
      if (existing) existing.remove();
      return;
    }

    const dismissKey = 'gec_broadcast_dismissed_' + encodeURIComponent(alert.message);
    if (sessionStorage.getItem(dismissKey) === 'true') {
      if (existing) existing.remove();
      return;
    }

    let banner = existing;
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'globalCampusBroadcastBanner';
      const disclaimer = document.querySelector('.disclaimer-topbar');
      const header = document.querySelector('.site-header');
      if (disclaimer && disclaimer.parentNode) {
        disclaimer.parentNode.insertBefore(banner, disclaimer.nextSibling);
      } else if (header && header.parentNode) {
        header.parentNode.insertBefore(banner, header);
      } else {
        document.body.insertBefore(banner, document.body.firstChild);
      }
    }

    const priority = alert.priority || alert.level || 'info';
    const priorityClass = priority === 'danger' ? 'broadcast-danger' : (priority === 'warning' ? 'broadcast-warning' : 'broadcast-info');
    const icon = priority === 'danger' ? '🚨' : (priority === 'warning' ? '⚠️' : '📢');
    const linkUrl = alert.linkUrl || alert.link;
    const linkText = alert.linkText || alert.link_label || 'View Details →';

    banner.className = `campus-broadcast-banner ${priorityClass}`;
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    banner.innerHTML = `
      <div class="broadcast-inner">
        <span class="broadcast-badge">${icon} CAMPUS ALERT</span>
        <span class="broadcast-text">${alert.message}</span>
        ${linkUrl ? `<a href="${linkUrl}" class="broadcast-action-btn" target="${linkUrl.startsWith('http') ? '_blank' : '_self'}" rel="noopener">${linkText}</a>` : ''}
        <button type="button" class="broadcast-close-btn" aria-label="Dismiss banner" onclick="sessionStorage.setItem('${dismissKey}', 'true'); this.closest('#globalCampusBroadcastBanner').remove();">&times;</button>
      </div>
    `;
  } catch (err) {
    console.warn('Campus broadcast banner error:', err);
  }
}



