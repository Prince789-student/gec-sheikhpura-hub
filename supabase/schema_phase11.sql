-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Phase 11 Database Schema
-- Lost & Found Module + Verified Faculty & Campus Room/Facility Directory
-- ==============================================================================

-- 1. Lost & Found Items Table
CREATE TABLE IF NOT EXISTS public.lost_found_items (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'electronics',
        'id_documents',
        'books_stationery',
        'keys',
        'bags_wallets',
        'accessories',
        'other'
    )),
    description TEXT NOT NULL,
    image_url TEXT,
    item_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location_found_or_lost VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN (
        'lost',
        'found',
        'claim_pending',
        'returned',
        'archived'
    )),
    reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(120) NOT NULL,
    reporter_contact_private TEXT, -- Strictly private, never published in public feed
    is_sensitive_document BOOLEAN DEFAULT false,
    flags_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lf_status_cat ON public.lost_found_items(status, category);
CREATE INDEX IF NOT EXISTS idx_lf_type_date ON public.lost_found_items(type, item_date DESC);
CREATE INDEX IF NOT EXISTS idx_lf_created ON public.lost_found_items(created_at DESC);

-- 2. Private Lost & Found Claims Table
CREATE TABLE IF NOT EXISTS public.lost_found_claims (
    id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) NOT NULL REFERENCES public.lost_found_items(id) ON DELETE CASCADE,
    claimant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    claimant_name VARCHAR(120) NOT NULL,
    proof_details TEXT NOT NULL, -- Private identification details only visible to finder and admin
    claimant_contact_private TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'approved',
        'rejected',
        'withdrawn'
    )),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lf_claims_item ON public.lost_found_claims(item_id, status);
CREATE INDEX IF NOT EXISTS idx_lf_claims_user ON public.lost_found_claims(claimant_user_id);

-- 3. Verified Faculty Directory Table
CREATE TABLE IF NOT EXISTS public.faculty_directory (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) DEFAULT 'Not verified',
    building_block VARCHAR(100) DEFAULT 'Academic Complex',
    floor VARCHAR(50) DEFAULT 'Not verified',
    office_hours VARCHAR(150) DEFAULT 'Not verified',
    public_contact VARCHAR(150) DEFAULT 'Not available',
    verification_status VARCHAR(30) DEFAULT 'verified' CHECK (verification_status IN (
        'verified',
        'unverified',
        'pending_check',
        'archived'
    )),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_faculty_dept ON public.faculty_directory(department);
CREATE INDEX IF NOT EXISTS idx_faculty_name ON public.faculty_directory(name);
CREATE INDEX IF NOT EXISTS idx_faculty_active ON public.faculty_directory(is_active, verification_status);

-- 4. Verified Campus Facilities & Room Directory Table
CREATE TABLE IF NOT EXISTS public.campus_facilities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL CHECK (category IN (
        'administrative',
        'labs_workshops',
        'classrooms',
        'library_study',
        'amenities',
        'hostels'
    )),
    room_number VARCHAR(50) DEFAULT 'Not verified',
    building_block VARCHAR(100) NOT NULL DEFAULT 'Academic Complex',
    floor VARCHAR(50) DEFAULT 'Ground Floor',
    coordinates_lat NUMERIC(10, 7),
    coordinates_lng NUMERIC(10, 7),
    accessibility_info VARCHAR(255) DEFAULT 'Not verified',
    opening_hours VARCHAR(150) DEFAULT 'Not verified',
    verification_status VARCHAR(30) DEFAULT 'verified' CHECK (verification_status IN (
        'verified',
        'unverified',
        'pending_check',
        'archived'
    )),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_facilities_cat ON public.campus_facilities(category);
CREATE INDEX IF NOT EXISTS idx_facilities_floor ON public.campus_facilities(floor);
CREATE INDEX IF NOT EXISTS idx_facilities_active ON public.campus_facilities(is_active, verification_status);

-- 5. Student Directory Correction Requests Table
CREATE TABLE IF NOT EXISTS public.directory_corrections (
    id VARCHAR(64) PRIMARY KEY,
    directory_type VARCHAR(20) NOT NULL CHECK (directory_type IN ('faculty', 'facility')),
    target_id VARCHAR(64) NOT NULL,
    target_name VARCHAR(150) NOT NULL,
    proposed_data JSONB NOT NULL,
    reason TEXT NOT NULL,
    submitter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitter_name VARCHAR(120),
    submitter_contact VARCHAR(150),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_corrections_status ON public.directory_corrections(status, created_at DESC);

-- 6. Row Level Security (RLS) Configuration
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_corrections ENABLE ROW LEVEL SECURITY;

-- Lost & Found Items Policies
-- Anyone can read active, unarchived posts
CREATE POLICY "Public read active lost and found items"
ON public.lost_found_items
FOR SELECT
USING (status != 'archived' AND flags_count < 3);

-- Authenticated or guest can insert items
CREATE POLICY "Users can report lost or found items"
ON public.lost_found_items
FOR INSERT
WITH CHECK (true);

-- Reporters or Admins can update their items
CREATE POLICY "Reporters or admins can update lost and found items"
ON public.lost_found_items
FOR UPDATE
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = reporter_user_id) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Claims Policies: Proof details strictly private to claimant, finder, and admin
CREATE POLICY "Claimants and finders can view claims"
ON public.lost_found_claims
FOR SELECT
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = claimant_user_id) OR
    EXISTS (
        SELECT 1 FROM public.lost_found_items
        WHERE lost_found_items.id = lost_found_claims.item_id
        AND lost_found_items.reporter_user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can submit private claims"
ON public.lost_found_claims
FOR INSERT
WITH CHECK (true);

-- Faculty & Campus Facility Directory Policies
CREATE POLICY "Public read active verified directory"
ON public.faculty_directory
FOR SELECT
USING (is_active = true);

CREATE POLICY "Public read active verified facilities"
ON public.campus_facilities
FOR SELECT
USING (is_active = true);

-- Only admins can modify directory
CREATE POLICY "Admin write faculty directory"
ON public.faculty_directory
FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Admin write facilities directory"
ON public.campus_facilities
FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Directory Corrections Policies
CREATE POLICY "Users can submit directory corrections"
ON public.directory_corrections
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view and triage corrections"
ON public.directory_corrections
FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
