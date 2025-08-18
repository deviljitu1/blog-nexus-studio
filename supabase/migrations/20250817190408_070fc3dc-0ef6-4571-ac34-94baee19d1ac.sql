-- Drop the existing view
DROP VIEW IF EXISTS public.blog_posts_with_stats;

-- Recreate the view WITHOUT SECURITY DEFINER
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
    post_id,
    count(*) AS like_count
  FROM post_likes
  GROUP BY post_id
) like_counts ON bp.id = like_counts.post_id;

-- Enable RLS on the view
ALTER VIEW public.blog_posts_with_stats SET (security_barrier = true);

-- Add RLS policy to only show published posts to unauthenticated users
-- and all posts to authenticated users
CREATE POLICY "Published posts visible to all, all posts to authenticated users" 
ON public.blog_posts_with_stats 
FOR SELECT 
USING (
  status = 'published' OR auth.uid() IS NOT NULL
);