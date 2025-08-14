import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PostInteraction {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export const usePostInteractions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkIfLiked = async (postId: string, userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking like status:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking like status:', err);
      return false;
    }
  };

  const checkIfSaved = async (postId: string, userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('post_saves')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking save status:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking save status:', err);
      return false;
    }
  };

  const getLikeCount = async (postId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        console.error('Error getting like count:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Error getting like count:', err);
      return 0;
    }
  };

  const toggleLike = async (postId: string, userId: string): Promise<{ isLiked: boolean; likeCount: number }> => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like articles.",
        variant: "destructive",
      });
      return { isLiked: false, likeCount: 0 };
    }

    setLoading(true);
    try {
      const isCurrentlyLiked = await checkIfLiked(postId, userId);

      if (isCurrentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;

        const likeCount = await getLikeCount(postId);
        toast({
          title: "Like removed",
          description: "Article removed from your liked list.",
        });
        return { isLiked: false, likeCount };
      } else {
        // Add like
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: userId }]);

        if (error) throw error;

        const likeCount = await getLikeCount(postId);
        toast({
          title: "Article liked!",
          description: "Thanks for the feedback!",
        });
        return { isLiked: true, likeCount };
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
      return { isLiked: false, likeCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (postId: string, userId: string): Promise<boolean> => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save articles.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const isCurrentlySaved = await checkIfSaved(postId, userId);

      if (isCurrentlySaved) {
        // Remove save
        const { error } = await supabase
          .from('post_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;

        toast({
          title: "Article removed",
          description: "Article removed from your saved list.",
        });
        return false;
      } else {
        // Add save
        const { error } = await supabase
          .from('post_saves')
          .insert([{ post_id: postId, user_id: userId }]);

        if (error) throw error;

        toast({
          title: "Article saved!",
          description: "You can find it in your saved articles.",
        });
        return true;
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      toast({
        title: "Error",
        description: "Failed to update save status.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkIfLiked,
    checkIfSaved,
    getLikeCount,
    toggleLike,
    toggleSave,
    loading,
  };
};