/**
 * GEC Sheikhpura Student Life Hub - Student Community, Events & Campus Life (Phase 7)
 * Features:
 * - College Events Directory with IST dates, search, and category filters
 * - Event Registration & Participation with duplicate prevention and capacity limits
 * - Non-academic Student Clubs & Societies Directory with Suggest a Club workflow
 * - Sports & Recreation Listings (matches, sparring, team recruitment)
 * - Campus-Life Announcements Board with automatic expiry filtering
 * - Strict Platform Separation: routes all academic queries to Apna College Bihar
 */

document.addEventListener('DOMContentLoaded', () => {
  // Purge any legacy demo sports/clubs/events from browser storage
  const keys = ['gec_sports_activities', 'gec_student_clubs', 'gec_community_events', 'gec_community_announcements'];
  const mockKeywords = [
    'weekend friendly', 'evening doubles', 'volleyball team', 'blitz chess', 
    'aarohan', 'natraj', 'shaurya', 'floodlight sparring', 'lost casio', 'casio fx'
  ];
  keys.forEach(k => {
    try {
      const val = localStorage.getItem(k);
      if (val) {
        const lower = val.toLowerCase();
        if (mockKeywords.some(mk => lower.includes(mk))) {
          localStorage.setItem(k, JSON.stringify([]));
        }
      }
    } catch(e) {}
  });

  initCommunityPage();
});

let currentActiveTab = 'eventsTab';

function formatActivityType(type) {
  if (!type) return 'Friendly Match';
  const clean = String(type).toLowerCase().replace(/-/g, '_').trim();
  const map = {
    practice_session: 'Practice Session',
    practice: 'Practice Session',
    team_recruitment: 'Team Recruitment',
    recruitment: 'Team Recruitment',
    trials: 'Team Recruitment',
    match: 'Friendly Match',
    friendly_match: 'Friendly Match',
    casual: 'Community Casual',
    tournament: 'Campus Tournament'
  };
  return map[clean] || clean.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatSportCategory(sport) {
  if (!sport) return 'Sports';
  const clean = String(sport).toLowerCase().replace(/-/g, '_').trim();
  const map = {
    cricket: 'Cricket',
    badminton: 'Badminton',
    volleyball: 'Volleyball',
    football: 'Football',
    chess: 'Chess & Indoor',
    chess_indoor: 'Chess & Indoor',
    indoor: 'Chess & Indoor',
    table_tennis: 'Table Tennis',
    athletics: 'Athletics & Track',
    kabaddi: 'Kabaddi'
  };
  return map[clean] || clean.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatAnnouncementCategory(cat, label) {
  const clean = String(cat || label || '').toLowerCase().replace(/-/g, '_').trim();
  const map = {
    lost_found: 'Lost & Found',
    cultural: 'Cultural Notice',
    cultural_audition: 'Cultural Audition',
    sports: 'Sports Update',
    sports_update: 'Sports Update',
    club_recruitment: 'Club Recruitment',
    reminder: 'Event Reminder',
    general: 'Campus Notice'
  };
  return map[clean] || clean.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function initCommunityPage() {
  initCommunityTabs();
  bindEventFilters();
  bindClubFilters();
  bindSportsFilters();
  bindAnnouncementFilters();
  bindModalForms();

  // Load active tab data (handles direct URL jumps like ?tab=clubs or ?tab=sports)
  if (currentActiveTab === 'eventsTab') await loadEventsSection();
  else if (currentActiveTab === 'clubsTab') await loadClubsSection();
  else if (currentActiveTab === 'sportsTab') await loadSportsSection();
  else if (currentActiveTab === 'announcementsTab') await loadAnnouncementsSection();

  // Also fetch events count for tab badge if not on events tab
  if (currentActiveTab !== 'eventsTab') {
    try {
      const { totalCount } = await window.DB.getEvents({ page: 1, limit: 1 });
      const badge = document.getElementById('eventsCountBadge');
      if (badge) badge.textContent = totalCount;
    } catch(e) {}
  }
}

/* ==========================================================================
   1. Community Tabs Switching
   ========================================================================== */
function activateCommunityTab(targetId, updateUrl = true) {
  const tabs = document.querySelectorAll('[data-community-tab]');
  const panels = document.querySelectorAll('.community-tab-panel');

  const matchingTab = Array.from(tabs).find(t => t.getAttribute('data-community-tab') === targetId);
  if (!matchingTab) return;

  tabs.forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  panels.forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  matchingTab.classList.add('active');
  matchingTab.setAttribute('aria-selected', 'true');
  const targetPanel = document.getElementById(targetId);
  if (targetPanel) {
    targetPanel.classList.add('active');
    targetPanel.style.display = 'block';
    currentActiveTab = targetId;

    if (updateUrl) {
      const tabParam = targetId.replace('Tab', '');
      const newUrl = window.location.pathname + '?tab=' + tabParam;
      try {
        window.history.pushState({ tab: tabParam }, '', newUrl);
      } catch(e) {}
    }

    // Lazy load corresponding tab data
    if (targetId === 'eventsTab') loadEventsSection();
    else if (targetId === 'clubsTab') loadClubsSection();
    else if (targetId === 'sportsTab') loadSportsSection();
    else if (targetId === 'announcementsTab') loadAnnouncementsSection();
  }
}

function initCommunityTabs() {
  const tabs = document.querySelectorAll('[data-community-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-community-tab');
      activateCommunityTab(targetId, true);
    });
  });

  // Check URL query param or hash for default tab (handles ?tab=clubs, ?tab-clubs, #clubs)
  const rawSearch = (window.location.search || '').toLowerCase();
  const rawHash = (window.location.hash || '').toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  let tabParam = urlParams.get('tab');

  if (!tabParam) {
    if (rawSearch.includes('clubs') || rawHash.includes('clubs')) tabParam = 'clubs';
    else if (rawSearch.includes('sports') || rawHash.includes('sports')) tabParam = 'sports';
    else if (rawSearch.includes('announcements') || rawHash.includes('announcements')) tabParam = 'announcements';
    else if (rawSearch.includes('events') || rawHash.includes('events')) tabParam = 'events';
  }

  if (tabParam) {
    activateCommunityTab(tabParam.replace('Tab', '') + 'Tab', false);
  }

  // Support browser Back/Forward navigation
  window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const popTab = params.get('tab') || (e.state && e.state.tab) || 'events';
    activateCommunityTab(popTab.replace('Tab', '') + 'Tab', false);
  });
}

/* ==========================================================================
   2. College Events Directory
   ========================================================================== */
async function loadEventsSection() {
  const container = document.getElementById('eventsGrid');
  const countBadge = document.getElementById('eventsCountBadge');
  const searchInput = document.getElementById('eventSearchInput');
  const catFilter = document.getElementById('eventCategoryFilter');
  const upcomingFilter = document.getElementById('eventUpcomingFilter');

  if (!container) return;

  const query = searchInput ? searchInput.value.trim() : '';
  const category = catFilter ? catFilter.value : 'all';
  const upcomingOnly = upcomingFilter ? upcomingFilter.checked : false;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
      <div style="font-size: 1.1rem; font-weight: 600;">Loading campus events...</div>
    </div>
  `;

  try {
    const { data, totalCount } = await window.DB.getEvents({
      category,
      upcomingOnly,
      query,
      page: 1,
      limit: 12
    });

    if (countBadge) {
      countBadge.textContent = totalCount;
    }

    if (data.length === 0) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1; padding: 3rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎪</div>
          <h3 class="state-title">No events match your criteria</h3>
          <p class="state-desc">Try clearing your filters or submit a new student event for campus review.</p>
          <button class="btn btn-secondary btn-sm" onclick="resetEventFilters()" style="margin-top: 0.75rem;">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = data.map(event => {
      const isPast = new Date(event.startTime).getTime() < Date.now();
      const isFull = event.capacity && (event.registeredCount || 0) >= event.capacity;
      const formattedDate = formatISTDate(event.startTime);

      return `
        <article class="directory-card event-card ${event.status === 'cancelled' ? 'event-cancelled' : ''}" id="card-${event.id}">
          <div class="directory-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span class="directory-category" style="display: inline-flex; align-items: center; gap: 0.3rem;">
                ${event.icon || '🎪'} ${escapeHtml(event.categoryLabel || event.category)}
              </span>
              <span class="status-badge ${event.isVerified ? 'status-verified' : 'status-sample'}">
                ${event.isVerified ? '🛡️ Council Verified' : '👥 Student Organized'}
              </span>
            </div>

            <h3 class="directory-name" style="margin-bottom: 0.35rem; font-size: 1.05rem;">
              ${escapeHtml(event.title)}
            </h3>

            <p style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.75rem;">
              ${escapeHtml(event.shortDescription)}
            </p>

            <!-- Event Metadata -->
            <div style="background-color: var(--bg-muted); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--text-main); font-weight: 600;">
                <span>📅</span>
                <span>${formattedDate}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--text-muted);">
                <span>📍</span>
                <span>${escapeHtml(event.venue)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--text-muted);">
                <span>👤</span>
                <span>Org: ${escapeHtml(event.organizerName)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem; pt: 0.25rem; border-top: 1px dashed var(--border-light);">
                <span style="font-size: 0.75rem; color: var(--text-subtle);">
                  👥 Capacity: ${event.capacity ? `${event.registeredCount || 0} / ${event.capacity}` : `${event.registeredCount || 0} registered`}
                </span>
                <span style="font-size: 0.75rem; font-weight: 700; color: ${event.entryFee > 0 ? 'var(--color-accent)' : 'var(--color-success)'};">
                  ${event.entryFee > 0 ? `₹${event.entryFee} Entry` : 'Free Entry'}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              ${isPast ? `
                <button type="button" class="btn btn-secondary btn-sm" disabled style="flex: 1;">
                  Event Completed
                </button>
              ` : (isFull ? `
                <button type="button" class="btn btn-secondary btn-sm" disabled style="flex: 1; color: var(--color-danger);">
                  Capacity Full
                </button>
              ` : `
                <button type="button" class="btn btn-primary btn-sm" onclick="openEventRegisterModal('${event.id}')" style="flex: 1;">
                  Register / Attend ↗
                </button>
              `)}
              <button type="button" class="btn btn-secondary btn-sm" onclick="openEventDetailsModal('${event.id}')">
                Details
              </button>
              <button type="button" class="btn btn-secondary btn-sm trigger-report-btn" data-target="${escapeHtml(event.title)}" title="Report inaccurate event info" style="padding: 0.35rem 0.55rem;">
                ⚠️
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    container.innerHTML = `
      <div class="state-container" style="grid-column: 1 / -1;">
        <h3 class="state-title">Unable to Load Events</h3>
        <p class="state-desc">${escapeHtml(err.message || 'Please check your connection')}</p>
        <button class="btn btn-secondary btn-sm" onclick="loadEventsSection()">Retry</button>
      </div>
    `;
  }
}

function bindEventFilters() {
  const searchInput = document.getElementById('eventSearchInput');
  const catFilter = document.getElementById('eventCategoryFilter');
  const upcomingFilter = document.getElementById('eventUpcomingFilter');

  if (searchInput) searchInput.addEventListener('input', debounce(() => loadEventsSection(), 300));
  if (catFilter) catFilter.addEventListener('change', () => loadEventsSection());
  if (upcomingFilter) upcomingFilter.addEventListener('change', () => loadEventsSection());
}

window.resetEventFilters = function() {
  const s = document.getElementById('eventSearchInput');
  const c = document.getElementById('eventCategoryFilter');
  const u = document.getElementById('eventUpcomingFilter');
  if (s) s.value = '';
  if (c) c.value = 'all';
  if (u) u.checked = false;
  loadEventsSection();
};

/* ==========================================================================
   3. Clubs & Societies Directory
   ========================================================================== */
async function loadClubsSection() {
  const container = document.getElementById('clubsGrid');
  const catFilter = document.getElementById('clubCategoryFilter');
  const searchInput = document.getElementById('clubSearchInput');

  if (!container) return;

  const category = catFilter ? catFilter.value : 'all';
  const query = searchInput ? searchInput.value.trim() : '';

  const { data } = await window.DB.getClubs({ category, query });

  if (data.length === 0) {
    container.innerHTML = `
      <div class="state-container" style="grid-column: 1 / -1; padding: 3rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎭</div>
        <h3 class="state-title">No clubs found in this category</h3>
        <p class="state-desc">Suggest a new student interest club or student society for GEC Sheikhpura.</p>
        <button class="btn btn-primary btn-sm" onclick="openSuggestClubModal()" style="margin-top: 0.75rem;">
          + Suggest a Club
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(club => {
    const activitiesPills = club.activities && club.activities.length
      ? club.activities.map(a => `<span class="room-amenity" style="font-size: 0.725rem;">${escapeHtml(a)}</span>`).join('')
      : '';

    return `
      <article class="directory-card club-card" id="${club.id}">
        <div class="directory-content">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="font-size: 1.5rem;">${club.icon || '🎭'}</span>
              <span class="directory-category">${escapeHtml(club.categoryLabel)}</span>
            </div>
            <span class="status-badge ${club.verificationStatus === 'verified_council' ? 'status-verified' : 'status-sample'}">
              ${club.verificationStatus === 'verified_council' ? '🛡️ Council Verified' : '👥 Student Group'}
            </span>
          </div>

          <h3 class="directory-name" style="margin-bottom: 0.35rem; font-size: 1.1rem;">
            ${escapeHtml(club.name)}
          </h3>

          <p style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 0.75rem;">
            ${escapeHtml(club.description)}
          </p>

          ${activitiesPills ? `<div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.85rem;">${activitiesPills}</div>` : ''}

          <!-- Schedule & Venue Details -->
          <div style="background-color: var(--bg-muted); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem;">
            <div><strong>📍 Meeting Venue:</strong> ${escapeHtml(club.meetingLocation || 'Campus Quadrangle')}</div>
            <div><strong>⏰ Schedule:</strong> ${escapeHtml(club.meetingSchedule || 'Weekly sessions')}</div>
            ${club.contactEmail ? `<div><strong>✉️ Contact:</strong> <a href="mailto:${club.contactEmail}">${escapeHtml(club.contactEmail)}</a></div>` : ''}
            ${club.contactSocial ? `<div><strong>📱 Social:</strong> <span style="font-family: var(--font-mono);">${escapeHtml(club.contactSocial)}</span></div>` : ''}
          </div>

          <div style="font-size: 0.775rem; color: var(--text-subtle); margin-bottom: 0.85rem; line-height: 1.4;">
            ℹ️ <strong>How to join:</strong> ${escapeHtml(club.membershipInstructions)}
          </div>

          <div style="display: flex; gap: 0.4rem;">
            <a href="mailto:${club.contactEmail || 'cultural.gecskp@gmail.com'}?subject=Inquiry%20to%20Join%20${encodeURIComponent(club.name)}" class="btn btn-secondary btn-sm" style="flex: 1; text-align: center;">
              ✉️ Message Club
            </a>
            <button type="button" class="btn btn-secondary btn-sm trigger-report-btn" data-target="${escapeHtml(club.name)}" style="padding: 0.35rem 0.6rem;">
              ⚠️
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function bindClubFilters() {
  const cat = document.getElementById('clubCategoryFilter');
  const s = document.getElementById('clubSearchInput');
  if (cat) cat.addEventListener('change', () => loadClubsSection());
  if (s) s.addEventListener('input', debounce(() => loadClubsSection(), 300));
}

/* ==========================================================================
   4. Sports & Recreation Activities
   ========================================================================== */
async function loadSportsSection() {
  const container = document.getElementById('sportsGrid');
  const sportFilter = document.getElementById('sportsCategoryFilter');
  const typeFilter = document.getElementById('sportsTypeFilter');

  if (!container) return;

  const sport = sportFilter ? sportFilter.value : 'all';
  const activityType = typeFilter ? typeFilter.value : 'all';

  const { data } = await window.DB.getSportsActivities({ sport, activityType });

  if (data.length === 0) {
    container.innerHTML = `
      <div class="state-container" style="grid-column: 1 / -1; padding: 3rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚽</div>
        <h3 class="state-title">No sports matches or activities posted</h3>
        <p class="state-desc">Host a friendly match or recruit players for evening badminton/cricket sparring.</p>
        <button class="btn btn-primary btn-sm" onclick="openHostSportsModal()" style="margin-top: 0.75rem;">
          + Post Sports Match
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(item => `
    <article class="directory-card sports-card" id="${item.id}">
      <div class="directory-content">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <span class="directory-category" style="font-size: 0.75rem;">
            🏅 ${escapeHtml(formatSportCategory(item.sportCategory || item.sportLabel))} • ${escapeHtml(formatActivityType(item.activityType))}
          </span>
          <span class="status-badge ${item.verificationStatus === 'verified' ? 'status-verified' : 'status-sample'}">
            ${item.verificationStatus === 'verified' ? '🛡️ Scheduled Meet' : '👥 Community Casual'}
          </span>
        </div>

        <h3 class="directory-name" style="margin-bottom: 0.35rem; font-size: 1.05rem;">
          ${escapeHtml(item.title)}
        </h3>

        <p style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.75rem;">
          ${escapeHtml(item.description)}
        </p>

        <div style="background-color: var(--bg-muted); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <div><strong>📍 Venue:</strong> ${escapeHtml(item.venue)}</div>
          <div><strong>⏰ Time:</strong> ${formatISTDate(item.scheduleTime)}</div>
          <div><strong>👤 Organizer:</strong> ${escapeHtml(item.organizerName)} (${escapeHtml(item.contactInfo || 'Campus Ground')})</div>
          <div style="display: flex; justify-content: space-between; margin-top: 0.2rem; pt: 0.25rem; border-top: 1px dashed var(--border-light);">
            <span>Squad: <strong>${item.currentPlayers} / ${item.requiredPlayers} players</strong></span>
            <span style="color: var(--color-success); font-weight: 700;">Open for Players</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.4rem;">
          <button type="button" class="btn btn-primary btn-sm" onclick="joinSportsActivity('${item.id}', '${escapeHtml(item.title)}')" style="flex: 1;">
            ⚽ Join Squad / Play
          </button>
          <button type="button" class="btn btn-secondary btn-sm trigger-report-btn" data-target="${escapeHtml(item.title)}" style="padding: 0.35rem 0.6rem;">
            ⚠️
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function bindSportsFilters() {
  const sport = document.getElementById('sportsCategoryFilter');
  const type = document.getElementById('sportsTypeFilter');
  if (sport) sport.addEventListener('change', () => loadSportsSection());
  if (type) type.addEventListener('change', () => loadSportsSection());
}

window.joinSportsActivity = function(id, title) {
  showToast(`Joined squad for "${title}". Meet the team at the specified venue!`);
};

/* ==========================================================================
   5. Campus-Life Announcements Board (Auto-Expiry Filtering)
   ========================================================================== */
async function loadAnnouncementsSection() {
  const container = document.getElementById('announcementsGrid');
  const catFilter = document.getElementById('announcementCategoryFilter');

  if (!container) return;

  const category = catFilter ? catFilter.value : 'all';
  const { data } = await window.DB.getCommunityAnnouncements({ category, activeOnly: true });

  if (data.length === 0) {
    container.innerHTML = `
      <div class="state-container" style="grid-column: 1 / -1; padding: 3rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📢</div>
        <h3 class="state-title">No active community announcements</h3>
        <p class="state-desc">Expired notices are automatically hidden from the feed.</p>
        <button class="btn btn-primary btn-sm" onclick="openPostAnnouncementModal()" style="margin-top: 0.75rem;">
          + Post Announcement
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(item => {
    const expireDate = new Date(item.expiresAt);
    const daysRemaining = Math.max(0, Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return `
      <article class="directory-card announcement-card" id="${item.id}">
        <div class="directory-content">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.45rem;">
            <span class="directory-category" style="font-size: 0.75rem;">
              📢 ${escapeHtml(formatAnnouncementCategory(item.category, item.categoryLabel))}
            </span>
            <span style="font-size: 0.725rem; font-family: var(--font-mono); color: var(--text-subtle);">
              ⏳ Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}
            </span>
          </div>

          <h3 class="directory-name" style="margin-bottom: 0.35rem; font-size: 1.05rem;">
            ${escapeHtml(item.title)}
          </h3>

          <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.5; margin-bottom: 0.75rem;">
            ${escapeHtml(item.description)}
          </p>

          <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; pt: 0.5rem; border-top: 1px solid var(--border-light);">
            <span>Posted by: <strong>${escapeHtml(item.submitterName)}</strong></span>
            <span>${escapeHtml(item.contactInfo || 'On Campus')}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function bindAnnouncementFilters() {
  const cat = document.getElementById('announcementCategoryFilter');
  if (cat) cat.addEventListener('change', () => loadAnnouncementsSection());
}

/* ==========================================================================
   6. Event Registration Flow & Modals
   ========================================================================== */
window.openEventRegisterModal = async function(eventId) {
  const event = await window.DB.getEventById(eventId);
  if (!event) return;

  const modal = document.getElementById('eventRegisterModal');
  const titleEl = document.getElementById('registerEventTitle');
  const venueEl = document.getElementById('registerEventVenue');
  const timeEl = document.getElementById('registerEventTime');
  const inputEventId = document.getElementById('registerEventId');

  if (titleEl) titleEl.textContent = event.title;
  if (venueEl) venueEl.textContent = '📍 ' + event.venue;
  if (timeEl) timeEl.textContent = '📅 ' + formatISTDate(event.startTime);
  if (inputEventId) inputEventId.value = event.id;

  // Auto-fill student profile if authenticated
  const user = await window.DB.getStudentSession();
  const nameInput = document.getElementById('regAttendeeName');
  const branchInput = document.getElementById('regAttendeeBranch');
  const emailInput = document.getElementById('regAttendeeEmail');

  if (user) {
    if (nameInput) nameInput.value = user.display_name || '';
    if (branchInput) branchInput.value = user.branch || 'CSE';
    if (emailInput) emailInput.value = user.email || '';
  }

  if (modal) modal.classList.add('open');
};

window.closeEventRegisterModal = function() {
  const modal = document.getElementById('eventRegisterModal');
  if (modal) modal.classList.remove('open');
};

window.openEventDetailsModal = async function(eventId) {
  const event = await window.DB.getEventById(eventId);
  if (!event) return;

  const modal = document.getElementById('eventDetailModal');
  const title = document.getElementById('detailEventTitle');
  const body = document.getElementById('detailEventBody');

  if (title) title.textContent = event.title;
  if (body) {
    body.innerHTML = `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
        <span class="directory-category">${escapeHtml(event.categoryLabel || event.category)}</span>
        <span class="status-badge ${event.isVerified ? 'status-verified' : 'status-sample'}">
          ${event.isVerified ? '🛡️ Verified Event' : '👥 Community Notice'}
        </span>
      </div>
      <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); margin-bottom: 1rem;">
        ${escapeHtml(event.fullDescription || event.shortDescription)}
      </p>
      <div style="background-color: var(--bg-muted); padding: 0.85rem; border-radius: var(--radius-sm); font-size: 0.85rem; line-height: 1.5; display: flex; flex-direction: column; gap: 0.35rem;">
        <div><strong>📅 Schedule:</strong> ${formatISTDate(event.startTime)} ${event.endTime ? 'to ' + formatISTDate(event.endTime) : ''}</div>
        <div><strong>📍 Venue:</strong> ${escapeHtml(event.venue)}</div>
        <div><strong>👤 Organizer:</strong> ${escapeHtml(event.organizerName)} (${escapeHtml(event.organizerContact || 'In-person')})</div>
        <div><strong>🎟️ Entry Fee:</strong> ${event.entryFee > 0 ? `₹${event.entryFee}` : 'Free for all students'}</div>
        <div><strong>👥 Capacity:</strong> ${event.capacity ? `${event.registeredCount || 0} / ${event.capacity} seats registered` : 'Open walk-in'}</div>
      </div>
      <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
        ⚠️ <strong>Non-Academic Policy:</strong> This is a campus recreation/cultural event. All study notes, BEU exams, and syllabus belong exclusively to <a href="https://www.apnacollegebihar.online/" target="_blank" rel="noopener noreferrer" style="color: var(--color-accent); font-weight: 700;">Apna College Bihar</a>.
      </div>
    `;
  }

  if (modal) modal.classList.add('open');
};

window.closeEventDetailModal = function() {
  const modal = document.getElementById('eventDetailModal');
  if (modal) modal.classList.remove('open');
};

/* ==========================================================================
   7. Form Submissions (Event, Club, Announcement)
   ========================================================================== */
function bindModalForms() {
  // 1. Event Registration Form
  const regForm = document.getElementById('eventRegistrationForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const eventId = document.getElementById('registerEventId').value;
      const name = document.getElementById('regAttendeeName').value.trim();
      const branch = document.getElementById('regAttendeeBranch').value;
      const batch = document.getElementById('regAttendeeBatch').value;
      const email = document.getElementById('regAttendeeEmail').value.trim();

      const res = await window.DB.registerForEvent(eventId, { name, branch, batch, email });
      if (res.success) {
        showToast('🎉 Successfully registered for the event! Check your dashboard.');
        closeEventRegisterModal();
        await loadEventsSection();
      } else {
        alert(res.error || 'Failed to register.');
      }
    });
  }

  // 2. Submit Event Form
  const eventForm = document.getElementById('submitEventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('evtTitle').value.trim();
      const category = document.getElementById('evtCategory').value;
      const startTime = document.getElementById('evtStartTime').value;
      const venue = document.getElementById('evtVenue').value.trim();
      const organizerName = document.getElementById('evtOrganizer').value.trim();
      const shortDescription = document.getElementById('evtDescription').value.trim();
      const capacity = document.getElementById('evtCapacity').value;
      const entryFee = document.getElementById('evtFee').value;

      const res = await window.DB.submitEvent({
        title,
        category,
        startTime,
        venue,
        organizerName,
        shortDescription,
        capacity,
        entryFee
      });

      if (res.success) {
        showToast('✅ Event submitted for admin review!');
        closeSubmitEventModal();
        eventForm.reset();
        await loadEventsSection();
      } else {
        alert(res.error || 'Failed to submit event.');
      }
    });
  }

  // 3. Suggest Club Form
  const clubForm = document.getElementById('suggestClubForm');
  if (clubForm) {
    clubForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('clubName').value.trim();
      const category = document.getElementById('clubCategory').value;
      const description = document.getElementById('clubDescription').value.trim();
      const activities = document.getElementById('clubActivities').value.trim();
      const meetingLocation = document.getElementById('clubVenue').value.trim();

      const res = await window.DB.submitClubSuggestion({
        name,
        category,
        description,
        activities,
        meetingLocation
      });

      if (res.success) {
        showToast('✨ Club suggestion submitted for review!');
        closeSuggestClubModal();
        clubForm.reset();
        await loadClubsSection();
      } else {
        alert(res.error || 'Failed to submit club proposal.');
      }
    });
  }

  // 4. Post Announcement Form
  const annForm = document.getElementById('postAnnouncementForm');
  if (annForm) {
    annForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('annTitle').value.trim();
      const category = document.getElementById('annCategory').value;
      const description = document.getElementById('annDescription').value.trim();
      const submitterName = document.getElementById('annSubmitter').value.trim();
      const durationDays = document.getElementById('annDuration').value;

      const res = await window.DB.submitCommunityAnnouncement({
        title,
        category,
        description,
        submitterName,
        durationDays
      });

      if (res.success) {
        showToast('📢 Community announcement posted to live feed!');
        closePostAnnouncementModal();
        annForm.reset();
        await loadAnnouncementsSection();
      } else {
        alert(res.error || 'Failed to post announcement.');
      }
    });
  }
  // 5. Host Sports Match Form
  const sportsForm = document.getElementById('hostSportsForm');
  if (sportsForm) {
    sportsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('sportsTitle').value.trim();
      const sportCategory = document.getElementById('sportsCategorySelect').value;
      const activityType = document.getElementById('sportsActivityTypeSelect').value;
      const venue = document.getElementById('sportsVenue').value.trim();
      const scheduleTime = document.getElementById('sportsScheduleTime').value;
      const requiredPlayers = document.getElementById('sportsRequiredPlayers').value;
      const currentPlayers = document.getElementById('sportsCurrentPlayers').value;
      const organizerName = document.getElementById('sportsOrganizerName').value.trim();
      const contactInfo = document.getElementById('sportsContactInfo').value.trim();
      const description = document.getElementById('sportsDescription').value.trim();

      const res = await window.DB.submitSportsActivity({
        title,
        sportCategory,
        activityType,
        venue,
        scheduleTime,
        requiredPlayers,
        currentPlayers,
        organizerName,
        contactInfo,
        description
      });

      if (res.success) {
        showToast('⚽ Sports activity published! Players can now view and join your squad.');
        closeHostSportsModal();
        sportsForm.reset();
        await loadSportsSection();
      } else {
        alert(res.error || 'Failed to submit sports activity.');
      }
    });
  }
}

// Modal open/close helpers
window.openSubmitEventModal = function() {
  const m = document.getElementById('submitEventModal');
  if (m) {
    m.classList.add('open');
    m.style.display = 'flex';
  }
};
window.closeSubmitEventModal = function() {
  const m = document.getElementById('submitEventModal');
  if (m) {
    m.classList.remove('open');
    m.style.display = 'none';
  }
};

window.openSuggestClubModal = function() {
  const m = document.getElementById('suggestClubModal');
  if (m) {
    m.classList.add('open');
    m.style.display = 'flex';
  }
};
window.closeSuggestClubModal = function() {
  const m = document.getElementById('suggestClubModal');
  if (m) {
    m.classList.remove('open');
    m.style.display = 'none';
  }
};

window.openPostAnnouncementModal = function() {
  const m = document.getElementById('postAnnouncementModal');
  if (m) {
    m.classList.add('open');
    m.style.display = 'flex';
  }
};
window.closePostAnnouncementModal = function() {
  const m = document.getElementById('postAnnouncementModal');
  if (m) {
    m.classList.remove('open');
    m.style.display = 'none';
  }
};

window.openHostSportsModal = function() {
  const m = document.getElementById('hostSportsModal');
  if (m) {
    m.classList.add('open');
    m.style.display = 'flex';
  }
};
window.closeHostSportsModal = function() {
  const m = document.getElementById('hostSportsModal');
  if (m) {
    m.classList.remove('open');
    m.style.display = 'none';
  }
};

function formatISTDate(dateStr) {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' IST';
  } catch (e) {
    return dateStr;
  }
}

function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
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

