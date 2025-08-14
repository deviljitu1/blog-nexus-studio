-- Create likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create saves table  
CREATE TABLE public.post_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

-- RLS policies for likes
CREATE POLICY "Users can view all likes" 
ON public.post_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own likes" 
ON public.post_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.post_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for saves
CREATE POLICY "Users can view their own saves" 
ON public.post_saves 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saves" 
ON public.post_saves 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves" 
ON public.post_saves 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add like count to blog posts view
CREATE OR REPLACE VIEW public.blog_posts_with_stats AS
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