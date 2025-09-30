import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Mail, FileText, BarChart3, MessageSquare, LogOut, File, BookOpen } from 'lucide-react';
import { ClientConsultationsTab } from './client-consultations';
import { ClientMessagesTab } from './client-messages';
import { ClientInvoicesTab } from './client-invoices';
import { ClientDocumentsTab } from './client-documents';
import { ClientResourcesTab } from './client-resources';

interface DashboardStats {
  totalConsultations: number;
  totalMessages: number;
  totalInvoices: number;
  unreadMessages: number;
}

interface Conversation {
  _id: string;
  participants: any[];
  subject: string;
  lastMessage?: {
    content: string;
    fromUserId: any;
    createdAt: string;
  };
  messageCount: number;
  unreadCount: { [userId: string]: number };
  conversationType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecentActivity {
  consultations: any[];
  messages: Conversation[];
  invoices: any[];
}

export default function ClientDashboard() {
   const [location] = useLocation();
   const [user, setUser] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('dashboard');
   const [dashboardData, setDashboardData] = useState<{
     stats: DashboardStats;
     recentActivity: RecentActivity;
   } | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('clientToken');
    const savedUser = localStorage.getItem('clientUser');

    if (!token || !savedUser) {
      window.location.href = '/client-portal';
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchDashboardData();

    // Check for tab query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['dashboard', 'consultations', 'messages', 'invoices', 'documents', 'resources'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.dashboard);
      } else if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        window.location.href = '/client-portal';
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    window.location.href = '/client-portal';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Client Portal</h1>
              <Badge variant="secondary" className="ml-3">
                Welcome, {user.firstName} {user.lastName}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Consultations</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <File className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.stats.totalConsultations}</div>
                  <p className="text-xs text-muted-foreground">Total bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.stats.totalMessages}</div>
                  {dashboardData.stats.unreadMessages > 0 && (
                    <p className="text-xs text-red-600">{dashboardData.stats.unreadMessages} unread</p>
                  )}
                  <p className="text-xs text-muted-foreground">Total messages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.stats.totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">Total invoices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resources</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Access</div>
                  <p className="text-xs text-muted-foreground">Legal resources</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Consultations</CardTitle>
                  <CardDescription>Your latest consultation bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentActivity.consultations.length > 0 ? (
                      dashboardData.recentActivity.consultations.slice(0, 5).map((consultation: any) => (
                        <div key={consultation.id} className="flex items-center space-x-4">
                          <div className={`w-2 h-2 bg-blue-500 rounded-full`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{consultation.serviceTypeName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(consultation.preferredDate).toLocaleDateString()} • {consultation.status}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No recent consultations</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common client tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center"
                      onClick={() => setActiveTab('consultations')}
                    >
                      <Calendar className="w-6 h-6 mb-2" />
                      <span className="text-sm">Book Consultation</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center"
                      onClick={() => setActiveTab('messages')}
                    >
                      <MessageSquare className="w-6 h-6 mb-2" />
                      <span className="text-sm">View Messages</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center"
                      onClick={() => setActiveTab('documents')}
                    >
                      <File className="w-6 h-6 mb-2" />
                      <span className="text-sm">Upload Documents</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center"
                      onClick={() => setActiveTab('resources')}
                    >
                      <BookOpen className="w-6 h-6 mb-2" />
                      <span className="text-sm">Legal Resources</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <ClientConsultationsTab />
          </TabsContent>

          <TabsContent value="messages">
            <ClientMessagesTab />
          </TabsContent>

          <TabsContent value="invoices">
            <ClientInvoicesTab />
          </TabsContent>

          <TabsContent value="documents">
            <ClientDocumentsTab />
          </TabsContent>

          <TabsContent value="resources">
            <ClientResourcesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}