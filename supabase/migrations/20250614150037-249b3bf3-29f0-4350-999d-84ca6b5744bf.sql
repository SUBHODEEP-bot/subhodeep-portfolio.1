
-- Create table for contact form messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert messages
CREATE POLICY "Allow public insert for contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Policy: Allow admin to read messages
CREATE POLICY "Allow admin to read contact messages"
ON public.contact_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Policy: Allow admin to update messages (e.g., mark as read)
CREATE POLICY "Allow admin to update contact messages"
ON public.contact_messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Policy: Allow admin to delete messages
CREATE POLICY "Allow admin to delete contact messages"
ON public.contact_messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));
