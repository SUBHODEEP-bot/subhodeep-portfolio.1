
-- Enable RLS on all tables if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Admin can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

-- Create comprehensive policies for projects table
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow all operations for projects" ON public.projects FOR ALL USING (true);

-- Create comprehensive policies for other tables
DROP POLICY IF EXISTS "Enable read access for all users" ON public.education;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.education;
CREATE POLICY "Anyone can view education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Allow all operations for education" ON public.education FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.awards;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.awards;
CREATE POLICY "Anyone can view awards" ON public.awards FOR SELECT USING (true);
CREATE POLICY "Allow all operations for awards" ON public.awards FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.skills;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.skills;
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow all operations for skills" ON public.skills FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.website_content;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.website_content;
CREATE POLICY "Anyone can view website_content" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "Allow all operations for website_content" ON public.website_content FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.gallery;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.gallery;
CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Allow all operations for gallery" ON public.gallery FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.blog;
CREATE POLICY "Anyone can view blog" ON public.blog FOR SELECT USING (true);
CREATE POLICY "Allow all operations for blog" ON public.blog FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.contact_messages;
CREATE POLICY "Anyone can view contact_messages" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Allow all operations for contact_messages" ON public.contact_messages FOR ALL USING (true);
