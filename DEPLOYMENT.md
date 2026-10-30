# Production Deployment & Operations Guide
## GEC Sheikhpura Student Life Hub (Unofficial Campus Platform)

> **Platform Separation Directive**:
> All academic study resources, notes, syllabus, PYQs, and exam preparation remain exclusively hosted on **[Apna College Bihar](https://www.apnacollegebihar.online/)**. The GEC Sheikhpura Student Life Hub solely handles local directory services, student accommodation, second-hand marketplace, campus maps, community events, and clubs.

---

## 1. Hosting Architecture & Requirements

The GEC Sheikhpura Hub is engineered as an ultra-fast, zero-build, standards-compliant static web application with client-side Supabase integration and Progressive Web App (PWA) offline caching.

- **Frontend Runtime**: Pure Static HTML5 / CSS3 / Vanilla JavaScript.
- **Backend as a Service**: Supabase (PostgreSQL 15+, Auth, Row Level Security, Realtime, Storage).
- **Map Engine**: Leaflet.js with OpenStreetMap standard tiles (Zero API key cost, zero third-party tracking).
- **Service Worker Cache**: `gec-hub-cache-v3` with offline emergency contacts and PWA installation.

---

## 2. Recommended Production Hosting Providers

The project root can be deployed directly to any modern static hosting service:

| Provider | Build Command | Output Directory | Single-Page Fallback | HTTPS |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Pages** | None (leave empty) | `.` (Root) | Enabled | Automatic (Free SSL) |
| **Vercel** | None (leave empty) | `.` (Root) | Auto-detected | Automatic (Free SSL) |
| **Netlify** | None (leave empty) | `.` (Root) | `/* /index.html 200` | Automatic (Free SSL) |
| **GitHub Pages** | None (Static deploy) | `.` (Root) | N/A | Automatic |

---

## 3. Database Migration Sequence

To deploy or rebuild the database schema from scratch on a new Supabase project, execute the SQL migration scripts in `supabase/` sequentially via the Supabase SQL Editor:

1. `supabase/schema.sql` (Phase 1–2: Base businesses, accommodations, food, transport, emergency).
2. `supabase/schema_phase3.sql` (Phase 3: Student profiles, authentication tables, living preferences).
3. `supabase/schema_phase4.sql` (Phase 4: Verified listings, review moderation, reports queue, in-app notifications).
4. `supabase/schema_phase5.sql` (Phase 5: Student marketplace, physical goods catalog, buyer enquiries).
5. `supabase/schema_phase6.sql` (Phase 6: Geospatial coordinates calibration, campus entrance reference points).
6. `supabase/schema_phase7.sql` (Phase 7: Community events, student clubs directory, sports activities, announcements).
7. `supabase/schema_phase8.sql` (Phase 8: High-frequency compound indexes, notification preferences, RLS hardening, analytics view).
8. `supabase/seed.sql` (Verified campus baseline directory data).

---

## 4. Supabase Storage Bucket Configuration

Create the following storage buckets in the Supabase Dashboard:

| Bucket Name | Public Access | Allowed MIME Types | Max Upload Size | Access Policy |
| :--- | :--- | :--- | :--- | :--- |
| `listings` | Public Read | `image/jpeg`, `image/png`, `image/webp` | 5 MB | Authenticated users can upload |
| `marketplace` | Public Read | `image/jpeg`, `image/png`, `image/webp` | 5 MB | Authenticated users can upload |
| `avatars` | Public Read | `image/jpeg`, `image/png`, `image/webp` | 2 MB | User can upload to their own user_id path |

---

## 5. External Service Configuration & Honest Readiness

### A. In-App Notifications
- **Status**: **100% Operational & Verified**.
- Works out-of-the-box across all pages via the universal navigation bell (`#headerNotifBell`), dropdown inbox, and student dashboard (`dashboard.html?tab=notifications`).
- Supports mark as read, mark all as read, and user-level isolation.

### B. Transactional Email Notifications
- **Status**: **Awaiting External SMTP Credentials**.
- To enable email delivery when a listing is verified or an event pass is issued:
  1. Configure SMTP in Supabase Dashboard: `Project Settings` → `Auth` → `SMTP Settings`.
  2. Input credentials for Resend, SendGrid, or Amazon SES as described in `.env.example`.
  3. Deploy a Supabase Edge Function to trigger email on `in_app_notifications` inserts.

### C. Browser Push Notifications
- **Status**: **Client Consent & Service Worker Handlers Ready (Awaiting VAPID Gateway)**.
- Service worker (`sw.js`) contains listeners for `push` and `notificationclick`.
- Student dashboard provides an opt-in toggle requiring explicit permission.
- Delivery requires configuring VAPID keys on a push gateway server before scheduled background pushes can be dispatched.

---

## 6. Pre-Launch Verification Checklist

- [ ] HTTPS is enforced across all routes with valid SSL certificate.
- [ ] Supabase project URL and anon key are saved in `assets/js/supabase-config.js` or through the admin console.
- [ ] No server-role secrets, admin passwords, or personal phone numbers are committed to source control.
- [ ] PWA `manifest.json` and icons (`icon-192.png`, `icon-512.png`) load successfully with status 200.
- [ ] Service worker registers and precaches offline shell (`offline.html`).
- [ ] Search interception correctly redirects academic queries ("notes", "syllabus", "pyqs") to Apna College Bihar.
- [ ] Admin panel access is restricted to authorized credentials; password fields are redacted in `window.Logger`.
- [ ] Automated regression tests pass 100% (`node tests/test_phase4.js`, `test_phase5.js`, `test_phase6.js`, `test_phase7.js`, `test_phase8.js`).

---

## 7. Rollback Procedure

If a breaking issue occurs after deployment:
1. **Frontend Rollback**:
   - In Cloudflare Pages, Vercel, or Netlify: Go to `Deployments` → select the last known stable deployment → click **Rollback to this deployment**.
2. **Database Rollback**:
   - Restore database from snapshot following the steps in `BACKUP_RECOVERY.md`.
3. **Client Cache Invalidation**:
   - Increment `CACHE_NAME` in `sw.js` (e.g. `gec-hub-cache-v4`).
   - The service worker `activate` listener will automatically delete legacy caches and claim active clients immediately.
