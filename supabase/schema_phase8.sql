-- ============================================================================
-- GEC Sheikhpura Student Life Hub - Phase 8 Database Schema
-- Notifications, Performance Indexes, Privacy-Conscious Analytics & RLS Hardening
-- ============================================================================

-- 1. Notification Preferences Extension on Student Profiles
ALTER TABLE IF EXISTS public.student_profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_updates": false,
  "listing_alerts": true,
  "event_reminders": true,
  "marketplace_enquiries": true,
  "browser_push": false
}'::jsonb;

-- 2. Performance Compound Indexes for High-Frequency Query Paths
-- ----------------------------------------------------------------------------
-- Speed up in-app notification queries & unread count badge lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.in_app_notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.in_app_notifications(user_id, created_at DESC);

-- Speed up marketplace multi-filter (status, category, price)
CREATE INDEX IF NOT EXISTS idx_marketplace_status_cat_created 
ON public.marketplace_listings(status, category_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_status_price 
ON public.marketplace_listings(status, price);

-- Speed up upcoming campus events filtering
CREATE INDEX IF NOT EXISTS idx_events_active_start 
ON public.community_events(is_active, start_time);

CREATE INDEX IF NOT EXISTS idx_events_category_active 
ON public.community_events(category, is_active);

-- Speed up event registrations lookups and capacity checks
CREATE INDEX IF NOT EXISTS idx_event_reg_event_user 
ON public.event_registrations(event_id, user_id);

-- Speed up local business & room directory verified status queries
CREATE INDEX IF NOT EXISTS idx_businesses_cat_verified 
ON public.businesses(category, is_verified);

CREATE INDEX IF NOT EXISTS idx_accommodations_type_verified 
ON public.accommodations(accommodation_type, is_verified);

-- Speed up moderation reports & dispute queue lookups
CREATE INDEX IF NOT EXISTS idx_reports_status_created 
ON public.listing_reports(status, created_at DESC);

-- Speed up moderation audit trail lookups
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target 
ON public.moderation_logs(target_type, target_id);

-- 3. Row Level Security (RLS) Policy Hardening
-- ----------------------------------------------------------------------------
-- Notifications: Strictly isolate private notifications to owning user
ALTER TABLE IF EXISTS public.in_app_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.in_app_notifications;
CREATE POLICY "Users can view own notifications" 
ON public.in_app_notifications
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.in_app_notifications;
CREATE POLICY "Users can update own notifications" 
ON public.in_app_notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Event Registrations: Attendee privacy protection
ALTER TABLE IF EXISTS public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view confirmed attendee counts without PII" ON public.event_registrations;
-- Users can view their own passes; public visitor queries only retrieve aggregated counts
DROP POLICY IF EXISTS "Users can view own registration passes" ON public.event_registrations;
CREATE POLICY "Users can view own registration passes" 
ON public.event_registrations
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can cancel own registration passes" ON public.event_registrations;
CREATE POLICY "Users can cancel own registration passes" 
ON public.event_registrations
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Privacy-Preserving Admin Analytics View
-- ----------------------------------------------------------------------------
-- Provides pre-aggregated counts without exposing raw user records or PII
CREATE OR REPLACE VIEW public.v_platform_aggregate_metrics AS
SELECT
  (SELECT COUNT(*) FROM public.businesses WHERE is_verified = true) AS published_businesses_count,
  (SELECT COUNT(*) FROM public.accommodations WHERE is_verified = true) AS published_accommodations_count,
  (SELECT COUNT(*) FROM public.marketplace_listings WHERE status = 'available') AS available_marketplace_items,
  (SELECT COUNT(*) FROM public.marketplace_listings WHERE status = 'sold') AS sold_marketplace_items,
  (SELECT COUNT(*) FROM public.community_events WHERE is_active = true AND start_time >= NOW()) AS upcoming_events_count,
  (SELECT COUNT(*) FROM public.student_clubs WHERE is_active = true) AS active_clubs_count,
  (SELECT COUNT(*) FROM public.listing_reports WHERE status IN ('pending', 'investigating')) AS pending_reports_count,
  NOW() AS metrics_calculated_at;

-- Restrict view to service role and authenticated administrators
REVOKE ALL ON public.v_platform_aggregate_metrics FROM anon, authenticated;
GRANT SELECT ON public.v_platform_aggregate_metrics TO service_role;
