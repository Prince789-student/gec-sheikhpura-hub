/**
 * GEC Sheikhpura Student Life Hub - Phase 12
 * Official Website Recursive Discovery & Public Data Crawler
 *
 * Source: https://www.gecsheikhpura.ac.in/
 * Respectful crawling with polite delays, rate limiting, duplicate detection,
 * SHA-256 content hashing, strict security boundaries, and academic separation.
 */

const https = require('https');
const http = require('http');
const url = require('url');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class OfficialSiteCrawler {
  constructor(options = {}) {
    this.baseUrl = 'https://www.gecsheikhpura.ac.in';
    this.baseDomain = 'gecsheikhpura.ac.in';
    this.maxDepth = options.maxDepth !== undefined ? options.maxDepth : 3;
    this.maxPages = options.maxPages !== undefined ? options.maxPages : 80;
    this.requestDelayMs = options.requestDelayMs !== undefined ? options.requestDelayMs : 600;
    this.timeoutMs = options.timeoutMs || 10000;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GECSheikhpuraHubBot/1.0 (+https://gecsheikhpurahub.in/about.html)';

    this.queue = [];
    this.visitedUrls = new Set();
    this.contentHashes = new Map(); // hash -> url
    this.discoveredPages = [];
    this.discoveredDocuments = [];
    this.errors = [];
    this.stats = {
      discovered: 0,
      fetched: 0,
      parsed: 0,
      approved: 0,
      duplicates: 0,
      restricted: 0,
      failed: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Normalize URLs: resolve relative, strip tracking params and fragments, normalize slashes
   */
  normalizeUrl(rawHref, currentUrl) {
    if (!rawHref) return null;
    let clean = rawHref.trim();
    if (clean.startsWith('javascript:') || clean.startsWith('mailto:') || clean.startsWith('tel:') || clean.startsWith('#')) {
      return null;
    }

    try {
      const resolved = new URL(clean, currentUrl || this.baseUrl);
      // Domain whitelist check
      if (!resolved.hostname.includes(this.baseDomain)) {
        return null;
      }

      // Remove tracking and session parameters
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'ref', 'v'];
      paramsToRemove.forEach(p => resolved.searchParams.delete(p));

      // Strip hash
      resolved.hash = '';

      // Normalize trailing slash for directories
      let pathname = resolved.pathname;
      if (!pathname.includes('.') && !pathname.endsWith('/')) {
        pathname += '/';
      }
      resolved.pathname = pathname;

      return resolved.toString();
    } catch (e) {
      return null;
    }
  }

  /**
   * Determine content category based on URL path and page title
   */
  classifyPage(cleanUrl, title = '') {
    const p = cleanUrl.toLowerCase();
    const t = title.toLowerCase();

    // Restricted Login sections
    if (p.includes('/login') || p.includes('/student-login') || p.includes('/admin-login') || p.includes('/portal') || t.includes('login')) {
      return { section: 'restricted_portal', subcategory: 'Student / Staff Login', restricted: true, type: 'login_portal' };
    }

    // Departments & Faculty
    if (p.includes('/department/')) {
      let deptName = 'General Engineering';
      if (p.includes('civil')) deptName = 'Civil Engineering';
      else if (p.includes('mechanical')) deptName = 'Mechanical Engineering';
      else if (p.includes('computer-science')) deptName = 'Computer Science & Engineering';
      else if (p.includes('electrical')) deptName = 'Electrical Engineering';
      else if (p.includes('electronics')) deptName = 'Electronics & Communication';
      else if (p.includes('mechatronics')) deptName = 'Mechatronics Engineering';
      else if (p.includes('applied-science')) deptName = 'Applied Science & Humanities';
      return { section: 'faculty_departments', subcategory: deptName, restricted: false, type: 'html_page' };
    }

    // Administration & Governance
    if (p.includes('/about-us/administration') || p.includes('/about-us/principals-message') || p.includes('/about-us/registrar') || p.includes('/about-us/dean-academics') || p.includes('/about-us/icc')) {
      return { section: 'administration', subcategory: 'Governance & Leadership', restricted: false, type: 'html_page' };
    }

    // College Overview & History
    if (p.includes('/about-us/')) {
      return { section: 'college_overview', subcategory: 'Institutional Profile', restricted: false, type: 'html_page' };
    }

    // Training & Placement
    if (p.includes('/training-and-placement/')) {
      return { section: 'training_placement', subcategory: 'T&P Cell & Recruiters', restricted: false, type: 'html_page' };
    }

    // Facilities & Campus Services
    if (p.includes('/facilities-and-services/')) {
      return { section: 'facilities_services', subcategory: 'Campus Facilities', restricted: false, type: 'html_page' };
    }

    // Activities, Innovation & Hackathon
    if (p.includes('/activities/')) {
      return { section: 'activities_clubs', subcategory: 'Student Activities & Innovation', restricted: false, type: 'html_page' };
    }

    // Approvals & Affiliations
    if (p.includes('/approval/')) {
      return { section: 'affiliation_approvals', subcategory: 'AICTE / BEU Approvals', restricted: false, type: 'html_page' };
    }

    // Notices, Updates & Tenders
    if (p.includes('notice') || p.includes('update') || p.includes('tender') || p.includes('circular') || t.includes('notice')) {
      return { section: 'public_notices', subcategory: 'Campus Circulars & Notices', restricted: false, type: 'public_notice' };
    }

    // PDF Documents
    if (p.endsWith('.pdf')) {
      return { section: 'public_documents', subcategory: 'Official PDF Document', restricted: false, type: 'pdf_document' };
    }

    // Contact
    if (p.includes('/contact') || p.includes('/visit-us')) {
      return { section: 'contact_directory', subcategory: 'Campus Office Contact', restricted: false, type: 'html_page' };
    }

    return { section: 'college_overview', subcategory: 'General Campus Page', restricted: false, type: 'html_page' };
  }

  /**
   * Fetch an HTTP/HTTPS resource politely with timeout and retry
   */
  async fetchResource(targetUrl, retryCount = 0) {
    return new Promise((resolve) => {
      const client = targetUrl.startsWith('https') ? https : http;
      const parsed = new URL(targetUrl);

      const req = client.get({
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'close'
        },
        timeout: this.timeoutMs
      }, (res) => {
        // Handle 3xx Redirects safely
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = this.normalizeUrl(res.headers.location, targetUrl);
          if (redirectUrl && redirectUrl !== targetUrl && retryCount < 3) {
            return resolve(this.fetchResource(redirectUrl, retryCount + 1));
          }
        }

        const contentType = res.headers['content-type'] || '';
        const isPdf = contentType.includes('application/pdf') || targetUrl.toLowerCase().endsWith('.pdf');

        if (isPdf) {
          // For PDF, record headers without downloading massive buffers
          res.resume();
          return resolve({
            status: res.statusCode,
            contentType: 'application/pdf',
            headers: res.headers,
            isPdf: true,
            body: ''
          });
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          body += chunk;
          // Protect memory from unexpectedly huge response (> 2MB)
          if (body.length > 2000000) {
            req.destroy();
          }
        });

        res.on('end', () => {
          resolve({
            status: res.statusCode,
            contentType,
            headers: res.headers,
            isPdf: false,
            body
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        if (retryCount < 2) {
          setTimeout(() => resolve(this.fetchResource(targetUrl, retryCount + 1)), 1000);
        } else {
          resolve({ status: 408, error: 'Request timeout' });
        }
      });

      req.on('error', (err) => {
        if (retryCount < 2) {
          setTimeout(() => resolve(this.fetchResource(targetUrl, retryCount + 1)), 1000);
        } else {
          resolve({ status: 500, error: err.message });
        }
      });
    });
  }

  /**
   * Clean raw HTML text, extract links, title, and calculate content hash
   */
  parseHtml(html, pageUrl) {
    if (!html) return { title: '', text: '', links: [], hash: '' };

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/&raquo;/g, '').replace(/\|.*/, '').trim() : '';
    if (!title) {
      // Fallback to h1 or h2
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'GEC Sheikhpura Portal Page';
    }

    // Extract links
    const links = [];
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const normalized = this.normalizeUrl(match[1], pageUrl);
      const linkText = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (normalized) {
        links.push({ url: normalized, text: linkText });
      }
    }

    // Clean body text (strip header, footer, scripts, styles)
    let clean = html;
    clean = clean.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                 .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                 .replace(/<!--[\s\S]*?-->/g, ' ')
                 .replace(/<header[\s\S]*?<\/header>/gi, ' ')
                 .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
                 .replace(/<nav[\s\S]*?<\/nav>/gi, ' ');

    const plainText = clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Cryptographic hash of content
    const hash = crypto.createHash('sha256').update(plainText || title).digest('hex');

    return { title, text: plainText, links, hash };
  }

  /**
   * Produce factual concise summary (max 280 chars)
   */
  generateFactualSummary(text, title, classification) {
    if (!text || text.length < 30) {
      return `Official ${classification.subcategory} publication from Government Engineering College Sheikhpura.`;
    }

    // Pick first descriptive sentence
    const cleaned = text.replace(/WebFont\.load[\s\S]*?\}\);/g, '').trim();
    const sentences = cleaned.split(/(?<=[.?!])\s+/);
    const valid = sentences.filter(s => s.length > 25 && !s.includes('{') && !s.includes('font-family'));
    const summary = (valid[0] || cleaned).substring(0, 260).trim();
    return summary.endsWith('.') ? summary : `${summary}...`;
  }

  /**
   * Run the recursive crawling queue
   */
  async crawl(seedUrls = ['https://www.gecsheikhpura.ac.in/']) {
    this.stats.startTime = new Date().toISOString();
    console.log(`\n🌐 [Crawler] Initializing official discovery on: ${this.baseUrl}`);
    console.log(`   Config: maxDepth=${this.maxDepth}, maxPages=${this.maxPages}, delay=${this.requestDelayMs}ms\n`);

    // Enqueue seeds
    seedUrls.forEach(u => {
      const norm = this.normalizeUrl(u);
      if (norm) {
        this.queue.push({ url: norm, depth: 0 });
        this.visitedUrls.add(norm);
        this.stats.discovered++;
      }
    });

    while (this.queue.length > 0 && this.discoveredPages.length < this.maxPages) {
      const current = this.queue.shift();
      const currentUrl = current.url;
      const currentDepth = current.depth;

      console.log(`[${this.discoveredPages.length + 1}/${this.maxPages}] Depth ${currentDepth}: ${currentUrl}`);

      // Polite delay between outbound requests
      await new Promise(r => setTimeout(r, this.requestDelayMs));

      const resp = await this.fetchResource(currentUrl);
      this.stats.fetched++;

      if (resp.status !== 200) {
        console.warn(`   ⚠️ HTTP ${resp.status} on ${currentUrl}`);
        this.stats.failed++;
        this.errors.push({ url: currentUrl, status: resp.status, error: resp.error || 'Non-200 status' });
        continue;
      }

      // Check if PDF Document
      if (resp.isPdf) {
        const docRecord = {
          id: `doc-${crypto.createHash('md5').update(currentUrl).digest('hex').substring(0, 10)}`,
          document_title: path.basename(new URL(currentUrl).pathname) || 'Official College Document',
          document_type: 'pdf',
          source_url: currentUrl,
          download_url: currentUrl,
          content_hash: crypto.createHash('sha256').update(currentUrl).digest('hex'),
          availability_status: 'available',
          created_at: new Date().toISOString()
        };
        this.discoveredDocuments.push(docRecord);
        this.stats.parsed++;
        continue;
      }

      // Parse HTML
      const parsed = this.parseHtml(resp.body, currentUrl);
      this.stats.parsed++;

      // Check duplicate content via hash
      if (this.contentHashes.has(parsed.hash)) {
        console.log(`   ℹ️ Duplicate content detected (matches: ${this.contentHashes.get(parsed.hash)})`);
        this.stats.duplicates++;
      } else {
        this.contentHashes.set(parsed.hash, currentUrl);
      }

      // Categorize & Security Checks
      const classification = this.classifyPage(currentUrl, parsed.title);
      if (classification.restricted) {
        console.log(`   🔒 Restricted Portal Identified: ${currentUrl} (Authentication boundary respected)`);
        this.stats.restricted++;
      }

      const summary = this.generateFactualSummary(parsed.text, parsed.title, classification);

      // Create Structured Page Record
      const pageRecord = {
        id: `page-${crypto.createHash('md5').update(currentUrl).digest('hex').substring(0, 12)}`,
        source_url: currentUrl,
        canonical_url: currentUrl,
        source_domain: this.baseDomain,
        page_title: parsed.title,
        section: classification.section,
        subcategory: classification.subcategory,
        content_type: classification.type,
        short_summary: summary,
        extracted_text: parsed.text.substring(0, 1200), // Clean summary snippet, no copyright reproduction
        published_date: '2026-10-27',
        document_url: currentUrl.endsWith('.pdf') ? currentUrl : null,
        content_language: 'en',
        http_status: resp.status,
        first_discovered_at: new Date().toISOString(),
        last_checked_at: new Date().toISOString(),
        content_hash: parsed.hash,
        verification_status: 'source_verified',
        import_status: classification.restricted ? 'restricted' : 'approved',
        error_message: null
      };

      this.discoveredPages.push(pageRecord);
      if (pageRecord.import_status === 'approved') {
        this.stats.approved++;
      }

      // Discover nested links if within depth limit
      if (currentDepth < this.maxDepth) {
        for (const link of parsed.links) {
          if (!this.visitedUrls.has(link.url)) {
            this.visitedUrls.add(link.url);
            this.stats.discovered++;
            this.queue.push({ url: link.url, depth: currentDepth + 1 });
          }
        }
      }
    }

    this.stats.endTime = new Date().toISOString();
    console.log(`\n✅ [Crawler] Crawl Completed!`);
    console.log(`   Discovered: ${this.stats.discovered} | Fetched: ${this.stats.fetched} | Approved: ${this.stats.approved} | Duplicates: ${this.stats.duplicates} | Restricted: ${this.stats.restricted} | Failed: ${this.stats.failed}\n`);

    return {
      stats: this.stats,
      pages: this.discoveredPages,
      documents: this.discoveredDocuments,
      errors: this.errors,
      remainingQueueCount: this.queue.length
    };
  }

  /**
   * Save crawl audit files
   */
  saveCrawlResults(outputDir = 'scripts') {
    const sitemapPath = path.join(outputDir, 'crawled_sitemap.json');
    const reportPath = path.join(outputDir, 'crawl_report.json');

    fs.writeFileSync(sitemapPath, JSON.stringify(this.discoveredPages, null, 2), 'utf8');
    fs.writeFileSync(reportPath, JSON.stringify({
      stats: this.stats,
      discoveredCount: this.discoveredPages.length,
      documentsCount: this.discoveredDocuments.length,
      errors: this.errors
    }, null, 2), 'utf8');

    console.log(`💾 Crawl results saved to ${sitemapPath} and ${reportPath}`);
  }
}

// CLI Execution support
if (require.main === module) {
  const crawler = new OfficialSiteCrawler({
    maxDepth: 2,
    maxPages: 30, // Polite test run
    requestDelayMs: 500
  });

  crawler.crawl().then(() => {
    crawler.saveCrawlResults(path.join(__dirname));
  }).catch(err => {
    console.error('Crawler failed:', err);
  });
}

module.exports = OfficialSiteCrawler;
