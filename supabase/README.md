# Supabase Database Setup & Administration Guide
## GEC Sheikhpura Student Life Hub (Phase 2)

This directory contains the production-grade PostgreSQL database schema, seed data, and Row Level Security (RLS) policies for the **GEC Sheikhpura Student Life Hub**.

---

## 1. Quick Setup in 3 Simple Steps

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project (e.g. `gec-sheikhpura-hub`).
2. Choose the nearest region (e.g. `ap-south-1` Mumbai for fastest latency in Bihar/India).
3. Set a strong database password and create the project.

### Step 2: Run the SQL Schema & Seed Scripts
1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation bar.
2. Click **New Query** and paste the entire contents of [`supabase/schema.sql`](schema.sql). Click **Run**.
   - This creates all 10 tables, indexes, constraints, and Row Level Security (RLS) policies.
3. Open a second query tab, paste the entire contents of [`supabase/seed.sql`](seed.sql), and click **Run**.
   - This seeds the initial verified dataset (categories, local shops, room rentals, mess services, BEU academic notes, and notices).

### Step 3: Connect Frontend to Supabase
1. In the Supabase Dashboard, go to **Project Settings** → **API**.
2. Copy your:
   - **Project URL** (e.g. `https://xyzabcdef.supabase.co`)
   - **Project API Keys** → `anon` `public` key (e.g. `eyJhbGciOi...`)
   > ⚠️ **SECURITY WARNING:** NEVER expose or copy your `service_role` key into client files. The frontend only requires the public `anon` key.
3. You can connect your database either by:
   - **Option A (Via Admin UI):** Navigate to `http://localhost:3000/admin.html`, expand **"⚙️ Supabase API Credentials Setup"**, paste the URL and Anon Key, and click **Save & Connect**.
   - **Option B (Direct in Code):** In [`assets/js/supabase-config.js`](../assets/js/supabase-config.js), set the default values for `url` and `anonKey`.

---

## 2. Setting Up an Administrator Account

1. In Supabase Dashboard, go to **Authentication** → **Users** → **Add User** → **Create User**.
2. Enter the admin email (e.g. `admin@gecsheikhpura.ac.in`) and a secure password.
3. Now assign the user the `admin` role by running this in the **SQL Editor**:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   SELECT id, email, 'Student Council Admin', 'admin'
   FROM auth.users
   WHERE email = 'admin@gecsheikhpura.ac.in'
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```
4. Now log into `http://localhost:3000/admin.html` with that email and password!

---

## 3. Database Schema Overview

| Table Name | Description | Access Policy (RLS) |
|---|---|---|
| `business_categories` | 8 core shop categories | Public Read / Admin Write |
| `businesses` | Local markets, stationery, repair, salons | Public Read (`is_active = true`) / Admin Write |
| `accommodations` | Rooms, PGs, hostels near Bajidpur | Public Read / Admin Write |
| `food_services` | Tiffin delivery, student mess, canteen | Public Read (`is_active = true`) / Admin Write |
| `academic_resources` | BEU syllabus, notes, PYQs, lab manuals | Public Read / Admin Write |
| `notices` | BEU exam circulars, PMS scholarship | Public Read (`is_published = true`) / Admin Write |
| `reports` | Student inaccuracy reports | Public Insert / Admin Read & Update |
| `submissions` | Peer contribution queue (notes, rooms) | Public Insert / Admin Read & Approve |
| `visit_requests` | In-person room inspection bookings | Public Insert / Admin Read |
| `profiles` | User accounts and role hierarchy | Self Read / Admin Read |

---

## 4. Storage Buckets (Optional for File Uploads)

To allow administrators to upload PDF notes or room photographs:
1. In Supabase Dashboard, go to **Storage** → **New Bucket**.
2. Create bucket `academic-files` (Public: Yes).
3. Create bucket `room-photos` (Public: Yes).
4. Add the following Storage policy:
   - **SELECT:** Allow public read access.
   - **INSERT / UPDATE:** Restricted to authenticated users with `is_admin() = true`.

---

## 5. Offline Fallback Protection

If a visitor opens the website while offline, or if Supabase project credentials have not yet been configured:
- The custom [`HubDatabaseService`](../assets/js/db-service.js) automatically and seamlessly falls back to the frozen seed dataset (`HUB_DATA`).
- Interactive filters, search, SGPA calculators, bookmarks, and emergency numbers continue to work 100% reliably.
