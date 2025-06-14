
-- Create table for tracking page views
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL DEFAULT '/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into page_views
CREATE POLICY "Allow public insert for page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read from page_views
CREATE POLICY "Allow public read for page views"
ON public.page_views
FOR SELECT
USING (true);


-- Create table for activity log
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Allow admin role to read activity log
CREATE POLICY "Allow admin to read activity log"
ON public.activity_log
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Allow admin role to insert into activity log
CREATE POLICY "Allow admin to insert into activity log"
ON public.activity_log
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));
