import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, UserCheck, HelpCircle, RefreshCw } from 'lucide-react';
import AddBlogPostForm from '@/components/blog/AddBlogPostForm';
import { ContentBlock } from '@/components/blog/BlogContentEditor';
import TestimonialsManager from './TestimonialsManager';
import TeamMembersManager from './TeamMembersManager';
import FAQManager from './FAQManager';

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

interface Testimonial {
  id: string;
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating?: number;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  imageUrl?: string;
  email?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function ContentManager() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [faq, setFaq] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | undefined>();

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [blogsRes, testimonialsRes, teamRes, faqRes] = await Promise.all([
        fetch('/api/admin/blogs', { headers }),
        fetch('/api/admin/testimonials', { headers }),
        fetch('/api/admin/team', { headers }),
        fetch('/api/admin/faq', { headers })
      ]);

      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogPosts(blogsData.blogs || []);
      }

      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json();
        setTestimonials(testimonialsData.testimonials || []);
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.members || []);
      }

      if (faqRes.ok) {
        const faqData = await faqRes.json();
        setFaq(faqData.faq || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlogPost = async (blogData: {
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
        body: JSON.stringify(blogData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to create blog post');
      }
    } catch (error) {
      console.error('Failed to create blog post:', error);
      throw error;
    }
  };

  const handleUpdateBlogPost = async (blogData: {
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
        body: JSON.stringify(blogData)
      });

      if (response.ok) {
        await fetchAllContent();
        setEditingBlog(undefined);
      } else {
        throw new Error('Failed to update blog post');
      }
    } catch (error) {
      console.error('Failed to update blog post:', error);
      throw error;
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      throw error;
    }
  };

  const handleCreateTestimonial = async (testimonialData: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testimonialData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to create testimonial');
      }
    } catch (error) {
      console.error('Failed to create testimonial:', error);
      throw error;
    }
  };

  const handleUpdateTestimonial = async (id: string, testimonialData: Partial<Testimonial>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testimonialData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to update testimonial');
      }
    } catch (error) {
      console.error('Failed to update testimonial:', error);
      throw error;
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      throw error;
    }
  };

  const handleCreateTeamMember = async (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(memberData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to create team member');
      }
    } catch (error) {
      console.error('Failed to create team member:', error);
      throw error;
    }
  };

  const handleUpdateTeamMember = async (id: string, memberData: Partial<TeamMember>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/team/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(memberData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to update team member');
      }
    } catch (error) {
      console.error('Failed to update team member:', error);
      throw error;
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/team/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to delete team member');
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
      throw error;
    }
  };

  const handleCreateFAQ = async (faqData: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(faqData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to create FAQ item');
      }
    } catch (error) {
      console.error('Failed to create FAQ item:', error);
      throw error;
    }
  };

  const handleUpdateFAQ = async (id: string, faqData: Partial<FAQItem>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(faqData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to update FAQ item');
      }
    } catch (error) {
      console.error('Failed to update FAQ item:', error);
      throw error;
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to delete FAQ item');
      }
    } catch (error) {
      console.error('Failed to delete FAQ item:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage your website content, testimonials, team, and FAQs</p>
        </div>
        <Button onClick={fetchAllContent} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Blog Posts</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blogPosts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {blogPosts.filter(p => p.published).length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testimonials.length}</div>
                <p className="text-xs text-muted-foreground">
                  {testimonials.filter(t => t.published).length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {teamMembers.filter(m => m.published).length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FAQ Items</CardTitle>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{faq.length}</div>
                <p className="text-xs text-muted-foreground">
                  {faq.filter(f => f.published).length} published
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Content</CardTitle>
              <CardDescription>Latest content updates across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...blogPosts, ...testimonials, ...teamMembers, ...faq]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((item) => (
                    <div key={`${item.id}-${'title' in item ? 'blog' : 'name' in item ? 'testimonial' : 'position' in item ? 'team' : 'question' in item ? 'faq' : 'unknown'}`.toString()}
                         className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {'title' in item ? item.title :
                           'name' in item ? item.name :
                           'question' in item ? item.question :
                           'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {'title' in item ? 'Blog Post' :
                           'name' in item ? 'Testimonial' :
                           'position' in item ? 'Team Member' :
                           'question' in item ? 'FAQ' :
                           'Unknown'} • Updated {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={item.published ? 'default' : 'secondary'}>
                        {item.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  ))}
                {[...blogPosts, ...testimonials, ...teamMembers, ...faq].length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No content yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Blog Posts</h3>
              <Button onClick={() => setShowBlogForm(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Add Blog Post
              </Button>
            </div>
            <div className="grid gap-4">
              {blogPosts.map((blog) => (
                <Card key={blog.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{blog.title}</CardTitle>
                        <CardDescription>/{blog.slug}</CardDescription>
                        {blog.excerpt && (
                          <p className="text-sm text-muted-foreground mt-2">{blog.excerpt}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge variant={blog.published ? 'default' : 'secondary'}>
                          {blog.published ? 'Published' : 'Draft'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingBlog(blog);
                            setShowBlogForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this blog post?')) {
                              handleDeleteBlogPost(blog.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                      {blog.publishedAt && (
                        <span>Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {blogPosts.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No blog posts yet. Click "Add Blog Post" to create your first blog post.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="testimonials">
          <TestimonialsManager
            testimonials={testimonials}
            onCreate={handleCreateTestimonial}
            onUpdate={handleUpdateTestimonial}
            onDelete={handleDeleteTestimonial}
          />
        </TabsContent>

        <TabsContent value="team">
          <TeamMembersManager
            members={teamMembers}
            onCreate={handleCreateTeamMember}
            onUpdate={handleUpdateTeamMember}
            onDelete={handleDeleteTeamMember}
          />
        </TabsContent>

        <TabsContent value="faq">
          <FAQManager
            faq={faq}
            onCreate={handleCreateFAQ}
            onUpdate={handleUpdateFAQ}
            onDelete={handleDeleteFAQ}
          />
        </TabsContent>
      </Tabs>

      <AddBlogPostForm
        isOpen={showBlogForm}
        onClose={() => {
          setShowBlogForm(false);
          setEditingBlog(undefined);
        }}
        onSubmit={editingBlog ? handleUpdateBlogPost : handleCreateBlogPost}
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
  );
}