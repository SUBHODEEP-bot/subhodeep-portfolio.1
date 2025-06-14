
-- Create education table for timeline
CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery table for media uploads
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  thumbnail_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog table for thoughts/articles
CREATE TABLE public.blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true);

-- Enable RLS on new tables
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;

-- Create policies for education (admin only can modify)
CREATE POLICY "Education is viewable by everyone" ON public.education
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify education" ON public.education
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for gallery (admin only can modify)
CREATE POLICY "Gallery is viewable by everyone" ON public.gallery
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify gallery" ON public.gallery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for blog (admin only can modify)
CREATE POLICY "Published blogs are viewable by everyone" ON public.blog
  FOR SELECT USING (published = true OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admin can modify blog" ON public.blog
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage policies for uploads bucket
CREATE POLICY "Anyone can view uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Admin can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'uploads' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add resume_url to website_content
INSERT INTO public.website_content (section, content_key, content_value) VALUES
('settings', 'resume_url', '""'),
('settings', 'dark_mode', 'false'),
('settings', 'show_education', 'true'),
('settings', 'show_gallery', 'true'),
('settings', 'show_blog', 'true');

-- Insert sample education data
INSERT INTO public.education (institution, degree, field_of_study, start_date, end_date, description) VALUES
('University of Engineering', 'Bachelor of Technology', 'Computer Science', '2021-08-01', '2025-06-01', 'Pursuing B.Tech in Computer Science with focus on software development and emerging technologies.');

-- Insert sample blog post
INSERT INTO public.blog (title, slug, content, excerpt, published, published_at) VALUES
('My Journey in Technology', 'my-journey-in-technology', 'This is where I share my thoughts and experiences in the world of technology and innovation...', 'Sharing my thoughts and experiences in technology.', true, NOW());
