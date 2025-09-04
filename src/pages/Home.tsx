import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Clock, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import heroImage from "@/assets/hero-bg.jpg";

const Home = () => {
  const [email, setEmail] = useState("");
  const { publishedPosts, loading } = useBlogPosts();
  
  const featuredPosts = publishedPosts.slice(0, 3);
  const recentPosts = publishedPosts.slice(3, 9);

  const stats = [
    { icon: BookOpen, label: "Articles", value: "150+" },
    { icon: Users, label: "Readers", value: "10K+" },
    { icon: Clock, label: "Reading Time", value: "1000+ hrs" },
    { icon: TrendingUp, label: "Growing", value: "Daily" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-glow/80"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        />
        <div className="relative container py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight animate-fade-in">
              Discover Stories That
              <span className="block text-primary-glow drop-shadow-glow animate-slide-up animate-delay-150">Inspire & Educate</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto animate-fade-in animate-delay-300">
              Join our community of curious minds exploring technology, creativity, 
              and innovation through thoughtful articles and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-lg mx-auto animate-scale-in animate-delay-300">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/50 focus:ring-white/20"
              />
              <Button size="lg" variant="secondary" className="shadow-glow hover-lift whitespace-nowrap">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group animate-fade-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div className="text-xl md:text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Featured Articles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked stories from our editorial team, covering the latest trends 
              and insights in technology and design.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading featured articles...</p>
              </div>
            ) : (
              featuredPosts.map((post, index) => (
                <div key={post.id} className="animate-fade-in hover-lift" style={{ animationDelay: `${index * 150}ms` }}>
                  <BlogCard post={post} variant="featured" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-20 content-gradient">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Latest Articles
              </h2>
              <p className="text-muted-foreground">
                Stay updated with our newest content and insights.
              </p>
            </div>
            <Link to="/articles">
              <Button variant="outline" className="mt-4 md:mt-0">
                View All Articles <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading latest articles...</p>
              </div>
            ) : (
              recentPosts.map((post, index) => (
                <div key={post.id} className="animate-fade-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                  <BlogCard post={post} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Explore Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dive deep into specific topics and discover content tailored to your interests.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase()}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="text-center p-4 md:p-6 rounded-lg bg-card shadow-card hover:shadow-elegant transition-all duration-300 group-hover:-translate-y-1 hover-lift">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${category.color} mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-glow`} />
                  <h3 className="font-semibold mb-1 md:mb-2 group-hover:text-primary transition-colors text-sm md:text-base">
                    {category.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {category.count} articles
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 hero-gradient">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Never Miss an Update
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Subscribe to our newsletter and get the latest articles delivered 
              directly to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <Button type="submit" variant="secondary" size="lg">
                Subscribe
              </Button>
            </form>
            <p className="text-sm text-white/70 mt-4">
              Join 10,000+ readers. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;