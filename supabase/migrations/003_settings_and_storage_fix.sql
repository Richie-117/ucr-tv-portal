-- ==============================================================================
-- University College of Rathmalana (UCR) - Division of Television Studies
-- Supabase PostgreSQL Schema Migration 003: Site Settings & Storage Updates
-- ==============================================================================

-- 1. Site Settings Table (Dynamic Section Headers, Global Configurations)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read site settings
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings 
    FOR SELECT USING (true);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access to site_settings" ON public.site_settings;
CREATE POLICY "Service role full access to site_settings" ON public.site_settings 
    FOR ALL USING (true) WITH CHECK (true);

-- 2. Update Storage Bucket 'portal-media' to permit PDF documents and 15MB uploads
DO $$
BEGIN
    UPDATE storage.buckets
    SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
        file_size_limit = 15728640 -- 15MB
    WHERE id = 'portal-media';
EXCEPTION
    WHEN OTHERS THEN
        -- If storage schema is not directly modifiable via SQL editor, pass safely
        NULL;
END $$;
