import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import BlogCard from "@/components/blog/BlogCard";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const categories = [
  { name: "Technology", count: 15, color: "bg-blue-500" },
  { name: "CSS", count: 8, color: "bg-green-500" },
  { name: "React", count: 12, color: "bg-purple-500" },
  { name: "TypeScript", count: 6, color: "bg-orange-500" },
  { name: "API", count: 4, color: "bg-red-500" },
  { name: "Performance", count: 7, color: "bg-yellow-500" },
  { name: "Design", count: 5, color: "bg-pink-500" },
  { name: "Development", count: 10, color: "bg-indigo-500" },
];

const Articles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { publishedPosts, loading } = useBlogPosts();

  // Update URL when search changes
  useEffect(() => {
    if (searchQuery) {
      setSearchParams(prev => {
        prev.set('search', searchQuery);
        return prev;
      });
    } else {
      setSearchParams(prev => {
        prev.delete('search');
        return prev;
      });
    }
  }, [searchQuery, setSearchParams]);

  // Filter and sort posts
  const filteredPosts = publishedPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || post.category.toLowerCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
        case "oldest":
          return new Date(a.publish_date).getTime() - new Date(b.publish_date).getTime();
        case "popular":
          return b.read_time - a.read_time;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            All Articles
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our complete collection of articles, tutorials, and insights 
            across various topics in technology and design.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card shadow-card rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles, tags, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name.toLowerCase()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchQuery && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                Search: {searchQuery} ×
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
                Category: {categories.find(c => c.name.toLowerCase() === selectedCategory)?.name} ×
              </Badge>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-muted-foreground">
            {loading ? "Loading articles..." : `Showing ${filteredPosts.length} of ${publishedPosts.length} articles`}
          </p>
        </div>

        {/* Articles Grid/List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "space-y-6"
          }>
            {filteredPosts.map((post) => (
              <BlogCard 
                key={post.id} 
                post={post} 
                variant={viewMode === "list" ? "compact" : "default"}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;