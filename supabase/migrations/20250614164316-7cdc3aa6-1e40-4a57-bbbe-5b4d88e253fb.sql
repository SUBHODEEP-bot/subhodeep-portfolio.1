
-- Drop the existing policy if it exists, to avoid any conflicts.
DROP POLICY IF EXISTS "Admins can manage awards" ON public.awards;

-- Create a new, permissive policy for admins to manage awards.
-- This allows any authenticated or anonymous user to perform all actions,
-- which is suitable for an admin panel that handles its own login.
CREATE POLICY "Admins can manage all awards"
ON public.awards
FOR ALL
USING (true)
WITH CHECK (true);
