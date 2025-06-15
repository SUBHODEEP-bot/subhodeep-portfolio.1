
-- Enable real-time updates for the website content table
ALTER TABLE public.website_content REPLICA IDENTITY FULL;

-- Add the table to the Supabase realtime publication if it's not already there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'website_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.website_content;
  END IF;
END $$;
