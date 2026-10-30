# Database Backup & Disaster Recovery Plan
## GEC Sheikhpura Student Life Hub

---

## 1. Overview & Recovery Objectives
This document establishes the practical backup, retention, and disaster recovery procedures for the **GEC Sheikhpura Student Life Hub**.

- **Recovery Point Objective (RPO)**: ≤ 24 hours for automated backups; ≤ 1 hour for pre-deployment snapshots.
- **Recovery Time Objective (RTO)**: ≤ 30 minutes to restore service from a verified dump.
- **Data Scope**: PostgreSQL database tables, student living preferences, verified directory records, marketplace listings, and user uploaded images.

---

## 2. Backup Methods & Capabilities

### A. Supabase Automated Backups (Managed Tier)
- If hosted on Supabase Pro/Team tier: Daily automated logical backups are performed by Supabase and retained for 7 to 30 days.
- Access via: Supabase Dashboard → `Project Settings` → `Database` → `Backups`.

### B. Manual Command-Line Logical Dump (`pg_dump`)
For local or community-hosted deployments, take consistent logical backups using PostgreSQL standard tooling:

```bash
# 1. Full schema + data backup (excluding internal Supabase extensions)
pg_dump -h db.your-project-ref.supabase.co -U postgres -d postgres \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="gec_hub_backup_$(date +%Y%m%d_%H%M%S).dump"

# 2. Schema-only migration backup
pg_dump -h db.your-project-ref.supabase.co -U postgres -d postgres \
  --schema-only \
  --file="gec_hub_schema_$(date +%Y%m%d).sql"

# 3. Data-only backup for key student directories
pg_dump -h db.your-project-ref.supabase.co -U postgres -d postgres \
  --data-only \
  --table=public.businesses \
  --table=public.accommodations \
  --table=public.marketplace_listings \
  --table=public.community_events \
  --file="gec_hub_directory_data_$(date +%Y%m%d).sql"
```

### C. Client Admin JSON Snapshot (Emergency Fallback)
Authorized administrators can export a sanitized JSON snapshot of local collections directly from the Admin Console (`⚙️ Operational Tools` → `Export JSON Snapshot`).
- **File Format**: `gec_hub_snapshot_YYYY-MM-DD.json`.
- **Contents**: Sanitized records for businesses, accommodations, marketplace items, events, and moderation logs.

---

## 3. Storage Bucket Backup (Uploaded Media)
Images uploaded to `listings`, `marketplace`, and `avatars` buckets can be synchronized to an encrypted S3-compatible cold storage (e.g., Cloudflare R2 or AWS S3) using `rclone` or Supabase CLI:

```bash
# Sync Supabase S3-compatible storage to local encrypted archive
rclone sync supabase-storage:listings ./backups/storage/listings/
rclone sync supabase-storage:marketplace ./backups/storage/marketplace/
```

---

## 4. Retention Schedule
- **Daily Backups**: Retain for 14 days.
- **Weekly Backups**: Retain for 8 weeks.
- **Monthly Backups**: Retain for 12 months.
- **Storage**: Backups must be stored in an encrypted offsite location (AES-256) with restricted access.
- **Source Control Safety**: Never commit `.dump` or `.sql` database exports containing student data or contact phone numbers to public git repositories.

---

## 5. Step-by-Step Restoration Procedure

### Step 1: Pre-Restoration Verification
1. Notify administrators that database maintenance is commencing.
2. Verify backup checksum:
   ```bash
   sha256sum gec_hub_backup_20261027_120000.dump
   ```

### Step 2: Restore to PostgreSQL / Supabase
```bash
# Set connection environment variables
export PGPASSWORD="your-database-password"

# Restore using pg_restore
pg_restore -h db.your-project-ref.supabase.co -U postgres -d postgres \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "gec_hub_backup_20261027_120000.dump"
```

### Step 3: Post-Restoration Verification
Run verification checks:
1. Confirm total business records match baseline:
   ```sql
   SELECT COUNT(*) FROM public.businesses WHERE is_verified = true;
   ```
2. Verify marketplace and upcoming events:
   ```sql
   SELECT COUNT(*) FROM public.marketplace_listings;
   SELECT COUNT(*) FROM public.community_events WHERE is_active = true;
   ```
3. Verify RLS policies are active:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
4. Access web application and confirm that listings render properly.
