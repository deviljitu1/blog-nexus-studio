// Sample blog posts data - In production, this would come from your Supabase database
export const blogPosts = [
  {
    id: "1",
    title: "The Future of Web Development: Trends to Watch in 2024",
    excerpt: "Explore the latest trends shaping the future of web development, from AI-powered tools to the evolution of responsive design.",
    content: `<h2>Introduction</h2>
    <p>Web development is evolving at an unprecedented pace. As we navigate through 2024, several key trends are reshaping how we build and interact with web applications.</p>
    
    <h2>AI-Powered Development Tools</h2>
    <p>Artificial intelligence is revolutionizing the development process, from code generation to automated testing and deployment.</p>
    
    <h2>Advanced CSS Features</h2>
    <p>Modern CSS features like Container Queries, Subgrid, and CSS Layers are providing developers with more powerful styling capabilities.</p>
    
    <h2>The Rise of Edge Computing</h2>
    <p>Edge computing is bringing computation closer to users, resulting in faster load times and improved user experiences.</p>
    
    <h2>Conclusion</h2>
    <p>Staying updated with these trends is crucial for any web developer looking to build modern, efficient, and user-friendly applications.</p>`,
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop",
    author: "Sarah Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    category: "Technology",
    tags: ["Web Development", "AI", "CSS", "Trends"],
    featured: true
  },
  {
    id: "2",
    title: "Building Responsive Layouts with Modern CSS Grid",
    excerpt: "Master the art of creating flexible, responsive layouts using CSS Grid and modern layout techniques.",
    content: `<h2>Getting Started with CSS Grid</h2>
    <p>CSS Grid has revolutionized how we approach layout design in web development. This comprehensive guide will walk you through creating responsive layouts.</p>
    
    <h2>Grid Fundamentals</h2>
    <p>Understanding the basic concepts of grid containers, grid items, and grid lines is essential for mastering CSS Grid.</p>
    
    <h2>Responsive Design Patterns</h2>
    <p>Learn about common responsive design patterns and how to implement them using CSS Grid properties.</p>`,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    author: "Michael Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-12",
    readTime: "6 min read",
    category: "CSS",
    tags: ["CSS Grid", "Responsive Design", "Layout"]
  },
  {
    id: "3",
    title: "Getting Started with React Server Components",
    excerpt: "Learn how React Server Components can improve your app's performance and user experience.",
    content: `<h2>What are Server Components?</h2>
    <p>React Server Components represent a new paradigm in React development, allowing components to run on the server.</p>
    
    <h2>Benefits and Use Cases</h2>
    <p>Discover the performance benefits and ideal use cases for implementing Server Components in your applications.</p>`,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    author: "Emily Rodriguez",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-10",
    readTime: "10 min read",
    category: "React",
    tags: ["React", "Server Components", "Performance"]
  },
  {
    id: "4",
    title: "TypeScript Best Practices for Large Applications",
    excerpt: "Essential TypeScript patterns and practices for building maintainable large-scale applications.",
    content: `<h2>Type Safety at Scale</h2>
    <p>Learn how to leverage TypeScript's type system to build robust, maintainable applications.</p>
    
    <h2>Advanced TypeScript Patterns</h2>
    <p>Explore advanced patterns like conditional types, mapped types, and utility types.</p>`,
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
    author: "David Kim",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-08",
    readTime: "12 min read",
    category: "TypeScript",
    tags: ["TypeScript", "Best Practices", "Architecture"]
  },
  {
    id: "5",
    title: "The Art of API Design: Creating Developer-Friendly Interfaces",
    excerpt: "Design principles and best practices for creating APIs that developers love to use.",
    content: `<h2>API Design Principles</h2>
    <p>Good API design is crucial for developer experience and application scalability.</p>
    
    <h2>RESTful Best Practices</h2>
    <p>Learn the principles of REST and how to apply them effectively in your API design.</p>`,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    author: "Alex Thompson",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-05",
    readTime: "9 min read",
    category: "API",
    tags: ["API Design", "REST", "Backend"]
  },
  {
    id: "6",
    title: "Optimizing Web Performance: A Comprehensive Guide",
    excerpt: "Techniques and strategies for improving web performance and delivering exceptional user experiences.",
    content: `<h2>Performance Fundamentals</h2>
    <p>Understanding the core metrics and principles of web performance optimization.</p>
    
    <h2>Loading Strategies</h2>
    <p>Implement effective loading strategies including lazy loading, code splitting, and resource optimization.</p>`,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    author: "Lisa Wang",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-03",
    readTime: "11 min read",
    category: "Performance",
    tags: ["Performance", "Optimization", "UX"]
  }
];

export const categories = [
  { name: "Technology", count: 15, color: "bg-blue-500" },
  { name: "CSS", count: 8, color: "bg-green-500" },
  { name: "React", count: 12, color: "bg-purple-500" },
  { name: "TypeScript", count: 6, color: "bg-orange-500" },
  { name: "API", count: 4, color: "bg-red-500" },
  { name: "Performance", count: 7, color: "bg-yellow-500" },
];

export const featuredPosts = blogPosts.filter(post => post.featured);
export const recentPosts = blogPosts.slice(0, 6);