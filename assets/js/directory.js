/**
 * GEC Sheikhpura Student Life Hub - Dynamic Directory Controller (Phase 4)
 * Connects to Supabase Database via HubDatabaseService with asynchronous
 * loading, filter queries, reviews & ratings modal, reporting disputes,
 * verified badge details, and offline safety.
 */

document.addEventListener('DOMContentLoaded', () => {
  ensurePhase4Modals();
  initShopsDirectory();
  initRoomsDirectory();
  initFoodDirectory();
});

/* ==========================================================================
   1. Explore Nearby (Local Shops & Market Directory)
   ========================================================================== */
function initShopsDirectory() {
  const container = document.getElementById('shopsGrid');
  const catFilter = document.getElementById('shopCategoryFilter');
  const sortFilter = document.getElementById('shopSortFilter');
  const searchInput = document.getElementById('shopSearchInput');
  const countEl = document.getElementById('shopCountBadge');

  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const highlightId = urlParams.get('highlight');

  async function filterAndRender() {
    const selectedCat = catFilter ? catFilter.value : 'all';
    const sortBy = sortFilter ? sortFilter.value : 'distance';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Loading verified directory...</div>
        <div style="font-size: 0.85rem;">Querying database listings</div>
      </div>
    `;

    try {
      const { data, totalCount, isLive } = await window.DB.getBusinesses({ category: selectedCat, query });

      let list = [...data];
      if (sortBy === 'distance') {
        list.sort((a, b) => a.distanceKm - b.distanceKm);
      } else if (sortBy === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
      }

      await renderShops(list, isLive);
    } catch (err) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <h3 class="state-title">Error Loading Directory</h3>
          <p class="state-desc">${escapeHtml(err.message || 'Unable to connect to service')}</p>
          <button class="btn btn-secondary" onclick="initShopsDirectory()">Retry</button>
        </div>
      `;
    }
  }

  async function renderShops(list, isLive = false) {
    if (countEl) {
      countEl.innerHTML = `
        <span>${list.length} local services</span>
        <span class="status-badge ${isLive ? 'status-verified' : 'status-sample'}" style="margin-left: 0.5rem;">
          ${isLive ? '● Live Supabase' : '○ Verified Store'}
        </span>
      `;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <h3 class="state-title">No matching local businesses</h3>
          <p class="state-desc">Try clearing your filters or list your local shop in Sheikhpura.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
            <button class="btn btn-secondary" onclick="document.getElementById('shopCategoryFilter').value='all'; document.getElementById('shopSearchInput').value=''; filterAndRender();">Reset Filters</button>
            <a href="submit-listing.html" class="btn btn-primary">+ List Your Business</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(shop => {
      const bookmarked = isBookmarked('shops', shop.id);
      const isHighlighted = highlightId === shop.id;
      const verifiedLabel = shop.verified ? 'Phone & Identity Verified' : 'Listing Submitted';

      return `
        <article class="directory-card ${isHighlighted ? 'highlighted-border' : ''}" id="${shop.id}">
          <div class="directory-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
              <span class="directory-category">${shop.categoryLabel || 'Local Store'}</span>
              <span class="status-badge ${shop.verified ? 'status-verified' : 'status-sample'}" title="Verification Status">
                🛡️ ${verifiedLabel}
              </span>
            </div>
            <h3 class="directory-title">${escapeHtml(shop.name)}</h3>
            
            <div class="directory-address">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${escapeHtml(shop.address)}</span>
            </div>

            <div class="directory-distance-box">
              <div>
                <strong>${shop.distanceKm} km</strong> road distance
                <div style="font-size: 0.75rem; color: var(--text-subtle);">${shop.estTime}</div>
              </div>
              <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-primary-800);">${shop.priceTier}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.8125rem;">
              <span style="color: var(--text-muted);"><strong>Hours:</strong> ${shop.hours}</span>
              <button type="button" class="listing-review-pill" onclick="openListingReviewsModal('shops', '${shop.id}', '${escapeHtml(shop.name)}')" title="View student reviews & ratings">
                ⭐ Reviews &amp; Ratings
              </button>
            </div>

            <div class="directory-tags">
              ${(shop.services || []).map(s => `<span class="directory-tag">${escapeHtml(s)}</span>`).join('')}
            </div>

            <div class="directory-actions">
              <a href="${shop.gmapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                Directions
              </a>
              <a href="tel:${shop.phone}" class="btn btn-primary btn-sm">
                Call: ${shop.phone}
              </a>
              <button type="button" class="btn btn-secondary btn-sm" onclick="openListingReportModal('business', '${shop.id}', '${escapeHtml(shop.name)}')" title="Report incorrect info">
                Report
              </button>
              <button type="button" class="btn-bookmark ${bookmarked ? 'bookmarked' : ''}" onclick="handleShopBookmark('${shop.id}')" title="Save to My Hub">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="${bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  window.handleShopBookmark = function(id) {
    const item = HUB_DATA.shops.find(x => x.id === id);
    if (!item) return;
    toggleBookmark('shops', item);
    filterAndRender();
  };

  if (catFilter) catFilter.addEventListener('change', filterAndRender);
  if (sortFilter) sortFilter.addEventListener('change', filterAndRender);
  if (searchInput) searchInput.addEventListener('input', filterAndRender);

  filterAndRender();
}

/* ==========================================================================
   2. Rooms, PG & Accommodations Directory
   ========================================================================== */
function initRoomsDirectory() {
  const container = document.getElementById('roomsGrid');
  const genderFilter = document.getElementById('roomGenderFilter');
  const budgetFilter = document.getElementById('roomBudgetFilter');
  const searchInput = document.getElementById('roomSearchInput');
  const countEl = document.getElementById('roomCountBadge');

  if (!container) return;

  async function filterAndRender() {
    const gender = genderFilter ? genderFilter.value : 'all';
    const maxBudget = budgetFilter ? parseInt(budgetFilter.value, 10) : 10000;
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <div style="font-weight: 600; margin-bottom: 0.25rem;">Fetching available housing...</div>
      </div>
    `;

    try {
      const { data, totalCount, isLive } = await window.DB.getAccommodations({ gender, maxRent: maxBudget, query });
      renderRooms(data, isLive);
    } catch (err) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <h3 class="state-title">Error Loading Accommodations</h3>
          <p class="state-desc">${escapeHtml(err.message)}</p>
        </div>
      `;
    }
  }

  function renderRooms(list, isLive = false) {
    if (countEl) {
      countEl.innerHTML = `
        <span>${list.length} accommodations available</span>
        <span class="status-badge ${isLive ? 'status-verified' : 'status-sample'}" style="margin-left: 0.5rem;">
          ${isLive ? '● Live Supabase' : '○ Verified Housing'}
        </span>
      `;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <h3 class="state-title">No rooms match your filter criteria</h3>
          <p class="state-desc">Try increasing your budget range or list your student accommodation.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
            <button class="btn btn-secondary" onclick="document.getElementById('roomBudgetFilter').value='10000'; document.getElementById('roomGenderFilter').value='all'; filterAndRender();">Reset Filters</button>
            <a href="submit-listing.html" class="btn btn-primary">+ List Your Room</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(room => {
      const bookmarked = isBookmarked('rooms', room.id);

      return `
        <article class="directory-card" id="${room.id}">
          <div class="directory-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span class="status-badge ${room.gender === 'Girls' ? 'status-urgent' : 'status-verified'}">${room.gender} Student Living</span>
              <div style="text-align: right;">
                <span style="font-size: 1.35rem; font-weight: 800; color: var(--color-primary-800);">₹${room.rent}</span>
                <span style="font-size: 0.75rem; color: var(--text-subtle);">/month</span>
              </div>
            </div>

            <h3 class="directory-title">${escapeHtml(room.title)}</h3>

            <div class="directory-address">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${escapeHtml(room.address)}</span>
            </div>

            <div class="directory-distance-box">
              <span><strong>${room.roadDistance}</strong></span>
              <span>Deposit: <strong>₹${room.deposit}</strong></span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; margin-bottom: 0.75rem; color: var(--text-muted);">
              <span><strong>Electricity:</strong> ${room.electricity}</span>
              <button type="button" class="listing-review-pill" onclick="openListingReviewsModal('rooms', '${room.id}', '${escapeHtml(room.title)}')">
                ⭐ Student Reviews
              </button>
            </div>

            <div class="directory-tags">
              ${(room.amenities || []).map(a => `<span class="directory-tag">${escapeHtml(a)}</span>`).join('')}
            </div>

            <div style="background-color: var(--bg-muted); padding: 0.5rem 0.75rem; border-radius: var(--radius-xs); font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
              <strong>Note:</strong> ${escapeHtml(room.sampleNote || 'Safe student accommodation')}
            </div>

            <div class="directory-actions" style="flex-wrap: wrap;">
              <button type="button" class="btn btn-secondary btn-sm trigger-visit-btn" data-room-id="${room.id}" data-room-title="${escapeHtml(room.title)}">
                📅 Request Visit
              </button>
              <a href="tel:${room.phone}" class="btn btn-primary btn-sm">
                Call Owner
              </a>
              <button type="button" class="btn btn-secondary btn-sm" onclick="openListingReportModal('accommodation', '${room.id}', '${escapeHtml(room.title)}')" title="Report listing">
                Report
              </button>
              <button type="button" class="btn-bookmark ${bookmarked ? 'bookmarked' : ''}" onclick="handleRoomBookmark('${room.id}')" title="Save to My Hub">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="${bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Rebind visit request buttons
    document.querySelectorAll('.trigger-visit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-room-id');
        const title = btn.getAttribute('data-room-title');
        const modal = document.getElementById('visitModal');
        if (modal) {
          document.getElementById('visitRoomId').value = id;
          document.getElementById('visitRoomTitle').value = title;
          modal.classList.add('active');
        }
      });
    });
  }

  window.handleRoomBookmark = function(id) {
    const item = HUB_DATA.rooms.find(x => x.id === id);
    if (!item) return;
    toggleBookmark('rooms', item);
    filterAndRender();
  };

  if (genderFilter) genderFilter.addEventListener('change', filterAndRender);
  if (budgetFilter) budgetFilter.addEventListener('change', filterAndRender);
  if (searchInput) searchInput.addEventListener('input', filterAndRender);

  filterAndRender();
}

/* ==========================================================================
   3. Food, Mess & Tiffin Directory
   ========================================================================== */
function initFoodDirectory() {
  const container = document.getElementById('foodGrid');
  const typeFilter = document.getElementById('foodTypeFilter');
  const countEl = document.getElementById('foodCountBadge');

  if (!container) return;

  async function filterAndRender() {
    const selectedType = typeFilter ? typeFilter.value : 'all';

    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
        Fetching meal plans &amp; tiffin services...
      </div>
    `;

    try {
      const { data, totalCount, isLive } = await window.DB.getFoodServices({ type: selectedType });
      renderFood(data, isLive);
    } catch (err) {
      container.innerHTML = `<div class="state-container" style="grid-column: 1 / -1;"><p>${escapeHtml(err.message)}</p></div>`;
    }
  }

  function renderFood(list, isLive = false) {
    if (countEl) {
      countEl.innerHTML = `
        <span>${list.length} food options</span>
        <span class="status-badge ${isLive ? 'status-verified' : 'status-sample'}" style="margin-left: 0.5rem;">
          ${isLive ? '● Live Supabase' : '○ Verified Store'}
        </span>
      `;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🍱</div>
          <h3 class="state-title">No Food &amp; Tiffin Services Listed Yet</h3>
          <p class="state-desc">Verified mess providers and tiffin services near Bajidpur campus will appear here once registered.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
            <a href="submit-listing.html" class="btn btn-primary">+ Register Mess / Tiffin Service</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => `
      <article class="directory-card" id="${item.id}">
        <div class="directory-content">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <span class="directory-category">${item.type}</span>
            <span class="status-badge status-verified">${item.diet}</span>
          </div>
          <h3 class="directory-title">${escapeHtml(item.name)}</h3>

          <div class="directory-address">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${escapeHtml(item.address)}</span>
          </div>

          <div class="directory-distance-box">
            <span>Monthly: <strong>₹${item.pricePerMonth}</strong></span>
            <span>Single Meal: <strong>₹${item.singleMealPrice}</strong></span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.8125rem;">
            <span style="color: var(--text-muted);"><strong>Timings:</strong> ${item.timings}</span>
            <button type="button" class="listing-review-pill" onclick="openListingReviewsModal('food', '${item.id}', '${escapeHtml(item.name)}')">
              ⭐ Student Reviews
            </button>
          </div>

          <div style="background-color: var(--bg-muted); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.8125rem; color: var(--text-main); margin-bottom: 0.75rem;">
            <strong>Menu Details:</strong> ${escapeHtml(item.menuSample)}
          </div>

          <div style="font-size: 0.75rem; color: var(--color-success); font-weight: 600; margin-bottom: 1rem;">
            ✓ ${item.trialAvailable}
          </div>

          <div class="directory-actions">
            <a href="tel:${item.phone}" class="btn btn-primary btn-sm">Call: ${item.phone}</a>
            <button type="button" class="btn btn-secondary btn-sm" onclick="openListingReportModal('food', '${item.id}', '${escapeHtml(item.name)}')">Report</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  if (typeFilter) typeFilter.addEventListener('change', filterAndRender);
  filterAndRender();
}

/* ==========================================================================
   4. Phase 4: Shared Reviews Modal & Workflow
   ========================================================================== */
let activeReviewListing = null;
let currentRatingSelection = 5;

window.openListingReviewsModal = async function(type, id, title) {
  activeReviewListing = { type, id, title };
  const modal = document.getElementById('listingReviewsModal');
  const titleEl = document.getElementById('reviewModalTitle');
  const container = document.getElementById('reviewsListContainer');
  const summaryEl = document.getElementById('reviewsSummaryHeader');
  if (!modal) return;

  titleEl.textContent = `Reviews & Ratings — ${title}`;
  container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading verified reviews...</div>`;

  modal.classList.add('active');

  const { reviews, totalCount, averageRating, starsBreakdown } = await window.DB.getListingReviews(type, id);

  // Render Rating Summary
  summaryEl.innerHTML = `
    <div class="rating-summary-container">
      <div style="text-align: center;">
        <div class="rating-big-score">${averageRating > 0 ? averageRating : '—'}</div>
        <div style="color: #f59e0b; font-size: 1.1rem; margin: 0.25rem 0;">
          ${averageRating > 0 ? '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating)) : '☆☆☆☆☆'}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${totalCount} verified opinions</div>
      </div>
      <div>
        ${[5, 4, 3, 2, 1].map(star => {
          const count = starsBreakdown[star] || 0;
          const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          return `
            <div class="rating-bar-row">
              <span style="width: 45px;">${star} star</span>
              <div class="rating-bar-track">
                <div class="rating-bar-fill" style="width: ${pct}%;"></div>
              </div>
              <span style="width: 25px; text-align: right;">${count}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div style="font-size: 0.775rem; color: var(--text-subtle); margin-bottom: 1rem; border-left: 3px solid var(--color-accent); padding-left: 0.5rem;">
      <strong>Transparency Notice:</strong> Ratings and reviews are submitted by GEC students and visitors. They represent individual experiences and do not constitute official college endorsements.
    </div>
  `;

  // Render Reviews List
  if (reviews.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; background: var(--bg-muted); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.875rem;">
        No reviews submitted yet for this listing. Be the first student to share your genuine experience!
      </div>
    `;
  } else {
    container.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-author">${escapeHtml(r.reviewer_name)}</span>
          <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        </div>
        <div class="review-date">${new Date(r.created_at).toLocaleDateString()}</div>
        <p class="review-body">${escapeHtml(r.review_text)}</p>
        <div style="display: flex; justify-content: flex-end; margin-top: 0.35rem;">
          <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;" onclick="reportReviewPrompt('${r.id}')" title="Report abusive or fake review">
            🚩 Flag Review
          </button>
        </div>
      </div>
    `).join('');
  }

  // Check student sign in state for writing review
  const sessionUser = await window.DB.getStudentSession();
  const formBox = document.getElementById('writeReviewSection');
  if (sessionUser) {
    formBox.innerHTML = `
      <div style="border-top: 1px solid var(--border-light); padding-top: 1rem; margin-top: 1.5rem;">
        <h4 style="font-size: 1rem; margin-bottom: 0.5rem;">Write Your Review as ${escapeHtml(sessionUser.display_name)}</h4>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label class="form-label">Your Rating (1 to 5 Stars)</label>
          <div class="star-rating-select" id="starSelector">
            <span onclick="setReviewRating(1)">★</span>
            <span onclick="setReviewRating(2)">★</span>
            <span onclick="setReviewRating(3)">★</span>
            <span onclick="setReviewRating(4)">★</span>
            <span onclick="setReviewRating(5)">★</span>
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <label class="form-label" for="userReviewInput">Your Honest Experience / Tips for Batchmates *</label>
          <textarea id="userReviewInput" class="form-control" rows="3" placeholder="Share details about prices, owner attitude, room hygiene, wifi speed, food quality..." required></textarea>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="btnSubmitReview" onclick="submitUserReview()">
          Publish Review
        </button>
      </div>
    `;
    setReviewRating(5);
  } else {
    formBox.innerHTML = `
      <div style="border-top: 1px solid var(--border-light); padding: 1rem 0 0; margin-top: 1.5rem; text-align: center;">
        <span style="font-size: 0.875rem; color: var(--text-muted);">Have you used this service or visited this accommodation?</span>
        <div style="margin-top: 0.5rem;">
          <a href="login.html" class="btn btn-secondary btn-sm">Sign In to Post a Student Review</a>
        </div>
      </div>
    `;
  }
};

window.setReviewRating = function(rating) {
  currentRatingSelection = rating;
  const stars = document.querySelectorAll('#starSelector span');
  stars.forEach((s, idx) => {
    s.classList.toggle('active', idx < rating);
  });
};

window.submitUserReview = async function() {
  if (!activeReviewListing) return;
  const text = document.getElementById('userReviewInput').value.trim();
  const btn = document.getElementById('btnSubmitReview');
  if (text.length < 5) {
    alert("Please write at least 5 characters for your review.");
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const res = await window.DB.submitListingReview({
    listing_type: activeReviewListing.type,
    listing_id: activeReviewListing.id,
    listing_title: activeReviewListing.title,
    rating: currentRatingSelection,
    review_text: text
  });

  btn.disabled = false;
  btn.textContent = 'Publish Review';

  if (!res.success) {
    alert(res.error || "Could not save review.");
  } else {
    showToast("Thank you! Your review has been published.");
    openListingReviewsModal(activeReviewListing.type, activeReviewListing.id, activeReviewListing.title);
  }
};

window.reportReviewPrompt = async function(reviewId) {
  const reason = prompt("Why are you reporting this review? (e.g. offensive language, fake review, spam)");
  if (!reason) return;
  await window.DB.reportReview(reviewId, reason);
  showToast("Review reported to moderation team. Thank you for keeping the hub clean.");
};

window.closeListingReviewsModal = function() {
  const modal = document.getElementById('listingReviewsModal');
  if (modal) modal.classList.remove('active');
  activeReviewListing = null;
};

/* ==========================================================================
   5. Phase 4: Shared Listing Report & Dispute Modal
   ========================================================================== */
let activeReportTarget = null;

window.openListingReportModal = function(type, id, title) {
  activeReportTarget = { type, id, title };
  const modal = document.getElementById('listingReportModal');
  if (!modal) return;

  document.getElementById('reportTargetTitle').value = title;
  document.getElementById('reportIssueCategory').value = 'wrong_phone';
  document.getElementById('reportIssueDesc').value = '';
  modal.classList.add('active');
};

window.closeListingReportModal = function() {
  const modal = document.getElementById('listingReportModal');
  if (modal) modal.classList.remove('active');
  activeReportTarget = null;
};

window.handleListingReportSubmit = async function(e) {
  e.preventDefault();
  if (!activeReportTarget) return;

  const issueType = document.getElementById('reportIssueCategory').value;
  const desc = document.getElementById('reportIssueDesc').value.trim();
  const reporterName = document.getElementById('reporterDisplayName') ? document.getElementById('reporterDisplayName').value.trim() : '';

  const res = await window.DB.submitListingReport({
    listing_type: activeReportTarget.type,
    listing_id: activeReportTarget.id,
    listing_title: activeReportTarget.title,
    issue_type: issueType,
    description: desc,
    reporter_name: reporterName || 'Concerned Student'
  });

  if (!res.success) {
    alert(res.error || "Unable to submit report.");
  } else {
    showToast("Report submitted successfully. Our campus moderators will investigate.");
    closeListingReportModal();
  }
};

/* ==========================================================================
   6. Shared Modals Injection Helper (Runs across all directory pages)
   ========================================================================== */
function ensurePhase4Modals() {
  // 1. Reviews Modal
  if (!document.getElementById('listingReviewsModal')) {
    const revModal = document.createElement('div');
    revModal.id = 'listingReviewsModal';
    revModal.className = 'modal-overlay';
    revModal.setAttribute('role', 'dialog');
    revModal.setAttribute('aria-modal', 'true');
    revModal.innerHTML = `
      <div class="modal-dialog" style="max-width: 580px;">
        <div class="modal-header">
          <h3 class="modal-title" id="reviewModalTitle">Reviews &amp; Ratings</h3>
          <button type="button" class="modal-close-btn" onclick="closeListingReviewsModal()">✕</button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
          <div id="reviewsSummaryHeader"></div>
          <div id="reviewsListContainer"></div>
          <div id="writeReviewSection"></div>
        </div>
      </div>
    `;
    document.body.appendChild(revModal);
  }

  // 2. Report Dispute Modal with all 10 Phase 4 categories
  if (!document.getElementById('listingReportModal')) {
    const repModal = document.createElement('div');
    repModal.id = 'listingReportModal';
    repModal.className = 'modal-overlay';
    repModal.setAttribute('role', 'dialog');
    repModal.setAttribute('aria-modal', 'true');
    repModal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Report Listing or Inaccurate Info</h3>
          <button type="button" class="modal-close-btn" onclick="closeListingReportModal()">✕</button>
        </div>
        <form onsubmit="handleListingReportSubmit(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Listing Name</label>
              <input type="text" id="reportTargetTitle" class="form-control" readonly>
            </div>
            <div class="form-group">
              <label class="form-label" for="reportIssueCategory">What is the issue with this listing? *</label>
              <select id="reportIssueCategory" class="form-control" required>
                <option value="wrong_phone">Wrong or Disconnected Phone Number</option>
                <option value="incorrect_address">Incorrect Public Address / Location</option>
                <option value="price_discrepancy">Price Discrepancy (Demanding more money than listed)</option>
                <option value="room_unavailable">Room / PG is Full or No Longer Available</option>
                <option value="business_closed">Shop / Service Has Permanently Closed</option>
                <option value="duplicate_listing">Duplicate Listing on GEC Hub</option>
                <option value="misleading_photos">Misleading, Inaccurate or Fake Photos</option>
                <option value="suspected_fraud">Suspected Fraud / Advance Digital Money Scam</option>
                <option value="inappropriate_content">Inappropriate or Abusive Content</option>
                <option value="other">Other Dispute / Issue</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="reportIssueDesc">Describe the Issue in Detail *</label>
              <textarea id="reportIssueDesc" class="form-control" rows="3" placeholder="Explain what is wrong so our campus moderation team can verify..." required></textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="reporterDisplayName">Your Name / Batch (Optional)</label>
              <input type="text" id="reporterDisplayName" class="form-control" placeholder="e.g. Student (Civil 2024)">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" onclick="closeListingReportModal()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Submit Report</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(repModal);
  }
}
