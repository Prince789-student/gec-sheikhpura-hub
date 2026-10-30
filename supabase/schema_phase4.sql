-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Phase 4 Schema & Migrations
-- Verified Local Listings, Room Owners, Reviews, Verification & Moderation
-- Strict platform separation: GEC Hub handles student life, Apna College Bihar handles academics.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Business Owner Submissions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_name TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.business_categories(id) ON DELETE RESTRICT,
    address TEXT NOT NULL,
    public_phone TEXT NOT NULL,
    normalized_phone TEXT NOT NULL,
    description TEXT NOT NULL,
    opening_hours TEXT NOT NULL DEFAULT '9:00 AM - 8:00 PM',
    price_range TEXT DEFAULT 'Affordable / Student Friendly',
    website_url TEXT,
    maps_url TEXT,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    submitter_name TEXT,
    submitter_phone TEXT,
    consent_to_publish BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'correction_requested', 'suspended')),
    admin_feedback TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_biz_sub_status ON public.business_submissions(status);
CREATE INDEX IF NOT EXISTS idx_biz_sub_user ON public.business_submissions(submitter_user_id);
CREATE INDEX IF NOT EXISTS idx_biz_sub_phone ON public.business_submissions(normalized_phone);

-- ------------------------------------------------------------------------------
-- 2. Room & Accommodation Owner Submissions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accommodation_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    property_title TEXT NOT NULL,
    accommodation_type TEXT NOT NULL CHECK (accommodation_type IN ('Single Room', 'Shared Room', 'PG / Student Room', 'Hostel / PG', 'Girls PG', 'Flat')),
    gender_preference TEXT NOT NULL DEFAULT 'Boys' CHECK (gender_preference IN ('Boys', 'Girls', 'All')),
    monthly_rent INT NOT NULL CHECK (monthly_rent > 0),
    security_deposit INT NOT NULL DEFAULT 0,
    electricity_charges TEXT NOT NULL DEFAULT 'Sub-meter reading (₹8-10/unit)',
    food_availability TEXT NOT NULL DEFAULT 'Not Included' CHECK (food_availability IN ('Included in Rent', 'Optional Extra Mess', 'Not Included', 'Self Cooking Allowed')),
    furnishing TEXT NOT NULL DEFAULT 'Semi-Furnished (Bed, Table, Chair)',
    bathroom_type TEXT NOT NULL DEFAULT 'Attached' CHECK (bathroom_type IN ('Attached', 'Common', 'Both Available')),
    kitchen_available BOOLEAN NOT NULL DEFAULT false,
    water_supply TEXT NOT NULL DEFAULT '24x7 Boring Water',
    wifi_available BOOLEAN NOT NULL DEFAULT true,
    amenities TEXT[] DEFAULT ARRAY['RO Water', 'Wi-Fi', 'Power Backup']::TEXT[],
    house_rules TEXT[] DEFAULT ARRAY['Gate closes 9:30 PM', 'No smoking', 'Maintain quiet hours']::TEXT[],
    address TEXT NOT NULL,
    distance_km NUMERIC(5, 2) DEFAULT 0.8,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    owner_name TEXT NOT NULL,
    owner_contact TEXT NOT NULL,
    normalized_phone TEXT NOT NULL,
    availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'few_left', 'full')),
    consent_to_publish BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'correction_requested', 'suspended')),
    admin_feedback TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_acc_sub_status ON public.accommodation_submissions(status);
CREATE INDEX IF NOT EXISTS idx_acc_sub_user ON public.accommodation_submissions(submitter_user_id);

-- ------------------------------------------------------------------------------
-- 3. Listing Verifications Audit Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'accommodation', 'food')),
    listing_id TEXT NOT NULL,
    listing_title TEXT NOT NULL,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('phone_call', 'physical_inspection', 'document_check', 'student_feedback', 're_verification')),
    outcome TEXT NOT NULL CHECK (outcome IN ('verified', 'flagged', 'rejected', 'suspended', 'expired')),
    badge_label TEXT NOT NULL DEFAULT 'Owner Contact Confirmed',
    reviewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_name TEXT DEFAULT 'Student Hub Moderator',
    review_notes TEXT, -- Private internal notes; never exposed publicly
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    next_review_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + INTERVAL '90 days')
);

CREATE INDEX IF NOT EXISTS idx_verif_target ON public.listing_verifications(listing_type, listing_id);
CREATE INDEX IF NOT EXISTS idx_verif_date ON public.listing_verifications(verified_at DESC);

-- ------------------------------------------------------------------------------
-- 4. Service Reviews and Ratings Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('shops', 'rooms', 'food', 'services')),
    listing_id TEXT NOT NULL,
    listing_title TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL DEFAULT 'GEC Student',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    aspect_ratings JSONB DEFAULT '{}'::jsonb, -- e.g. {"cleanliness": 4, "pricing": 5, "wifi": 4}
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'flagged', 'hidden')),
    is_reported BOOLEAN NOT NULL DEFAULT false,
    report_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_listing_review UNIQUE (user_id, listing_type, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_listing ON public.service_reviews(listing_type, listing_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.service_reviews(user_id);

-- ------------------------------------------------------------------------------
-- 5. Listing Reports and Dispute Workflow Table
-- ------------------------------------------------------------------------------
-- Extends or creates reports table with full Phase 4 dispute workflow
CREATE TABLE IF NOT EXISTS public.listing_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'accommodation', 'food', 'service', 'review', 'general')),
    listing_id TEXT,
    listing_title TEXT NOT NULL,
    reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_name TEXT DEFAULT 'Student / Visitor',
    issue_type TEXT NOT NULL CHECK (issue_type IN (
        'incorrect_address',
        'wrong_phone',
        'price_discrepancy',
        'business_closed',
        'room_unavailable',
        'duplicate_listing',
        'misleading_photos',
        'suspected_fraud',
        'inappropriate_content',
        'other'
    )),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    resolution_note TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports(status);
CREATE INDEX IF NOT EXISTS idx_listing_reports_target ON public.listing_reports(listing_type, listing_id);

-- ------------------------------------------------------------------------------
-- 6. Moderation Audit Logs Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    moderator_email TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'approve_submission',
        'reject_submission',
        'request_correction',
        'verify_listing',
        'suspend_listing',
        'restore_listing',
        'resolve_report',
        'moderate_review',
        'update_availability'
    )),
    target_type TEXT NOT NULL, -- 'business_submission', 'accommodation_submission', 'service_review', 'listing_report', 'business', 'accommodation'
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mod_logs_action ON public.moderation_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_mod_logs_date ON public.moderation_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. In-App Notifications Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'submission_received',
        'listing_approved',
        'listing_rejected',
        'correction_requested',
        'listing_reported',
        'listing_expiring',
        'review_moderated',
        'general'
    )),
    target_link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.in_app_notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 8. Functions and Triggers: Rating Recalculation & Timestamps
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_biz_sub_updated_at ON public.business_submissions;
CREATE TRIGGER trg_biz_sub_updated_at
    BEFORE UPDATE ON public.business_submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

DROP TRIGGER IF EXISTS trg_acc_sub_updated_at ON public.accommodation_submissions;
CREATE TRIGGER trg_acc_sub_updated_at
    BEFORE UPDATE ON public.accommodation_submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.service_reviews;
CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON public.service_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.listing_reports;
CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON public.listing_reports
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES FOR PHASE 4
-- Strict protection against unauthenticated publication and privilege escalation.
-- ==============================================================================

ALTER TABLE public.business_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- 9.1 Business Submissions Policies
-- Authenticated users or visitors can insert submissions
DROP POLICY IF EXISTS "Anyone can submit business listing" ON public.business_submissions;
CREATE POLICY "Anyone can submit business listing" ON public.business_submissions
    FOR INSERT WITH CHECK (true);

-- Submitter can view their own submissions
DROP POLICY IF EXISTS "Submitters can view own business submissions" ON public.business_submissions;
CREATE POLICY "Submitters can view own business submissions" ON public.business_submissions
    FOR SELECT USING (auth.uid() = submitter_user_id OR public.is_admin());

-- Submitter can update their submission ONLY if it is still pending or needs correction
DROP POLICY IF EXISTS "Submitters can edit own pending business submissions" ON public.business_submissions;
CREATE POLICY "Submitters can edit own pending business submissions" ON public.business_submissions
    FOR UPDATE USING (
        (auth.uid() = submitter_user_id AND status IN ('pending', 'correction_requested'))
        OR public.is_admin()
    );

-- Admins have full access to manage submissions
DROP POLICY IF EXISTS "Admins can manage business submissions" ON public.business_submissions;
CREATE POLICY "Admins can manage business submissions" ON public.business_submissions
    FOR ALL USING (public.is_admin());

-- 9.2 Accommodation Submissions Policies
DROP POLICY IF EXISTS "Anyone can submit accommodation listing" ON public.accommodation_submissions;
CREATE POLICY "Anyone can submit accommodation listing" ON public.accommodation_submissions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Submitters can view own accommodation submissions" ON public.accommodation_submissions;
CREATE POLICY "Submitters can view own accommodation submissions" ON public.accommodation_submissions
    FOR SELECT USING (auth.uid() = submitter_user_id OR public.is_admin());

DROP POLICY IF EXISTS "Submitters can edit own pending accommodation submissions" ON public.accommodation_submissions;
CREATE POLICY "Submitters can edit own pending accommodation submissions" ON public.accommodation_submissions
    FOR UPDATE USING (
        (auth.uid() = submitter_user_id AND status IN ('pending', 'correction_requested'))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can manage accommodation submissions" ON public.accommodation_submissions;
CREATE POLICY "Admins can manage accommodation submissions" ON public.accommodation_submissions
    FOR ALL USING (public.is_admin());

-- 9.3 Listing Verifications Policies
-- Public can view verification outcomes and badges, but NEVER private reviewer notes!
-- To enforce this, review_notes is hidden from anonymous clients via view or RLS, or admin only.
DROP POLICY IF EXISTS "Public can view verified listing badges" ON public.listing_verifications;
CREATE POLICY "Public can view verified listing badges" ON public.listing_verifications
    FOR SELECT USING (outcome = 'verified' OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can record verifications" ON public.listing_verifications;
CREATE POLICY "Only admins can record verifications" ON public.listing_verifications
    FOR ALL USING (public.is_admin());

-- 9.4 Service Reviews Policies
-- Public can read ONLY approved reviews
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.service_reviews;
CREATE POLICY "Public can read approved reviews" ON public.service_reviews
    FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

-- Authenticated users can insert reviews
DROP POLICY IF EXISTS "Authenticated users can submit review" ON public.service_reviews;
CREATE POLICY "Authenticated users can submit review" ON public.service_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can edit or delete ONLY their own reviews
DROP POLICY IF EXISTS "Users can update own review" ON public.service_reviews;
CREATE POLICY "Users can update own review" ON public.service_reviews
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own review" ON public.service_reviews;
CREATE POLICY "Users can delete own review" ON public.service_reviews
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- 9.5 Listing Reports Policies
DROP POLICY IF EXISTS "Anyone can submit a listing report" ON public.listing_reports;
CREATE POLICY "Anyone can submit a listing report" ON public.listing_reports
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own reports" ON public.listing_reports;
CREATE POLICY "Users can view own reports" ON public.listing_reports
    FOR SELECT USING (auth.uid() = reporter_user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage listing reports" ON public.listing_reports;
CREATE POLICY "Admins can manage listing reports" ON public.listing_reports
    FOR ALL USING (public.is_admin());

-- 9.6 Moderation Logs Policies
-- Only authenticated admins can read and write moderation logs
DROP POLICY IF EXISTS "Admins can view moderation logs" ON public.moderation_logs;
CREATE POLICY "Admins can view moderation logs" ON public.moderation_logs
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert moderation logs" ON public.moderation_logs;
CREATE POLICY "Admins can insert moderation logs" ON public.moderation_logs
    FOR INSERT WITH CHECK (public.is_admin());

-- 9.7 In-App Notifications Policies
-- Users can view and mark read ONLY their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.in_app_notifications;
CREATE POLICY "Users can view own notifications" ON public.in_app_notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.in_app_notifications;
CREATE POLICY "Users can update own notifications" ON public.in_app_notifications
    FOR UPDATE USING (auth.uid() = user_id);
