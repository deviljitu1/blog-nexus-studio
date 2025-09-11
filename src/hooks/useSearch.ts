import { useMemo } from 'react';
import { useBlogPosts, BlogPost } from './useBlogPosts';

export interface SearchSuggestion {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  type: 'post';
}

export const useSearch = (query: string) => {
  const { publishedPosts, loading } = useBlogPosts();

  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const searchTerm = query.toLowerCase();
    
    return publishedPosts
      .filter((post: BlogPost) => (
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt?.toLowerCase().includes(searchTerm) ||
        post.category.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      ))
      .slice(0, 5)
      .map((post: BlogPost) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        category: post.category,
        type: 'post' as const,
      }));
  }, [query, publishedPosts]);

  return {
    suggestions,
    loading,
    hasResults: suggestions.length > 0,
  };
};