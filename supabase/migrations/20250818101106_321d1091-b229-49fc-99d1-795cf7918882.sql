-- Fix the remaining security definer view and function
-- The error is about blog_posts_with_stats view having SECURITY DEFINER
DROP VIEW IF EXISTS public.blog_posts_with_stats;

-- Recreate the view without SECURITY DEFINER
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

-- Fix the remaining function that doesn't have search_path set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;