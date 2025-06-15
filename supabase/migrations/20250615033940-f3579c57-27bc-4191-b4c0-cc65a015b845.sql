
-- Enable Row Level Security on the education table if not already enabled
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow everyone to read the education data.
-- This is necessary for the public-facing portfolio.
CREATE POLICY "Allow public read access to education"
ON public.education
FOR SELECT
USING (true);

-- Create a policy to allow users with the 'admin' role to do everything
-- (select, insert, update, delete) on the education table.
CREATE POLICY "Allow admin full access to education"
ON public.education
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
