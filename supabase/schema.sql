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
-- With RLS enabled and no public policies, anon/public keys cannot read or write.
-- Only the backend service role key (SUPABASE_SERVICE_ROLE_KEY) can access this table.
ALTER TABLE public.x_circle_cache ENABLE ROW LEVEL SECURITY;
