import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  author_name: string;
  author_avatar: string | null;
  publish_date: string;
  read_time: number;
  category: string;
  tags: string[];
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  featured?: boolean;
}

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setPosts((data as BlogPost[]) || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Ensure user is authenticated before insert
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Please log in to create posts.');

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => [data as BlogPost, ...prev]);
      toast({
        title: "Success",
        description: "Blog post created successfully!",
      });
      return data;
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create post',
        variant: "destructive",
      });
      throw err;
    }
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => prev.map(post => post.id === id ? data as BlogPost : post));
      toast({
        title: "Success",
        description: "Blog post updated successfully!",
      });
      return data;
    } catch (err) {
      console.error('Error updating post:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update post',
        variant: "destructive",
      });
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== id));
      toast({
        title: "Success",
        description: "Blog post deleted successfully!",
      });
    } catch (err) {
      console.error('Error deleting post:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete post',
        variant: "destructive",
      });
      throw err;
    }
  };

  const getPublishedPosts = () => {
    return posts.filter(post => post.status === 'published');
  };

  const getPostById = (id: string) => {
    return posts.find(post => post.id === id);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    publishedPosts: getPublishedPosts(),
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    getPostById,
    refetch: fetchPosts,
  };
};