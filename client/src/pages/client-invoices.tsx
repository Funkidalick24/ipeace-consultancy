import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  consultationId?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export function ClientInvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch(`/api/client/invoices/${invoice.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      } else {
        alert('Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    if (filter === 'paid') return invoice.status === 'paid';
    if (filter === 'pending') return ['sent', 'draft'].includes(invoice.status);
    if (filter === 'overdue') return invoice.status === 'overdue';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !['paid', 'cancelled'].includes(selectedInvoice?.status || '');
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoices List */}
          <div className="lg:col-span-1">
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
                  All ({invoices.length})
                </button>
                <button
                  onClick={() => setFilter('paid')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'paid'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Paid ({invoices.filter(i => i.status === 'paid').length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'pending'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pending ({invoices.filter(i => ['sent', 'draft'].includes(i.status)).length})
                </button>
                <button
                  onClick={() => setFilter('overdue')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'overdue'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Overdue ({invoices.filter(i => i.status === 'overdue').length})
                </button>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-2">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedInvoice?.id === invoice.id
                        ? 'bg-primary-blue text-white'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-medium ${
                        selectedInvoice?.id === invoice.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {invoice.invoiceNumber}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedInvoice?.id === invoice.id
                          ? 'bg-white bg-opacity-20 text-white'
                          : getStatusColor(invoice.status)
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className={`text-sm mb-1 ${
                      selectedInvoice?.id === invoice.id ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {formatCurrency(invoice.total, invoice.currency)}
                    </p>
                    <p className={`text-xs ${
                      selectedInvoice?.id === invoice.id ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                    {isOverdue(invoice.dueDate) && invoice.status !== 'paid' && (
                      <p className={`text-xs font-medium ${
                        selectedInvoice?.id === invoice.id ? 'text-red-200' : 'text-red-600'
                      }`}>
                        Overdue
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? 'You have no invoices yet.' : `No ${filter} invoices.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Detail */}
          <div className="lg:col-span-2">
            {selectedInvoice ? (
              <div className="bg-white rounded-lg shadow">
                {/* Invoice Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</h2>
                      <p className="text-gray-600">Invoice Details</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                      </span>
                      <button
                        onClick={() => handleDownloadInvoice(selectedInvoice)}
                        className="ml-3 btn-primary px-4 py-2 rounded-md font-medium"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Invoice Information</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Created:</span> {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                        <p><span className="font-medium">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                        {selectedInvoice.paidAt && (
                          <p><span className="font-medium">Paid:</span> {new Date(selectedInvoice.paidAt).toLocaleDateString()}</p>
                        )}
                        {selectedInvoice.paymentMethod && (
                          <p><span className="font-medium">Payment Method:</span> {selectedInvoice.paymentMethod}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Amount Due</h3>
                      <div className="text-3xl font-bold text-primary-blue">
                        {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                      </div>
                      {isOverdue(selectedInvoice.dueDate) && selectedInvoice.status !== 'paid' && (
                        <p className="text-red-600 text-sm font-medium mt-1">This invoice is overdue</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Invoice Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium text-gray-700">Description</th>
                          <th className="text-center py-2 font-medium text-gray-700">Qty</th>
                          <th className="text-right py-2 font-medium text-gray-700">Unit Price</th>
                          <th className="text-right py-2 font-medium text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 text-gray-900">{item.description}</td>
                            <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                            <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice, selectedInvoice.currency)}</td>
                            <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.total, selectedInvoice.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Invoice Summary */}
                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax ({selectedInvoice.taxRate * 100}%):</span>
                          <span className="font-medium">{formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total:</span>
                          <span className="text-primary-blue">{formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedInvoice.notes && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-gray-700">{selectedInvoice.notes}</p>
                    </div>
                  )}

                  {/* Payment Status */}
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      {selectedInvoice.status === 'paid' && (
                        <div className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">Payment Received</span>
                        </div>
                      )}
                      {selectedInvoice.status === 'sent' && (
                        <div className="flex items-center text-blue-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Awaiting Payment</span>
                        </div>
                      )}
                    </div>

                    {selectedInvoice.status !== 'paid' && (
                      <button className="btn-primary px-6 py-2 rounded-md font-medium">
                        Make Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an invoice</h3>
                <p className="text-gray-600">Choose an invoice from the list to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientInvoices() {
  // Redirect to dashboard with invoices tab
  window.location.href = '/client/dashboard?tab=invoices';
  return null;
}