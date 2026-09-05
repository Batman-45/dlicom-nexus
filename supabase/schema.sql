-- ==============================================================================
-- Dlicom Circle: Persistent Real-X Data Cache Schema
-- Table: x_circle_cache
-- Purpose: Persists successfully fetched real X social interaction graphs.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.x_circle_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    profile_json JSONB NOT NULL,
    connections_json JSONB NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL,
    last_attempted_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT x_circle_cache_username_key UNIQUE (username)
);

-- Case-insensitive unique index on normalized username
CREATE UNIQUE INDEX IF NOT EXISTS idx_x_circle_cache_username_lower
    ON public.x_circle_cache (LOWER(username));

-- Index for expiration and stale maintenance queries
CREATE INDEX IF NOT EXISTS idx_x_circle_cache_expires_at
    ON public.x_circle_cache (expires_at);

-- Enable Row Level Security (RLS)
-- Only backend service-role key can read/write x_circle_cache
ALTER TABLE public.x_circle_cache ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Dlicom Verified Community Registry Schema
-- Table: dlicom_community_members
-- Purpose: Persists officially verified Dlicom community members with provenance.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.dlicom_community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dli_id TEXT NOT NULL,
    x_handle TEXT NOT NULL,
    normalized_handle TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    verification_level TEXT NOT NULL DEFAULT 'OFFICIALLY_VERIFIED',
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
    source_type TEXT NOT NULL,
    source_authority TEXT NOT NULL DEFAULT 'OFFICIAL_WEBSITE',
    official_source_url TEXT NOT NULL,
    confidence_score INTEGER NOT NULL DEFAULT 100,
    evidence_summary TEXT NOT NULL,
    provenance TEXT NOT NULL,
    discovery_source TEXT NOT NULL,
    source_freshness TEXT NOT NULL DEFAULT 'FRESH',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    avatar_url TEXT,
    bio TEXT,
    region TEXT,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT dlicom_community_members_dli_id_key UNIQUE (dli_id),
    CONSTRAINT dlicom_community_members_x_handle_key UNIQUE (x_handle),
    CONSTRAINT dlicom_community_members_normalized_handle_key UNIQUE (normalized_handle)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dlicom_community_members_normalized_handle
    ON public.dlicom_community_members (normalized_handle);

ALTER TABLE public.dlicom_community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to verified community members"
    ON public.dlicom_community_members
    FOR SELECT
    TO public
    USING (verification_status = 'VERIFIED');

-- ==============================================================================
-- Table: community_evidence
-- Purpose: Persists granular provenance and individual public proof URLs.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dli_id TEXT NOT NULL REFERENCES public.dlicom_community_members(dli_id) ON DELETE CASCADE,
    evidence_url TEXT NOT NULL,
    evidence_type TEXT NOT NULL,
    source_authority TEXT NOT NULL,
    evidence_summary TEXT,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_valid BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_community_evidence_dli_id
    ON public.community_evidence (dli_id);

ALTER TABLE public.community_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to community evidence"
    ON public.community_evidence
    FOR SELECT
    TO public
    USING (is_valid = true);

-- ==============================================================================
-- Table: community_sources
-- Purpose: Tracks the status, health, and HTTP metrics of public sources.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT UNIQUE NOT NULL,
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL,
    primary_url TEXT NOT NULL,
    http_status INTEGER,
    status TEXT NOT NULL DEFAULT 'HEALTHY',
    last_checked TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    records_extracted INTEGER NOT NULL DEFAULT 0,
    records_accepted INTEGER NOT NULL DEFAULT 0,
    records_rejected INTEGER NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    error_message TEXT
);

ALTER TABLE public.community_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to community sources"
    ON public.community_sources
    FOR SELECT
    TO public
    USING (true);

-- ==============================================================================
-- Table: community_conflicts
-- Purpose: Audits identity collisions or conflicting source metadata.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    normalized_handle TEXT NOT NULL,
    field TEXT NOT NULL,
    existing_value TEXT,
    conflicting_value TEXT,
    existing_source TEXT,
    conflicting_source TEXT,
    resolution TEXT NOT NULL,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_conflicts_handle
    ON public.community_conflicts (normalized_handle);

ALTER TABLE public.community_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to community conflicts"
    ON public.community_conflicts
    FOR SELECT
    TO public
    USING (true);

-- ==============================================================================
-- Table: community_refresh_log
-- Purpose: Server-side log of automated source refresh executions.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_refresh_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    sources_checked INTEGER NOT NULL DEFAULT 0,
    total_discovered INTEGER NOT NULL DEFAULT 0,
    total_verified INTEGER NOT NULL DEFAULT 0,
    total_candidates INTEGER NOT NULL DEFAULT 0,
    conflicts_detected INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    details JSONB
);

ALTER TABLE public.community_refresh_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to community refresh log"
    ON public.community_refresh_log
    FOR SELECT
    TO public
    USING (true);


