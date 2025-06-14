
-- Create storage bucket for gallery uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true);

-- Create storage policies for the gallery bucket
CREATE POLICY "Anyone can view gallery files" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Admin can upload gallery files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update gallery files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete gallery files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
