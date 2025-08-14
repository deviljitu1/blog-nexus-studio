import { Link } from "react-router-dom";
import { CalendarDays, Clock, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { BlogPost } from "@/hooks/useBlogPosts";

interface BlogCardProps {
  post: BlogPost;
  variant?: "default" | "featured" | "compact";
}

const BlogCard = ({ post, variant = "default" }: BlogCardProps) => {
  const isFeature = variant === "featured";
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <Link to={`/article/${post.id}`} className="group">
        <article className="flex space-x-4 p-4 rounded-lg hover:bg-accent/50 transition-colors">
          <img
            src={post.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&h=200&fit=crop'}
            alt={post.title}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-3">
              <span className="flex items-center">
                <CalendarDays className="h-3 w-3 mr-1" />
                {new Date(post.publish_date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {post.read_time} min read
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/article/${post.id}`} className="group">
      <Card className={`overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 group-hover:-translate-y-1 ${
        isFeature ? "h-full" : ""
      }`}>
        <div className="relative overflow-hidden">
          <img
            src={post.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop'}
            alt={post.title}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isFeature ? "h-64" : "h-48"
            }`}
          />
          {variant === "featured" && (
            <Badge className="absolute top-4 left-4 hero-gradient text-white border-0">
              Featured
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
          >
            <Tag className="h-3 w-3 mr-1" />
            {post.category}
          </Badge>
        </div>
        
        <CardHeader className="pb-2">
          <h2 className={`font-serif font-semibold leading-tight group-hover:text-primary transition-colors ${
            isFeature ? "text-2xl" : "text-xl"
          }`}>
            {post.title}
          </h2>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className={`text-muted-foreground leading-relaxed mb-4 ${
            isFeature ? "text-base" : "text-sm"
          }`}>
            {post.excerpt || 'No excerpt available'}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {post.author_avatar && (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{post.author_name}</span>
                <div className="flex items-center text-xs text-muted-foreground space-x-3">
                  <span className="flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    {new Date(post.publish_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.read_time} min read
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;