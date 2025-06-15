
-- Drop all existing policies for gallery table
DROP POLICY IF EXISTS "Allow all operations for gallery" ON public.gallery;
DROP POLICY IF EXISTS "Users can view gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admin can manage gallery" ON public.gallery;

-- Create a single permissive policy for gallery table
CREATE POLICY "Gallery public access" ON public.gallery FOR ALL USING (true);

-- Drop all existing storage policies for gallery bucket
DROP POLICY IF EXISTS "Anyone can upload to gallery bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update gallery bucket files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete gallery bucket files" ON storage.objects;
DROP POLICY IF EXISTS "Gallery files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can view gallery files" ON storage.objects;

-- Create new storage policies for gallery bucket
CREATE POLICY "Gallery storage public access" ON storage.objects
  FOR ALL USING (bucket_id = 'gallery');

-- Ensure the gallery bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;
