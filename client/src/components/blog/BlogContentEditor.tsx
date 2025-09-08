import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'link' | 'image' | 'file';
  content?: string;
  url?: string;
  alt?: string;
  filename?: string;
  size?: number;
}

interface BlogContentEditorProps {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
  onFileUpload?: (file: File) => Promise<{ url: string; filename: string; size: number }>;
}

export default function BlogContentEditor({ content, onChange, onFileUpload }: BlogContentEditorProps) {
  const [newBlockType, setNewBlockType] = useState<ContentBlock['type']>('paragraph');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
    };

    if (type === 'paragraph') {
      newBlock.content = '';
    } else if (type === 'link') {
      newBlock.content = '';
      newBlock.url = '';
    } else if (type === 'image') {
      newBlock.url = '';
      newBlock.alt = '';
    } else if (type === 'file') {
      newBlock.url = '';
      newBlock.filename = '';
      newBlock.size = 0;
    }

    onChange([...content, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    const updatedContent = content.map(block =>
      block.id === id ? { ...block, ...updates } : block
    );
    onChange(updatedContent);
  };

  const deleteBlock = (id: string) => {
    onChange(content.filter(block => block.id !== id));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = content.findIndex(block => block.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.length) return;

    const newContent = [...content];
    [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
    onChange(newContent);
  };

  const handleFileUpload = async (blockId: string, file: File) => {
    if (!onFileUpload) return;

    setUploading(true);
    try {
      const result = await onFileUpload(file);
      console.log('File upload result:', result); // Debug log
      updateBlock(blockId, {
        url: result.url,
        filename: result.filename,
        size: result.size,
        alt: result.filename, // Use filename as alt text if not provided
        content: result.filename // For display purposes
      });
    } catch (error) {
      console.error('File upload failed:', error);
      alert(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <Textarea
            value={block.content || ''}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Enter paragraph text..."
            className="min-h-[100px]"
          />
        );

      case 'link':
        return (
          <div className="space-y-2">
            <Input
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Descriptive link text (e.g., 'Learn more about our services')"
            />
            <Input
              value={block.url || ''}
              onChange={(e) => updateBlock(block.id, { url: e.target.value })}
              placeholder="https://example.com or /api/files/id"
              type="text"
            />
            {block.url && block.content && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  Preview: <a href={block.url} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">{block.content}</a>
                </p>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <Input
              value={block.url || ''}
              onChange={(e) => updateBlock(block.id, { url: e.target.value })}
              placeholder="File URL... (or upload below)"
              type="text"
            />
            <Input
              value={block.alt || ''}
              onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
              placeholder="Description..."
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(block.id, file);
                  }
                }}
              />
            </div>
            {block.url && block.filename && (
              <div className="mt-2">
                {block.filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img
                    src={block.url}
                    alt={block.alt || ''}
                    className="max-w-full h-auto max-h-48 object-contain border rounded"
                    onError={(e) => {
                      console.error('Image failed to load:', block.url);
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{block.filename}</span>
                    {block.size && (
                      <span className="text-xs text-gray-500">
                        ({(block.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(block.url, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(block.id, file);
                  }
                }}
              />
            </div>
            {block.filename && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{block.filename}</span>
                {block.size && (
                  <span className="text-xs text-gray-500">
                    ({(block.size / 1024).toFixed(1)} KB)
                  </span>
                )}
                {block.url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(block.url, '_blank')}
                  >
                    Download
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('paragraph')}
        >
          Add Paragraph
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('link')}
        >
          Add Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('image')}
        >
          Add Image
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('file')}
        >
          Add File
        </Button>
      </div>

      <div className="space-y-4">
        {content.map((block, index) => (
          <Card key={block.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {block.type}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === content.length - 1}
                  >
                    ↓
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteBlock(block.id)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </Button>
            </div>
            {renderBlock(block)}
          </Card>
        ))}
      </div>

      {content.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No content blocks yet. Click the buttons above to add content.
        </div>
      )}
    </div>
  );
}