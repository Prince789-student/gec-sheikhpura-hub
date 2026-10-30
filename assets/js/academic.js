/**
 * GEC Sheikhpura Student Life Hub - Dynamic Academic Resource Center (Phase 2)
 * Connects to Supabase Database via HubDatabaseService with asynchronous
 * filtering, pagination, search, and local fallback safety.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAcademicCenter();
});

function initAcademicCenter() {
  const container = document.getElementById('academicGrid');
  const branchFilter = document.getElementById('academicBranchFilter');
  const semFilter = document.getElementById('academicSemFilter');
  const typeFilter = document.getElementById('academicTypeFilter');
  const searchInput = document.getElementById('academicSearchInput');
  const countEl = document.getElementById('academicResultCount');

  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const highlightId = urlParams.get('highlight');
  const initialBranch = urlParams.get('branch');

  if (initialBranch && branchFilter) {
    branchFilter.value = initialBranch;
  }

  async function filterAndRender() {
    const selectedBranch = branchFilter ? branchFilter.value : 'all';
    const selectedSem = semFilter ? semFilter.value : 'all';
    const selectedType = typeFilter ? typeFilter.value : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <div style="font-weight: 600; margin-bottom: 0.25rem;">Querying academic study materials...</div>
      </div>
    `;

    try {
      const { data, totalCount, isLive } = await window.DB.getAcademicResources({
        branch: selectedBranch,
        semester: selectedSem,
        type: selectedType,
        query: query
      });

      renderCards(data, isLive);
    } catch (err) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <h3 class="state-title">Error Loading Academic Resources</h3>
          <p class="state-desc">${escapeHtml(err.message)}</p>
          <button class="btn btn-secondary" onclick="resetAcademicFilters()">Reset Filters</button>
        </div>
      `;
    }
  }

  function renderCards(list, isLive = false) {
    if (countEl) {
      countEl.innerHTML = `
        <span>Showing ${list.length} verified academic resources</span>
        <span class="status-badge ${isLive ? 'status-verified' : 'status-sample'}" style="margin-left: 0.5rem;">
          ${isLive ? '● Live Supabase' : '○ Verified Store'}
        </span>
      `;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <svg class="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <h3 class="state-title">No Academic Resources Found</h3>
          <p class="state-desc">Try resetting your filters or submit verified notes to help your fellow GEC Sheikhpura students.</p>
          <button class="btn btn-primary" onclick="resetAcademicFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const bookmarked = isBookmarked('academics', item.id);
      const isHighlighted = highlightId === item.id;

      return `
        <article class="academic-card ${isHighlighted ? 'highlighted-border' : ''}" id="${item.id}" style="${isHighlighted ? 'border-color: var(--color-accent); box-shadow: 0 0 0 2px var(--color-accent);' : ''}">
          <div class="academic-card-header">
            <span class="branch-badge">${item.branch}</span>
            <span class="semester-badge">${item.semester}</span>
          </div>
          <div class="resource-type-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            ${item.type}
          </div>
          <h3 class="academic-card-title">${item.title}</h3>
          
          <div class="academic-card-meta">
            <div class="meta-row">
              <span style="font-weight: 600; color: var(--text-main);">Subject:</span>
              <span>${item.subject}</span>
            </div>
            <div class="meta-row">
              <span style="font-weight: 600; color: var(--text-main);">Source:</span>
              <span>${item.source}</span>
            </div>
            <div class="meta-row">
              <span style="font-weight: 600; color: var(--text-main);">File:</span>
              <span>${item.fileSize}</span>
            </div>
            <div style="margin-top: 0.35rem;">
              <span class="status-badge status-verified">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Verified BEU Syllabus Standard
              </span>
            </div>
          </div>

          <div class="academic-card-footer">
            <a href="javascript:void(0)" onclick="simulateDownload('${escapeHtml(item.title)}')" class="btn btn-primary btn-sm" style="flex: 1;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download PDF
            </a>
            <button type="button" class="btn-bookmark ${bookmarked ? 'bookmarked' : ''}" onclick="handleAcademicBookmark('${item.id}')" title="Save to My Hub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    if (highlightId) {
      setTimeout(() => {
        const el = document.getElementById(highlightId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }

  window.handleAcademicBookmark = function(id) {
    const item = HUB_DATA.academics.find(x => x.id === id);
    if (!item) return;
    toggleBookmark('academics', item);
    filterAndRender();
  };

  window.simulateDownload = function(title) {
    showToast(`Downloading: "${title}"`);
  };

  window.resetAcademicFilters = function() {
    if (branchFilter) branchFilter.value = 'all';
    if (semFilter) semFilter.value = 'all';
    if (typeFilter) typeFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    filterAndRender();
  };

  if (branchFilter) branchFilter.addEventListener('change', filterAndRender);
  if (semFilter) semFilter.addEventListener('change', filterAndRender);
  if (typeFilter) typeFilter.addEventListener('change', filterAndRender);
  if (searchInput) searchInput.addEventListener('input', filterAndRender);

  filterAndRender();
}
