
-- Create the awards table to store certificate and award information
CREATE TABLE public.awards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  issued_date date,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security for the awards table
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to all awards
CREATE POLICY "Public can read awards" ON public.awards FOR SELECT USING (true);

-- Policy to allow admins to manage all awards
CREATE POLICY "Admins can manage awards" ON public.awards
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create a storage bucket for award and certificate images
INSERT INTO storage.buckets (id, name, public)
VALUES ('awards', 'awards', true);

-- Policy to allow public viewing of award images
CREATE POLICY "Award images are publicly viewable"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'awards' );

-- Policy to allow authenticated admins to upload award images
CREATE POLICY "Admins can upload award images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'awards' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy to allow authenticated admins to update award images
CREATE POLICY "Admins can update award images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'awards' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy to allow authenticated admins to delete award images
CREATE POLICY "Admins can delete award images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'awards' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
