console.log('[DEBUG] Admin module loading...');

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '@/components/auth/register-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Mail, FileText, BarChart3, MessageSquare, Image, Settings, Brain, LogOut } from 'lucide-react';
import AddBlogPostForm from '@/components/blog/AddBlogPostForm';
import { ContentBlock } from '@/components/blog/BlogContentEditor';
import AITrainingManager from '@/components/admin/AITrainingManager';
import UserList from '@/components/admin/UserList';
import ConsultationList from '@/components/admin/ConsultationList';
import ContactList from '@/components/admin/ContactList';
import MediaLibrary from '@/components/admin/MediaLibrary';
import ContentManager from '@/components/admin/ContentManager';

console.log('[DEBUG] Admin module imports completed');

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

interface DashboardStats {
  totalUsers: number;
  totalConsultations: number;
  totalContacts: number;
  totalBlogs: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  color: string;
}

export default function Admin() {
  console.log('[DEBUG] Admin component rendering');

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
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalConsultations: 0,
    totalContacts: 0,
    totalBlogs: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

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
          fetchDashboardStats();
          fetchRecentActivities();
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

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.stats) {
        setDashboardStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/recent-activity', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.activities) {
        setRecentActivities(data.activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        })));
      }
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
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
        fetchBlogs();
        alert('Blog post created successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Failed to create blog post:', error);
      alert('Failed to create blog post. Please try again.');
      throw error;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <Badge variant="secondary" className="ml-3">
                Welcome, {user.username}
              </Badge>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Consultations</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Communication</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Active users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalConsultations.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contact Forms</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalContacts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total submissions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalBlogs.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Published posts</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest admin actions and system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4">
                          <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.description} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Users className="w-6 h-6 mb-2" />
                      <span className="text-sm">Add User</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <FileText className="w-6 h-6 mb-2" />
                      <span className="text-sm">New Blog Post</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Mail className="w-6 h-6 mb-2" />
                      <span className="text-sm">Send Email</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <BarChart3 className="w-6 h-6 mb-2" />
                      <span className="text-sm">View Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserList />
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <ConsultationList />
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <ContactList />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <ContentManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reporting</CardTitle>
                <CardDescription>View detailed analytics and generate reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground mb-4">Coming soon - Traffic analytics, conversion tracking, and custom reports</p>
                  <Button disabled>Feature in Development</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle>Email & Communication</CardTitle>
                <CardDescription>Manage email templates and communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Communication Center</h3>
                  <p className="text-muted-foreground mb-4">Coming soon - Email templates, newsletter management, and communication history</p>
                  <Button disabled>Feature in Development</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <MediaLibrary />
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Administration</CardTitle>
                <CardDescription>System settings, backups, and maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">System Tools</h3>
                  <p className="text-muted-foreground mb-4">Coming soon - Settings management, backups, audit logs, and system monitoring</p>
                  <Button disabled>Feature in Development</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai">
            <AITrainingManager />
          </TabsContent>
        </Tabs>

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
          key={editingBlog?.id || 'new'}
          isEditing={!!editingBlog}
        />
      </div>
    </div>
  );
}