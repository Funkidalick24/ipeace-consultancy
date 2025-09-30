import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, User, Mail, Phone, Building, FileText, CheckCircle, XCircle, AlertCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { InlineLoader, ListSkeleton, ButtonLoader } from '@/components/ui/loading';

interface Consultation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string | null;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: string;
  description: string;
  status: string;
  createdAt: string;
  serviceTypeName?: string;
  consultationTypeName?: string;
}

export default function ConsultationList() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/consultations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[DEBUG] Raw consultations data:', data.bookings?.[0]);

        // Clean the data by removing Mongoose metadata
        const cleanBookings = (data.bookings || []).map((booking: any) => {
          // If booking has _doc, use that; otherwise use booking directly
          const cleanBooking = booking._doc || booking;

          // Remove any Mongoose internal properties
          const { $__, _doc, ...cleanData } = cleanBooking;

          return {
            id: cleanData._id || cleanData.id,
            firstName: cleanData.firstName,
            lastName: cleanData.lastName,
            email: cleanData.email,
            phone: cleanData.phone,
            company: cleanData.company,
            serviceType: cleanData.serviceType,
            preferredDate: cleanData.preferredDate,
            preferredTime: cleanData.preferredTime,
            consultationType: cleanData.consultationType,
            description: cleanData.description,
            status: cleanData.status,
            createdAt: cleanData.createdAt,
            serviceTypeName: cleanData.serviceTypeName,
            consultationTypeName: cleanData.consultationTypeName,
          };
        });

        console.log('[DEBUG] Cleaned consultations data:', cleanBookings[0]);
        setConsultations(cleanBookings);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch consultations',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch consultations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (consultationId: string, newStatus: string) => {
    console.log(`[DEBUG] Frontend: Attempting to update consultation ${consultationId} status to: ${newStatus}`);
    if (!consultationId || consultationId === 'undefined') {
      console.log(`[DEBUG] Frontend: Invalid consultation ID: ${consultationId}`);
      toast({
        title: 'Error',
        description: 'Invalid consultation ID',
        variant: 'destructive'
      });
      return;
    }

    setUpdatingStatus(consultationId);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/consultations/${consultationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[DEBUG] Frontend: Successfully updated consultation ${consultationId} status to: ${data.booking.status}`);

        // Clean the updated booking data
        const updatedBooking = data.booking._doc || data.booking;
        const { $__, _doc, ...cleanUpdatedBooking } = updatedBooking;

        setConsultations(consultations.map(consultation =>
          consultation.id === consultationId ? { ...consultation, status: cleanUpdatedBooking.status } : consultation
        ));
        toast({
          title: 'Success',
          description: `Consultation status updated to ${newStatus}`
        });
      } else {
        const error = await response.json();
        console.log(`[DEBUG] Frontend: Failed to update consultation status: ${error.error}`);
        toast({
          title: 'Error',
          description: error.error || 'Failed to update consultation status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to update consultation status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update consultation status',
        variant: 'destructive'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = `${consultation.firstName} ${consultation.lastName} ${consultation.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    const matchesService = serviceFilter === 'all' || consultation.serviceType === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
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
        <CardHeader>
          <CardTitle>Consultations</CardTitle>
          <CardDescription>
            Manage consultation bookings and client communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListSkeleton count={8} />
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
              placeholder="Search consultations..."
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
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="regulatory">Regulatory</SelectItem>
              <SelectItem value="ai">AI Solutions</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Consultations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Consultations ({filteredConsultations.length})</CardTitle>
          <CardDescription>
            Manage consultation bookings and client communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConsultations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No consultations found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No consultation bookings yet.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultations.map((consultation) => (
                  <TableRow key={consultation?.id || Math.random()}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {consultation?.firstName} {consultation?.lastName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {consultation?.email}
                        </span>
                        {consultation?.company && (
                          <span className="text-sm text-muted-foreground">
                            {consultation.company}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{consultation?.serviceTypeName || consultation?.serviceType}</span>
                        <span className="text-sm text-muted-foreground">
                          {consultation?.consultationTypeName || consultation?.consultationType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{consultation?.preferredDate ? formatDate(consultation.preferredDate) : 'N/A'}</span>
                        <span className="text-sm text-muted-foreground">
                          {consultation?.preferredTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(consultation?.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(consultation?.status)}
                        {consultation?.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {consultation?.createdAt ? formatDateTime(consultation.createdAt) : 'N/A'}
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
                              setSelectedConsultation(consultation);
                              setShowDetailDialog(true);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {consultation?.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(consultation.id, 'confirmed')}
                              disabled={updatingStatus === consultation.id}
                            >
                              {updatingStatus === consultation.id ? (
                                <InlineLoader className="w-4 h-4 mr-2" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {consultation?.status === 'confirmed' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(consultation.id, 'completed')}
                              disabled={updatingStatus === consultation.id}
                            >
                              {updatingStatus === consultation.id ? (
                                <InlineLoader className="w-4 h-4 mr-2" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          {consultation?.status !== 'cancelled' && consultation?.status !== 'completed' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(consultation.id, 'cancelled')}
                              className="text-red-600"
                              disabled={updatingStatus === consultation.id}
                            >
                              {updatingStatus === consultation.id ? (
                                <InlineLoader className="w-4 h-4 mr-2" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Cancel
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

      {/* Consultation Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
            <DialogDescription>
              Complete information about this consultation booking
            </DialogDescription>
          </DialogHeader>

          {selectedConsultation && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Client Information</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <p><strong>Name:</strong> {selectedConsultation.firstName} {selectedConsultation.lastName}</p>
                    <p><strong>Email:</strong> {selectedConsultation.email}</p>
                    <p><strong>Phone:</strong> {selectedConsultation.phone}</p>
                    {selectedConsultation.company && (
                      <p><strong>Company:</strong> {selectedConsultation.company}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Consultation Details</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <p><strong>Service:</strong> {selectedConsultation.serviceTypeName || selectedConsultation.serviceType}</p>
                    <p><strong>Type:</strong> {selectedConsultation.consultationTypeName || selectedConsultation.consultationType}</p>
                    <p><strong>Preferred Date:</strong> {selectedConsultation.preferredDate ? formatDate(selectedConsultation.preferredDate) : 'N/A'}</p>
                    <p><strong>Preferred Time:</strong> {selectedConsultation.preferredTime}</p>
                    <p><strong>Status:</strong>
                      <Badge variant={getStatusBadgeVariant(selectedConsultation.status)} className="ml-2">
                        {selectedConsultation.status || 'pending'}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Description</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedConsultation.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
                {selectedConsultation.status === 'pending' && (
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedConsultation.id, 'confirmed');
                      setShowDetailDialog(false);
                    }}
                  >
                    Confirm Consultation
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}