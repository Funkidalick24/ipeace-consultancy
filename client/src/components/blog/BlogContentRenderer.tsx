import React from 'react';
import { ContentBlock } from './BlogContentEditor';

interface BlogContentRendererProps {
  content: ContentBlock[];
}

export default function BlogContentRenderer({ content }: BlogContentRendererProps) {
  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={block.id} className="mb-4 text-gray-700 leading-relaxed">
            {block.content}
          </p>
        );

      case 'link':
        return (
          <p key={block.id} className="mb-4">
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {block.content}
            </a>
          </p>
        );

      case 'image':
        return (
          <div key={block.id} className="mb-6">
            <img
              src={block.url}
              alt={block.alt || ''}
              className="max-w-full h-auto rounded-lg shadow-md"
            />
            {block.alt && (
              <p className="text-sm text-gray-600 mt-2 italic">{block.alt}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={block.id} className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{block.filename}</p>
                  {block.size && (
                    <p className="text-sm text-gray-500">
                      {(block.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
              {block.url && (
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No content available.
      </div>
    );
  }

  return (
    <div className="prose prose-lg max-w-none">
      {content.map(renderBlock)}
    </div>
  );
}