
-- Drop the generic modification policy on the gallery table
DROP POLICY IF EXISTS "Only admin can modify gallery" ON public.gallery;

-- Create a specific INSERT policy for the gallery table
CREATE POLICY "Admin can insert into gallery" ON public.gallery
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a specific UPDATE policy for the gallery table
CREATE POLICY "Admin can update gallery" ON public.gallery
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
     EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a specific DELETE policy for the gallery table
CREATE POLICY "Admin can delete from gallery" ON public.gallery
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drop old policies on storage.objects for the gallery bucket
DROP POLICY IF EXISTS "Admin can upload gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete gallery files" ON storage.objects;

-- Create a new, specific INSERT policy for storage.objects
CREATE POLICY "Admin can insert gallery files" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a new, specific UPDATE policy for storage.objects
CREATE POLICY "Admin can update gallery files" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a new, specific DELETE policy for storage.objects
CREATE POLICY "Admin can delete gallery files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
