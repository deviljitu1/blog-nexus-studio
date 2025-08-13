-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image TEXT,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  author_avatar TEXT,
  publish_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_time INTEGER DEFAULT 5,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

-- Create policies for admin access (for now, anyone can manage - you can add auth later)
CREATE POLICY "Anyone can insert blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete blog posts" 
ON public.blog_posts 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.blog_posts (title, excerpt, content, image, author_name, category, tags, read_time) VALUES
('The Future of Web Development', 'Exploring the latest trends and technologies shaping the future of web development.', 'Web development is constantly evolving, with new frameworks, tools, and methodologies emerging regularly. In this comprehensive guide, we explore the cutting-edge technologies that are shaping the future of web development.', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop', 'John Doe', 'Technology', '{"web development", "future", "trends"}', 8),
('Building Scalable Applications', 'Best practices for creating applications that can handle growth and increased traffic.', 'Scalability is crucial for modern applications. Learn the essential patterns and practices for building applications that can grow with your user base.', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop', 'Jane Smith', 'Development', '{"scalability", "architecture", "best practices"}', 12),
('Design Thinking in Product Development', 'How design thinking methodology can transform your product development process.', 'Design thinking puts users at the center of the development process, leading to more innovative and user-friendly products.', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&h=400&fit=crop', 'Mike Johnson', 'Design', '{"design thinking", "UX", "product development"}', 6);