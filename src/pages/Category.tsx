import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlogCard from "@/components/blog/BlogCard";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const Category = () => {
  const { category } = useParams();
  const { publishedPosts, loading } = useBlogPosts();
  
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  const filteredPosts = publishedPosts.filter(
    post => post.category.toLowerCase() === category?.toLowerCase()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Tag className="h-4 w-4 mr-2" />
              {categoryName}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {categoryName} Articles
          </h1>
          
          <p className="text-xl text-muted-foreground">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} in this category
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="py-12">
        <div className="container">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-4">No articles found</h2>
              <p className="text-muted-foreground mb-6">
                There are no published articles in the {categoryName} category yet.
              </p>
              <Link to="/articles">
                <Button>
                  Explore All Articles
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;