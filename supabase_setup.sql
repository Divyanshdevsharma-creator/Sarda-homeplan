-- ==============================================================================
-- SARDA HOMEPLAN — COMPLETE SUPABASE DATABASE SETUP & SCHEMA
-- Single Source of Truth for all application data
-- Run this ENTIRE block in Supabase SQL Editor and click RUN.
-- ==============================================================================

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'Super Admin',
  mobile TEXT,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for admins" ON public.admins;
CREATE POLICY "Allow all for admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.admins (email, full_name, role, mobile, password)
VALUES 
  ('admin@sardahomeplan.com', 'Admin Office', 'Super Admin', '9876543210', 'admin123'),
  ('admin@saradahomeplan.com', 'Admin Office', 'Super Admin', '9876543210', 'admin123'),
  ('admin', 'Admin Office', 'Super Admin', '9876543210', 'admin123'),
  ('dkvaid1978@gmail.com', 'Dinesh Kumar Sharma', 'Admin', '9918833851', 'admin123')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  mobile = EXCLUDED.mobile;

-- 2. CUSTOMER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  mobile TEXT,
  village_city TEXT,
  district TEXT,
  avatar_url TEXT,
  landmark TEXT,
  pin_code TEXT,
  state TEXT DEFAULT 'Bihar',
  property_type TEXT DEFAULT 'Residential (1-3 Floor)',
  whatsapp_number TEXT,
  preferred_language TEXT DEFAULT 'Hindi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS pin_code TEXT;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Bihar';
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'Residential (1-3 Floor)';
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.customer_profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'Hindi';

-- Auto-confirm newly signed up auth users to avoid "Email not confirmed" / "Invalid login credentials" blocks
CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_users();

-- Update any existing unconfirmed auth users so they can log in seamlessly
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;


DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'customer_profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.customer_profiles', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for customer_profiles" ON public.customer_profiles FOR ALL USING (true) WITH CHECK (true);

-- Insert / Update known customers
INSERT INTO public.customer_profiles (id, full_name, mobile, village_city, district)
VALUES 
  ('278249c5-b731-4a97-a914-a12918ff52c5', 'Anshuman', '7905916813', 'Sheetlaganj', 'Pratapgarh'),
  ('ed19be47-cf35-4e83-910a-b51d5c1e13f2', 'Devansh Singh', '9151772250', 'saraea', 'Pratapgarh')
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  mobile = EXCLUDED.mobile,
  village_city = EXCLUDED.village_city,
  district = EXCLUDED.district;

-- 3. CUSTOMER REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.customer_requests (
  id BIGSERIAL PRIMARY KEY,
  customer_user_id UUID,
  user_id UUID,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  village_city TEXT,
  district TEXT,
  plot_length TEXT,
  plot_width TEXT,
  measurement_unit TEXT DEFAULT 'feet',
  floors TEXT DEFAULT 'G+1',
  requirements TEXT,
  vastu_consultation TEXT DEFAULT 'Standard Vastu',
  status TEXT DEFAULT 'New Request',
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_requests ADD COLUMN IF NOT EXISTS attachment_url TEXT;

ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for customer_requests" ON public.customer_requests;
CREATE POLICY "Allow all for customer_requests" ON public.customer_requests FOR ALL USING (true) WITH CHECK (true);

-- 4. SITE VISITS TABLE
CREATE TABLE IF NOT EXISTS public.site_visits (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT,
  visit_date TEXT NOT NULL,
  visit_time TEXT NOT NULL,
  status TEXT DEFAULT 'Proposed',
  notes TEXT,
  customer_response TEXT DEFAULT 'Pending',
  customer_response_notes TEXT,
  customer_preferred_date TEXT,
  customer_preferred_time TEXT,
  customer_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for site_visits" ON public.site_visits;
CREATE POLICY "Allow all for site_visits" ON public.site_visits FOR ALL USING (true) WITH CHECK (true);

-- 5. RESCHEDULE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.reschedule_requests (
  id BIGSERIAL PRIMARY KEY,
  visit_id BIGINT,
  request_id BIGINT,
  customer_id UUID,
  requested_date TEXT NOT NULL,
  requested_time TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Requested',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for reschedule_requests" ON public.reschedule_requests;
CREATE POLICY "Allow all for reschedule_requests" ON public.reschedule_requests FOR ALL USING (true) WITH CHECK (true);

-- 6. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID,
  customer_request_id BIGINT,
  project_name TEXT NOT NULL,
  project_status TEXT DEFAULT 'Planning',
  plot_length TEXT,
  plot_width TEXT,
  measurement_unit TEXT DEFAULT 'feet',
  floors TEXT DEFAULT 'G+1',
  rough_plan_url TEXT,
  final_blueprint_url TEXT,
  mistri_sheet_url TEXT,
  site_visit_status TEXT DEFAULT 'Not Scheduled',
  site_visit_date TEXT,
  site_visit_time TEXT,
  plan_status TEXT DEFAULT 'Not Available',
  payment_status TEXT DEFAULT 'Not Available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for projects" ON public.projects;
CREATE POLICY "Allow all for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT,
  customer_user_id UUID,
  customer_name TEXT,
  mobile TEXT,
  amount NUMERIC DEFAULT 1000,
  payment_type TEXT DEFAULT 'Site Visit Advance',
  payment_status TEXT DEFAULT 'Advance Received',
  payment_mode TEXT DEFAULT 'UPI / QR',
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for payments" ON public.payments;
CREATE POLICY "Allow all for payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- 8. DELIVERABLES TABLE (Architectural Plans, Blueprints, Mistri Sheets)
CREATE TABLE IF NOT EXISTS public.deliverables (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT,
  customer_id UUID,
  deliverable_type TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_name TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for deliverables" ON public.deliverables;
CREATE POLICY "Allow all for deliverables" ON public.deliverables FOR ALL USING (true) WITH CHECK (true);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  request_id BIGINT,
  type TEXT DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_tab TEXT,
  badge TEXT,
  badge_color TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for notifications" ON public.notifications;
CREATE POLICY "Allow all for notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- 10. ENABLE REALTIME ON RELEVANT TABLES
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE customer_requests, site_visits, payments, deliverables, notifications, reschedule_requests;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
    WHEN others THEN
      NULL;
  END;
END $$;

-- Reset sequence IDs
SELECT setval(pg_get_serial_sequence('public.customer_requests', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM public.customer_requests;
SELECT setval(pg_get_serial_sequence('public.site_visits', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM public.site_visits;

-- ==============================================================================
-- 11. SUPABASE STORAGE BUCKET FOR AVATARS / PROFILE PHOTOS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];

-- Storage Bucket RLS Policies
DROP POLICY IF EXISTS "Public avatars select policy" ON storage.objects;
CREATE POLICY "Public avatars select policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated avatars upload policy" ON storage.objects;
CREATE POLICY "Authenticated avatars upload policy" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated avatars update policy" ON storage.objects;
CREATE POLICY "Authenticated avatars update policy" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated avatars delete policy" ON storage.objects;
CREATE POLICY "Authenticated avatars delete policy" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');
