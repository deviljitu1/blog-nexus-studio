import { useParams, Link } from "react-router-dom";
import { CalendarDays, Clock, User, Tag, ArrowLeft, Share, Bookmark, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BlogCard from "@/components/blog/BlogCard";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import SEOHead from "@/components/SEOHead";

const BlogPost = () => {
  const { id } = useParams();
  const { getPostById, publishedPosts } = useBlogPosts();
  const { toast } = useToast();
  const { toggleLike, toggleSave, checkIfLiked, checkIfSaved, getLikeCount } = usePostInteractions();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const post = getPostById(id || '');
  
  // Mock user ID for demo - in real app, get from auth
  const userId = "demo-user-123";
  


  // Load interaction states on component mount
  useEffect(() => {
    if (post && userId) {
      const loadInteractionStates = async () => {
        setLoading(true);
        try {
          const [liked, saved, count] = await Promise.all([
            checkIfLiked(post.id, userId),
            checkIfSaved(post.id, userId),
            getLikeCount(post.id)
          ]);
          
          setIsLiked(liked);
          setIsSaved(saved);
          setLikeCount(count);
        } catch (error) {
          console.error('Error loading interaction states:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadInteractionStates();
    }
  }, [post?.id, userId]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/articles">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = publishedPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || 'Check out this article',
          url: url
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The article link has been copied to your clipboard.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async () => {
    if (!post) return;
    
    const newSavedState = await toggleSave(post.id, userId);
    setIsSaved(newSavedState);
  };

  const handleLike = async () => {
    if (!post) return;
    
    const { isLiked: newLikedState, likeCount: newLikeCount } = await toggleLike(post.id, userId);
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this article: ${post.title}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEOHead
        title={`${post.title} - ModernBlog`}
        description={post.excerpt || `Read ${post.title} on ModernBlog`}
        image={post.image || "https://modernblog.com/og-image.jpg"}
        url={`${window.location.origin}/article/${post.id}`}
        type="article"
        publishedTime={post.publish_date}
        author={post.author_name}
        tags={post.tags}
        category={post.category}
      />
      <article className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 py-8">
        <div className="container">
          <Link to="/articles" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
          
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {post.category}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                {post.author_avatar && (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{post.author_name}</p>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <span className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {new Date(post.publish_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.read_time} min read
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare} disabled={loading}>
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSave}
                  disabled={loading}
                  className={isSaved ? "bg-primary text-primary-foreground" : ""}
                >
                  <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLike}
                  disabled={loading}
                  className={isLiked ? "bg-red-500 text-white hover:bg-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                  <span className="flex items-center gap-1">
                    {isLiked ? "Liked" : "Like"}
                    {likeCount > 0 && <span className="text-xs">({likeCount})</span>}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={post.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="prose-blog">
                  {post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <p>No content available for this post.</p>
                  )}
                </div>
                
                {/* Tags */}
                <div className="mt-12 pt-8 border-t">
                  <h3 className="font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link key={tag} to={`/tag/${tag.toLowerCase()}`}>
                        <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Author Bio */}
                <div className="mt-12 p-6 bg-muted/30 rounded-lg">
                  <div className="flex items-start space-x-4">
                    {post.author_avatar && (
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{post.author_name}</h3>
                      <p className="text-muted-foreground mb-4">
                        Passionate writer and developer sharing insights about modern web development, 
                        design trends, and technology innovation. Follow for more great content.
                      </p>
                      <Button variant="outline" size="sm">
                        Follow {post.author_name}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Table of Contents */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-semibold mb-3">Table of Contents</h3>
                    <nav className="space-y-2 text-sm">
                      <a href="#introduction" className="block text-muted-foreground hover:text-primary">
                        Introduction
                      </a>
                      <a href="#main-content" className="block text-muted-foreground hover:text-primary">
                        Main Content
                      </a>
                      <a href="#conclusion" className="block text-muted-foreground hover:text-primary">
                        Conclusion
                      </a>
                    </nav>
                  </div>
                  
                  {/* Share */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-semibold mb-3">Share this article</h3>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm" className="justify-start" onClick={handleShareTwitter}>
                        Share on Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start" onClick={handleShareLinkedIn}>
                        Share on LinkedIn
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start" onClick={handleCopyLink}>
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-serif font-bold mb-8 text-center">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
      </article>
    </>
  );
};

export default BlogPost;