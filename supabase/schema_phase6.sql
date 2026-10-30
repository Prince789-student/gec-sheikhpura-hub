-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Supabase Database Schema (Phase 6)
-- Advanced Maps, Geospatial Reference Points, Verified Coordinates & PWA Metadata
-- PostgreSQL DDL with Row Level Security (RLS) & Role-Based Access Control
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Location Reference Points Table
-- Stores official campus reference points (e.g. Bajidpur Main Gate) and key
-- transit nodes used for calculating straight-line distances and route hints.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.location_references (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    verified_accuracy TEXT NOT NULL DEFAULT 'exact_gps' CHECK (verified_accuracy IN ('exact_gps', 'campus_gate', 'survey_bench')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed verified reference points
INSERT INTO public.location_references (id, name, description, latitude, longitude, address, is_default, is_active, verified_accuracy) VALUES
('gec_main_gate', 'GEC Sheikhpura - Bajidpur Main Gate', 'Official campus entrance for all student access and distance measurements.', 25.1380, 85.8640, 'Bajidpur, Near Police Line, Sheikhpura, Bihar 811105', true, true, 'campus_gate'),
('gec_academic_block', 'GEC Sheikhpura - Academic Building Complex', 'Ground zero of administrative & classroom blocks.', 25.1382, 85.8643, 'Academic Block, GEC Sheikhpura Campus, Bajidpur', false, true, 'exact_gps'),
('sheikhpura_railway_station', 'Sheikhpura Railway Station (SHK)', 'Primary railway junction connecting Patna, Gaya, and Kiul.', 25.1480, 85.8550, 'Station Road, Sheikhpura, Bihar 811105', false, true, 'exact_gps'),
('sheikhpura_bus_stand', 'Sheikhpura Bus Terminal (Chandi Mor & Bypass)', 'Main regional bus depot for Patna, Bihar Sharif, and Nawada buses.', 25.1440, 85.8610, 'Bypass Road, Sheikhpura, Bihar', false, true, 'exact_gps'),
('thana_chowk', 'Thana Chowk Market Center', 'Central hub for banking, emergency services, and Sheikhpura town market.', 25.1430, 85.8595, 'Thana Chowk, Sheikhpura, Bihar', false, true, 'exact_gps')
ON CONFLICT (id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    address = EXCLUDED.address,
    updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 2. Coordinate Verification Audit Columns on Existing Tables
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.businesses
    ADD COLUMN IF NOT EXISTS coordinate_accuracy TEXT DEFAULT 'street_approximate' CHECK (coordinate_accuracy IN ('exact_gps', 'street_approximate', 'unverified')),
    ADD COLUMN IF NOT EXISTS coordinate_verified_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS coordinate_verified_by UUID REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.accommodations
    ADD COLUMN IF NOT EXISTS coordinate_accuracy TEXT DEFAULT 'street_approximate' CHECK (coordinate_accuracy IN ('exact_gps', 'street_approximate', 'unverified')),
    ADD COLUMN IF NOT EXISTS coordinate_verified_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS coordinate_verified_by UUID REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.food_services
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS coordinate_accuracy TEXT DEFAULT 'street_approximate' CHECK (coordinate_accuracy IN ('exact_gps', 'street_approximate', 'unverified')),
    ADD COLUMN IF NOT EXISTS coordinate_verified_at TIMESTAMPTZ DEFAULT NOW();

-- Update seeded coordinates for food services if null
UPDATE public.food_services
SET latitude = 25.1370, longitude = 85.8632, coordinate_accuracy = 'street_approximate'
WHERE id = 'f1111111-1111-1111-1111-111111111111' AND latitude IS NULL;

UPDATE public.food_services
SET latitude = 25.1372, longitude = 85.8628, coordinate_accuracy = 'street_approximate'
WHERE id = 'f2222222-2222-2222-2222-222222222222' AND latitude IS NULL;

UPDATE public.food_services
SET latitude = 25.1380, longitude = 85.8640, coordinate_accuracy = 'exact_gps'
WHERE id = 'f3333333-3333-3333-3333-333333333333' AND latitude IS NULL;

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS) for Location References
-- ------------------------------------------------------------------------------
ALTER TABLE public.location_references ENABLE ROW LEVEL SECURITY;

-- Public can read active location reference points
DROP POLICY IF EXISTS "Public can view active reference points" ON public.location_references;
CREATE POLICY "Public can view active reference points"
    ON public.location_references
    FOR SELECT
    USING (is_active = true);

-- Only authenticated administrators can modify location reference points
DROP POLICY IF EXISTS "Admins can manage reference points" ON public.location_references;
CREATE POLICY "Admins can manage reference points"
    ON public.location_references
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. Audit Log Helper for Location Updates
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_location_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (OLD.latitude IS DISTINCT FROM NEW.latitude OR OLD.longitude IS DISTINCT FROM NEW.longitude) THEN
        INSERT INTO public.moderation_logs (
            moderator_id,
            action,
            target_type,
            target_id,
            details
        ) VALUES (
            auth.uid(),
            'update_coordinates',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            jsonb_build_object(
                'old_lat', OLD.latitude,
                'old_lng', OLD.longitude,
                'new_lat', NEW.latitude,
                'new_lng', NEW.longitude,
                'accuracy', NEW.coordinate_accuracy
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments explaining the schema
COMMENT ON TABLE public.location_references IS 'Verified campus entrance and city transit landmarks used for geographic distance calculation.';
COMMENT ON COLUMN public.businesses.coordinate_accuracy IS 'Precision tier of geographic location: exact_gps, street_approximate, or unverified.';
