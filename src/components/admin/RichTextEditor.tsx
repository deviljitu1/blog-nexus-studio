import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Loader2
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onTitleGenerate?: (title: string) => void;
  onExcerptGenerate?: (excerpt: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onTitleGenerate,
  onExcerptGenerate,
  placeholder = "Start writing your blog post..."
}) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:text-primary/80',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  const generateContent = async (type: 'blog' | 'title' | 'excerpt') => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for content generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: aiPrompt,
          type,
          category: 'General'
        }
      });

      if (error) throw error;

      if (type === 'blog' && editor) {
        editor.commands.setContent(data.content);
      } else if (type === 'title' && onTitleGenerate) {
        onTitleGenerate(data.content);
      } else if (type === 'excerpt' && onExcerptGenerate) {
        onExcerptGenerate(data.content);
      }

      toast({
        title: "Success",
        description: `${type === 'blog' ? 'Content' : type === 'title' ? 'Title' : 'Excerpt'} generated successfully!`,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, imageFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const insertImage = async () => {
    let finalImageUrl = imageUrl;

    if (imageFile) {
      finalImageUrl = await uploadImage();
      if (!finalImageUrl) return;
    }

    if (!finalImageUrl) {
      toast({
        title: "Error",
        description: "Please provide an image URL or select a file",
        variant: "destructive",
      });
      return;
    }

    editor?.chain().focus().setImage({ src: finalImageUrl }).run();
    setIsImageDialogOpen(false);
    setImageUrl('');
    setImageFile(null);
  };

  const insertLink = () => {
    const url = window.prompt('Enter link URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return <div className="h-96 bg-muted animate-pulse rounded-md" />;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* AI Content Generation */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Content Generation
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Describe what you want to write about..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => generateContent('blog')}
              disabled={isGenerating}
              size="sm"
              className="min-w-[100px]"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => generateContent('title')}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              Generate Title
            </Button>
            <Button
              onClick={() => generateContent('excerpt')}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              Generate Excerpt
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-muted/30 border-b">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="text-center">
                <span className="text-sm text-muted-foreground">OR</span>
              </div>
              <div>
                <Label htmlFor="image-file">Upload Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    onClick={insertImage}
                    disabled={isUploading || (!imageUrl && !imageFile)}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Insert
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};