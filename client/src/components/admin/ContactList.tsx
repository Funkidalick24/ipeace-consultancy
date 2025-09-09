import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mail, User, Building, MessageSquare, Clock, CheckCircle, AlertCircle, MoreHorizontal, Send } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  service: string | null;
  message: string;
  newsletter: boolean;
  createdAt: string;
  status: 'pending' | 'responded';
  respondedAt?: string;
}

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[DEBUG] Raw contacts data:', data.contacts?.[0]);

        // Clean the data by removing Mongoose metadata
        const cleanContacts = (data.contacts || []).map((contact: any) => {
          // If contact has _doc, use that; otherwise use contact directly
          const cleanContact = contact._doc || contact;

          // Remove any Mongoose internal properties
          const { $__, _doc, ...cleanData } = cleanContact;

          return {
            id: cleanData._id || cleanData.id,
            firstName: cleanData.firstName,
            lastName: cleanData.lastName,
            email: cleanData.email,
            company: cleanData.company,
            service: cleanData.service,
            message: cleanData.message,
            newsletter: cleanData.newsletter,
            status: cleanData.status,
            respondedAt: cleanData.respondedAt,
            createdAt: cleanData.createdAt,
          };
        });

        console.log('[DEBUG] Cleaned contacts data:', cleanContacts[0]);
        setContacts(cleanContacts);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch contacts',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contacts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    console.log(`[DEBUG] Frontend: Attempting to update contact ${contactId} status to: ${newStatus}`);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/contacts/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[DEBUG] Frontend: Successfully updated contact ${contactId} status to: ${data.contact.status}`);

        // Clean the updated contact data
        const updatedContact = data.contact._doc || data.contact;
        const { $__, _doc, ...cleanUpdatedContact } = updatedContact;

        setContacts(contacts.map(contact =>
          contact.id === contactId ? { ...contact, status: cleanUpdatedContact.status, respondedAt: cleanUpdatedContact.respondedAt } : contact
        ));
        toast({
          title: 'Success',
          description: `Contact status updated to ${newStatus}`
        });
      } else {
        const error = await response.json();
        console.log(`[DEBUG] Frontend: Failed to update contact status: ${error.error}`);
        toast({
          title: 'Error',
          description: error.error || 'Failed to update contact status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to update contact status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact status',
        variant: 'destructive'
      });
    }
  };

  const handleSendResponse = async () => {
    if (!selectedContact || !responseMessage.trim()) return;

    setSendingResponse(true);
    try {
      console.log(`[DEBUG] Frontend: Sending response to contact ${selectedContact.id}`);

      // First update the status to responded
      const token = localStorage.getItem('authToken');
      const statusResponse = await fetch(`/api/admin/contacts/${selectedContact.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'responded' })
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to update contact status');
      }

      const statusData = await statusResponse.json();
      console.log(`[DEBUG] Frontend: Contact status updated to responded`);

      // Clean the updated contact data
      const updatedContact = statusData.contact._doc || statusData.contact;
      const { $__, _doc, ...cleanUpdatedContact } = updatedContact;

      // In a real implementation, this would call an API endpoint to send email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setContacts(contacts.map(contact =>
        contact.id === selectedContact.id
          ? { ...contact, status: cleanUpdatedContact.status, respondedAt: cleanUpdatedContact.respondedAt }
          : contact
      ));

      toast({
        title: 'Success',
        description: 'Response sent successfully'
      });

      setShowResponseDialog(false);
      setResponseMessage('');
      setSelectedContact(null);
    } catch (error) {
      console.error('Failed to send response:', error);
      toast({
        title: 'Error',
        description: 'Failed to send response',
        variant: 'destructive'
      });
    } finally {
      setSendingResponse(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'responded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'responded':
        return 'default';
      case 'pending':
      default:
        return 'outline';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = `${contact.firstName} ${contact.lastName} ${contact.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions ({filteredContacts.length})</CardTitle>
          <CardDescription>
            Manage contact form submissions and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No contacts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No contact submissions yet.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {contact.email}
                        </span>
                        {contact.company && (
                          <span className="text-sm text-muted-foreground">
                            {contact.company}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{contact.service || 'General'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {contact.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(contact.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(contact.status)}
                        {contact.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(contact.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowDetailDialog(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {(!contact.status || contact.status === 'pending') && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowResponseDialog(true);
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send Response
                            </DropdownMenuItem>
                          )}
                          {(!contact.status || contact.status === 'pending') && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(contact.id, 'responded')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Responded
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              Complete information about this contact submission
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Contact Information</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <p><strong>Name:</strong> {selectedContact.firstName} {selectedContact.lastName}</p>
                    <p><strong>Email:</strong> {selectedContact.email}</p>
                    {selectedContact.company && (
                      <p><strong>Company:</strong> {selectedContact.company}</p>
                    )}
                    <p><strong>Service:</strong> {selectedContact.service || 'General'}</p>
                    <p><strong>Newsletter:</strong> {selectedContact.newsletter ? 'Subscribed' : 'Not subscribed'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Status & Timeline</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <p><strong>Status:</strong>
                      <Badge variant={getStatusBadgeVariant(selectedContact.status)} className="ml-2">
                        {selectedContact.status || 'pending'}
                      </Badge>
                    </p>
                    <p><strong>Submitted:</strong> {formatDate(selectedContact.createdAt)}</p>
                    {selectedContact.respondedAt && (
                      <p><strong>Responded:</strong> {formatDate(selectedContact.respondedAt)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Message</span>
                </div>
                <div className="pl-6">
                  <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
                {(!selectedContact.status || selectedContact.status === 'pending') && (
                  <Button
                    onClick={() => {
                      setShowDetailDialog(false);
                      setSelectedContact(selectedContact);
                      setShowResponseDialog(true);
                    }}
                  >
                    Send Response
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Response</DialogTitle>
            <DialogDescription>
              Send a response to {selectedContact?.firstName} {selectedContact?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Response Message</label>
              <Textarea
                placeholder="Type your response here..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResponseDialog(false);
                  setResponseMessage('');
                }}
                disabled={sendingResponse}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={!responseMessage.trim() || sendingResponse}
              >
                {sendingResponse ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}