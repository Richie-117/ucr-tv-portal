-- ==============================================================================
-- University College of Rathmalana (UCR) - Division of Television Studies
-- Supabase PostgreSQL Schema Migration
-- ==============================================================================

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    student_number TEXT UNIQUE NOT NULL,
    course TEXT NOT NULL CHECK (course IN ('TPOPT', 'TPRPT')),
    batch TEXT NOT NULL,
    profile_image_url TEXT,
    is_representative BOOLEAN NOT NULL DEFAULT FALSE,
    representative_role TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    phone_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_course ON public.students(course);
CREATE INDEX IF NOT EXISTS idx_students_student_number ON public.students(student_number);
CREATE INDEX IF NOT EXISTS idx_students_representative ON public.students(is_representative);

-- 3. Learning Stages Table
CREATE TABLE IF NOT EXISTS public.learning_stages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Modules Table
CREATE TABLE IF NOT EXISTS public.modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT,
    description TEXT NOT NULL DEFAULT '',
    course_codes TEXT[] NOT NULL DEFAULT '{}',
    learning_stage_id TEXT REFERENCES public.learning_stages(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('ongoing', 'upcoming', 'completed')),
    thumbnail_url TEXT,
    resources JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_status ON public.modules(status);
CREATE INDEX IF NOT EXISTS idx_modules_stage ON public.modules(learning_stage_id);

-- 5. Gallery Table
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    event_date TEXT,
    show_on_home BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    event_date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    cover_image_url TEXT,
    registration_url TEXT,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);

-- 7. Lecturers Table
CREATE TABLE IF NOT EXISTS public.lecturers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    role_type TEXT NOT NULL CHECK (role_type IN ('head', 'senior_lecturer', 'lecturer')),
    specialization TEXT NOT NULL,
    profile_image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;

-- 9. Public Read Policies
DROP POLICY IF EXISTS "Public can view students" ON public.students;
CREATE POLICY "Public can view students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view learning_stages" ON public.learning_stages;
CREATE POLICY "Public can view learning_stages" ON public.learning_stages FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Public can view modules" ON public.modules;
CREATE POLICY "Public can view modules" ON public.modules FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Public can view lecturers" ON public.lecturers;
CREATE POLICY "Public can view lecturers" ON public.lecturers FOR SELECT USING (true);

-- 10. Storage Bucket Setup (portal-media)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portal-media',
    'portal-media',
    true,
    15728640, -- 15MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    file_size_limit = 15728640;

-- Public Storage Read Access
DROP POLICY IF EXISTS "Public can view portal media" ON storage.objects;
CREATE POLICY "Public can view portal media" ON storage.objects
    FOR SELECT USING (bucket_id = 'portal-media');
