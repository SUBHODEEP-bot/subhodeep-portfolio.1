
-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create website_content table to store all dynamic content
CREATE TABLE public.website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL, -- 'hero', 'about', 'skills', 'projects', 'contact'
  content_key TEXT NOT NULL,
  content_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section, content_key)
);

-- Create projects table for portfolio management
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  github_url TEXT,
  live_url TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table for skills management
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'programming', 'tools', 'soft'
  proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100),
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for website_content (admin only can modify)
CREATE POLICY "Website content is viewable by everyone" ON public.website_content
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify website content" ON public.website_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for projects (admin only can modify)
CREATE POLICY "Projects are viewable by everyone" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for skills (admin only can modify)
CREATE POLICY "Skills are viewable by everyone" ON public.skills
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify skills" ON public.skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    CASE 
      WHEN NEW.email = 'subhodeeppal2005@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default website content
INSERT INTO public.website_content (section, content_key, content_value) VALUES
('hero', 'name', '"Subhodeep Pal"'),
('hero', 'title', '"Engineering Student | Innovator | Future Technologist"'),
('hero', 'description', '"Passionate about creating innovative solutions that bridge technology and human needs. Currently pursuing engineering while building the future, one line of code at a time."'),
('about', 'bio', '"Hello! I''m Subhodeep Pal, an engineering student with a passion for innovation and technology. I believe in creating solutions that make a difference in people''s lives."'),
('about', 'quote', '"Innovation distinguishes between a leader and a follower."'),
('contact', 'email', '"subhodeeppal2005@gmail.com"'),
('contact', 'phone', '"+91 XXXXXXXXXX"'),
('contact', 'location', '"India"');

-- Insert default skills
INSERT INTO public.skills (name, category, proficiency, icon_name) VALUES
('JavaScript', 'programming', 90, 'Code'),
('React', 'programming', 85, 'Globe'),
('Python', 'programming', 80, 'Terminal'),
('Node.js', 'programming', 75, 'Server'),
('TypeScript', 'programming', 85, 'FileCode'),
('Git', 'tools', 90, 'GitBranch'),
('Docker', 'tools', 70, 'Box'),
('AWS', 'tools', 65, 'Cloud'),
('Leadership', 'soft', 85, 'Users'),
('Communication', 'soft', 80, 'MessageSquare'),
('Problem Solving', 'soft', 90, 'Lightbulb'),
('Teamwork', 'soft', 85, 'Users');

-- Insert default projects
INSERT INTO public.projects (title, description, tech_stack, github_url, live_url, featured) VALUES
('Personal Portfolio Website', 'A modern, responsive portfolio website built with React and TypeScript', ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Supabase'], 'https://github.com/subhodeep', 'https://portfolio.subhodeep.dev', true),
('E-Commerce Platform', 'Full-stack e-commerce solution with payment integration', ARRAY['React', 'Node.js', 'MongoDB', 'Stripe'], 'https://github.com/subhodeep/ecommerce', 'https://ecommerce.subhodeep.dev', true),
('Task Management App', 'Collaborative task management application with real-time updates', ARRAY['React', 'Firebase', 'Material-UI'], 'https://github.com/subhodeep/taskmanager', 'https://tasks.subhodeep.dev', false);
