import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Mail, Users, Send, Plus, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { InlineLoader, ListSkeleton } from '@/components/ui/loading';

interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  source: 'contact-form' | 'website-signup' | 'admin-added';
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
}

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
  const [newSubscriberFirstName, setNewSubscriberFirstName] = useState('');
  const [newSubscriberLastName, setNewSubscriberLastName] = useState('');
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [addingSubscriber, setAddingSubscriber] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/newsletter/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch newsletter subscribers',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch newsletter subscribers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriberEmail.trim()) return;

    setAddingSubscriber(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/newsletter/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newSubscriberEmail.trim(),
          firstName: newSubscriberFirstName.trim() || undefined,
          lastName: newSubscriberLastName.trim() || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers([...subscribers, data.subscriber]);
        setNewSubscriberEmail('');
        setNewSubscriberFirstName('');
        setNewSubscriberLastName('');
        setShowAddDialog(false);
        toast({
          title: 'Success',
          description: 'Newsletter subscriber added successfully'
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to add subscriber',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to add subscriber:', error);
      toast({
        title: 'Error',
        description: 'Failed to add subscriber',
        variant: 'destructive'
      });
    } finally {
      setAddingSubscriber(false);
    }
  };

  const handleToggleSubscriberStatus = async (email: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/newsletter/subscribers/${email}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setSubscribers(subscribers.map(sub =>
          sub.email === email ? { ...sub, isActive: !currentStatus, unsubscribedAt: !currentStatus ? new Date().toISOString() : undefined } : sub
        ));
        toast({
          title: 'Success',
          description: `Subscriber ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update subscriber status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to update subscriber status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscriber status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/newsletter/subscribers/${email}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSubscribers(subscribers.filter(sub => sub.email !== email));
        toast({
          title: 'Success',
          description: 'Subscriber deleted successfully'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete subscriber',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber',
        variant: 'destructive'
      });
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterContent.trim()) return;

    setSendingNewsletter(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: newsletterSubject.trim(),
          content: newsletterContent.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowSendDialog(false);
        setNewsletterSubject('');
        setNewsletterContent('');
        toast({
          title: 'Success',
          description: data.message
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to send newsletter',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      toast({
        title: 'Error',
        description: 'Failed to send newsletter',
        variant: 'destructive'
      });
    } finally {
      setSendingNewsletter(false);
    }
  };

  const activeSubscribers = subscribers.filter(sub => sub.isActive);
  const inactiveSubscribers = subscribers.filter(sub => !sub.isActive);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Management</CardTitle>
          <CardDescription>
            Manage newsletter subscribers and send newsletters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListSkeleton count={5} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeSubscribers.length} active, {inactiveSubscribers.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscribers.length}</div>
            <p className="text-xs text-muted-foreground">Ready to receive newsletters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Sources</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(subscribers.map(s => s.source)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Subscriber
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Newsletter Subscriber</DialogTitle>
              <DialogDescription>
                Add a new email address to the newsletter subscriber list.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  placeholder="subscriber@example.com"
                  value={newSubscriberEmail}
                  onChange={(e) => setNewSubscriberEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    placeholder="John"
                    value={newSubscriberFirstName}
                    onChange={(e) => setNewSubscriberFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    placeholder="Doe"
                    value={newSubscriberLastName}
                    onChange={(e) => setNewSubscriberLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSubscriber}
                  disabled={addingSubscriber || !newSubscriberEmail.trim()}
                >
                  {addingSubscriber ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subscriber
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Send className="w-4 h-4 mr-2" />
              Send Newsletter ({activeSubscribers.length} recipients)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Newsletter</DialogTitle>
              <DialogDescription>
                Send a newsletter to all {activeSubscribers.length} active subscribers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  placeholder="Newsletter subject line"
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content *</label>
                <Textarea
                  rows={10}
                  placeholder="Write your newsletter content here. You can use HTML formatting."
                  value={newsletterContent}
                  onChange={(e) => setNewsletterContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  HTML formatting is supported for rich content.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendNewsletter}
                  disabled={sendingNewsletter || !newsletterSubject.trim() || !newsletterContent.trim()}
                >
                  {sendingNewsletter ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Newsletter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscribers ({subscribers.length})</CardTitle>
          <CardDescription>
            Manage your newsletter subscriber list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No subscribers yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your newsletter list by adding subscribers or enabling newsletter signup on your contact forms.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Subscriber
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {subscriber.firstName && subscriber.lastName
                            ? `${subscriber.firstName} ${subscriber.lastName}`
                            : subscriber.email}
                        </span>
                        {subscriber.firstName && subscriber.lastName && (
                          <span className="text-sm text-muted-foreground">
                            {subscriber.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {subscriber.source.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.isActive ? 'default' : 'secondary'}>
                        {subscriber.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(subscriber.subscribedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSubscriberStatus(subscriber.email, subscriber.isActive)}
                          title={subscriber.isActive ? 'Deactivate subscriber' : 'Activate subscriber'}
                        >
                          {subscriber.isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Delete subscriber">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {subscriber.email} from the newsletter list?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSubscriber(subscriber.email)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}