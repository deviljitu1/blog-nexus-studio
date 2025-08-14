-- Fix the security definer view warning by removing SECURITY DEFINER
DROP VIEW IF EXISTS public.blog_posts_with_stats;

-- Create a regular view instead of security definer
CREATE VIEW public.blog_posts_with_stats AS
SELECT 
  bp.*,
  COALESCE(like_counts.like_count, 0) as like_count
FROM public.blog_posts bp
LEFT JOIN (
  SELECT 
    post_id,
    COUNT(*) as like_count
  FROM public.post_likes
  GROUP BY post_id
) like_counts ON bp.id = like_counts.post_id;

-- Fix the function search path warning
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;