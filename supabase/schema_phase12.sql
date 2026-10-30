-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Phase 12 Database Schema
-- Official Website Discovery, Public Data Import & Source-Synced College Directory
-- ==============================================================================

-- 1. Crawled & Synced Official Pages
CREATE TABLE IF NOT EXISTS public.crawled_pages (
    id VARCHAR(64) PRIMARY KEY,
    source_url TEXT NOT NULL UNIQUE,
    canonical_url TEXT,
    source_domain VARCHAR(120) NOT NULL DEFAULT 'gecsheikhpura.ac.in',
    page_title VARCHAR(255) NOT NULL,
    section VARCHAR(64) NOT NULL CHECK (section IN (
        'college_overview',
        'administration',
        'faculty_departments',
        'training_placement',
        'facilities_services',
        'activities_clubs',
        'public_notices',
        'public_documents',
        'affiliation_approvals',
        'contact_directory',
        'restricted_portal'
    )),
    subcategory VARCHAR(100),
    content_type VARCHAR(32) NOT NULL DEFAULT 'html_page' CHECK (content_type IN (
        'html_page',
        'public_notice',
        'pdf_document',
        'login_portal',
        'tender',
        'recruitment'
    )),
    short_summary TEXT NOT NULL,
    extracted_text TEXT,
    published_date DATE,
    document_url TEXT,
    content_language VARCHAR(10) DEFAULT 'en',
    http_status INT DEFAULT 200,
    first_discovered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_content_change_at TIMESTAMPTZ,
    content_hash VARCHAR(64) NOT NULL,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'source_verified' CHECK (verification_status IN (
        'source_verified',
        'unverified',
        'community_reported'
    )),
    import_status VARCHAR(32) NOT NULL DEFAULT 'approved' CHECK (import_status IN (
        'discovered',
        'fetched',
        'parsed',
        'classified',
        'review_required',
        'approved',
        'published',
        'duplicate',
        'restricted',
        'extraction_failed',
        'rejected',
        'outdated',
        'source_unavailable'
    )),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crawled_status_sec ON public.crawled_pages(import_status, section);
CREATE INDEX IF NOT EXISTS idx_crawled_type ON public.crawled_pages(content_type);
CREATE INDEX IF NOT EXISTS idx_crawled_hash ON public.crawled_pages(content_hash);
CREATE INDEX IF NOT EXISTS idx_crawled_last_checked ON public.crawled_pages(last_checked_at DESC);

-- 2. Crawled Official Documents & PDFs
CREATE TABLE IF NOT EXISTS public.crawled_documents (
    id VARCHAR(64) PRIMARY KEY,
    page_id VARCHAR(64) REFERENCES public.crawled_pages(id) ON DELETE CASCADE,
    document_title VARCHAR(255) NOT NULL,
    document_type VARCHAR(32) NOT NULL DEFAULT 'pdf',
    source_url TEXT NOT NULL,
    download_url TEXT NOT NULL,
    published_date DATE,
    content_hash VARCHAR(64),
    file_size_kb INT,
    availability_status VARCHAR(32) DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_doc_type ON public.crawled_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_doc_date ON public.crawled_documents(published_date DESC);

-- 3. Crawl Audit & Synchronization Jobs
CREATE TABLE IF NOT EXISTS public.crawl_jobs (
    id VARCHAR(64) PRIMARY KEY,
    job_type VARCHAR(32) NOT NULL CHECK (job_type IN ('full_crawl', 'incremental_sync', 'manual')),
    status VARCHAR(32) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    discovered_count INT DEFAULT 0,
    fetched_count INT DEFAULT 0,
    approved_count INT DEFAULT 0,
    restricted_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    duplicate_count INT DEFAULT 0,
    duration_ms INT DEFAULT 0,
    error_summary TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_started ON public.crawl_jobs(started_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.crawled_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawled_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_jobs ENABLE ROW LEVEL SECURITY;

-- Public can read ONLY approved and published records
CREATE POLICY "Public can view approved crawled pages"
    ON public.crawled_pages FOR SELECT
    USING (import_status IN ('approved', 'published'));

CREATE POLICY "Public can view available documents"
    ON public.crawled_documents FOR SELECT
    USING (availability_status = 'available');

-- Administrators have full access
CREATE POLICY "Admins have full access to crawled pages"
    ON public.crawled_pages FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' IN ('admin', 'moderator'))
    WITH CHECK (auth.jwt()->>'role' IN ('admin', 'moderator'));

CREATE POLICY "Admins have full access to crawled documents"
    ON public.crawled_documents FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' IN ('admin', 'moderator'))
    WITH CHECK (auth.jwt()->>'role' IN ('admin', 'moderator'));

CREATE POLICY "Admins have full access to crawl jobs"
    ON public.crawl_jobs FOR ALL
    TO authenticated
    USING (auth.jwt()->>'role' IN ('admin', 'moderator'))
    WITH CHECK (auth.jwt()->>'role' IN ('admin', 'moderator'));
