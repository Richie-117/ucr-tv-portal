-- ==============================================================================
-- University College of Rathmalana (UCR) - Division of Television Studies
-- Supabase PostgreSQL Schema Migration 002: Timetables & Overrides
-- ==============================================================================

-- 1. Timetables Table
CREATE TABLE IF NOT EXISTS public.timetables (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('foundation', 'academic_1', 'academic_2')),
    course TEXT NOT NULL CHECK (course IN ('TPOPT', 'TPRPT')),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    batch_label TEXT NOT NULL,
    pdf_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_timetables_category ON public.timetables(category);
CREATE INDEX IF NOT EXISTS idx_timetables_course ON public.timetables(course);
CREATE INDEX IF NOT EXISTS idx_timetables_published ON public.timetables(is_published);

-- 2. Timetable Overrides Table
CREATE TABLE IF NOT EXISTS public.timetable_overrides (
    id TEXT PRIMARY KEY,
    timetable_id TEXT REFERENCES public.timetables(id) ON DELETE CASCADE,
    timetable_slot_id TEXT,
    course TEXT CHECK (course IN ('TPOPT', 'TPRPT')),
    exception_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('POSTPONED', 'UNAVAILABLE')),
    reason TEXT,
    rescheduled_date TEXT,
    rescheduled_start_time TEXT,
    rescheduled_end_time TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_overrides_date ON public.timetable_overrides(exception_date);
CREATE INDEX IF NOT EXISTS idx_overrides_course ON public.timetable_overrides(course);
CREATE INDEX IF NOT EXISTS idx_overrides_active ON public.timetable_overrides(is_active);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_overrides ENABLE ROW LEVEL SECURITY;

-- Allow public read of published timetables and active overrides
CREATE POLICY "Public timetables are viewable by everyone" 
    ON public.timetables FOR SELECT 
    USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Public timetable overrides are viewable by everyone" 
    ON public.timetable_overrides FOR SELECT 
    USING (is_active = true OR auth.role() = 'authenticated');

-- Full control for service role / admin
CREATE POLICY "Service role full access to timetables" 
    ON public.timetables FOR ALL 
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to timetable overrides" 
    ON public.timetable_overrides FOR ALL 
    USING (true) WITH CHECK (true);
