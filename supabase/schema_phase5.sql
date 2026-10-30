-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Phase 5 Schema & Migrations
-- Student Marketplace, Buy / Sell / Exchange, Enquiries & Safety Controls
-- Strict platform separation: GEC Hub handles physical student items.
-- Apna College Bihar (https://www.apnacollegebihar.online/) handles all academic notes/syllabus.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Marketplace Categories Reference Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📦',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed predefined permitted physical student categories
INSERT INTO public.marketplace_categories (id, name, icon, description, display_order)
VALUES
    ('books_materials', 'Books & Physical Study Tools', '📚', 'Used physical textbooks, standard reference books, engineering drafters, drawing sheets. (No digital notes/PDFs)', 1),
    ('calculators', 'Scientific Calculators & Tech Tools', '🧮', 'Casio fx-991EX/MS calculators, drawing boards, mini drafters, instruments', 2),
    ('cycles', 'Cycles & Campus Commute', '🚲', 'Bicycles, locks, pumps, cycle lights, commute accessories for Bajidpur campus', 3),
    ('furniture', 'Hostel & Room Furniture', '🪑', 'Study tables, chairs, folding beds, mattresses, book racks, shoe stands', 4),
    ('hostel_essentials', 'Hostel Essentials & Storage', '🛏️', 'Buckets, mugs, room coolers, study lamps, curtains, laundry hampers', 5),
    ('laptops_computers', 'Laptops & Computer Accessories', '💻', 'Used laptops, monitors, mechanical keyboards, mice, RAM, laptop stands', 6),
    ('mobiles_gadgets', 'Mobile Phones & Power Gadgets', '📱', 'Smartphones, power banks, fast chargers, adapters, USB hubs', 7),
    ('audio_headphones', 'Headphones & Audio', '🎧', 'Earphones, wireless earbuds, noise-canceling headphones, study audio', 8),
    ('sports_fitness', 'Sports & Fitness Equipment', '🏏', 'Cricket bats, badminton kits, footballs, volleyballs, gym dumbbells', 9),
    ('clothing_bags', 'College Bags & Lab Wear', '🎒', 'Heavy-duty college backpacks, winter jackets, engineering workshop lab coats', 10),
    ('appliances', 'Room Appliances', '⚡', 'Electric kettles, room heaters, table fans, trimmers, extension boards', 11),
    ('other_essentials', 'Other Permitted Student Goods', '📦', 'Miscellaneous student-life items compliant with campus guidelines', 12)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- ------------------------------------------------------------------------------
-- 2. Marketplace Listings Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    seller_name TEXT NOT NULL DEFAULT 'GEC Student',
    seller_contact_public TEXT, -- Optional public phone/WhatsApp; only stored if user explicitly consents
    title TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.marketplace_categories(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_negotiable BOOLEAN NOT NULL DEFAULT true,
    item_condition TEXT NOT NULL CHECK (item_condition IN ('new', 'like_new', 'good', 'fair', 'for_parts')),
    image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    approximate_location TEXT NOT NULL DEFAULT 'Bajidpur Campus / Sheikhpura',
    pickup_available BOOLEAN NOT NULL DEFAULT true,
    delivery_available BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'archived')),
    moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'suspended')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + INTERVAL '60 days'),
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_listings(status, moderation_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_listings(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_listings(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_created ON public.marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_price ON public.marketplace_listings(price);

-- Auto-update updated_at timestamp
CREATE OR REPLACE TRIGGER update_marketplace_listings_timestamp
    BEFORE UPDATE ON public.marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. Marketplace Enquiries (Safe Buyer-to-Seller Communication)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    seller_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    buyer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    buyer_name TEXT NOT NULL,
    buyer_contact TEXT NOT NULL,
    message TEXT NOT NULL,
    offered_price NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_enquiries_listing ON public.marketplace_enquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_seller ON public.marketplace_enquiries(seller_user_id, status);
CREATE INDEX IF NOT EXISTS idx_enquiries_buyer ON public.marketplace_enquiries(buyer_user_id);

CREATE OR REPLACE TRIGGER update_marketplace_enquiries_timestamp
    BEFORE UPDATE ON public.marketplace_enquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. Marketplace Saved Items / Watchlist
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_marketplace_saved UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_marketplace_user ON public.marketplace_saved_items(user_id);

-- ------------------------------------------------------------------------------
-- 5. Extend Listing Reports for Marketplace
-- ------------------------------------------------------------------------------
-- Ensure 'marketplace' is accepted in public.listing_reports if listing_type constraint exists
DO $$
BEGIN
    ALTER TABLE public.listing_reports DROP CONSTRAINT IF EXISTS listing_reports_listing_type_check;
    ALTER TABLE public.listing_reports ADD CONSTRAINT listing_reports_listing_type_check
        CHECK (listing_type IN ('business', 'accommodation', 'food', 'service', 'review', 'marketplace', 'general'));
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_saved_items ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS Policies for marketplace_categories
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read active marketplace categories"
    ON public.marketplace_categories FOR SELECT
    USING (is_active = true);

-- ------------------------------------------------------------------------------
-- RLS Policies for marketplace_listings
-- ------------------------------------------------------------------------------
-- Public visitors can read only approved and active/reserved listings
CREATE POLICY "Public read active marketplace listings"
    ON public.marketplace_listings FOR SELECT
    USING (
        (moderation_status = 'approved' AND status IN ('available', 'reserved', 'sold'))
        OR (auth.uid() IS NOT NULL AND seller_user_id = auth.uid())
        OR is_admin()
    );

-- Authenticated users can insert their own listings
CREATE POLICY "Authenticated users can create marketplace listings"
    ON public.marketplace_listings FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND seller_user_id = auth.uid()
        AND moderation_status = 'approved' -- Default auto-approval for registered students unless flagged
    );

-- Sellers can update their own listings (e.g. status, price, description)
CREATE POLICY "Sellers can update their own marketplace listings"
    ON public.marketplace_listings FOR UPDATE
    USING (seller_user_id = auth.uid() OR is_admin())
    WITH CHECK (seller_user_id = auth.uid() OR is_admin());

-- Sellers or Admins can delete their own listings
CREATE POLICY "Sellers and admins can delete listings"
    ON public.marketplace_listings FOR DELETE
    USING (seller_user_id = auth.uid() OR is_admin());

-- ------------------------------------------------------------------------------
-- RLS Policies for marketplace_enquiries
-- ------------------------------------------------------------------------------
-- Buyers can insert enquiries
CREATE POLICY "Anyone or authenticated user can send enquiry"
    ON public.marketplace_enquiries FOR INSERT
    WITH CHECK (true);

-- Only seller or buyer can view the enquiry
CREATE POLICY "Participants can view their enquiries"
    ON public.marketplace_enquiries FOR SELECT
    USING (
        seller_user_id = auth.uid()
        OR (buyer_user_id IS NOT NULL AND buyer_user_id = auth.uid())
        OR is_admin()
    );

-- Seller can update status (e.g. mark as read or replied)
CREATE POLICY "Seller can update enquiry status"
    ON public.marketplace_enquiries FOR UPDATE
    USING (seller_user_id = auth.uid() OR is_admin())
    WITH CHECK (seller_user_id = auth.uid() OR is_admin());

-- ------------------------------------------------------------------------------
-- RLS Policies for marketplace_saved_items
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their saved items"
    ON public.marketplace_saved_items FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can save marketplace items"
    ON public.marketplace_saved_items FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can remove their saved marketplace items"
    ON public.marketplace_saved_items FOR DELETE
    USING (user_id = auth.uid());
