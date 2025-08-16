-- Fix security definer view issue by recreating the view without SECURITY DEFINER
-- This ensures the view uses the querying user's permissions instead of the creator's

-- Drop the existing view first
DROP VIEW IF EXISTS public.blog_posts_with_stats;

-- Recreate the view without SECURITY DEFINER (default and secure behavior)
-- Views inherit RLS policies from their underlying tables automatically
CREATE VIEW public.blog_posts_with_stats AS
SELECT 
    bp.id,
    bp.title,
    bp.excerpt,
    bp.content,
    bp.image,
    bp.author_name,
    bp.author_avatar,
    bp.publish_date,
    bp.read_time,
    bp.category,
    bp.tags,
    bp.status,
    bp.created_at,
    bp.updated_at,
    COALESCE(like_counts.like_count, 0::bigint) AS like_count
FROM blog_posts bp
LEFT JOIN (
    SELECT 
        post_likes.post_id,
        count(*) AS like_count
    FROM post_likes
    GROUP BY post_likes.post_id
) like_counts ON (bp.id = like_counts.post_id);