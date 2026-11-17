-- ==============================================================================
-- SKEMA BASIS DATA & ROW LEVEL SECURITY (RLS) - PLATFORM PENGADUAN MASYARAKAT
-- Kompatibel: Supabase PostgreSQL 15+
-- Fitur: RBAC (Citizen, Officer, Admin), Audit Logging, Indexing, Storage RLS
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipe Enum untuk Hak Akses Pengguna
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipe Enum untuk Kategori Pengaduan
DO $$ BEGIN
    CREATE TYPE complaint_category AS ENUM (
        'infrastruktur',
        'kebersihan',
        'ketertiban_umum',
        'kesehatan',
        'lingkungan_hidup',
        'lainnya'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipe Enum untuk Status Pengaduan
DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM (
        'pending',
        'verified',
        'in_progress',
        'resolved',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. TABEL PROFILES (Tersinkronisasi Otomatis dengan auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    role user_role NOT NULL DEFAULT 'citizen',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. TABEL COMPLAINTS (Pengaduan Masyarakat)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(32) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category complaint_category NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo_url TEXT NOT NULL,
    status complaint_status NOT NULL DEFAULT 'pending',
    is_public BOOLEAN NOT NULL DEFAULT true,
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. TABEL COMPLAINT_TIMELINES (Catatan Lapangan & Riwayat Tindak Lanjut)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.complaint_timelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status complaint_status NOT NULL,
    note TEXT NOT NULL,
    evidence_photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. TABEL AUDIT_LOGS (Pencatatan Jejak Keamanan & Operasional)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_name VARCHAR(64) NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. PENGINDEKSAN DATABASE (High-Traffic Performance Optimization)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_ticket_number ON public.complaints(ticket_number);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_officer ON public.complaints(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_is_public ON public.complaints(is_public);

CREATE INDEX IF NOT EXISTS idx_timelines_complaint_id ON public.complaint_timelines(complaint_id);
CREATE INDEX IF NOT EXISTS idx_timelines_created_at ON public.complaint_timelines(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ==============================================================================
-- 7. FUNGSI DAN TRIGGER OTOMATIS
-- ==============================================================================

-- A. Auto-update timestamp 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_complaints_updated_at ON public.complaints;
CREATE TRIGGER set_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- B. Sinkronisasi Pengguna Baru (auth.users -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone_number, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone_number',
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'citizen'::public.user_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- C. Generator Nomor Tiket Otomatis (Format: TKT-YYYYMMDD-XXXX)
CREATE SEQUENCE IF NOT EXISTS public.complaint_ticket_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    v_date TEXT := to_char(timezone('utc'::text, now()), 'YYYYMMDD');
    v_seq INT;
    v_ticket TEXT;
BEGIN
    v_seq := nextval('public.complaint_ticket_seq');
    -- Format: TKT-20261117-0001 (padding 4 digit)
    v_ticket := 'TKT-' || v_date || '-' || lpad((v_seq % 10000)::text, 4, '0');
    RETURN v_ticket;
END;
$$ LANGUAGE plpgsql;

-- Trigger default nomor tiket jika tidak disediakan di Server Action
CREATE OR REPLACE FUNCTION public.set_complaint_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_ticket_number ON public.complaints;
CREATE TRIGGER trg_set_ticket_number
    BEFORE INSERT ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.set_complaint_ticket_number();

-- ==============================================================================
-- 8. HELPER SECURITY DEFINER FUNCTIONS UNTUK RLS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_officer_or_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('officer', 'admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. Policies Tabel PROFILES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles: Pemilik atau Staff dapat melihat profil" ON public.profiles;
CREATE POLICY "Profiles: Pemilik atau Staff dapat melihat profil"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR public.is_officer_or_admin()
    );

DROP POLICY IF EXISTS "Profiles: Pengguna dapat memperbarui profilnya sendiri" ON public.profiles;
CREATE POLICY "Profiles: Pengguna dapat memperbarui profilnya sendiri"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Profiles: Admin memiliki kontrol penuh" ON public.profiles;
CREATE POLICY "Profiles: Admin memiliki kontrol penuh"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- B. Policies Tabel COMPLAINTS
-- ------------------------------------------------------------------------------
-- 1. Publik (Anonim & Authenticated) dapat melihat pengaduan yang berstatus publik
DROP POLICY IF EXISTS "Complaints: Akses baca publik non-sensitif" ON public.complaints;
CREATE POLICY "Complaints: Akses baca publik non-sensitif"
    ON public.complaints FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

-- 2. Warga dapat melihat seluruh pengaduan yang mereka buat (termasuk non-publik)
DROP POLICY IF EXISTS "Complaints: Warga dapat melihat pengaduan miliknya" ON public.complaints;
CREATE POLICY "Complaints: Warga dapat melihat pengaduan miliknya"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 3. Petugas & Admin dapat melihat semua pengaduan
DROP POLICY IF EXISTS "Complaints: Petugas & Admin dapat melihat semua" ON public.complaints;
CREATE POLICY "Complaints: Petugas & Admin dapat melihat semua"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (public.is_officer_or_admin());

-- 4. Warga terdaftar dapat membuat pengaduan baru
DROP POLICY IF EXISTS "Complaints: Warga dapat menyisipkan pengaduan baru" ON public.complaints;
CREATE POLICY "Complaints: Warga dapat menyisipkan pengaduan baru"
    ON public.complaints FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 5. Petugas dapat memperbarui status pengaduan atau pengaduan yang ditugaskan
DROP POLICY IF EXISTS "Complaints: Petugas dapat memperbarui pengaduan" ON public.complaints;
CREATE POLICY "Complaints: Petugas dapat memperbarui pengaduan"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (public.is_officer_or_admin())
    WITH CHECK (public.is_officer_or_admin());

-- 6. Admin memiliki hak penuh untuk menghapus
DROP POLICY IF EXISTS "Complaints: Admin dapat menghapus pengaduan" ON public.complaints;
CREATE POLICY "Complaints: Admin dapat menghapus pengaduan"
    ON public.complaints FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- C. Policies Tabel COMPLAINT_TIMELINES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Timelines: Dapat dibaca publik jika pengaduan publik" ON public.complaint_timelines;
CREATE POLICY "Timelines: Dapat dibaca publik jika pengaduan publik"
    ON public.complaint_timelines FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_timelines.complaint_id
            AND (c.is_public = true OR c.user_id = auth.uid() OR public.is_officer_or_admin())
        )
    );

DROP POLICY IF EXISTS "Timelines: Petugas & Admin dapat menambah catatan lapangan" ON public.complaint_timelines;
CREATE POLICY "Timelines: Petugas & Admin dapat menambah catatan lapangan"
    ON public.complaint_timelines FOR INSERT
    TO authenticated
    WITH CHECK (public.is_officer_or_admin() AND actor_id = auth.uid());

-- ------------------------------------------------------------------------------
-- D. Policies Tabel AUDIT_LOGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Audit Logs: Hanya Admin yang dapat melihat log audit" ON public.audit_logs;
CREATE POLICY "Audit Logs: Hanya Admin yang dapat melihat log audit"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Audit Logs: Sistem / Pengguna terotentikasi dapat mencatat log" ON public.audit_logs;
CREATE POLICY "Audit Logs: Sistem / Pengguna terotentikasi dapat mencatat log"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ==============================================================================
-- 10. PUBLIC VIEW: SENSOR DATA SENSITIF PELAPOR (DATA PRIVACY)
-- ==============================================================================
CREATE OR REPLACE VIEW public.public_complaints_feed AS
SELECT 
    c.id,
    c.ticket_number,
    c.title,
    c.category,
    c.description,
    c.address,
    c.latitude,
    c.longitude,
    c.photo_url,
    c.status,
    c.created_at,
    -- Sensor nama pelapor (misal: "Budi Santoso" -> "B*** S***")
    CASE 
        WHEN p.full_name IS NOT NULL THEN
            regexp_replace(p.full_name, '(?<=\b\w)\w+', '***', 'g')
        ELSE 'Warga Anonim'
    END AS masked_reporter
FROM public.complaints c
LEFT JOIN public.profiles p ON c.user_id = p.id
WHERE c.is_public = true;

-- Berikan izin SELECT pada view publik
GRANT SELECT ON public.public_complaints_feed TO anon, authenticated;

-- ==============================================================================
-- 11. SUPABASE STORAGE SETUP (BUCKET & RLS)
-- ==============================================================================
-- Buat bucket 'evidence-photos' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-photos', 'evidence-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS untuk Storage Object 'evidence-photos'
DROP POLICY IF EXISTS "Storage: Siapa saja dapat melihat bukti foto" ON storage.objects;
CREATE POLICY "Storage: Siapa saja dapat melihat bukti foto"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'evidence-photos');

DROP POLICY IF EXISTS "Storage: Pengguna terotentikasi dapat mengunggah bukti foto" ON storage.objects;
CREATE POLICY "Storage: Pengguna terotentikasi dapat mengunggah bukti foto"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'evidence-photos');
