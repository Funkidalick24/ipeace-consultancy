import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, UserCheck, HelpCircle, RefreshCw } from 'lucide-react';
import PageEditor from './PageEditor';
import TestimonialsManager from './TestimonialsManager';
import TeamMembersManager from './TeamMembersManager';
import FAQManager from './FAQManager';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
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
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [faq, setFaq] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | undefined>();

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

      const [pagesRes, testimonialsRes, teamRes, faqRes] = await Promise.all([
        fetch('/api/admin/content/pages', { headers }),
        fetch('/api/admin/testimonials', { headers }),
        fetch('/api/admin/team', { headers }),
        fetch('/api/admin/faq', { headers })
      ]);

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData.pages || []);
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

  const handleCreatePage = async (pageData: Omit<StaticPage, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/content/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pageData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to create page');
      }
    } catch (error) {
      console.error('Failed to create page:', error);
      throw error;
    }
  };

  const handleUpdatePage = async (id: string, pageData: Partial<StaticPage>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/content/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pageData)
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to update page');
      }
    } catch (error) {
      console.error('Failed to update page:', error);
      throw error;
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/content/pages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchAllContent();
      } else {
        throw new Error('Failed to delete page');
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
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
                <div className="text-2xl font-bold">{pages.length}</div>
                <p className="text-xs text-muted-foreground">
                  {pages.filter(p => p.published).length} published
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
                {[...pages, ...testimonials, ...teamMembers, ...faq]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 5)
                  .map((item) => (
                    <div key={`${item.id}-${'title' in item ? 'page' : 'name' in item ? 'testimonial' : 'position' in item ? 'team' : 'question' in item ? 'faq' : 'unknown'}`}
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
                           'Unknown'} • Updated {new Date(item.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={item.published ? 'default' : 'secondary'}>
                        {item.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  ))}
                {[...pages, ...testimonials, ...teamMembers, ...faq].length === 0 && (
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
              <Button onClick={() => setShowPageEditor(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Add Blog Post
              </Button>
            </div>
            <div className="grid gap-4">
              {pages.map((page) => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                        <CardDescription>/{page.slug}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={page.published ? 'default' : 'secondary'}>
                          {page.published ? 'Published' : 'Draft'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPage(page);
                            setShowPageEditor(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {page.excerpt && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{page.excerpt}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
              {pages.length === 0 && (
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

      <PageEditor
        page={editingPage}
        onSave={editingPage ? (data) => handleUpdatePage(editingPage.id, data) : handleCreatePage}
        onClose={() => {
          setShowPageEditor(false);
          setEditingPage(undefined);
        }}
        isOpen={showPageEditor}
      />
    </div>
  );
}