-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Supabase Database Schema (Phase 7)
-- Student Community, Campus Events, Clubs & Societies, Sports & Recreation,
-- and Non-Academic Announcements Board.
-- PostgreSQL DDL with Row Level Security (RLS) & Role-Based Access Control
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Community Events Table
-- Cultural fests, sports tournaments, recreational hackathons, photography,
-- fresher/farewell, and community meetups (Non-academic only).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT,
    cover_image TEXT,
    short_description TEXT NOT NULL,
    full_description TEXT,
    category TEXT NOT NULL CHECK (category IN ('cultural', 'sports', 'tech_recreation', 'arts', 'social_service', 'meetup', 'campus_fest')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    venue TEXT NOT NULL,
    venue_lat NUMERIC(10, 7),
    venue_lng NUMERIC(10, 7),
    organizer_name TEXT NOT NULL,
    organizer_contact TEXT,
    registration_deadline TIMESTAMPTZ,
    registration_type TEXT NOT NULL DEFAULT 'internal' CHECK (registration_type IN ('internal', 'external_link', 'open_walkin')),
    external_registration_url TEXT,
    entry_fee INT NOT NULL DEFAULT 0,
    capacity INT,
    registered_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'approved', 'published', 'cancelled', 'completed')),
    verification_status TEXT NOT NULL DEFAULT 'community_submitted' CHECK (verification_status IN ('verified_council', 'community_submitted', 'unverified')),
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_category ON public.community_events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.community_events(status);
CREATE INDEX IF NOT EXISTS idx_events_start ON public.community_events(start_time);

-- ------------------------------------------------------------------------------
-- 2. Event Registrations Table
-- Authenticated student participation tracking with duplicate prevention constraint.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    attendee_name TEXT NOT NULL,
    attendee_branch TEXT,
    attendee_batch TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_user_registration UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.event_registrations(user_id);

-- ------------------------------------------------------------------------------
-- 3. Student Clubs & Societies Directory Table
-- Non-academic student clubs, cultural societies, hobby & sports groups.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cultural', 'photography', 'sports', 'literary', 'social_service', 'environment', 'entrepreneurship', 'tech_hobby')),
    category_label TEXT NOT NULL,
    icon TEXT,
    description TEXT NOT NULL,
    activities TEXT[] DEFAULT ARRAY[]::TEXT[],
    meeting_location TEXT,
    meeting_schedule TEXT,
    contact_email TEXT,
    contact_social TEXT,
    membership_instructions TEXT,
    verification_status TEXT NOT NULL DEFAULT 'student_group' CHECK (verification_status IN ('verified_council', 'student_group', 'pending_proposal')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    suggested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_clubs_category ON public.student_clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_active ON public.student_clubs(is_active);

-- ------------------------------------------------------------------------------
-- 4. Sports & Recreational Activities Table
-- Casual matches, hostel tournaments, team recruitment & recreational leagues.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sports_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    sport_category TEXT NOT NULL CHECK (sport_category IN ('cricket', 'football', 'badminton', 'volleyball', 'table_tennis', 'athletics', 'chess', 'kabaddi')),
    activity_type TEXT NOT NULL CHECK (activity_type IN ('match', 'tournament', 'team_recruitment', 'practice_session', 'open_recreation')),
    description TEXT NOT NULL,
    venue TEXT NOT NULL,
    schedule_time TIMESTAMPTZ NOT NULL,
    organizer_name TEXT NOT NULL,
    contact_info TEXT,
    required_players INT,
    current_players INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    verification_status TEXT NOT NULL DEFAULT 'community_organized' CHECK (verification_status IN ('verified', 'community_organized')),
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sports_category ON public.sports_activities(sport_category);
CREATE INDEX IF NOT EXISTS idx_sports_status ON public.sports_activities(status);

-- ------------------------------------------------------------------------------
-- 5. Campus-Life Announcements Board Table
-- Community-moderated notices (Lost & found, recruitment, activity reminders).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'club_recruitment', 'lost_found', 'sports', 'cultural', 'reminder')),
    description TEXT NOT NULL,
    submitter_name TEXT NOT NULL,
    submitter_role TEXT NOT NULL DEFAULT 'student',
    contact_info TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'approved', 'published', 'expired', 'hidden', 'rejected')),
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_announcements_cat ON public.community_announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.community_announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_expires ON public.community_announcements(expires_at);

-- ------------------------------------------------------------------------------
-- 6. Seed Data (Realistic Non-Academic Community Content)
-- ------------------------------------------------------------------------------
INSERT INTO public.student_clubs (id, name, category, category_label, icon, description, activities, meeting_location, meeting_schedule, contact_email, contact_social, membership_instructions, verification_status, is_active) VALUES
('club-cultural', 'Natraj Cultural & Performing Arts Society', 'cultural', 'Cultural & Drama', '🎭', 'Student-run cultural society organizing campus street plays, annual fest skits, music ensembles, and folk dance performances.', ARRAY['Skit & Mime Writing', 'Annual Fest Drama', 'Folk & Classical Dance', 'Instrumental Jamming'], 'Open Air Auditorium, Bajidpur Campus', 'Wednesdays & Fridays 5:00 PM', 'cultural.gecskp@gmail.com', '@natraj_gecskp', 'Open to all semesters. Auditions conducted at the beginning of autumn semester.', 'verified_council', true),
('club-photo', 'ShutterCraft Photography & Filmmaking Circle', 'photography', 'Photography & Media', '📸', 'Documenting campus life, engineering projects, Sheikhpura landscapes, photo walks, and short film storytelling.', ARRAY['Campus Event Coverage', 'Weekend Photo Walks', 'Video Editing Workshops', 'Annual Photo Exhibition'], 'Student Activity Room 102, Academic Block', 'Saturdays 3:00 PM', 'shuttercraft.gec@gmail.com', '@shuttercraft_gec', 'Submit 3 best mobile or DSLR photographs to join the group.', 'student_group', true),
('club-sports', 'Shaurya Sports & Athletics Committee', 'sports', 'Sports & Fitness', '🏆', 'Coordinating inter-branch cricket, volleyball tournaments, badminton championships, and campus fitness running clubs.', ARRAY['Inter-Branch Cricket Cup', 'Hostel Volleyball League', 'Morning Running Club', 'Annual Athletic Meet'], 'Bajidpur Campus Sports Pavilion', 'Daily 5:30 PM - 7:00 PM', 'sports.gecskp@gmail.com', '@shaurya_sports_gec', 'Register with your hostel sports captain or meet at the ground at 5:30 PM.', 'verified_council', true),
('club-literary', 'Kalam Debating & Creative Writing Club', 'literary', 'Literary & Debating', '✍️', 'Fostering Hindi & English public speaking, parliamentary debates, poetry recitations, and campus newsletter writing.', ARRAY['Youth Parliamentary Debate', 'Poetry Kavi Sammelan', 'Creative Essay Competitions', 'Wall Magazine Curation'], 'Central Library Seminar Hall', 'Thursdays 4:30 PM', 'kalam.literary@gmail.com', '@kalam_debating', 'Walk in to any weekly open debate session.', 'student_group', true),
('club-green', 'Green Horizon Eco & Social Volunteering Club', 'environment', 'Eco & Social Service', '🌱', 'Leading campus plantation drives, plastic-free campaigns around Bajidpur, blood donation camps, and community teaching.', ARRAY['Tree Plantation in Bajidpur', 'Clean Campus Drive', 'Blood Donation Camp', 'Primary Village Tutoring'], 'Ground Floor Quadrangle', 'Sundays 9:00 AM', 'greenhorizon.gec@gmail.com', '@green_horizon_gec', 'Join the weekend volunteering group by signing up at the student desk.', 'verified_council', true)
ON CONFLICT (id) DO NOTHING;

-- Seed verified community events
INSERT INTO public.community_events (id, title, short_description, full_description, category, start_time, end_time, venue, organizer_name, registration_deadline, registration_type, entry_fee, capacity, registered_count, status, verification_status) VALUES
('e1111111-1111-1111-1111-111111111111', 'Aarohan 2026: Annual Inter-Branch Cultural Fest', 'Grand two-day annual cultural festival featuring dance, music bands, drama, fashion, and art exhibitions.', 'Aarohan 2026 brings together students from all engineering branches for cultural performances, battle of bands, traditional Bihar folk dance, solo singing, and photography exhibitions on the main campus grounds.', 'cultural', '2026-11-14 10:00:00+05:30', '2026-11-15 21:00:00+05:30', 'Main Campus Grounds & Auditorium', 'Student Activity Council & Natraj Club', '2026-11-12 18:00:00+05:30', 'internal', 0, 400, 142, 'published', 'verified_council'),
('e2222222-2222-2222-2222-222222222222', 'Shaurya Cup: Inter-Branch T20 Cricket Championship', 'Annual cricket championship between CSE, CE, EE, ME, ECE, and Mechatronics branches.', 'Knockout T20 cricket tournament played with hard tennis ball on the campus ground. Team rosters must be verified by the branch sports captain.', 'sports', '2026-11-05 08:30:00+05:30', '2026-11-08 17:00:00+05:30', 'Bajidpur Campus Sports Ground', 'Shaurya Sports Committee', '2026-11-03 20:00:00+05:30', 'internal', 0, 120, 84, 'published', 'verified_council'),
('e3333333-3333-3333-3333-333333333333', 'ByteStorm 2026: 24-Hour Campus Hackathon (Recreational)', 'Non-academic competitive coding and hardware tinkering sprint for creative student problem-solving.', 'Build creative student utilities, IoT prototypes, or mobile tools. Strictly an engineering recreational event hosted in the central computing labs.', 'tech_recreation', '2026-11-20 11:00:00+05:30', '2026-11-21 11:00:00+05:30', 'Central Computing Center, Academic Block', 'Coders Circle & CSE Society', '2026-11-18 22:00:00+05:30', 'internal', 0, 60, 38, 'published', 'community_submitted'),
('e4444444-4444-4444-4444-444444444444', 'Green Bajidpur: Campus & Village Tree Plantation Drive', 'Eco-volunteering drive planting 200 saplings along the campus perimeter and Bajidpur link road.', 'Join fellow students on Sunday morning to plant shade and fruit trees around the college boundary. Refreshments and certificates provided for student volunteers.', 'social_service', '2026-11-01 07:30:00+05:30', '2026-11-01 11:30:00+05:30', 'College Main Entrance & Perimeter Road', 'Green Horizon Eco Club', '2026-10-31 18:00:00+05:30', 'internal', 0, 80, 45, 'published', 'verified_council')
ON CONFLICT (id) DO NOTHING;

-- Seed announcements
INSERT INTO public.community_announcements (id, title, category, description, submitter_name, submitter_role, contact_info, is_verified, published_at, expires_at, status) VALUES
('n1111111-1111-1111-1111-111111111111', 'Lost Casio fx-991ES Plus Scientific Calculator in Room 204', 'lost_found', 'Lost a black Casio calculator with blue sticker on the back cover in Room 204 after 3rd period on Monday. If found, please return to CSE 3rd Year desk or drop at guard room.', 'Aman Kumar (CSE 3rd Year)', 'student', 'Available at campus cafeteria in afternoon', true, NOW(), NOW() + INTERVAL '7 days', 'published'),
('n2222222-2222-2222-2222-222222222222', 'Natraj Drama Club Auditions for Aarohan Street Play', 'cultural', 'Calling all actors, scriptwriters, and dholak/cajon players. Auditions will be held on Friday at 5 PM near the open-air stage. No prior acting experience required.', 'Natraj Cultural Society', 'club_coordinator', 'cultural.gecskp@gmail.com', true, NOW(), NOW() + INTERVAL '10 days', 'published'),
('n3333333-3333-3333-3333-333333333333', 'Hostel Badminton Court Floodlight Sparring - Evening 6:30 PM', 'sports', 'Open evening doubles sparring at Boys Hostel badminton court. Bring your own rackets; shuttlecocks provided by committee.', 'Hostel Sports Representative', 'student', 'Ground Floor Hostel Office', true, NOW(), NOW() + INTERVAL '5 days', 'published')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_announcements ENABLE ROW LEVEL SECURITY;

-- 1. Events RLS
DROP POLICY IF EXISTS "Public can view published events" ON public.community_events;
CREATE POLICY "Public can view published events"
    ON public.community_events FOR SELECT
    USING (status IN ('published', 'completed', 'cancelled'));

DROP POLICY IF EXISTS "Authenticated users can submit events" ON public.community_events;
CREATE POLICY "Authenticated users can submit events"
    ON public.community_events FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Admins can manage all events" ON public.community_events;
CREATE POLICY "Admins can manage all events"
    ON public.community_events FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. Event Registrations RLS
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;
CREATE POLICY "Users can view their own registrations"
    ON public.event_registrations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can register themselves" ON public.event_registrations;
CREATE POLICY "Users can register themselves"
    ON public.event_registrations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can cancel their own registrations" ON public.event_registrations;
CREATE POLICY "Users can cancel their own registrations"
    ON public.event_registrations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 3. Student Clubs RLS
DROP POLICY IF EXISTS "Public can view active clubs" ON public.student_clubs;
CREATE POLICY "Public can view active clubs"
    ON public.student_clubs FOR SELECT
    USING (is_active = true AND verification_status IN ('verified_council', 'student_group'));

DROP POLICY IF EXISTS "Authenticated users can suggest clubs" ON public.student_clubs;
CREATE POLICY "Authenticated users can suggest clubs"
    ON public.student_clubs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = suggested_by);

DROP POLICY IF EXISTS "Admins can manage all clubs" ON public.student_clubs;
CREATE POLICY "Admins can manage all clubs"
    ON public.student_clubs FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Sports Activities RLS
DROP POLICY IF EXISTS "Public can view active sports activities" ON public.sports_activities;
CREATE POLICY "Public can view active sports activities"
    ON public.sports_activities FOR SELECT
    USING (status IN ('active', 'completed'));

DROP POLICY IF EXISTS "Authenticated users can submit sports activities" ON public.sports_activities;
CREATE POLICY "Authenticated users can submit sports activities"
    ON public.sports_activities FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Admins can manage all sports activities" ON public.sports_activities;
CREATE POLICY "Admins can manage all sports activities"
    ON public.sports_activities FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Community Announcements RLS
DROP POLICY IF EXISTS "Public can view published and unexpired announcements" ON public.community_announcements;
CREATE POLICY "Public can view published and unexpired announcements"
    ON public.community_announcements FOR SELECT
    USING (status = 'published' AND expires_at > timezone('utc'::text, now()));

DROP POLICY IF EXISTS "Authenticated users can post announcements" ON public.community_announcements;
CREATE POLICY "Authenticated users can post announcements"
    ON public.community_announcements FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Admins can manage all announcements" ON public.community_announcements;
CREATE POLICY "Admins can manage all announcements"
    ON public.community_announcements FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
