import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, CheckCircle, AlertTriangle, Wand2, Eye } from 'lucide-react';
import type { BlogPost } from '@/hooks/useBlogPosts';
import { generateSEOMetadata, generateSocialContent, validateSEO } from '@/utils/seoUtils';
import { RichTextEditor } from './RichTextEditor';
import { supabase } from '@/integrations/supabase/client';

interface PostFormProps {
  post?: BlogPost;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PostForm = ({ post, onSubmit, onCancel, loading }: PostFormProps) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    image: post?.image || '',
    author_name: post?.author_name || 'Nahush Patel',
    category: post?.category || 'General',
    tags: post?.tags || [],
    status: post?.status || 'published',
    read_time: post?.read_time || 5,
  });

  const [newTag, setNewTag] = useState('');
  const [seoMetadata, setSeoMetadata] = useState<any>(null);
  const [seoValidation, setSeoValidation] = useState<any>(null);
  const [showSEOPreview, setShowSEOPreview] = useState(false);
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);

  // Auto-generate SEO metadata when form data changes
  useEffect(() => {
    if (formData.title) {
      const metadata = generateSEOMetadata(formData);
      const validation = validateSEO({
        seoTitle: metadata.seoTitle,
        metaDescription: metadata.metaDescription,
        tags: formData.tags,
        content: formData.content
      });
      
      setSeoMetadata(metadata);
      setSeoValidation(validation);
    }
  }, [formData.title, formData.excerpt, formData.content, formData.category, formData.tags]);

  // Auto-update read time based on content
  useEffect(() => {
    if (formData.content && seoMetadata?.estimatedReadTime !== formData.read_time) {
      setFormData(prev => ({
        ...prev,
        read_time: seoMetadata?.estimatedReadTime || 5
      }));
    }
  }, [seoMetadata?.estimatedReadTime]);

  const [socialContent, setSocialContent] = useState<any>(null);

  useEffect(() => {
    if (formData.title) {
      setSocialContent(generateSocialContent(formData));
    }
  }, [formData.title, formData.excerpt, formData.category, formData.tags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const autoGenerateExcerpt = () => {
    if (formData.content && !formData.excerpt) {
      const cleanContent = formData.content.replace(/<[^>]*>/g, '').trim();
      const excerpt = cleanContent.length > 160 
        ? `${cleanContent.substring(0, 157)}...`
        : cleanContent;
      setFormData(prev => ({ ...prev, excerpt }));
    }
  };

  const handleFeaturedUpload = async () => {
    if (!featuredFile) return;
    setUploadingFeatured(true);
    try {
      const fileName = `featured/${Date.now()}-${featuredFile.name}`;
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, featuredFile);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);
      setFormData(prev => ({ ...prev, image: publicUrl }));
      setFeaturedFile(null);
    } catch (e) {
      console.error('Featured image upload failed:', e);
    } finally {
      setUploadingFeatured(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* SEO Status Card */}
      {seoValidation && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className={`h-5 w-5 ${seoValidation.score >= 80 ? 'text-green-500' : seoValidation.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`} />
                SEO Score: {seoValidation.score}/100
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSEOPreview(!showSEOPreview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showSEOPreview ? 'Hide' : 'Show'} SEO Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {seoValidation.issues.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                 <AlertDescription>
                   <strong>Issues to fix:</strong>
                   <ul className="list-disc list-inside mt-1" aria-label="SEO issues list">
                    {seoValidation.issues.map((issue: string, index: number) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {seoValidation.recommendations.length > 0 && (
               <Alert>
                 <AlertDescription>
                   <strong>Recommendations:</strong>
                   <ul className="list-disc list-inside mt-1" aria-label="SEO recommendations list">
                    {seoValidation.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {showSEOPreview && seoMetadata && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Search Engine Preview:</h4>
                <div className="space-y-2">
                  <div className="text-blue-600 text-lg font-medium">{seoMetadata.seoTitle}</div>
                  <div className="text-green-600 text-sm">{seoMetadata.canonicalUrl}</div>
                  <div className="text-gray-600 text-sm">{seoMetadata.metaDescription}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            {post ? 'Edit Post' : 'Create SEO-Optimized Post'}
          </CardTitle>
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="excerpt">SEO Description/Excerpt</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={autoGenerateExcerpt}
                    className="text-xs"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Auto-generate
                  </Button>
                </div>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="SEO-optimized description (120-160 characters recommended)"
                  rows={3}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.excerpt.length}/160 characters
                </div>
              </div>

              <div>
                <Label htmlFor="image">Featured Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                <div className="my-3 text-xs text-muted-foreground text-center">or</div>
                <div className="flex items-center gap-2">
                  <Input
                    id="featured-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFeaturedFile(e.target.files?.[0] || null)}
                  />
                  <Button type="button" onClick={handleFeaturedUpload} disabled={uploadingFeatured || !featuredFile}>
                    {uploadingFeatured ? 'Uploading...' : 'Upload & Set'}
                  </Button>
                </div>
                {formData.image && (
                  <div className="mt-3">
                    <img src={formData.image} alt="Featured preview" className="h-32 w-full object-cover rounded" />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="author">Author Name</Label>
                <Input
                  id="author"
                  value={formData.author_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="CSS">CSS</SelectItem>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="TypeScript">TypeScript</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'published' | 'draft') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  min="1"
                  value={formData.read_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.tags.length} tags • Recommended: 3-5 tags for optimal SEO
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              content={formData.content || ''}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              onTitleGenerate={(title) => setFormData(prev => ({ ...prev, title }))}
              onExcerptGenerate={(excerpt) => setFormData(prev => ({ ...prev, excerpt }))}
              placeholder="Write your SEO-optimized content here... (500+ words recommended for better search rankings)"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {formData.content ? `${formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length} words` : '0 words'} • 
              Est. read time: {seoMetadata?.estimatedReadTime || 5} minutes
            </div>
          </div>

          {/* Social Media Preview */}
          {socialContent && showSEOPreview && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Social Media Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Twitter/X Post:</Label>
                  <div className="p-3 bg-background rounded border text-sm mt-1">
                    {socialContent.twitterContent}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">LinkedIn Post:</Label>
                  <div className="p-3 bg-background rounded border text-sm mt-1">
                    {socialContent.linkedInContent}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : post ? 'Update Post' : 'Create SEO-Optimized Post'}
            </Button>
          </div>
        </form>
      </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;