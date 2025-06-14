
-- Create a new public storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up row-level security policies for the avatars bucket
-- Allow public read access to everyone
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users (the admin) to upload avatars
CREATE POLICY "Anyone can upload an avatar."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' );

-- Allow authenticated users to update their own avatars
CREATE POLICY "Anyone can update their own avatars."
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Anyone can delete their own avatars."
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' );
