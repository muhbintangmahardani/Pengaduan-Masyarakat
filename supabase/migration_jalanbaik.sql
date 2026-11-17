-- ==============================================================================
-- MIGRATION: JALANBAIK WORKFLOW ENHANCEMENT
-- Menambahkan kolom dan status workflow per-role (Citizen -> Admin -> Officer -> Admin Review)
-- ==============================================================================

-- 1. Tambah status 'under_review' jika belum ada
ALTER TYPE complaint_status ADD VALUE IF NOT EXISTS 'under_review';

-- 2. Tambahkan kolom pendukung workflow jalanbaik ke tabel complaints
ALTER TABLE public.complaints
    ADD COLUMN IF NOT EXISTS damage_type VARCHAR(100) DEFAULT 'Jalan berlubang',
    ADD COLUMN IF NOT EXISTS damage_level VARCHAR(50) DEFAULT 'Sedang',
    ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Sedang',
    ADD COLUMN IF NOT EXISTS target_date DATE,
    ADD COLUMN IF NOT EXISTS completion_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS completion_note TEXT,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 3. Update generator nomor tiket menjadi format JB-YYYY-XXXX (Contoh: JB-2026-0142)
CREATE SEQUENCE IF NOT EXISTS public.complaint_jb_seq START 140;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    v_year TEXT := to_char(timezone('utc'::text, now()), 'YYYY');
    v_seq INT := nextval('public.complaint_jb_seq');
BEGIN
    RETURN 'JB-' || v_year || '-' || lpad((v_seq % 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Indeks performa untuk query tugas petugas & antrean admin
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_officer_status ON public.complaints(assigned_officer_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_target_date ON public.complaints(target_date);
