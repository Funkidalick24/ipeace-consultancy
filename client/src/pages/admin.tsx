import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '@/components/auth/register-form';
import AddBlogPostForm from '@/components/blog/AddBlogPostForm';
import { ContentBlock } from '@/components/blog/BlogContentEditor';
import AITrainingManager from '@/components/admin/AITrainingManager';

interface User {
  id: number;
  username: string;
  role: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: ContentBlock[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  displayImage?: string;
}

export default function Admin() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showAddBlogForm, setShowAddBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          fetchBlogs();
        } else {
          localStorage.removeItem('authToken');
          setShowAuth(true);
        }
      } else {
        setShowAuth(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setShowAuth(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/blogs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setShowAuth(false);
        setLoginError('');
        fetchBlogs();
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setBlogs([]);
    setShowAuth(true);
    setIsLoginMode(true);
  };

  const handleAddBlogPost = async (blogPostData: {
    title: string;
    slug: string;
    excerpt: string;
    content: ContentBlock[];
    published: boolean;
    displayImage?: string;
  }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogPostData)
      });

      if (response.ok) {
        // Refresh the blogs list
        fetchBlogs();
        alert('Blog post created successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Failed to create blog post:', error);
      alert('Failed to create blog post. Please try again.');
      throw error; // Re-throw to let the form handle it
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    console.log('handleEditBlog called with:', blog);
    setEditingBlog(blog);
    setShowAddBlogForm(true);
  };

  const handleUpdateBlogPost = async (blogPostData: {
    title: string;
    slug: string;
    excerpt: string;
    content: ContentBlock[];
    published: boolean;
    displayImage?: string;
  }) => {
    if (!editingBlog) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/blogs/${editingBlog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogPostData)
      });

      if (response.ok) {
        // Refresh the blogs list
        fetchBlogs();
        alert('Blog post updated successfully!');
        setEditingBlog(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update blog post');
      }
    } catch (error) {
      console.error('Failed to update blog post:', error);
      alert('Failed to update blog post. Please try again.');
      throw error;
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    console.log('handleDeleteBlog called with ID:', blogId, 'Type:', typeof blogId);
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const token = localStorage.getItem('authToken');
        console.log('Making DELETE request to:', `/api/blogs/${blogId}`);
        const response = await fetch(`/api/blogs/${blogId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          console.log('Blog deleted successfully');
          fetchBlogs();
          alert('Blog post deleted successfully!');
        } else {
          const error = await response.json();
          console.error('Delete failed:', error);
          alert('Failed to delete blog post: ' + (error.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete blog post. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-md">
          {isLoginMode ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {loginError && (
                  <div className="text-red-600 mb-4">{loginError}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLoginMode(false)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <RegisterForm
              onSuccess={() => {
                setIsLoginMode(true);
                setLoginError('');
                // Optionally show success message
                alert('Account created successfully! Please login with your credentials.');
              }}
              onSwitchToLogin={() => setIsLoginMode(true)}
            />
          )}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.username}!</h2>
          <p className="text-gray-600">Manage your blog posts and site content here.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Blog Posts</h2>
              <button
                onClick={() => setShowAddBlogForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add New Post
              </button>
            </div>
          </div>
          <div className="p-6">
            {blogs.length === 0 ? (
              <p className="text-gray-500">No blog posts yet.</p>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-md">
                    <div>
                      <h3 className="font-medium">{blog.title}</h3>
                      <p className="text-sm text-gray-600">
                        {blog.published ? 'Published' : 'Draft'} • {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          console.log('Edit button clicked for blog:', blog.id);
                          handleEditBlog(blog);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => {
                          console.log('Delete button clicked for blog:', blog.id);
                          handleDeleteBlog(blog.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AddBlogPostForm
          isOpen={showAddBlogForm}
          onClose={() => {
            setShowAddBlogForm(false);
            setEditingBlog(null);
          }}
          onSubmit={editingBlog ? handleUpdateBlogPost : handleAddBlogPost}
          initialData={editingBlog ? {
            title: editingBlog.title,
            slug: editingBlog.slug,
            excerpt: editingBlog.excerpt || '',
            content: editingBlog.content,
            published: editingBlog.published,
            displayImage: editingBlog.displayImage || ''
          } : undefined}
          key={editingBlog?.id || 'new'} // Force re-render when switching between edit/add
          isEditing={!!editingBlog}
        />

        {/* AI Training Data Section */}
        <div className="mt-8">
          <AITrainingManager />
        </div>
      </div>
    </div>
  );
}