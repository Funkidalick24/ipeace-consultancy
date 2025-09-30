import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'template' | 'guide' | 'article' | 'checklist' | 'regulation';
  serviceType?: string;
  tags: string[];
  fileUrl?: string;
  isPublished: boolean;
  isPremium: boolean;
  downloadCount: number;
  createdAt: string;
}

export default function ClientResources() {
  const [, navigate] = useLocation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('clientToken');
    if (!token) {
      navigate('/client-portal');
      return;
    }

    fetchResources();
  }, [navigate]);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/resources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data.resources);
      } else if (response.status === 401) {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        navigate('/client-portal');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResource = async (resource: Resource) => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch(`/api/client/resources/${resource.id}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local download count
        setResources(resources.map(r =>
          r.id === resource.id
            ? { ...r, downloadCount: r.downloadCount + 1 }
            : r
        ));

        // If there's a file URL, download it
        if (resource.fileUrl) {
          const downloadResponse = await fetch(resource.fileUrl);
          if (downloadResponse.ok) {
            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = `${resource.title}.${getFileExtension(resource.fileUrl)}`;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
          }
        }
      } else {
        alert('Failed to download resource');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      alert('Failed to download resource');
    }
  };

  const getFileExtension = (url: string): string => {
    const extension = url.split('.').pop();
    return extension || 'pdf';
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'template': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-green-100 text-green-800';
      case 'article': return 'bg-purple-100 text-purple-800';
      case 'checklist': return 'bg-yellow-100 text-yellow-800';
      case 'regulation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'template': return '📄';
      case 'guide': return '📚';
      case 'article': return '📰';
      case 'checklist': return '✅';
      case 'regulation': return '⚖️';
      default: return '📄';
    }
  };

  const categories = [
    { value: 'all', label: 'All Resources', count: resources.length },
    { value: 'template', label: 'Templates', count: resources.filter(r => r.category === 'template').length },
    { value: 'guide', label: 'Guides', count: resources.filter(r => r.category === 'guide').length },
    { value: 'article', label: 'Articles', count: resources.filter(r => r.category === 'article').length },
    { value: 'checklist', label: 'Checklists', count: resources.filter(r => r.category === 'checklist').length },
    { value: 'regulation', label: 'Regulations', count: resources.filter(r => r.category === 'regulation').length },
  ];

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    navigate('/client-portal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/client/dashboard')}
                className="text-primary-blue hover:text-secondary-blue font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Resource Library</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-primary-blue text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getCategoryIcon(resource.category)}</div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(resource.category)}`}>
                    {resource.category}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{resource.description}</p>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{resource.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {resource.downloadCount} downloads
                  </div>
                  <button
                    onClick={() => handleDownloadResource(resource)}
                    className="btn-primary px-4 py-2 rounded-md font-medium text-sm"
                  >
                    Download
                  </button>
                </div>

                {resource.isPremium && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ Premium Resource
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory !== 'all' ? 'No resources found' : 'No resources available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Legal resources will be available here soon.'
              }
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="btn-primary px-6 py-3 rounded-md font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Resource Categories Info */}
        {resources.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Resource Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">📄</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Templates</h4>
                  <p className="text-sm text-gray-600">Customizable legal document templates for common business needs</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-2xl">📚</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Guides</h4>
                  <p className="text-sm text-gray-600">Step-by-step guides for legal compliance and business procedures</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-2xl">📰</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Articles</h4>
                  <p className="text-sm text-gray-600">Educational articles on legal topics and industry updates</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Checklists</h4>
                  <p className="text-sm text-gray-600">Comprehensive checklists for legal compliance and due diligence</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-2xl">⚖️</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Regulations</h4>
                  <p className="text-sm text-gray-600">Key regulations and legal requirements for your industry</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}