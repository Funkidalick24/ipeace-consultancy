import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BlogContentEditor, { ContentBlock } from './BlogContentEditor';
import { uploadFile } from '@/lib/fileUpload';

interface AddBlogPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (blogPost: {
    title: string;
    slug: string;
    excerpt: string;
    content: ContentBlock[];
    published: boolean;
    displayImage?: string;
  }) => Promise<void>;
  initialData?: {
    title: string;
    slug: string;
    excerpt: string;
    content: ContentBlock[];
    published: boolean;
    displayImage?: string;
  };
  isEditing?: boolean;
}

export default function AddBlogPostForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}: AddBlogPostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState<ContentBlock[]>(initialData?.content || []);
  const [published, setPublished] = useState(initialData?.published || false);
  const [displayImage, setDisplayImage] = useState(initialData?.displayImage || '');
  const [loading, setLoading] = useState(false);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [uploadingDisplayImage, setUploadingDisplayImage] = useState(false);
  const displayImageInputRef = useRef<HTMLInputElement>(null);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (autoGenerateSlug) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    setAutoGenerateSlug(false);
  };

  const handleFileUpload = async (file: File): Promise<{ url: string; filename: string; size: number }> => {
    const result = await uploadFile(file);
    return {
      url: result.url,
      filename: result.originalName,
      size: result.size
    };
  };

  const handleDisplayImageUpload = async (file: File) => {
    setUploadingDisplayImage(true);
    try {
      const result = await uploadFile(file);
      setDisplayImage(result.url);
    } catch (error) {
      console.error('Display image upload failed:', error);
      alert('Display image upload failed. Please try again.');
    } finally {
      setUploadingDisplayImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    if (!slug.trim()) {
      alert('Slug is required');
      return;
    }

    if (content.length === 0) {
      alert('Content is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        published,
        displayImage: displayImage.trim() || undefined
      });

      // Reset form
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent([]);
      setPublished(false);
      setAutoGenerateSlug(true);

      onClose();
    } catch (error) {
      console.error('Failed to save blog post:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Blog Post' : 'Add New Blog Post'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter blog post title..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="url-friendly-slug"
                required
              />
              <p className="text-xs text-gray-500">
                This will be used in the URL: /blog/{slug}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Excerpt</label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of the blog post..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Display Image</label>
            <div className="flex gap-2">
              <Input
                value={displayImage}
                onChange={(e) => setDisplayImage(e.target.value)}
                placeholder="Image URL or upload below (optional)"
                type="text"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => displayImageInputRef.current?.click()}
                disabled={uploadingDisplayImage}
              >
                {uploadingDisplayImage ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <input
              ref={displayImageInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleDisplayImageUpload(file);
                }
              }}
            />
            <p className="text-xs text-gray-500">
              URL of the image to display at the top of the blog post. You can enter a URL or upload an image. If left empty, the IPEACE logo will be used.
            </p>
            {displayImage && (
              <div className="mt-2">
                {displayImage.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img
                    src={displayImage}
                    alt="Display image preview"
                    className="max-w-full h-auto max-h-32 object-contain border rounded"
                    onError={(e) => {
                      console.error('Display image failed to load:', displayImage);
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <span className="text-sm font-medium">File uploaded</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(displayImage, '_blank')}
                    >
                      View File
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content *</label>
            <Card className="p-4">
              <BlogContentEditor
                content={content}
                onChange={setContent}
                onFileUpload={handleFileUpload}
              />
            </Card>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              checked={published}
              onCheckedChange={(checked) => setPublished(checked as boolean)}
            />
            <label
              htmlFor="published"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Publish immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}