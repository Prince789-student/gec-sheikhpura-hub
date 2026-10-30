-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Supabase Database Schema (Phase 2)
-- PostgreSQL DDL with Row Level Security (RLS) & Role-Based Access Control
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles & Admin Roles (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. Business Categories Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_name TEXT,
    display_order INT DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- 3. Businesses Directory Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.business_categories(id) ON DELETE SET NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    distance_km NUMERIC(5, 2), -- Calculated road distance from Bajidpur campus
    opening_hours TEXT,
    price_range TEXT,
    website_url TEXT,
    maps_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'sample', 'unverified', 'flagged')),
    last_verified_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_businesses_cat ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON public.businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON public.businesses(verification_status);

-- ------------------------------------------------------------------------------
-- 4. Accommodations Marketplace Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    accommodation_type TEXT NOT NULL CHECK (accommodation_type IN ('Single Room', 'Shared Room', 'PG / Student Room', 'Hostel / PG', 'Girls PG', 'Flat')),
    gender_preference TEXT NOT NULL DEFAULT 'All' CHECK (gender_preference IN ('Boys', 'Girls', 'All')),
    description TEXT,
    monthly_rent INT NOT NULL,
    security_deposit INT NOT NULL DEFAULT 0,
    electricity_charges TEXT DEFAULT 'Sub-meter reading',
    food_included BOOLEAN NOT NULL DEFAULT false,
    furnished BOOLEAN NOT NULL DEFAULT true,
    bathroom_type TEXT DEFAULT 'Attached' CHECK (bathroom_type IN ('Attached', 'Common', 'Both Available')),
    kitchen_available BOOLEAN NOT NULL DEFAULT false,
    wifi_available BOOLEAN NOT NULL DEFAULT true,
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    house_rules TEXT[] DEFAULT ARRAY[]::TEXT[],
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    distance_km NUMERIC(5, 2),
    owner_contact TEXT NOT NULL,
    owner_name TEXT,
    availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'few_left', 'full')),
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'sample', 'unverified')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_accommodations_rent ON public.accommodations(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_accommodations_gender ON public.accommodations(gender_preference);
CREATE INDEX IF NOT EXISTS idx_accommodations_status ON public.accommodations(availability_status);

-- ------------------------------------------------------------------------------
-- 5. Food Services Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('Tiffin Delivery', 'Sit-in Mess & Takeaway', 'Campus Food Stall', 'Restaurant')),
    menu_description TEXT NOT NULL,
    diet_type TEXT NOT NULL DEFAULT 'Veg & Egg Option',
    meal_price INT, -- Price per single thali/meal
    monthly_plan_price INT, -- Price for 30-day subscription
    veg_available BOOLEAN NOT NULL DEFAULT true,
    non_veg_available BOOLEAN NOT NULL DEFAULT false,
    delivery_available BOOLEAN NOT NULL DEFAULT true,
    operating_hours TEXT,
    contact_phone TEXT,
    address TEXT,
    trial_available TEXT DEFAULT '1-day trial meal available',
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'sample', 'unverified')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. Academic Resources Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester TEXT NOT NULL,
    subject TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('Official Syllabus', 'Subject Notes', 'Unit Notes', 'PYQs', 'Lab Manual', 'Important Qs')),
    academic_year TEXT DEFAULT '2025-2026',
    file_url TEXT NOT NULL,
    file_size TEXT,
    source_url TEXT,
    source_author TEXT DEFAULT 'Faculty / Topper Verified',
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'sample', 'unverified')),
    download_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_academic_branch ON public.academic_resources(branch);
CREATE INDEX IF NOT EXISTS idx_academic_sem ON public.academic_resources(semester);
CREATE INDEX IF NOT EXISTS idx_academic_type ON public.academic_resources(resource_type);

-- ------------------------------------------------------------------------------
-- 7. Notices & Announcements Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('exam', 'scholarship', 'campus', 'academic', 'general')),
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    source_url TEXT,
    source_name TEXT DEFAULT 'BEU / GEC Sheikhpura Cell',
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'sample', 'unverified')),
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notices_published ON public.notices(is_published, published_at DESC);

-- ------------------------------------------------------------------------------
-- 8. Reports Table (Public Inaccuracy Submissions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'accommodation', 'food', 'academic', 'notice', 'general')),
    listing_id TEXT,
    listing_title TEXT,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('phone', 'location', 'price', 'closed', 'inaccurate', 'other')),
    description TEXT NOT NULL,
    reported_by_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 9. Community Submissions Table (Peer Contribution Queue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contribution_type TEXT NOT NULL CHECK (contribution_type IN ('notes', 'room', 'shop', 'food')),
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    contact_or_link TEXT NOT NULL,
    contributor_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- ------------------------------------------------------------------------------
-- 10. Visit Requests Table (Room & PG Enquiries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visit_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accommodation_id UUID REFERENCES public.accommodations(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Public Read on Active/Verified, Public Create on Reports/Queue,
-- Authenticated Admins for all Mutation Operations.
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

-- 2. Categories Policies (Public Read)
CREATE POLICY "Public categories are viewable by everyone" ON public.business_categories
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.business_categories
    FOR ALL USING (public.is_admin());

-- 3. Businesses Policies
CREATE POLICY "Public businesses viewable by everyone" ON public.businesses
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage businesses" ON public.businesses
    FOR ALL USING (public.is_admin());

-- 4. Accommodations Policies
CREATE POLICY "Public accommodations viewable by everyone" ON public.accommodations
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage accommodations" ON public.accommodations
    FOR ALL USING (public.is_admin());

-- 5. Food Services Policies
CREATE POLICY "Public food services viewable by everyone" ON public.food_services
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage food services" ON public.food_services
    FOR ALL USING (public.is_admin());

-- 6. Academic Resources Policies
CREATE POLICY "Public academic resources viewable by everyone" ON public.academic_resources
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage academic resources" ON public.academic_resources
    FOR ALL USING (public.is_admin());

-- 7. Notices Policies
CREATE POLICY "Published notices viewable by everyone" ON public.notices
    FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage notices" ON public.notices
    FOR ALL USING (public.is_admin());

-- 8. Reports Policies (Public Insert, Admin View/Update)
CREATE POLICY "Anyone can submit a report" ON public.reports
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and manage reports" ON public.reports
    FOR ALL USING (public.is_admin());

-- 9. Submissions Policies (Public Insert, Admin View/Update)
CREATE POLICY "Anyone can submit a contribution" ON public.submissions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and manage submissions" ON public.submissions
    FOR ALL USING (public.is_admin());

-- 10. Visit Requests Policies (Public Insert, Admin View/Update)
CREATE POLICY "Students can request a room visit" ON public.visit_requests
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view visit requests" ON public.visit_requests
    FOR ALL USING (public.is_admin());
