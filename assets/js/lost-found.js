/**
 * GEC Sheikhpura Student Life Hub - Phase 11
 * Lost & Found Module Controller
 * Handles reporting, searching, filtering, match suggestions, private claims,
 * ownership verification, flagging, and privacy redaction.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLostFoundPage();
});

let currentFilter = {
  type: 'all',
  category: 'all',
  status: 'all',
  query: '',
  page: 1,
  limit: 18
};

let activeTargetItemId = null;

async function initLostFoundPage() {
  // Parse URL search params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('type')) currentFilter.type = urlParams.get('type');
  if (urlParams.get('category')) currentFilter.category = urlParams.get('category');
  if (urlParams.get('status')) currentFilter.status = urlParams.get('status');
  if (urlParams.get('query')) currentFilter.query = urlParams.get('query');

  const highlightId = urlParams.get('highlight') || urlParams.get('item');

  // Setup search input listener
  const searchInput = document.getElementById('lfSearchInput');
  if (searchInput) {
    if (currentFilter.query) searchInput.value = currentFilter.query;
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilter.query = e.target.value.trim();
        currentFilter.page = 1;
        loadLostFoundItems();
      }, 250);
    });
  }

  // Setup category pill listeners
  const catPills = document.querySelectorAll('[data-lf-cat]');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter.category = pill.getAttribute('data-lf-cat');
      currentFilter.page = 1;
      loadLostFoundItems();
    });
  });

  // Setup type tab listeners
  const typeTabs = document.querySelectorAll('[data-lf-type]');
  typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      typeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter.type = tab.getAttribute('data-lf-type');
      currentFilter.page = 1;
      loadLostFoundItems();
    });
  });

  // Setup status filter dropdown
  const statusSelect = document.getElementById('lfStatusSelect');
  if (statusSelect) {
    if (currentFilter.status) statusSelect.value = currentFilter.status;
    statusSelect.addEventListener('change', (e) => {
      currentFilter.status = e.target.value;
      currentFilter.page = 1;
      loadLostFoundItems();
    });
  }

  // Bind modals
  setupLostFoundModals();

  // Load items
  await loadLostFoundItems(highlightId);
}

async function loadLostFoundItems(highlightId = null) {
  const grid = document.getElementById('lfItemsGrid');
  const emptyState = document.getElementById('lfEmptyState');
  const countStats = document.getElementById('lfCountStats');

  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
      <div class="loading-spinner" style="margin: 0 auto 1rem auto;"></div>
      <p>Loading Lost & Found items across campus...</p>
    </div>
  `;

  try {
    const res = await window.DB.getLostFoundItems(currentFilter);
    const items = res.data || [];
    const counts = res.counts || {};

    // Update stat numbers if elements exist
    const countLost = document.getElementById('statLfLost');
    const countFound = document.getElementById('statLfFound');
    const countPending = document.getElementById('statLfPending');
    const countReturned = document.getElementById('statLfReturned');

    if (countLost) countLost.textContent = counts.lost || 0;
    if (countFound) countFound.textContent = counts.found || 0;
    if (countPending) countPending.textContent = counts.claim_pending || 0;
    if (countReturned) countReturned.textContent = counts.returned || 0;

    if (countStats) {
      countStats.textContent = `Showing ${items.length} of ${res.totalCount} reports`;
    }

    if (items.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    // Check user session
    const currentUser = await window.DB.getStudentSession();
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator');

    grid.innerHTML = items.map(item => {
      const isHighlighted = highlightId && (item.id === highlightId);
      const isLost = item.type === 'lost';
      const statusBadge = getStatusBadge(item.status);
      const categoryLabel = getCategoryLabel(item.category);

      const canClaim = !isLost && (item.status === 'found' || item.status === 'claim_pending');
      const isOwner = currentUser && item.reporter_user_id === currentUser.id;
      const canReviewClaims = !isLost && (isOwner || isAdmin);

      // Safe date formatting
      const dateFormatted = item.item_date ? new Date(item.item_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : 'Recent';

      return `
        <article class="hub-card lf-card ${isHighlighted ? 'highlight-pulse' : ''}" id="card-${item.id}" style="${isHighlighted ? 'border: 2px solid var(--color-accent);' : ''}">
          <div class="lf-card-header">
            <span class="badge ${isLost ? 'badge-danger' : 'badge-success'}">${isLost ? '🚨 LOST' : '📦 FOUND'}</span>
            ${statusBadge}
          </div>

          <div class="lf-card-image-box">
            <img src="${item.image_url || 'assets/images/icons/icon-512.png'}" 
                 alt="${escapeHtml(item.title)}" 
                 loading="lazy"
                 onerror="this.src='assets/images/icons/icon-512.png'">
            <span class="lf-category-tag">${categoryLabel}</span>
          </div>

          <div class="lf-card-body">
            <h3 class="lf-card-title">${escapeHtml(item.title)}</h3>
            
            <div class="lf-card-meta">
              <span title="Date reported or missing">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${dateFormatted}
              </span>
              <span title="Campus Location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${escapeHtml(item.location_found_or_lost || 'GEC Sheikhpura Campus')}
              </span>
            </div>

            <p class="lf-card-desc">
              ${escapeHtml(item.description)}
            </p>

            ${item.is_sensitive_document ? `
              <div class="alert-subtle" style="font-size: 0.75rem; padding: 0.4rem 0.6rem; margin-bottom: 0.75rem; border-radius: 6px; background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
                🛡️ <strong>ID Privacy Protection:</strong> Roll/Registration numbers masked to prevent identity theft.
              </div>
            ` : ''}

            ${item.reporter_contact_private ? `
              <div style="font-size: 0.8rem; background: var(--surface-2); padding: 0.5rem; border-radius: 6px; margin-bottom: 0.75rem;">
                <strong>Reporter Contact:</strong> <code>${escapeHtml(item.reporter_contact_private)}</code>
              </div>
            ` : ''}
          </div>

          <div class="lf-card-actions">
            ${canClaim && item.status !== 'returned' ? `
              <button type="button" class="btn btn-primary btn-sm" onclick="openClaimModal('${item.id}')" style="flex: 1;">
                🔐 Claim This Item
              </button>
            ` : ''}

            ${canReviewClaims ? `
              <button type="button" class="btn btn-secondary btn-sm" onclick="openClaimsReviewModal('${item.id}')" style="flex: 1;">
                📋 Review Claims
              </button>
            ` : ''}

            <button type="button" class="btn btn-ghost btn-sm" onclick="openMatchesModal('${item.id}')" title="Find Potential Matches">
              🔍 Match
            </button>

            <button type="button" class="btn btn-ghost btn-sm text-danger" onclick="openFlagModal('${item.id}')" title="Report Inappropriate/Suspicious">
              🚩
            </button>
          </div>
        </article>
      `;
    }).join('');

    // If highlight requested, scroll smoothly to target
    if (highlightId) {
      setTimeout(() => {
        const el = document.getElementById(`card-${highlightId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }

  } catch (err) {
    console.error('Failed to load Lost & Found items:', err);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-danger);">
        <p>Failed to load reports. Please check your connection.</p>
        <button class="btn btn-secondary btn-sm" onclick="loadLostFoundItems()">Retry</button>
      </div>
    `;
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'lost':
      return '<span class="status-badge" style="background:#ef4444; color:#fff;">Lost</span>';
    case 'found':
      return '<span class="status-badge" style="background:#10b981; color:#fff;">Found</span>';
    case 'claim_pending':
      return '<span class="status-badge" style="background:#8b5cf6; color:#fff;">Claim Under Review</span>';
    case 'returned':
      return '<span class="status-badge" style="background:#0284c7; color:#fff;">✅ Returned to Owner</span>';
    case 'archived':
      return '<span class="status-badge" style="background:#64748b; color:#fff;">Archived</span>';
    default:
      return `<span class="status-badge">${escapeHtml(status)}</span>`;
  }
}

function getCategoryLabel(category) {
  const map = {
    'electronics': '📱 Electronics & Gadgets',
    'id_documents': '🪪 ID Cards & Documents',
    'keys_locks': '🔑 Keys & Locks',
    'wallets_money': '👛 Wallets & Purses',
    'books_stationary': '📚 Books & Stationery',
    'clothing_accessories': '👕 Bags & Clothing',
    'other': '📦 Other Items'
  };
  return map[category] || '📦 General Item';
}

function setupLostFoundModals() {
  // Report Lost Form
  const lostForm = document.getElementById('reportLostForm');
  if (lostForm) {
    lostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = lostForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const data = {
        title: document.getElementById('lostTitle').value,
        category: document.getElementById('lostCategory').value,
        item_date: document.getElementById('lostDate').value,
        location_found_or_lost: document.getElementById('lostLocation').value,
        description: document.getElementById('lostDesc').value,
        image_url: document.getElementById('lostImage').value || '',
        reporter_contact_private: document.getElementById('lostContact').value
      };

      const res = await window.DB.reportLostItem(data);
      if (submitBtn) submitBtn.disabled = false;

      if (res.success) {
        closeModal('reportLostModal');
        lostForm.reset();
        showToast('Lost item reported successfully! We will alert you if any match is found.');

        if (res.matches && res.matches.length > 0) {
          showMatchSuggestionModal(res.item, res.matches);
        } else {
          loadLostFoundItems(res.item.id);
        }
      } else {
        alert(res.error || 'Failed to submit report.');
      }
    });
  }

  // Report Found Form
  const foundForm = document.getElementById('reportFoundForm');
  if (foundForm) {
    foundForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = foundForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const data = {
        title: document.getElementById('foundTitle').value,
        category: document.getElementById('foundCategory').value,
        item_date: document.getElementById('foundDate').value,
        location_found_or_lost: document.getElementById('foundLocation').value,
        description: document.getElementById('foundDesc').value,
        image_url: document.getElementById('foundImage').value || '',
        reporter_contact_private: document.getElementById('foundContact').value
      };

      const res = await window.DB.reportFoundItem(data);
      if (submitBtn) submitBtn.disabled = false;

      if (res.success) {
        closeModal('reportFoundModal');
        foundForm.reset();
        showToast('Found item reported! Thank you for helping the campus community.');

        if (res.matches && res.matches.length > 0) {
          showMatchSuggestionModal(res.item, res.matches);
        } else {
          loadLostFoundItems(res.item.id);
        }
      } else {
        alert(res.error || 'Failed to submit report.');
      }
    });
  }

  // Claim Form
  const claimForm = document.getElementById('claimItemForm');
  if (claimForm) {
    claimForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeTargetItemId) return;

      const submitBtn = claimForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const claimData = {
        proof_details: document.getElementById('claimProofDetails').value,
        claimant_contact_private: document.getElementById('claimContactPrivate').value
      };

      const res = await window.DB.submitLostFoundClaim(activeTargetItemId, claimData);
      if (submitBtn) submitBtn.disabled = false;

      if (res.success) {
        closeModal('claimItemModal');
        claimForm.reset();
        showToast('Ownership claim submitted privately. The finder or admin will review your proof.');
        loadLostFoundItems(activeTargetItemId);
      } else {
        alert(res.error || 'Failed to submit claim.');
      }
    });
  }

  // Flag Form
  const flagForm = document.getElementById('flagItemForm');
  if (flagForm) {
    flagForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeTargetItemId) return;

      const reason = document.getElementById('flagReason').value;
      const res = await window.DB.flagLostFoundItem(activeTargetItemId, reason);
      if (res.success) {
        closeModal('flagItemModal');
        flagForm.reset();
        showToast('Item reported for moderation review.');
        loadLostFoundItems();
      } else {
        alert(res.error || 'Failed to flag item.');
      }
    });
  }
}

// Global modal triggers
window.openReportLostModal = function() {
  const dateInput = document.getElementById('lostDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  openModal('reportLostModal');
};

window.openReportFoundModal = function() {
  const dateInput = document.getElementById('foundDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  openModal('reportFoundModal');
};

window.openClaimModal = function(itemId) {
  activeTargetItemId = itemId;
  openModal('claimItemModal');
};

window.openFlagModal = function(itemId) {
  activeTargetItemId = itemId;
  openModal('flagItemModal');
};

window.openClaimsReviewModal = async function(itemId) {
  activeTargetItemId = itemId;
  const container = document.getElementById('claimsReviewList');
  if (!container) return;

  container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner"></div> Loading claims...</div>';
  openModal('claimsReviewModal');

  const claims = await window.DB.getClaimsForItem(itemId);
  if (!claims || claims.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <p>No ownership claims have been submitted yet for this item.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = claims.map(c => `
    <div class="hub-card" style="margin-bottom: 1rem; border-left: 4px solid ${c.status === 'approved' ? '#10b981' : (c.status === 'rejected' ? '#ef4444' : '#8b5cf6')};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <strong>Claimant: ${escapeHtml(c.claimant_name || 'Student')}</strong>
        <span class="badge ${c.status === 'approved' ? 'badge-success' : (c.status === 'rejected' ? 'badge-danger' : 'badge-warning')}">
          ${c.status.toUpperCase()}
        </span>
      </div>

      <div style="font-size: 0.85rem; margin-bottom: 0.5rem; background: var(--surface-2); padding: 0.5rem; border-radius: 6px;">
        <strong>Private Verification Proof:</strong>
        <p style="margin: 0.25rem 0 0 0; white-space: pre-wrap;">${escapeHtml(c.proof_details)}</p>
      </div>

      <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        <span>Private Contact: <code>${escapeHtml(c.claimant_contact_private || 'Not provided')}</code></span> &bull; 
        <span>Submitted: ${new Date(c.created_at).toLocaleString('en-IN')}</span>
      </div>

      ${c.status === 'pending' ? `
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" class="btn btn-primary btn-sm" onclick="resolveClaim('${c.id}', 'approve')">
            ✅ Accept & Verify Ownership
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="resolveClaim('${c.id}', 'reject')">
            ❌ Decline (Insufficient Proof)
          </button>
        </div>
      ` : `
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          <em>Decision notes: ${escapeHtml(c.admin_notes || 'Processed')}</em>
        </div>
      `}
    </div>
  `).join('');
};

window.resolveClaim = async function(claimId, decision) {
  const notes = prompt(
    decision === 'approve'
      ? 'Enter verification note or safe handover instructions (e.g., Handed over at Security Desk Room 002):'
      : 'Enter reason for declining claim (e.g., Serial number did not match physical item):'
  );
  if (notes === null) return; // cancelled

  const res = await window.DB.processClaim(claimId, decision, notes);
  if (res.success) {
    showToast(decision === 'approve' ? 'Claim verified and item marked as RETURNED!' : 'Claim declined.');
    closeModal('claimsReviewModal');
    loadLostFoundItems(activeTargetItemId);
  } else {
    alert(res.error || 'Failed to update claim.');
  }
};

window.openMatchesModal = async function(itemId) {
  const item = await window.DB.getLostFoundItemById(itemId);
  if (!item) return;

  const matches = await window.DB.suggestMatches(item);
  showMatchSuggestionModal(item, matches);
};

function showMatchSuggestionModal(targetItem, matches) {
  const titleEl = document.getElementById('matchesModalTitle');
  const bodyEl = document.getElementById('matchesModalBody');
  if (!bodyEl) return;

  if (titleEl) {
    titleEl.textContent = `Potential Matches for: "${targetItem.title}"`;
  }

  if (!matches || matches.length === 0) {
    bodyEl.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <p>No high-confidence matches found in our current campus database.</p>
        <p style="font-size: 0.85rem;">Our automated engine checks category, title/description keywords, location, and dates. We will automatically notify you when a matching report is posted!</p>
      </div>
    `;
  } else {
    bodyEl.innerHTML = `
      <div style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--text-muted);">
        We found <strong>${matches.length} possible matching report(s)</strong> based on category, campus location, keywords, and dates:
      </div>
      ${matches.map(m => `
        <div class="hub-card" style="margin-bottom: 0.75rem; border-left: 4px solid var(--color-accent);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <strong style="font-size: 0.95rem;">${escapeHtml(m.item.title)}</strong>
            <span class="badge badge-success">${m.score}% Match</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            <span>${m.reasons.join(' &bull; ')}</span>
          </div>
          <p style="font-size: 0.85rem; margin-bottom: 0.5rem;">${escapeHtml(m.item.description)}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">📍 ${escapeHtml(m.item.location_found_or_lost)}</span>
            <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal('matchesModal'); loadLostFoundItems('${m.item.id}')">
              View Report &rarr;
            </button>
          </div>
        </div>
      `).join('')}
    `;
  }

  openModal('matchesModal');
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
