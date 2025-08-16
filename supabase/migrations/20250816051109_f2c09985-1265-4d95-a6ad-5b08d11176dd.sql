-- Fix critical security issue: Blog posts can be modified by anyone
-- Restrict INSERT, UPDATE, DELETE operations to authenticated users only

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can delete blog posts" ON public.blog_posts;

-- Create secure policies that require authentication
-- Only authenticated users can create blog posts
CREATE POLICY "Authenticated users can insert blog posts" 
ON public.blog_posts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update blog posts
CREATE POLICY "Authenticated users can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can delete blog posts
CREATE POLICY "Authenticated users can delete blog posts" 
ON public.blog_posts 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Keep the existing SELECT policy for published posts (public read access)
-- This policy already exists and is secure: "Anyone can view published blog posts"