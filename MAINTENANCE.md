# GEC Sheikhpura Student Life Hub — Platform Maintenance & Operational Manual

**Platform Status:** Operational (Phase 10 — Continuous Improvement, Smart Automation & Platform Scalability)  
**Campus Target:** Government Engineering College (GEC), Sheikhpura, Bihar (PIN 811105)  
**Academic Sister Platform:** [Apna College Bihar](https://www.apnacollegebihar.online/) *(Strict separation: all notes, syllabus, PYQs, lectures, and timers belong exclusively to Apna College Bihar)*.

---

## 1. Architectural Model & Scope Separation

The **GEC Sheikhpura Student Life Hub** is an unofficial student-life and local living portal. It covers:
- Local businesses, stationery, dairy, repair, salon, and laundry services.
- Student accommodation (rooms, PGs, hostels).
- Mess and tiffin meal subscriptions.
- Campus transit, e-rickshaws, bus stands, and railway station connectivity.
- Campus community clubs, verified society events, and student second-hand marketplace.
- Emergency casualty hospitals, 24/7 pharmacies, police contacts, and helpline directories.

> **CRITICAL DIRECTIVE:** Under no circumstances should academic syllabus, PYQ repositories, lecture notes, or study timers be duplicated on this hub. All academic inquiries are routed directly to [Apna College Bihar](https://www.apnacollegebihar.online/).

---

## 2. Directory & Listing Maintenance Procedures

### 2.1 Verifying Public Information
Public confidence requires strict listing truthfulness.
- **Never claim a business is open now** without confirmed, verified operating hours.
- **Never mark a listing as verified** solely because an owner submitted recent edits.
- Verification audits must be documented under `admin.html > 🛡️ Verification & Audit Logs`:
  1. **Phone Call Verification:** Call the registered mobile number. Confirm owner name, exact address, and rate schedule.
  2. **Physical On-Site Visit:** Verify physical storefront, signage, and proximity to Bajidpur Police Line.
  3. **Multi-Student Feedback:** Cross-reference ratings and review sentiments from enrolled students.

### 2.2 Adding & Updating Business Listings
1. Navigate to `admin.html > 🏪 Manage Businesses`.
2. Click **"+ Add New Business"** or click **"Edit"** on an existing card.
3. Validate required fields:
   - Business Name (e.g. `Maa Durga Stationery & Xerox`)
   - Category (`stationery`, `grocery`, `repair`, `salon`, `laundry`, `bank`, `medical`)
   - Address & Distance (measured road distance in km from GEC Sheikhpura main gate)
   - Verified 10-digit Phone Number (`+91-XXXXXXXXXX`)
   - Verified Operating Hours (`e.g. 7:30 AM - 8:30 PM`)
   - Services list (comma separated)
4. Save record. An audit entry is automatically appended to the operational log.

### 2.3 Managing Accommodations & Room Freshness
- Accommodations have an freshness threshold of **45 days**.
- In the directory, rooms with unchanged availability for >45 days are flagged with `needs_review` during the automated maintenance run.
- Administrators contact landlords to confirm vacant beds/rooms before re-stamping `last_verified_at = now()`.

---

## 3. Student Feedback & Product Improvement Desk

### 3.1 Feedback Lifecycle
Every student submission moves through an audited lifecycle:
1. `pending`: Initial student submission; awaiting administrative review.
2. `reviewing`: Currently under investigation by moderators.
3. `planned`: Accepted suggestion queued for engineering/operational rollout.
4. `in_progress`: Actively being implemented or field-verified.
5. `completed`: Resolved and published.
6. `declined`: Rejected or duplicate (with clear, respectful rationale).

### 3.2 Privacy & Transparency Rules
- **Public Resolution Summary (`resolution_summary`):** Visible directly to the submitting student on their personal profile (`dashboard.html > 💬 My Feedback & Requests`).
- **Internal Moderator Notes (`admin_notes`):** Strictly restricted to administrators. Contains private evidence, staff notes, and audit context. **Never transmitted or exposed to client students.**
- **Private Contact Details:** Student contact emails/phones are voluntarily supplied and accessible only within the authenticated admin console.

---

## 4. Safe Idempotent Platform Automations

### 4.1 Automated Maintenance Routine
The maintenance suite can be triggered on demand via:
`admin.html > ⚙️ Operational Tools & Logs > ▶️ Run Platform Maintenance Routine`  
(or called programmatically via `window.DB.runPlatformAutomations()`).

**Tasks automated safely:**
1. **Notice Expiration:** Compares notice validity/expiry dates with the current timestamp. Notices with `valid_until < NOW()` are marked `is_active: false`.
2. **Event Concluding:** Compares event date and time with current timestamp. Past events are updated to `status: 'completed'`.
3. **Accommodation Stale Flagging:** Accommodations unverified for >45 days receive `review_status: 'needs_review'`.
4. **Business Review Flagging:** Businesses unverified for >90 days receive `review_status: 'needs_review'`.
5. **Audit Logging:** Every cycle writes an idempotent summary report to `gec_automation_reports`.

> **IDEMPOTENCY GUARANTEE:** Running the maintenance routine multiple times back-to-back will produce zero duplicate side effects, zero duplicate notifications, and will **never destructively delete** any listing.

---

## 5. Duplicate & Data-Quality Detection Engine

### 5.1 Matching Signals
The detection engine inspects records using three signals:
- **Phone Number Normalization:** Strips country codes (`+91`), spaces, and dashes down to 10 digits. Exact phone matches indicate high probability duplicate entries.
- **Name Token Jaccard Similarity:** Normalizes text (lowercase, removes stopwords like `and`, `the`, `shop`) and computes token intersection over union (threshold >= 0.40).
- **Category Compatibility:** Restricts candidate pairs to identical categories.

### 5.2 Resolution Actions
In `admin.html > 🔍 Quality & Duplicates`:
- **Safe Archive Candidate:** Deactivates the duplicate listing (`is_active: false, status: 'archived'`) while preserving submission history and contact links.
- **Mark Distinct Entities:** Records administrative confirmation that the listings represent separate entities, dismissing the warning.

---

## 6. Runtime Feature Flags

Feature flags allow instant toggling of modules without triggering full redeployments:

| Flag Key | Description | Default | Safe Rollback Action |
| :--- | :--- | :--- | :--- |
| `advanced_search_filters` | Multi-facet filtering on directory pages | `true` | Toggle OFF in Admin Console |
| `duplicate_detector` | Token-matching duplicate prevention | `true` | Toggle OFF in Admin Console |
| `data_freshness_audit` | Overdue review flags for rooms/shops | `true` | Toggle OFF in Admin Console |
| `student_data_export` | 1-click personal JSON data export | `true` | Toggle OFF in Admin Console |
| `experimental_push_reminders` | Browser push notifications | `false` | Remains OFF until VAPID configured |

To change a flag:
1. Go to `admin.html > ⚙️ Operational Tools & Logs`.
2. In the **"Platform Feature Flags"** card, click **"Enable"** or **"Disable"** for the target feature.
3. Changes apply instantly across the current runtime session.

---

## 7. Privacy Controls & Account Deletion

### 7.1 Student Data Export
Students can request and download a complete archive of their personal data:
- Navigate to `dashboard.html > ⚙️ Preferences & Security`.
- Click **"📥 Download My Personal Data (.json)"**.
- Gathers student profile, saved listings, created marketplace items, event RSVPs, and submitted feedback into a downloadable `gec_student_data_<id>.json` file.

### 7.2 Account Deletion Protocol
When a student requests account deletion:
1. Deletion requests are stored in `gec_account_deletion_requests` with status `pending`.
2. Moderation audit records and security logs are preserved in accordance with university audit guidelines.
3. Active marketplace items and community posts are dissociated or archived safely.
4. User profile credentials and authentication tokens are invalidated upon confirmation.

---

## 8. Database Maintenance, Migrations & Disaster Recovery

### 8.1 Schema Migrations
Database migrations are housed in `supabase/`:
- `supabase/schema_phase8.sql`: Phase 8 core schema, compound indexes, and RLS policies.
- `supabase/schema_phase9.sql`: Phase 9 student feedback and review moderation schema.
- `supabase/schema_phase10.sql`: Phase 10 status lifecycle constraints, freshness columns, compound indexes, and account deletion request tables.

**Applying Migrations in Supabase SQL Editor:**
```sql
-- 1. Review migration script in supabase/schema_phase10.sql
-- 2. Open Supabase Dashboard > Project > SQL Editor
-- 3. Paste and run schema_phase10.sql
-- 4. Verify output indicates SUCCESS and indexes are created.
```

### 8.2 JSON Snapshot Backup & Restoration
- **Exporting Backup Snapshot:** In `admin.html > ⚙️ Operational Tools & Logs`, click **"💾 Export JSON Snapshot"**. This generates a complete timestamped JSON dump of all directories, rooms, shops, marketplace listings, feedback, and audit logs.
- **Restoration Procedure:** Refer to [BACKUP_RECOVERY.md](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/BACKUP_RECOVERY.md) for full emergency database recovery procedures.

---

## 9. Incident Rollback Runbook

If an operational anomaly or broken listing occurs:
1. **Disable Feature Flag:** If the issue involves an experimental feature, toggle the corresponding feature flag OFF in `admin.html`.
2. **Review Sanitized Logs:** Check `admin.html > 📋 Sanitized Operational Event Logs` to identify exact stack traces and error codes.
3. **Database Rollback:** If a bad migration or data mutation occurred:
   - For Supabase: Restore to Point-in-Time Backup (PITR) or run down migration steps.
   - For Local Store: Re-import the most recent verified JSON snapshot from the backup folder.
4. **Service Worker Cache Invalidation:** If static assets misbehave, bump the cache version in `sw.js` (e.g., from `gec-hub-cache-v3` to `gec-hub-cache-v4`) to force client browsers to refetch fresh HTML/JS.
