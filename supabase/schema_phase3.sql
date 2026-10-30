-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Phase 3 Schema & Migrations
-- Student Profiles, Preferences, Cross-Device Saved Listings & RLS
-- Strict separation: No study progress or academic tracking tables.
-- ==============================================================================

-- 1. Extend or Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    branch TEXT,
    semester TEXT,
    admission_batch TEXT,
    preferred_categories TEXT[] DEFAULT ARRAY['stationery', 'grocery']::TEXT[],
    preferred_accommodation_type TEXT DEFAULT 'Any',
    preferred_budget INT DEFAULT 3000,
    preferred_food_options TEXT DEFAULT 'Veg & Egg',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure columns exist if table was partially created in Phase 2
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS semester TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admission_batch TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT ARRAY['stationery', 'grocery']::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_accommodation_type TEXT DEFAULT 'Any';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_budget INT DEFAULT 3000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_food_options TEXT DEFAULT 'Veg & Egg';

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_budget INT DEFAULT 3000,
    notification_preferences JSONB DEFAULT '{"email_updates": false, "listing_alerts": true}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Cross-Device Saved Listings (Bookmarking) Table
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('shops', 'rooms', 'food', 'medical', 'transport', 'facility')),
    item_id TEXT NOT NULL,
    item_title TEXT,
    item_meta JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_item UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user ON public.saved_items(user_id);

-- 4. Living-Expense Records (Private to each Student)
CREATE TABLE IF NOT EXISTS public.monthly_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    room_rent INT DEFAULT 0,
    mess_food INT DEFAULT 0,
    utilities_recharge INT DEFAULT 0,
    stationery_xerox INT DEFAULT 0,
    local_transit INT DEFAULT 0,
    personal_snacks INT DEFAULT 0,
    total_monthly INT DEFAULT 0,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_expense UNIQUE (user_id)
);

-- 5. Trigger for New User Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_preferences (user_id, updated_at)
  VALUES (new.id, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR PHASE 3
-- Complete Privacy Isolation Between Students
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update ONLY their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Preferences: Users can manage only their own preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Saved Items: Users can read, insert, delete ONLY their own saved items
DROP POLICY IF EXISTS "Users can view own saved items" ON public.saved_items;
CREATE POLICY "Users can view own saved items" ON public.saved_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved items" ON public.saved_items;
CREATE POLICY "Users can insert own saved items" ON public.saved_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved items" ON public.saved_items;
CREATE POLICY "Users can delete own saved items" ON public.saved_items
    FOR DELETE USING (auth.uid() = user_id);

-- Monthly Expenses: Private to user only
DROP POLICY IF EXISTS "Users can manage own expenses" ON public.monthly_expenses;
CREATE POLICY "Users can manage own expenses" ON public.monthly_expenses
    FOR ALL USING (auth.uid() = user_id);

-- 6. Listing Reports Table (Matches Phase 3 Specification)
CREATE TABLE IF NOT EXISTS public.listing_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    listing_type TEXT NOT NULL,
    listing_id TEXT,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone or students can report listing" ON public.listing_reports;
CREATE POLICY "Anyone or students can report listing" ON public.listing_reports
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own reports" ON public.listing_reports;
CREATE POLICY "Users can view own reports" ON public.listing_reports
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
