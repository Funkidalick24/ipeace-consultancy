import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { SEOHead, pageSEO } from '@/components/seo/SEOHead';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: any[]; // Content is now an array of blocks
  publishedAt: string | null;
  createdAt: string;
  displayImage?: string;
}

export default function Blogs() {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const shareOnSocial = (platform: string, title: string, url: string) => {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);

    let shareUrl = '';
    switch (platform) {
      case 'x':
        shareUrl = `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading blogs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="site-page min-h-screen bg-[var(--cream)]">
      <SEOHead {...pageSEO.blogs} />
      <Header />

      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <span className="section-kicker mb-4">Fresh perspectives</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Ideas worth sharing</h1>
            <p className="text-xl text-gray-600">Latest insights and updates from IPEACE</p>
          </div>

          {/* View Toggle */}
          {blogs.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="flex bg-white rounded-2xl shadow-sm border border-blue-100 p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-xl"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-xl"
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          )}

          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts available yet.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "space-y-6"
            }>
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className={`bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,41,55,0.08)] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  onClick={() => window.location.href = `/blog/${blog.slug}`}
                >
                  {/* Display Image */}
                  <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'}>
                    <img
                      src={blog.displayImage || '/logo.png'}
                      alt={blog.title}
                      className={`w-full h-full object-contain bg-gray-100 ${
                        viewMode === 'list' ? 'rounded-l-lg' : 'rounded-t-lg'
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/logo.png') {
                          target.src = '/logo.png';
                        }
                      }}
                    />
                  </div>

                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h2>
                    {blog.excerpt && (
                      <p className={`text-gray-600 mb-4 ${
                        viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'
                      }`}>
                        {blog.excerpt}
                      </p>
                    )}
                    <div className={`flex justify-between items-center ${
                      viewMode === 'list' ? 'mt-auto' : ''
                    }`}>
                      <div className="text-sm text-gray-500">
                        {blog.publishedAt && new Date(blog.publishedAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            shareOnSocial('x', blog.title, `${window.location.origin}/blog/${blog.slug}`);
                          }}
                          className="w-6 h-6 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors text-xs"
                          title="Share on X"
                        >
                          𝕏
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(`${window.location.origin}/blog/${blog.slug}`);
                          }}
                          className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors text-xs"
                          title="Copy link"
                        >
                          🔗
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
