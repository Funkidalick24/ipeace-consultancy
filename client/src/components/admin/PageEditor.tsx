import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Eye, FileText, Edit3 } from 'lucide-react';

interface StaticPage {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  authorId?: string;
}

interface PageEditorProps {
  page?: StaticPage;
  onSave: (page: Omit<StaticPage, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>) => Promise<void>;
  onClose?: () => void;
  isOpen: boolean;
}

export default function PageEditor({ page, onSave, onClose, isOpen }: PageEditorProps) {
  const [formData, setFormData] = useState<StaticPage>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (page) {
      setFormData({
        ...page,
        excerpt: page.excerpt || ''
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        published: false
      });
    }
  }, [page]);

  const handleInputChange = (field: keyof StaticPage, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title if slug is empty
    if (field === 'title' && !formData.slug) {
      const slug = value.toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        published: formData.published
      });
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    return (
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-4">{formData.title}</h1>
        {formData.excerpt && (
          <p className="text-xl text-muted-foreground mb-6">{formData.excerpt}</p>
        )}
        <div
          className="text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formData.content }}
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {page ? 'Edit Page' : 'Create New Page'}
          </DialogTitle>
          <DialogDescription>
            {page ? 'Update the page content and settings' : 'Create a new static page for your website'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          {/* Editor Panel */}
          <div className="flex-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Page Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter page title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="page-url-slug"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL-friendly identifier for this page
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description of the page"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange('published', checked)}
                  />
                  <Label htmlFor="published">Publish page</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter page content (HTML supported)"
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  You can use HTML tags for formatting
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {previewMode ? (
                  renderPreview()
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click preview to see how the page will look</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Page'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}