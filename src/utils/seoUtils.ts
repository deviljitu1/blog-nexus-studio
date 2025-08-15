// Utility functions for SEO optimization
export const generateSEOMetadata = (formData: {
  title: string;
  excerpt?: string;
  content?: string;
  category: string;
  tags: string[];
  author_name: string;
}) => {
  // Generate SEO-optimized title (under 60 characters)
  const seoTitle = formData.title.length > 60 
    ? `${formData.title.substring(0, 57)}...`
    : formData.title;

  // Generate meta description (120-160 characters optimal)
  let metaDescription = formData.excerpt || '';
  
  if (!metaDescription && formData.content) {
    // Extract first sentence or paragraph from content
    const cleanContent = formData.content.replace(/<[^>]*>/g, '').trim();
    metaDescription = cleanContent.length > 160 
      ? `${cleanContent.substring(0, 157)}...`
      : cleanContent;
  }
  
  if (!metaDescription) {
    metaDescription = `Read about ${formData.title} on ModernBlog. Discover insights about ${formData.category.toLowerCase()} and more.`;
  }

  // Ensure meta description is within optimal length
  if (metaDescription.length > 160) {
    metaDescription = `${metaDescription.substring(0, 157)}...`;
  }

  // Generate URL-friendly slug
  const slug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Calculate estimated read time based on content
  const estimatedReadTime = formData.content 
    ? Math.max(1, Math.ceil(formData.content.split(/\s+/).length / 200)) // Average 200 words per minute
    : 5;

  // Generate structured data keywords
  const keywords = [
    ...formData.tags,
    formData.category,
    'blog',
    'article',
    formData.author_name.split(' ')[0].toLowerCase()
  ].filter(Boolean).join(', ');

  return {
    seoTitle,
    metaDescription,
    slug,
    estimatedReadTime,
    keywords,
    canonicalUrl: `https://modernblog.com/article/${slug}`,
    structuredData: generateStructuredData({
      title: seoTitle,
      description: metaDescription,
      category: formData.category,
      tags: formData.tags,
      author: formData.author_name,
      slug
    })
  };
};

export const generateStructuredData = ({
  title,
  description,
  category,
  tags,
  author,
  slug,
  publishDate,
  image
}: {
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  slug: string;
  publishDate?: string;
  image?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image || "https://modernblog.com/og-image.jpg",
    "author": {
      "@type": "Person",
      "name": author,
      "url": `https://modernblog.com/author/${author.toLowerCase().replace(/\s+/g, '-')}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "ModernBlog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://modernblog.com/logo.png",
        "width": 200,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://modernblog.com/article/${slug}`
    },
    "url": `https://modernblog.com/article/${slug}`,
    "datePublished": publishDate || new Date().toISOString(),
    "dateModified": publishDate || new Date().toISOString(),
    "articleSection": category,
    "keywords": tags.join(", "),
    "wordCount": 500, // This would be calculated from actual content
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "genre": category,
    "about": {
      "@type": "Thing",
      "name": category
    }
  };
};

// Generate social media optimized content
export const generateSocialContent = (formData: {
  title: string;
  excerpt?: string;
  category: string;
  tags: string[];
}) => {
  const hashtags = formData.tags
    .slice(0, 3) // Limit to 3 hashtags for better engagement
    .map(tag => `#${tag.replace(/\s+/g, '')}`)
    .join(' ');

  return {
    twitterContent: `${formData.title}\n\n${formData.excerpt || ''}\n\n${hashtags}`,
    linkedInContent: `${formData.title}\n\n${formData.excerpt || ''}\n\nRead more about ${formData.category.toLowerCase()} on our blog.\n\n${hashtags}`,
    facebookContent: formData.excerpt || formData.title
  };
};

// Validate SEO quality
export const validateSEO = (metadata: {
  seoTitle: string;
  metaDescription: string;
  tags: string[];
  content?: string;
}) => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Title validation
  if (metadata.seoTitle.length < 30) {
    issues.push("Title is too short (should be 30-60 characters)");
  }
  if (metadata.seoTitle.length > 60) {
    issues.push("Title is too long (should be under 60 characters)");
  }

  // Meta description validation
  if (metadata.metaDescription.length < 120) {
    recommendations.push("Meta description could be longer (120-160 characters optimal)");
  }
  if (metadata.metaDescription.length > 160) {
    issues.push("Meta description is too long (should be under 160 characters)");
  }

  // Tags validation
  if (metadata.tags.length < 3) {
    recommendations.push("Consider adding more tags (3-5 recommended for better SEO)");
  }
  if (metadata.tags.length > 10) {
    recommendations.push("Too many tags might dilute SEO focus (5-8 tags recommended)");
  }

  // Content validation
  if (metadata.content && metadata.content.length < 300) {
    recommendations.push("Content is quite short. Longer content (500+ words) tends to rank better");
  }

  return {
    score: Math.max(0, 100 - (issues.length * 20) - (recommendations.length * 5)),
    issues,
    recommendations,
    isOptimal: issues.length === 0 && recommendations.length <= 2
  };
};