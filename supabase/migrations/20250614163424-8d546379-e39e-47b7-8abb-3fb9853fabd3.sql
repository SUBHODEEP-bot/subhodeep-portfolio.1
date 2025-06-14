
-- Create a new public storage bucket for awards
INSERT INTO storage.buckets (id, name, public)
VALUES ('awards', 'awards', true)
ON CONFLICT (id) DO NOTHING;

-- Set up row-level security policies for the awards bucket
-- Allow public read access to everyone
CREATE POLICY "Award images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'awards' );

-- Allow anyone to upload awards
CREATE POLICY "Anyone can upload an award."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'awards' );

-- Allow anyone to update award images
CREATE POLICY "Anyone can update award images."
ON storage.objects FOR UPDATE
USING ( bucket_id = 'awards' );

-- Allow anyone to delete award images
CREATE POLICY "Anyone can delete award images."
ON storage.objects FOR DELETE
USING ( bucket_id = 'awards' );
