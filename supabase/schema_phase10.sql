-- ============================================================================
-- GEC Sheikhpura Student Life Hub - Phase 10 Database Schema
-- Continuous Improvement, Freshness Tracking, Scalability & Automation
-- ============================================================================

-- 1. Student Feedback Schema Evolution
-- Extend status values to product lifecycle: pending, reviewing, planned, in_progress, completed, declined
ALTER TABLE IF EXISTS public.student_feedback
DROP CONSTRAINT IF EXISTS student_feedback_category_check;

ALTER TABLE IF EXISTS public.student_feedback
DROP CONSTRAINT IF EXISTS student_feedback_status_check;

ALTER TABLE IF EXISTS public.student_feedback
ADD CONSTRAINT student_feedback_status_check CHECK (status IN (
  'pending',
  'reviewing',
  'planned',
  'in_progress',
  'completed',
  'declined',
  -- Backwards compatibility with Phase 9
  'under_review',
  'resolved',
  'rejected'
));

-- Add public-facing resolution summary and submitting user ID
ALTER TABLE IF EXISTS public.student_feedback
ADD COLUMN IF NOT EXISTS resolution_summary TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Data Freshness & Listing Maintenance Metadata
ALTER TABLE IF EXISTS public.businesses
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS review_status VARCHAR(30) DEFAULT 'fresh' CHECK (review_status IN ('fresh', 'due_for_check', 'stale', 'archived'));

ALTER TABLE IF EXISTS public.accommodations
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS review_status VARCHAR(30) DEFAULT 'fresh' CHECK (review_status IN ('fresh', 'due_for_check', 'stale', 'archived'));

ALTER TABLE IF EXISTS public.marketplace_listings
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Self-Service Account Deletion Requests Table
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT,
  status VARCHAR(30) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'executed', 'cancelled')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own deletion requests" 
ON public.account_deletion_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deletion requests" 
ON public.account_deletion_requests 
FOR SELECT 
USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- 4. High-Performance Compound Scalability Indexes
-- Accelerate feedback triage by status & category
CREATE INDEX IF NOT EXISTS idx_feedback_status_cat_created 
ON public.student_feedback(status, category, created_at DESC);

-- Accelerate stale listing audit queries
CREATE INDEX IF NOT EXISTS idx_businesses_freshness_verified 
ON public.businesses(review_status, last_verified_at ASC);

CREATE INDEX IF NOT EXISTS idx_accommodations_freshness_verified 
ON public.accommodations(review_status, last_verified_at ASC);

-- Accelerate marketplace inactivity pruning
CREATE INDEX IF NOT EXISTS idx_marketplace_status_activity 
ON public.marketplace_listings(status, last_activity_at DESC);

-- 5. RLS Policy Hardening: Student Self-Service Feedback View
-- Allow students to read the status and resolution summary of feedback they submitted
CREATE POLICY "Students can view their own submitted feedback" 
ON public.student_feedback 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.jwt() ->> 'role' = 'service_role' OR 
  EXISTS (
    SELECT 1 FROM public.student_profiles 
    WHERE student_profiles.id = auth.uid() 
    AND student_profiles.role IN ('admin', 'moderator')
  )
);

COMMENT ON TABLE public.account_deletion_requests IS 'Phase 10 GDPR/Privacy self-service account deletion queue.';
