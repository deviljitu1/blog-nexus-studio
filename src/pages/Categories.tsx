import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/SEOHead";

const Categories = () => {
  const { posts, loading } = useBlogPosts();
  const [categories, setCategories] = useState<Array<{ name: string; count: number; posts: any[] }>>([]);

  useEffect(() => {
    if (posts.length > 0) {
      // Group posts by category
      const categoryMap = posts
        .filter(post => post.status === 'published')
        .reduce((acc, post) => {
          const category = post.category || 'General';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(post);
          return acc;
        }, {} as Record<string, any[]>);

      // Convert to array format
      const categoryArray = Object.entries(categoryMap).map(([name, posts]) => ({
        name,
        count: posts.length,
        posts: posts.slice(0, 3) // Show first 3 posts
      }));

      setCategories(categoryArray.sort((a, b) => b.count - a.count));
    }
  }, [posts]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <SEOHead 
          title="Categories"
          description="Browse articles by category"
        />
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-48 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8 px-4">
      <SEOHead 
        title="Categories"
        description="Browse our articles organized by categories. Find content that interests you the most."
      />
      
      <div className="text-center space-y-4 mb-8 md:mb-12 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-serif font-bold">Categories</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Explore our articles organized by topics and interests
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-4">No categories found</h2>
          <p className="text-muted-foreground">
            Articles will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div 
              key={category.name} 
              className="animate-fade-in hover-lift"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="hover:shadow-elegant transition-all duration-300 h-full shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl font-serif">{category.name}</CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {category.count} articles
                    </Badge>
                  </div>
                  <CardDescription className="text-sm md:text-base">
                    Latest articles in {category.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.posts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/article/${post.id}`}
                        className="block p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors hover-lift"
                      >
                        <h4 className="font-medium text-sm line-clamp-2 mb-1 hover:text-primary transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.publish_date).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                    {category.count > 3 && (
                      <Link
                        to={`/category/${encodeURIComponent(category.name)}`}
                        className="block text-sm text-primary hover:underline font-medium pt-2 transition-colors hover:text-primary/80"
                      >
                        View all {category.count} articles →
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;