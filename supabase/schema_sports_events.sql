-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Master Database Schema
-- COMPLETE SPORTS, EVENTS & TOURNAMENT MANAGEMENT SYSTEM
-- Integrated Modules:
-- 1. Student Events Management
-- 2. Sports & Squad Management (Team, Athletics, Individual, Indoor)
-- 3. Tournament & Manual Match Management (Scoring Engines, Timers, Tie Resolution, Standings)
-- 4. Cultural Competitions Management (Multi-Criteria Evaluation, Judging, Ranks)
-- 5. Shared Infrastructure (Audit Logs, Realtime Notifications, Documents)
-- PostgreSQL DDL with Row Level Security (RLS) & Constraints
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- MODULE A: STUDENT EVENTS MANAGEMENT
-- ------------------------------------------------------------------------------

-- Event Categories
CREATE TABLE IF NOT EXISTS public.event_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.event_categories (id, name, description, icon, is_active) VALUES
('technical', 'Technical & Hackathons', 'Coding sprints, robotics, circuit design & workshops', '💻', true),
('cultural', 'Cultural & Arts', 'Drama, dance, music, photography and campus festivals', '🎭', true),
('sports', 'Sports & Athletics', 'Inter-branch tournaments, athletics meets, sports sparring', '🏆', true),
('academic', 'Academic & Career', 'Guest lectures, alumni interactions, GATE preparation', '📚', true),
('workshop', 'Skill Workshops', 'Hands-on practical training and certified bootcamps', '🛠️', true),
('seminar', 'Seminars & Talks', 'Faculty presentations and industry expert discussions', '🎤', true),
('competition', 'Competitions', 'Intra and inter-college contests & challenges', '🎯', true),
('festival', 'Campus Festivals', 'Annual fest, freshers welcome, farewell gatherings', '🎉', true),
('other', 'Special Initiatives', 'Social service, tree plantation and environmental drives', '🌱', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Core Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.event_categories(id),
    poster_url TEXT,
    venue TEXT NOT NULL,
    venue_details TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reg_start_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reg_deadline TIMESTAMPTZ NOT NULL,
    max_participants INT,
    registered_count INT NOT NULL DEFAULT 0,
    event_rules TEXT,
    required_resources TEXT,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    event_head_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_head_name TEXT NOT NULL,
    event_head_reg_no TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled', 'postponed')),
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_category_id ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events(status, start_date);
CREATE INDEX IF NOT EXISTS idx_events_head ON public.events(event_head_id);

-- Event Management Team Members
CREATE TABLE IF NOT EXISTS public.event_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    student_reg_no TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'Event Head', 'Co-Head', 'Event Coordinator', 'Technical Manager',
        'Sports Manager', 'Registration Manager', 'Finance Manager',
        'Volunteer', 'Media Manager', 'Custom Role'
    )),
    custom_role_title TEXT,
    responsibilities TEXT,
    contact_phone TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    is_approved_by_admin BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_member UNIQUE (event_id, student_reg_no)
);

CREATE INDEX IF NOT EXISTS idx_event_members_event ON public.event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_user ON public.event_members(user_id);

-- Event Member Permissions
CREATE TABLE IF NOT EXISTS public.event_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.event_members(id) ON DELETE CASCADE,
    can_view_participants BOOLEAN NOT NULL DEFAULT true,
    can_manage_registrations BOOLEAN NOT NULL DEFAULT false,
    can_update_schedule BOOLEAN NOT NULL DEFAULT false,
    can_upload_documents BOOLEAN NOT NULL DEFAULT false,
    can_publish_announcements BOOLEAN NOT NULL DEFAULT false,
    can_manage_tasks BOOLEAN NOT NULL DEFAULT false,
    can_manage_resources BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_member_permission UNIQUE (member_id)
);

-- Event Updates (Text, Image, PDF, Schedule, Task format)
CREATE TABLE IF NOT EXISTS public.event_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL DEFAULT 'Coordinator',
    update_type TEXT NOT NULL DEFAULT 'text' CHECK (update_type IN ('text', 'image', 'pdf', 'task', 'schedule')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    is_important BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_event_updates_event ON public.event_updates(event_id);

-- Event Documents
CREATE TABLE IF NOT EXISTS public.event_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'pdf',
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    is_private_to_team BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Event Student Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_reg_no TEXT NOT NULL,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled', 'attended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_student_reg UNIQUE (event_id, student_reg_no)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user ON public.event_registrations(user_id);

-- Event Tasks
CREATE TABLE IF NOT EXISTS public.event_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to_member_id UUID REFERENCES public.event_members(id) ON DELETE SET NULL,
    assigned_to_name TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- ------------------------------------------------------------------------------
-- MODULE B: SPORTS & SQUAD MANAGEMENT
-- ------------------------------------------------------------------------------

-- Master Sports Directory
CREATE TABLE IF NOT EXISTS public.sports (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    sport_type TEXT NOT NULL CHECK (sport_type IN ('team', 'individual', 'doubles', 'relay', 'athletics', 'indoor')),
    icon TEXT NOT NULL DEFAULT '⚽',
    min_squad_size INT NOT NULL DEFAULT 1,
    max_squad_size INT NOT NULL DEFAULT 15,
    playing_squad_size INT NOT NULL DEFAULT 1,
    substitute_count INT NOT NULL DEFAULT 0,
    scoring_system TEXT NOT NULL CHECK (scoring_system IN ('cricket', 'kabaddi', 'basketball', 'volleyball', 'athletics_distance', 'athletics_time', 'chess_carrom', 'standard_points')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default sports
INSERT INTO public.sports (id, name, code, sport_type, icon, min_squad_size, max_squad_size, playing_squad_size, substitute_count, scoring_system, is_active) VALUES
-- Team Sports
('cricket', 'Cricket', 'CRI', 'team', '🏏', 11, 16, 11, 5, 'cricket', true),
('kabaddi', 'Kabaddi', 'KBD', 'team', '🤼', 7, 12, 7, 5, 'kabaddi', true),
('basketball', 'Basketball', 'BB', 'team', '🏀', 5, 12, 5, 7, 'basketball', true),
('volleyball', 'Volleyball', 'VB', 'team', '🏐', 6, 12, 6, 6, 'volleyball', true),
('football', 'Football', 'FB', 'team', '⚽', 11, 18, 11, 7, 'standard_points', true),
-- Individual & Doubles Racquet / Indoor Sports
('badminton', 'Badminton (Singles/Doubles)', 'BDM', 'doubles', '🏸', 1, 2, 1, 0, 'standard_points', true),
('table_tennis', 'Table Tennis', 'TT', 'doubles', '🏓', 1, 2, 1, 0, 'standard_points', true),
('chess', 'Chess', 'CHS', 'indoor', '♟️', 1, 1, 1, 0, 'chess_carrom', true),
('carrom', 'Carrom', 'CRM', 'indoor', '🎯', 1, 2, 1, 0, 'chess_carrom', true),
-- Athletics Field Events
('shot_put', 'Shot Put', 'SP', 'athletics', '⚪', 1, 1, 1, 0, 'athletics_distance', true),
('discus_throw', 'Discus Throw', 'DT', 'athletics', '💿', 1, 1, 1, 0, 'athletics_distance', true),
('javelin_throw', 'Javelin Throw', 'JT', 'athletics', '🗡️', 1, 1, 1, 0, 'athletics_distance', true),
('long_jump', 'Long Jump', 'LJ', 'athletics', '🏃', 1, 1, 1, 0, 'athletics_distance', true),
('high_jump', 'High Jump', 'HJ', 'athletics', '🤸', 1, 1, 1, 0, 'athletics_distance', true),
-- Athletics Track Events
('run_100m', '100 Metres Sprint', 'R100', 'athletics', '⚡', 1, 1, 1, 0, 'athletics_time', true),
('run_200m', '200 Metres Sprint', 'R200', 'athletics', '🏃', 1, 1, 1, 0, 'athletics_time', true),
('run_400m', '400 Metres Race', 'R400', 'athletics', '⏱️', 1, 1, 1, 0, 'athletics_time', true),
('relay_4x100m', '4 × 100 Metres Relay', 'RELAY1', 'relay', '🎽', 4, 5, 4, 1, 'athletics_time', true),
('relay_4x400m', '4 × 400 Metres Relay', 'RELAY2', 'relay', '🏁', 4, 5, 4, 1, 'athletics_time', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    min_squad_size = EXCLUDED.min_squad_size, 
    max_squad_size = EXCLUDED.max_squad_size, 
    playing_squad_size = EXCLUDED.playing_squad_size;

-- Configurable Sport Rules
CREATE TABLE IF NOT EXISTS public.sport_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id TEXT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    half_or_period_duration_minutes INT DEFAULT 20,
    raid_timer_seconds INT DEFAULT 30,
    timeout_count INT DEFAULT 2,
    max_fouls_allowed INT DEFAULT 5,
    points_per_win INT NOT NULL DEFAULT 2,
    points_per_draw INT NOT NULL DEFAULT 1,
    points_per_loss INT NOT NULL DEFAULT 0,
    custom_config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_sport_rule UNIQUE (sport_id)
);

-- Seed rules for key sports
INSERT INTO public.sport_rules (sport_id, half_or_period_duration_minutes, raid_timer_seconds, timeout_count, max_fouls_allowed, points_per_win, points_per_draw, points_per_loss, custom_config) VALUES
('cricket', 0, 0, 0, 0, 2, 1, 0, '{"default_overs": 10, "powerplay_overs": 3, "super_over": true}'::jsonb),
('kabaddi', 20, 30, 2, 0, 2, 1, 0, '{"halves": 2, "half_break_mins": 5, "bonus_line": true, "do_or_die_raid": 3}'::jsonb),
('basketball', 10, 0, 3, 5, 2, 0, 0, '{"quarters": 4, "shot_clock_secs": 24, "foul_bonus_threshold": 5}'::jsonb),
('volleyball', 0, 0, 2, 0, 2, 0, 0, '{"sets_to_win": 3, "points_per_set": 25, "deciding_set_points": 15, "deuce_margin": 2}'::jsonb)
ON CONFLICT (sport_id) DO NOTHING;

-- Teams Registry
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sport_id TEXT NOT NULL REFERENCES public.sports(id),
    tournament_id UUID,
    logo_url TEXT,
    captain_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    captain_name TEXT NOT NULL,
    captain_reg_no TEXT NOT NULL,
    captain_phone TEXT NOT NULL,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'withdrawn')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_teams_sport ON public.teams(sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams(status);

-- Team Roster & Players
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    player_name TEXT NOT NULL,
    reg_no TEXT NOT NULL,
    phone TEXT,
    gender TEXT NOT NULL DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    sport_role TEXT NOT NULL DEFAULT 'Player',
    batting_hand TEXT CHECK (batting_hand IN ('Right Hand', 'Left Hand', NULL)),
    bowling_style TEXT,
    position TEXT,
    jersey_number INT,
    is_captain BOOLEAN NOT NULL DEFAULT false,
    is_playing_xi BOOLEAN NOT NULL DEFAULT true,
    is_verified_student BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_team_player_reg UNIQUE (team_id, reg_no)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_reg ON public.team_members(reg_no);

-- Team Roster Change Requests (Audited change requests after approval)
CREATE TABLE IF NOT EXISTS public.team_registration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('roster_change', 'substitution', 'withdrawal')),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    review_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- ------------------------------------------------------------------------------
-- MODULE C: TOURNAMENT & MANUAL MATCH MANAGEMENT
-- ------------------------------------------------------------------------------

-- Tournaments Table
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    sport_id TEXT NOT NULL REFERENCES public.sports(id),
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    tournament_type TEXT NOT NULL DEFAULT 'knockout' CHECK (tournament_type IN ('knockout', 'league', 'group_stage', 'custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    venue TEXT NOT NULL,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organizer_name TEXT NOT NULL,
    organizer_contact TEXT NOT NULL,
    banner_url TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    max_squad_override INT,
    min_squad_override INT,
    playing_xi_override INT,
    substitute_override INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tournaments_sport ON public.tournaments(sport_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);

-- Matches Table (Strictly Manual Scheduling by Organizer)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    sport_id TEXT NOT NULL REFERENCES public.sports(id),
    round_name TEXT NOT NULL DEFAULT 'Round 1' CHECK (round_name IN ('Round 1', 'Round 2', 'Quarter-Final', 'Semi-Final', 'Final', 'Third Place Match', 'League Stage', 'Group A', 'Group B', 'Custom')),
    match_number INT NOT NULL DEFAULT 1,
    team_a_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team_b_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team_a_name TEXT NOT NULL,
    team_b_name TEXT NOT NULL,
    participant_a_name TEXT,
    participant_b_name TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    venue TEXT NOT NULL,
    referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referee_name TEXT,
    scorekeeper_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scorekeeper_name TEXT,
    instructions TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'live', 'half_time', 'paused', 
        'completed', 'result_pending_approval', 'published', 'cancelled', 'postponed'
    )),
    team_a_score INT DEFAULT 0,
    team_b_score INT DEFAULT 0,
    score_details JSONB DEFAULT '{}'::jsonb,
    winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    winner_name TEXT,
    is_draw BOOLEAN NOT NULL DEFAULT false,
    tie_breaker_reason TEXT,
    decided_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON public.matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_sport ON public.matches(sport_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- Chronological Match Scoring Events (Ball-by-ball, Raids, Baskets, Sets, Attempts)
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    period_or_over TEXT NOT NULL, -- e.g. "Over 4.2", "1st Half (12:45)", "Q2 (3:20)", "Attempt 3"
    event_type TEXT NOT NULL CHECK (event_type IN (
        'cricket_run', 'cricket_wicket', 'cricket_extra', 'cricket_over_end',
        'kabaddi_raid', 'kabaddi_tackle', 'kabaddi_bonus', 'kabaddi_allout', 'kabaddi_empty_raid',
        'basketball_1pt', 'basketball_2pt', 'basketball_3pt', 'basketball_foul', 'basketball_timeout',
        'volleyball_point', 'volleyball_set_end',
        'athletics_attempt', 'athletics_foul',
        'penalty_card', 'substitution', 'official_correction'
    )),
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team_name TEXT,
    player_id UUID,
    player_name TEXT,
    points_delta INT NOT NULL DEFAULT 0,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_match_events_match ON public.match_events(match_id);

-- Authoritative Realtime Timer State (For Kabaddi, Basketball, Football)
CREATE TABLE IF NOT EXISTS public.match_timer_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    period_number INT NOT NULL DEFAULT 1,
    is_running BOOLEAN NOT NULL DEFAULT false,
    elapsed_seconds INT NOT NULL DEFAULT 0,
    period_duration_seconds INT NOT NULL DEFAULT 1200, -- 20 mins default
    last_resumed_at TIMESTAMPTZ,
    raid_timer_running BOOLEAN NOT NULL DEFAULT false,
    raid_elapsed_seconds INT NOT NULL DEFAULT 0,
    raid_duration_seconds INT NOT NULL DEFAULT 30,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_match_timer UNIQUE (match_id)
);

-- Official Result Decisions & Tie Resolutions (Audited authority decisions)
CREATE TABLE IF NOT EXISTS public.result_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    decision_type TEXT NOT NULL CHECK (decision_type IN ('standard_win', 'tie_breaker', 'super_over', 'golden_raid', 'penalty_shootout', 'walkover', 'disqualification', 'joint_winners')),
    winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    winner_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    deciding_authority_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    authority_name TEXT NOT NULL,
    supporting_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tournament Standings / Points Table
CREATE TABLE IF NOT EXISTS public.tournament_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    sport_id TEXT NOT NULL REFERENCES public.sports(id),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    matches_played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    draws INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    score_for INT NOT NULL DEFAULT 0,
    score_against INT NOT NULL DEFAULT 0,
    score_difference INT NOT NULL DEFAULT 0,
    net_run_rate NUMERIC(8, 3) DEFAULT 0.000,
    rank INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_tournament_team_standing UNIQUE (tournament_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_standings_tournament ON public.tournament_standings(tournament_id);

-- Individual Sport Rankings (Separate Sport-Wise Standings)
CREATE TABLE IF NOT EXISTS public.individual_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id TEXT NOT NULL REFERENCES public.sports(id),
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    participant_name TEXT NOT NULL,
    student_reg_no TEXT NOT NULL,
    department TEXT NOT NULL,
    total_points INT NOT NULL DEFAULT 0,
    best_metric_display TEXT, -- e.g. "12.45m", "11.23s", "4 Wins"
    rank INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_individual_sport_reg UNIQUE (sport_id, academic_year, student_reg_no)
);

CREATE INDEX IF NOT EXISTS idx_individual_rankings_sport ON public.individual_rankings(sport_id, rank);

-- Rank-Based Points Configurations (Per Sport)
CREATE TABLE IF NOT EXISTS public.points_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id TEXT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    tournament_type TEXT NOT NULL DEFAULT 'standard',
    first_place_points INT NOT NULL DEFAULT 10,
    second_place_points INT NOT NULL DEFAULT 7,
    third_place_points INT NOT NULL DEFAULT 5,
    fourth_place_points INT NOT NULL DEFAULT 3,
    participation_points INT NOT NULL DEFAULT 1,
    custom_rank_points JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_sport_points_config UNIQUE (sport_id, tournament_type)
);

-- Seed default point configs
INSERT INTO public.points_configurations (sport_id, tournament_type, first_place_points, second_place_points, third_place_points, fourth_place_points, participation_points)
SELECT id, 'standard', 10, 7, 5, 3, 1 FROM public.sports
ON CONFLICT (sport_id, tournament_type) DO NOTHING;

-- Audited Points Awards (Prevents duplicate award, supports recalculation)
CREATE TABLE IF NOT EXISTS public.points_awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    sport_id TEXT NOT NULL REFERENCES public.sports(id),
    award_type TEXT NOT NULL CHECK (award_type IN ('team', 'individual')),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_reg_no TEXT,
    rank_position INT NOT NULL,
    points_awarded INT NOT NULL,
    reason TEXT NOT NULL,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_points_award_target UNIQUE (tournament_id, sport_id, award_type, team_id, user_id)
);


-- ------------------------------------------------------------------------------
-- MODULE D: CULTURAL COMPETITIONS MANAGEMENT
-- ------------------------------------------------------------------------------

-- Master Cultural Categories (Strict 10 Official Categories)
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'poetry_writing', 'group_discussion', 'extempore', 
        'essay_writing_english', 'essay_writing_hindi', 
        'story_writing_english', 'story_writing_hindi', 
        'debate', 'rangoli', 'painting'
    )),
    category_label TEXT NOT NULL,
    description TEXT NOT NULL,
    competition_type TEXT NOT NULL DEFAULT 'individual' CHECK (competition_type IN ('individual', 'group')),
    min_group_size INT NOT NULL DEFAULT 1,
    max_group_size INT NOT NULL DEFAULT 1,
    venue TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reg_deadline TIMESTAMPTZ NOT NULL,
    max_participants INT,
    rules TEXT,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organizer_name TEXT NOT NULL,
    organizer_contact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN (
        'upcoming', 'registration_open', 'judging_active', 'completed', 'results_published'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_competitions_category ON public.competitions(category);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON public.competitions(status);

-- Cultural Participants & Entries
CREATE TABLE IF NOT EXISTS public.competition_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    participant_name TEXT NOT NULL,
    student_reg_no TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    group_name TEXT,
    group_members TEXT[] DEFAULT ARRAY[]::TEXT[],
    attendance_status TEXT NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'present', 'absent', 'disqualified')),
    submission_notes TEXT,
    submission_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_competition_student_entry UNIQUE (competition_id, student_reg_no)
);

CREATE INDEX IF NOT EXISTS idx_comp_entries_comp ON public.competition_entries(competition_id);

-- Assigned Judges
CREATE TABLE IF NOT EXISTS public.judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    judge_name TEXT NOT NULL,
    designation TEXT NOT NULL DEFAULT 'Faculty Judge',
    access_code TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_competition_judge UNIQUE (competition_id, user_id)
);

-- Judging Criteria & Weights
CREATE TABLE IF NOT EXISTS public.judging_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    criterion_name TEXT NOT NULL, -- e.g. Creativity, Presentation, Content Quality, Communication, Originality
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    weightage_percent NUMERIC(5, 2) NOT NULL DEFAULT 20.0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Judge Scores Per Participant & Criterion
CREATE TABLE IF NOT EXISTS public.competition_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES public.competition_entries(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES public.judges(id) ON DELETE CASCADE,
    criterion_id UUID NOT NULL REFERENCES public.judging_criteria(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL CHECK (score >= 0),
    remarks TEXT,
    scored_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_entry_judge_criterion UNIQUE (competition_id, entry_id, judge_id, criterion_id)
);

-- Published Competition Final Rankings
CREATE TABLE IF NOT EXISTS public.competition_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES public.competition_entries(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    student_reg_no TEXT NOT NULL,
    department TEXT NOT NULL,
    total_weighted_score NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    rank INT NOT NULL DEFAULT 1,
    award_title TEXT, -- e.g. "1st Prize", "Runner-Up", "Special Mention"
    tie_resolution_note TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_competition_final_entry UNIQUE (competition_id, entry_id)
);


-- ------------------------------------------------------------------------------
-- MODULE E: SHARED INFRASTRUCTURE (AUDIT, NOTIFICATIONS, DOCUMENTS)
-- ------------------------------------------------------------------------------

-- Realtime In-App Notifications
CREATE TABLE IF NOT EXISTS public.sports_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_email TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'event_created', 'event_updated', 'registration_status', 'management_assigned',
        'match_scheduled', 'match_started', 'score_updated', 'match_completed',
        'result_published', 'ranking_updated', 'admin_alert'
    )),
    entity_type TEXT NOT NULL, -- 'event', 'match', 'team', 'competition', 'points'
    entity_id TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sports_notif_user ON public.sports_notifications(recipient_user_id, is_read);

-- Comprehensive Security Audit Trail
CREATE TABLE IF NOT EXISTS public.sports_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g. 'score_correction', 'tie_resolution', 'team_approval', 'result_publication'
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.sports_audit_logs(entity_type, entity_id);


-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_timer_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judging_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for published data
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read active sports" ON public.sports FOR SELECT USING (is_active = true);
CREATE POLICY "Public read sport rules" ON public.sport_rules FOR SELECT USING (true);
CREATE POLICY "Public read approved teams" ON public.teams FOR SELECT USING (status = 'approved' OR auth.uid() = captain_id);
CREATE POLICY "Public read approved tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public read match events" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "Public read timer state" ON public.match_timer_state FOR SELECT USING (true);
CREATE POLICY "Public read tournament standings" ON public.tournament_standings FOR SELECT USING (true);
CREATE POLICY "Public read individual rankings" ON public.individual_rankings FOR SELECT USING (true);
CREATE POLICY "Public read competitions" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Public read competition results" ON public.competition_results FOR SELECT USING (true);
CREATE POLICY "Public read event updates" ON public.event_updates FOR SELECT USING (true);

-- Authenticated Student & Role-Restricted Policies
CREATE POLICY "Student create event" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = event_head_id);
CREATE POLICY "Event Head update event" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = event_head_id);
CREATE POLICY "Student register event" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Student view own registration" ON public.event_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Captain manage team" ON public.teams FOR ALL TO authenticated USING (auth.uid() = captain_id) WITH CHECK (auth.uid() = captain_id);
CREATE POLICY "Student register competition" ON public.competition_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Student view own competition entry" ON public.competition_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "User read own notifications" ON public.sports_notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_user_id);
CREATE POLICY "User mark own notification read" ON public.sports_notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_user_id);

-- Super Admin Full Privileges
CREATE POLICY "Super admin manage events" ON public.events FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'pk3334238@gmail.com');
CREATE POLICY "Super admin manage sports" ON public.sports FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'pk3334238@gmail.com');
CREATE POLICY "Super admin manage teams" ON public.teams FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'pk3334238@gmail.com');
CREATE POLICY "Super admin manage tournaments" ON public.tournaments FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'pk3334238@gmail.com');
CREATE POLICY "Super admin manage matches" ON public.matches FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'pk3334238@gmail.com');
CREATE POLICY "Super admin manage audit logs" ON public.sports_audit_logs FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'pk3334238@gmail.com');

