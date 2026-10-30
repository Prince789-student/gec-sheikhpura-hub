# GEC Sheikhpura Student Life Hub — Production Launch & Operational Guide

## 1. Project Overview & Architectural Boundaries

The **GEC Sheikhpura Student Life Hub** is an independent, student-built web platform designed to streamline non-academic campus life for engineering students at Government Engineering College (GEC) Sheikhpura (Bajidpur campus), Bihar.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MANDATORY PLATFORM SEPARATION                        │
├───────────────────────────────────┬────────────────────────────────────┤
│ GEC Sheikhpura Student Life Hub   │ Apna College Bihar                 │
│ (https://gecsheikhpurahub.in/)    │ (https://apnacollegebihar.online/) │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Local Services & Shop Directory │ • Branch & Semester Syllabus       │
│ • Student Rooms & PG Finder       │ • Academic Lecture Notes & Videos  │
│ • Mess & Tiffin Providers         │ • Previous Year Questions (PYQs)   │
│ • Second-Hand Marketplace         │ • Exam Prep, CGPA & Study Timers   │
│ • College Gate Distance Maps      │ • Mentorship & Study Groups        │
│ • Campus Clubs, Sports & Events   │                                    │
│ • Emergency Services Directory    │                                    │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Feature Inventory Across Phases 1–9

- **Phase 1 (Core Web)**: High-contrast design system, responsive navigation, dark/light theme toggle, and disclaimer headers.
- **Phase 2 (Local Directory)**: Verified shops, stationery, mobile repair, emergency medical services, and local transit contacts.
- **Phase 3 (Student Accounts)**: Secure session management, profile batch details, role-based access control, and saved items.
- **Phase 4 (Verified Listings & Reviews)**: Rating summaries, student reviews, owner listing submissions, and moderation queues.
- **Phase 5 (Physical Marketplace)**: Second-hand peer exchange, buyer chat inquiries, seller dashboard, and dispute resolution.
- **Phase 6 (Maps, Distance & PWA)**: Leaflet map views, campus gate coordinate reference (25.1380° N, 85.8640° E), Haversine straight-line distance, PWA manifest, and offline service worker fallback.
- **Phase 7 (Campus Community & Life)**: Campus event passes with capacity limit enforcement, student club proposals, recreation sports matching, and auto-expiring announcements.
- **Phase 8 (Notifications, Analytics & Ops)**: Universal notification bell, unread badge counter, live first-party admin analytics, sanitized error logs with regex credential redaction, and database JSON snapshot backups.
- **Phase 9 (Final Launch, SEO & Feedback)**: Structured Student Feedback Desk (9 categories), `robots.txt`, XML `sitemap.xml`, custom `404.html`, trust & safety policies (`about.html`, `privacy.html`, `terms.html`, `community-guidelines.html`), and Schema.org structured data.

---

## 3. Environment Configuration

Copy `.env.example` into your private deployment dashboard. **Never commit real credentials to source control.**

```bash
# Public Client Keys (Safe in browser)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-placeholder

# Server-Only Secrets (Never expose to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-placeholder
VAPID_PUBLIC_KEY=your-vapid-public-key-placeholder
VAPID_PRIVATE_KEY=your-vapid-private-key-placeholder
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your-smtp-password-placeholder

# Academic Platform Link
ACADEMIC_PORTAL_URL=https://www.apnacollegebihar.online/
```

---

## 4. Database Migration Sequence

Execute migrations sequentially in the Supabase SQL Editor:

1. `supabase/schema.sql` (Initial core schema)
2. `supabase/schema_phase3.sql` (Student profiles & auth roles)
3. `supabase/schema_phase4.sql` (Owner submissions, reviews, moderation logs)
4. `supabase/schema_phase5.sql` (Marketplace items & buyer inquiries)
5. `supabase/schema_phase6.sql` (Location calibration & reference points)
6. `supabase/schema_phase7.sql` (Community events, registrations, clubs, announcements)
7. `supabase/schema_phase8.sql` (Notification preferences, compound indexes, aggregate view)
8. `supabase/schema_phase9.sql` (Student feedback table, status indexes, private RLS policies)

---

## 5. Phased Launch Strategy

### Stage A: Private Alpha Testing (Days 1–5)
- **Cohort**: 10–15 trusted student volunteers (5 hostel residents, 5 private PG tenants, 3 day scholars).
- **Objectives**:
  - Test account signup, bookmarking, and notification bell preview.
  - Test room search, distance radius filters, and owner phone verification.
  - Test second-hand marketplace listing creation and buyer inquiry modal.
  - Validate that academic searches (`notes`, `syllabus`, `pyq`) cleanly route to Apna College Bihar.
- **Action**: Fix any reported mobile layout glitches or broken phone numbers.

### Stage B: Limited Campus Release (Days 6–12)
- **Target Audience**: GEC Sheikhpura campus batch groups (1st to 4th year).
- **Objectives**:
  - Release verified local shops, photocopy centers, and mess contacts.
  - Open event registration for Aarohan Cultural Fest and Shaurya Cup.
  - Monitor the **💬 Student Feedback Desk** in `admin.html` daily for outdated room vacancies or missing services.
- **Verification**: Review operational error logs (`operationalTab`) to ensure zero unhandled exceptions.

### Stage C: Campus-Wide Discovery (Post-Day 12)
- **Distribution**: Share direct links on student boards and social channels.
- **Ongoing Maintenance**:
  - Weekly review of pending listing submissions and feedback reports.
  - Regular export of JSON database backup snapshots via Admin Console.
  - Strict enforcement of anti-ragging zero-tolerance directives.

---

## 6. Student Usability Testing Protocol

When conducting usability testing sessions with student volunteers, follow this practical checklist:

| Task ID | User Action to Test | Success Criteria | Notes / Evaluation |
| :---: | :--- | :--- | :--- |
| **UT-01** | Open Home and switch to Dark Theme | Theme toggles instantly without flashing; contrast remains readable. | Check readability in direct sunlight. |
| **UT-02** | Search for "single room with mess near campus" | Navigates to `rooms-pg.html`; filters by type; straight-line distance is clear. | Verify student understands physical inspection disclaimer. |
| **UT-03** | Test academic query interception | Types "CSE 3rd sem notes" in search bar; redirected to Apna College Bihar banner. | Strict separation verified. |
| **UT-04** | Discover nearest photocopy / stationery shop | Uses `explore-nearby.html` map; views distance from College Main Gate. | Verify radius selector (1km, 3km, 5km). |
| **UT-05** | View a marketplace item & contact seller | Opens item details; sends buyer message via inquiry modal. | Confirm seller receives in-app notification. |
| **UT-06** | Claim an event registration pass | Registers for upcoming event; receives pass; unread bell count increments. | Attempt duplicate registration to verify blocking. |
| **UT-07** | Submit a suggestion via Student Feedback Desk | Fills category, target page, and note in `contact.html`; receives toast. | Submitter contact is optional. |
| **UT-08** | Offline resilience test | Disconnects network; navigates to `offline.html`; accesses emergency hospital/police numbers. | PWA offline fallback verified. |

---

## 7. Emergency Rollback & Recovery Runbook

1. **Frontend Rollback**:
   - In Cloudflare Pages / Vercel dashboard: Click **Deployments**, locate the last verified deployment tag, and click **Rollback to this version**. Instant DNS switch occurs in < 30 seconds.
2. **Database Rollback**:
   - If a schema index causes database lock contention, drop it safely using:
     ```sql
     DROP INDEX CONCURRENTLY IF EXISTS idx_student_feedback_status_created;
     ```
3. **PWA Cache Invalidation**:
   - If client devices retain stale cached assets, increment the cache name in `sw.js` (e.g. `gec-hub-cache-v4`), commit, and redeploy. The service worker will flush old caches automatically.
