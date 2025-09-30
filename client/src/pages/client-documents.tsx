import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
  createdAt: string;
  uploadedBy: string;
}

export default function ClientDocuments() {
  const [, navigate] = useLocation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent' | 'shared'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('clientToken');
    if (!token) {
      navigate('/client-portal');
      return;
    }

    fetchDocuments();
  }, [navigate]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else if (response.status === 401) {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        navigate('/client-portal');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const token = localStorage.getItem('clientToken');
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch('/api/client/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh documents list
        fetchDocuments();
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch(`/api/files/${document.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.originalName;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string): string => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return '📊';
    return '📄';
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(doc.createdAt) > sevenDaysAgo;
    }
    // For 'shared', we'll need to implement this based on the backend
    return true;
  });

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
          <p className="mt-4 text-gray-600">Loading documents...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            </div>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-primary px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </button>
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
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-blue text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Documents ({documents.length})
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'recent'
                  ? 'bg-secondary-blue text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Recent (Last 7 days)
            </button>
            <button
              onClick={() => setFilter('shared')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'shared'
                  ? 'bg-accent-yellow text-primary-blue'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Shared with Me
            </button>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getFileIcon(document.mimetype)}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(document)}
                      className="p-2 text-gray-400 hover:text-primary-blue transition-colors"
                      title="Download"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 truncate" title={document.originalName}>
                    {document.originalName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatFileSize(document.size)}
                  </p>
                </div>

                <div className="text-xs text-gray-400">
                  {new Date(document.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No documents found' : `No ${filter} documents`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't uploaded any documents yet."
                : `No documents match the ${filter} filter.`
              }
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-primary px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? 'Uploading...' : 'Upload Your First Document'}
              </button>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View All Documents
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upload Instructions */}
        {documents.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Document Management Tips</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Upload contracts, agreements, and legal documents for secure storage</li>
                    <li>Documents shared by your legal team will appear here automatically</li>
                    <li>Supported formats: PDF, Word documents, images, and text files</li>
                    <li>All files are encrypted and stored securely</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}