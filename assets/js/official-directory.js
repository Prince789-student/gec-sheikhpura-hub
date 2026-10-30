/**
 * GEC Sheikhpura Student Life Hub - Phase 12
 * Source-Synced Official Directory Controller
 * Displays approved pages, documents, notices, and portal disclosures
 * discovered from https://www.gecsheikhpura.ac.in/
 */

document.addEventListener('DOMContentLoaded', () => {
  initOfficialDirectoryPage();
});

let currentDirectoryFilter = {
  section: 'all',
  status: 'approved',
  contentType: 'all',
  query: '',
  page: 1,
  limit: 18
};

let activeTargetPage = null;

async function initOfficialDirectoryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('section')) currentDirectoryFilter.section = urlParams.get('section');
  if (urlParams.get('query')) currentDirectoryFilter.query = urlParams.get('query');

  // Search input listener
  const searchInput = document.getElementById('crawledSearchInput');
  if (searchInput) {
    if (currentDirectoryFilter.query) searchInput.value = currentDirectoryFilter.query;
    let timer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        currentDirectoryFilter.query = e.target.value.trim();
        currentDirectoryFilter.page = 1;
        loadOfficialDirectoryItems();
      }, 250);
    });
  }

  // Section chip listeners
  const chips = document.querySelectorAll('[data-sync-section]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentDirectoryFilter.section = chip.getAttribute('data-sync-section');
      currentDirectoryFilter.page = 1;
      loadOfficialDirectoryItems();
    });
  });

  // Content type selector
  const typeSelect = document.getElementById('crawledTypeSelect');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentDirectoryFilter.contentType = e.target.value;
      currentDirectoryFilter.page = 1;
      loadOfficialDirectoryItems();
    });
  }

  setupCorrectionForm();

  await loadOfficialDirectoryItems();
}

async function loadOfficialDirectoryItems() {
  const grid = document.getElementById('crawledPagesGrid');
  const emptyState = document.getElementById('crawledEmptyState');
  const countStats = document.getElementById('crawledCountStats');

  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
      <div class="loading-spinner" style="margin: 0 auto 1rem auto;"></div>
      <p>Loading source-synced official disclosures...</p>
    </div>
  `;

  try {
    const res = await window.DB.getCrawledPages(currentDirectoryFilter);
    const pages = res.data || [];
    const counts = res.counts || {};

    // Update hero stats if elements exist
    const statPages = document.getElementById('statSyncPages');
    const statNotices = document.getElementById('statSyncNotices');
    const statDocs = document.getElementById('statSyncDocs');

    if (statPages) statPages.textContent = counts.approved || 51;
    if (statNotices) statNotices.textContent = 10;
    if (statDocs) statDocs.textContent = counts.documents || 4;

    if (countStats) {
      countStats.textContent = `Showing ${pages.length} of ${res.totalCount} official disclosures`;
    }

    if (pages.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = pages.map(page => {
      const isRestricted = page.content_type === 'login_portal' || page.import_status === 'restricted';
      const sectionBadge = getSectionBadge(page.section);

      const isAcademic = page.section === 'faculty_departments' || page.source_url.includes('syllabus') || page.source_url.includes('academic-regulation');

      return `
        <article class="hub-card directory-card">
          <div class="directory-card-top">
            <div>
              <span class="badge ${sectionBadge.cls}">${sectionBadge.label}</span>
              ${isRestricted ? '<span class="badge badge-warning">🔒 Login Protected</span>' : ''}
              <h3 class="dir-name" style="margin-top: 0.5rem; font-size: 1.05rem;">${escapeHtml(page.page_title)}</h3>
              <div class="dir-designation" style="font-size: 0.8rem; color: var(--text-muted);">
                ${escapeHtml(page.subcategory || 'Official Page')}
              </div>
            </div>
            <div class="dir-icon-box">
              ${sectionBadge.icon}
            </div>
          </div>

          <div class="dir-details-list">
            <p style="font-size: 0.85rem; color: var(--text-color); line-height: 1.5; margin: 0 0 0.75rem 0;">
              ${escapeHtml(page.short_summary)}
            </p>

            ${isAcademic ? `
              <div class="alert-subtle" style="font-size: 0.775rem; background: rgba(59, 130, 246, 0.08); padding: 0.5rem; border-radius: 6px; margin-bottom: 0.5rem;">
                📚 <strong>Study Tools &amp; Notes:</strong> For complete question banks, syllabus guides, and preparation, visit <a href="https://www.apnacollegebihar.online/" target="_blank" rel="noopener" style="color: var(--color-accent); font-weight: 700;">Apna College Bihar ↗</a>.
              </div>
            ` : ''}

            <div style="font-size: 0.775rem; background: var(--surface-2); padding: 0.45rem 0.6rem; border-radius: 6px; word-break: break-all;">
              <span style="color: var(--text-muted);">Official Source:</span><br>
              <a href="${page.source_url}" target="_blank" rel="noopener" class="dir-contact-link" style="font-family: monospace;">
                ${escapeHtml(page.source_url)} ↗
              </a>
            </div>
          </div>

          <div class="directory-card-footer">
            <span style="font-size: 0.75rem; color: var(--text-muted);">
              Checked: ${new Date(page.last_checked_at).toLocaleDateString('en-IN')}
            </span>
            <div style="display: flex; gap: 0.35rem;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="openPreviewModal('${page.id}')">
                Preview
              </button>
              <a href="${page.source_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 4px;">
                Open Official ↗
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load official directory:', err);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-danger);">
        <p>Failed to load official disclosures. Please retry.</p>
        <button class="btn btn-secondary btn-sm" onclick="loadOfficialDirectoryItems()">Retry</button>
      </div>
    `;
  }
}

function getSectionBadge(section) {
  const map = {
    'college_overview': { label: '🏛️ Overview', cls: 'badge-primary', icon: '🏛️' },
    'administration': { label: '⚖️ Administration', cls: 'badge-danger', icon: '👨‍💼' },
    'faculty_departments': { label: '🎓 Department', cls: 'badge-info', icon: '🎓' },
    'training_placement': { label: '🤝 Placement', cls: 'badge-success', icon: '💼' },
    'facilities_services': { label: '🔬 Facilities', cls: 'badge-warning', icon: '🔬' },
    'activities_clubs': { label: '🚀 Activities', cls: 'badge-secondary', icon: '💡' },
    'affiliation_approvals': { label: '📜 Approvals', cls: 'badge-light', icon: '📜' },
    'public_notices': { label: '📢 Notices', cls: 'badge-danger', icon: '📢' },
    'public_documents': { label: '📄 Documents', cls: 'badge-info', icon: '📄' },
    'contact_directory': { label: '📞 Contact', cls: 'badge-secondary', icon: '📞' },
    'restricted_portal': { label: '🔒 Portal', cls: 'badge-warning', icon: '🔒' }
  };
  return map[section] || { label: '🌐 Disclosure', cls: 'badge-secondary', icon: '📄' };
}

window.openPreviewModal = async function(pageId) {
  const page = await window.DB.getCrawledPageById(pageId);
  if (!page) return;

  const titleEl = document.getElementById('previewModalTitle');
  const bodyEl = document.getElementById('previewModalBody');
  if (titleEl) titleEl.textContent = page.page_title;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="hub-card" style="margin-bottom: 1rem; background: var(--surface-2);">
        <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
          <strong>Section:</strong> ${escapeHtml(page.section)} &bull; <strong>Subcategory:</strong> ${escapeHtml(page.subcategory || 'General')}
        </div>
        <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
          <strong>Verification Status:</strong> <span class="badge badge-success">🛡️ Verified Source (gecsheikhpura.ac.in)</span>
        </div>
        <div style="font-size: 0.8rem; margin-bottom: 0.5rem;">
          <strong>Content SHA-256 Hash:</strong> <code>${escapeHtml(page.content_hash)}</code>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          <strong>Last Content Audit:</strong> ${new Date(page.last_checked_at).toLocaleString('en-IN')}
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Factual Executive Summary:</h4>
        <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-color);">${escapeHtml(page.short_summary)}</p>
      </div>

      <div style="margin-bottom: 1rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Public Text Extract (Snippet):</h4>
        <div style="font-size: 0.825rem; background: var(--surface-1); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); max-height: 200px; overflow-y: auto; line-height: 1.5; white-space: pre-wrap;">
          ${escapeHtml(page.extracted_text || 'No additional text snippet stored.')}
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <button type="button" class="btn btn-ghost btn-sm" onclick="openReportOutdatedModal('${page.id}', '${escapeHtml(page.page_title)}')">
          🚩 Report Broken / Outdated Link
        </button>
        <a href="${page.source_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
          Visit Original Official Page ↗
        </a>
      </div>
    `;
  }

  openModal('crawledDetailModal');
};

function setupCorrectionForm() {
  const form = document.getElementById('crawledCorrectionForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeTargetPage) return;

    const notes = document.getElementById('crawledCorrNotes').value;
    const contact = document.getElementById('crawledCorrContact').value;

    const res = await window.DB.submitDirectoryCorrection({
      directory_type: 'crawled_page',
      target_id: activeTargetPage.id,
      target_name: activeTargetPage.title,
      proposed_data: { notes },
      reason: notes,
      submitter_contact: contact
    });

    if (res.success) {
      closeModal('crawledCorrectionModal');
      form.reset();
      showToast('Thank you! Correction report sent to hub administrators.');
    } else {
      alert(res.error || 'Failed to submit report.');
    }
  });
}

window.openReportOutdatedModal = function(id, title) {
  activeTargetPage = { id, title };
  const label = document.getElementById('crawledCorrTargetLabel');
  if (label) label.textContent = `Target: "${title}"`;
  closeModal('crawledDetailModal');
  openModal('crawledCorrectionModal');
};

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
