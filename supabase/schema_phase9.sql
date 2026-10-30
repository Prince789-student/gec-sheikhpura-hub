-- ============================================================================
-- GEC Sheikhpura Student Life Hub - Phase 9 Database Schema
-- Student Feedback System, Privacy Hardening & Final Launch Readiness
-- ============================================================================

-- 1. Student Feedback Table
-- Stores user-submitted feedback, missing local services, corrections, and usability reports.
CREATE TABLE IF NOT EXISTS public.student_feedback (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'missing_service',
    'incorrect_details',
    'room_availability',
    'map_location',
    'marketplace_issue',
    'event_info',
    'accessibility',
    'bug_broken',
    'feature_suggestion'
  )),
  description TEXT NOT NULL,
  related_page_or_listing VARCHAR(255),
  contact_info VARCHAR(150), -- Optional student email or phone; never shared publicly
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance Indexes for Feedback Queue Lookups
CREATE INDEX IF NOT EXISTS idx_student_feedback_status_created 
ON public.student_feedback(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_feedback_category 
ON public.student_feedback(category, created_at DESC);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;

-- Allow any student or visitor (authenticated or anonymous) to submit feedback
CREATE POLICY "Public and students can submit feedback" 
ON public.student_feedback 
FOR INSERT 
WITH CHECK (true);

-- Protect student privacy: feedback submissions are private and viewable only by authorized administrators/moderators
CREATE POLICY "Only administrators can view student feedback" 
ON public.student_feedback 
FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.student_profiles 
    WHERE student_profiles.id = auth.uid() 
    AND student_profiles.role IN ('admin', 'moderator')
  )
);

-- Only authorized administrators/moderators can update feedback status or add resolution notes
CREATE POLICY "Only administrators can update student feedback" 
ON public.student_feedback 
FOR UPDATE 
USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.student_profiles 
    WHERE student_profiles.id = auth.uid() 
    AND student_profiles.role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.student_profiles 
    WHERE student_profiles.id = auth.uid() 
    AND student_profiles.role IN ('admin', 'moderator')
  )
);

COMMENT ON TABLE public.student_feedback IS 'Phase 9 student feedback, missing service requests, and quality reports.';
