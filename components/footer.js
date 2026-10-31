/**
 * GEC Sheikhpura Student Life Hub - Universal Footer Component Script
 * Auto-injects and manages the universal responsive footer across all pages.
 * Handles mobile expandable accordion sections and year synchronization.
 */

(function () {
  // 1. Ensure footer.css is linked
  function ensureFooterStyles() {
    if (!document.querySelector('link[href*="footer.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'components/footer.css';
      document.head.appendChild(link);
    }
  }

  // Universal Footer Template
  const FOOTER_TEMPLATE = `
  <div class="container">
    <!-- Academic Platform Partner Banner -->
    <div class="footer-partner-strip">
      <div>
        <div class="partner-title">
          <span>📚 Looking for Academic Resources, BEU Syllabus, or PYQs?</span>
        </div>
        <div class="partner-desc">
          Official study materials, B.Tech semester notes, lecture finder, and CGPA tools are hosted on Apna College Bihar.
        </div>
      </div>
      <a href="https://www.apnacollegebihar.online/" target="_blank" rel="noopener noreferrer" class="footer-partner-btn">
        Visit Apna College Bihar ↗
      </a>
    </div>

    <!-- Main Footer Grid -->
    <div class="footer-main-grid">
      <!-- 1. Brand Section -->
      <div class="footer-brand-col">
        <div class="footer-brand-header">
          <div class="footer-brand-crest" style="background: none; overflow: hidden;">
            <img src="assets/images/college_crest.jpg" alt="GEC Sheikhpura Logo" width="28" height="28" style="object-fit: contain; border-radius: 50%;">
          </div>
          <div>
            <div class="footer-brand-title">GEC Sheikhpura <span>Hub</span></div>
            <div style="font-size: 0.725rem; color: #64748b; font-weight: 600;">Student Life &amp; Local Services</div>
          </div>
        </div>

        <div class="footer-unofficial-badge">
          <span>🛡️ Independent Student Platform</span>
        </div>

        <p class="footer-brand-desc">
          A dedicated student-built life hub for Government Engineering College Sheikhpura. Helping students discover verified hostel rooms, tiffin services, campus clubs, and nearby essentials in Bajidpur.
        </p>

        <div class="footer-social-links">
          <a href="https://www.gecsheikhpura.ac.in/" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Official GEC Sheikhpura Website">
            🌐
          </a>
          <a href="https://www.apnacollegebihar.online/" target="_blank" rel="noopener noreferrer" class="footer-social-btn" title="Apna College Bihar Partner">
            📚
          </a>
          <a href="community.html" class="footer-social-btn" title="Campus Community Hub">
            👥
          </a>
          <a href="contact.html" class="footer-social-btn" title="Student Support Desk">
            ✉️
          </a>
        </div>
      </div>

      <!-- 2. Quick Links -->
      <div class="footer-col" data-footer-accordion>
        <div class="footer-col-header" tabindex="0" role="button" aria-expanded="false">
          <h4 class="footer-heading">Quick Links</h4>
          <span class="footer-accordion-toggle" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </div>
        <ul class="footer-links-list">
          <li><a href="index.html">🏠 Home Hub</a></li>
          <li><a href="about.html">🏛️ About This Project</a></li>
          <li><a href="college-info.html">ℹ️ College Information</a></li>
          <li><a href="admissions.html">🎓 Admissions &amp; Cutoffs</a></li>
          <li><a href="academics.html">📖 Academic Overview</a></li>
          <li><a href="campus-directory.html">👥 Faculty Directory</a></li>
          <li><a href="placement.html">💼 Training &amp; Placements</a></li>
          <li><a href="notices.html">📢 Campus &amp; BEU Notices</a></li>
          <li><a href="student-tools.html">🧮 Student Tools &amp; CGPA</a></li>
          <li><a href="contact.html">✉️ Contact &amp; Corrections</a></li>
        </ul>
      </div>

      <!-- 3. Student Resources -->
      <div class="footer-col" data-footer-accordion>
        <div class="footer-col-header" tabindex="0" role="button" aria-expanded="false">
          <h4 class="footer-heading">Student Living</h4>
          <span class="footer-accordion-toggle" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </div>
        <ul class="footer-links-list">
          <li><a href="community.html">🎪 Student Community</a></li>
          <li><a href="community.html?tab=events">📅 College Events</a></li>
          <li><a href="community.html?tab=clubs">🤝 Clubs &amp; Societies</a></li>
          <li><a href="community.html?tab=sports">⚽ Sports &amp; Recreation</a></li>
          <li><a href="community.html?tab=announcements">📢 Campus Announcements</a></li>
          <li><a href="rooms-pg.html">🏠 Rooms &amp; PG Rentals</a></li>
          <li><a href="food-tiffin.html">🍱 Food &amp; Mess Services</a></li>
          <li><a href="explore-nearby.html">🏪 Explore Local Shops</a></li>
          <li><a href="transport.html">🚌 Sheikhpura Transport</a></li>
          <li><a href="emergency.html">🚑 Medical &amp; Emergency</a></li>
          <li><a href="lost-found.html">🎒 Lost &amp; Found Desk</a></li>
          <li><a href="submit-listing.html" style="color: var(--color-accent, #38bdf8); font-weight: 600;">+ List Room / Shop (Free)</a></li>
        </ul>
      </div>

      <!-- 4. Legal & Governance -->
      <div class="footer-col" data-footer-accordion>
        <div class="footer-col-header" tabindex="0" role="button" aria-expanded="false">
          <h4 class="footer-heading">Legal &amp; Policy</h4>
          <span class="footer-accordion-toggle" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </div>
        <ul class="footer-links-list">
          <li><a href="privacy.html">🔒 Privacy Policy</a></li>
          <li><a href="terms.html">📜 Terms &amp; Conditions</a></li>
          <li><a href="disclaimer.html">⚠️ Website Disclaimer</a></li>
          <li><a href="cookie-policy.html">🍪 Cookie Policy</a></li>
          <li><a href="community-guidelines.html">🤝 Community Guidelines</a></li>
          <li><a href="acceptable-use.html">🛡️ Acceptable Use Policy</a></li>
          <li><a href="data-deletion.html">🗑️ Data Deletion Policy</a></li>
          <li><a href="intellectual-property.html">⚖️ Copyright &amp; IP Policy</a></li>
          <li><a href="accessibility.html">♿ Accessibility Statement</a></li>
          <li><a href="grievance.html">⚖️ Grievance Redressal</a></li>
        </ul>
      </div>

      <!-- 5. Contact & Support -->
      <div class="footer-col" data-footer-accordion>
        <div class="footer-col-header" tabindex="0" role="button" aria-expanded="false">
          <h4 class="footer-heading">Verified Contact</h4>
          <span class="footer-accordion-toggle" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </div>
        <div class="footer-contact-body">
          <div class="footer-contact-item">
            <strong>Campus Location</strong>
            Bajidpur, Near Police Line, Sheikhpura, Bihar – 811105
          </div>
          <div class="footer-contact-item">
            <strong>Community Helpdesk</strong>
            <a href="mailto:contact@gecsheikhpura.in">contact@gecsheikhpura.in</a>
          </div>
          <div class="footer-contact-item">
            <strong>Academic Partner</strong>
            <a href="mailto:support@apnacollegebihar.online">support@apnacollegebihar.online</a>
          </div>
          <div class="footer-contact-item">
            <strong>Emergency Police / Medical</strong>
            <span style="color: #ef4444; font-weight: 700;">Dial 112 (Toll Free)</span><br>
            <span>Sadar Hospital: 06341-223333</span>
          </div>
          <div style="margin-top: 0.85rem;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="if(window.openReportModal){window.openReportModal('General Student Hub Feedback');} else {window.location.href='contact.html';}" style="font-size: 0.775rem; width: 100%; justify-content: center;">
              ⚠️ Report Wrong Info
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Legal Bar -->
    <div class="footer-bottom-bar">
      <div class="footer-disclaimer-legal">
        <strong>Disclaimer:</strong> GEC Sheikhpura Student Life Hub is an independent, unofficial community project maintained by engineering students for peer support and local convenience. It is not affiliated with, endorsed by, or operated by Government Engineering College Sheikhpura, Aryabhatta Knowledge University, or the Department of Science, Technology and Technical Education (DSTTE), Government of Bihar. All official college communications and notices are sourced directly from <a href="https://www.gecsheikhpura.ac.in/" target="_blank" rel="noopener noreferrer">gecsheikhpura.ac.in</a>. All academic notes and syllabus belong to <a href="https://www.apnacollegebihar.online/" target="_blank" rel="noopener noreferrer">Apna College Bihar</a>.
      </div>

      <div class="footer-bottom-flex">
        <div>
          &copy; <span id="footerCurrentYear">2026</span> GEC Sheikhpura Student Life Hub. All rights reserved.
        </div>
        <div class="footer-bottom-links">
          <a href="student-tools.html">Student Tools</a>
          <a href="saved-items.html">Saved Hub</a>
          <a href="community-guidelines.html">Guidelines</a>
          <a href="contact.html">Support</a>
        </div>
      </div>
    </div>
  </div>`;

  function initUniversalFooter() {
    ensureFooterStyles();

    let footer = document.getElementById('universal-site-footer');
    if (!footer) {
      footer = document.querySelector('footer.site-footer');
    }

    if (!footer) {
      footer = document.createElement('footer');
      footer.id = 'universal-site-footer';
      footer.className = 'site-footer';
      document.body.appendChild(footer);
    }

    // Replace or hydrate footer inner HTML
    footer.innerHTML = FOOTER_TEMPLATE;
    footer.id = 'universal-site-footer';
    if (!footer.classList.contains('site-footer')) {
      footer.classList.add('site-footer');
    }

    // Set dynamic copyright year
    const yearEl = document.getElementById('footerCurrentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    // Initialize Mobile Expandable Accordions (< 768px)
    bindMobileAccordions(footer);
  }

  function bindMobileAccordions(container) {
    const accordions = container.querySelectorAll('[data-footer-accordion]');
    accordions.forEach(col => {
      const header = col.querySelector('.footer-col-header');
      if (!header) return;

      const toggle = function (e) {
        // Only active on mobile viewports
        if (window.innerWidth > 768) return;

        const isActive = col.classList.contains('active');
        // Accordion behavior: close other columns
        accordions.forEach(c => {
          if (c !== col) {
            c.classList.remove('active');
            const h = c.querySelector('.footer-col-header');
            if (h) h.setAttribute('aria-expanded', 'false');
          }
        });

        if (isActive) {
          col.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
        } else {
          col.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        }
      };

      header.addEventListener('click', toggle);
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalFooter);
  } else {
    initUniversalFooter();
  }

  window.initUniversalFooter = initUniversalFooter;
})();

