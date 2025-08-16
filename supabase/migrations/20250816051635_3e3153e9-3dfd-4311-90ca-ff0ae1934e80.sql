-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Create RLS policies for blog image uploads
CREATE POLICY "Anyone can view blog images" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their blog images" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete blog images" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);