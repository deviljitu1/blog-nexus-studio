import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  tags?: string[];
  category?: string;
}

const SEOHead = ({ 
  title = "ModernBlog - Your Premium Blogging Experience",
  description = "Discover insightful articles, tutorials, and stories on ModernBlog - your premium destination for quality content.",
  image = "https://modernblog.com/og-image.jpg",
  url = "https://modernblog.com",
  type = "website",
  publishedTime,
  author,
  tags,
  category
}: SEOHeadProps) => {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    
    // Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Article-specific tags
    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, true);
      }
      if (author) {
        updateMetaTag('article:author', author, true);
      }
      if (category) {
        updateMetaTag('article:section', category, true);
      }
      if (tags) {
        tags.forEach(tag => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.setAttribute('content', tag);
          document.head.appendChild(meta);
        });
      }
    }
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Add structured data for articles
    if (type === 'article') {
      const existingScript = document.querySelector('script[data-seo="article"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', 'article');
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": [image],
        "author": {
          "@type": "Person",
          "name": author || "ModernBlog"
        },
        "publisher": {
          "@type": "Organization",
          "name": "ModernBlog",
          "logo": {
            "@type": "ImageObject",
            "url": "https://modernblog.com/logo.png"
          }
        },
        "url": url,
        ...(publishedTime && {
          "datePublished": publishedTime,
          "dateModified": publishedTime
        }),
        ...(category && { "articleSection": category }),
        ...(tags && { "keywords": tags.join(", ") })
      };
      
      script.innerHTML = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
    
    // Cleanup function to remove article-specific tags when component unmounts
    return () => {
      if (type === 'article') {
        const articleTags = document.querySelectorAll('meta[property^="article:"]');
        articleTags.forEach(tag => tag.remove());
        
        const articleScript = document.querySelector('script[data-seo="article"]');
        if (articleScript) {
          articleScript.remove();
        }
      }
    };
  }, [title, description, image, url, type, publishedTime, author, tags, category]);
  
  return null;
};

export default SEOHead;