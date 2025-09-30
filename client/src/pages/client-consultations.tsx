import { useState, useEffect } from 'react';

interface Consultation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: string;
  description: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  serviceTypeName: string;
  consultationTypeName: string;
}

export function ClientConsultationsTab() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/consultations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsultations(data.consultations);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };


  const filteredConsultations = consultations.filter(consultation => {
    if (filter === 'all') return true;
    return consultation.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
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
              All ({consultations.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Pending ({consultations.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Confirmed ({consultations.filter(c => c.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Completed ({consultations.filter(c => c.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Consultations List */}
        {filteredConsultations.length > 0 ? (
          <div className="space-y-6">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {consultation.serviceTypeName}
                    </h3>
                    <p className="text-gray-600">{consultation.consultationTypeName}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(consultation.status)}`}>
                    {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {new Date(consultation.preferredDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{consultation.preferredTime}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{consultation.email}</p>
                    <p className="text-sm text-gray-600">{consultation.phone}</p>
                  </div>

                  {consultation.company && (
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{consultation.company}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{consultation.description}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Created: {new Date(consultation.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    {consultation.status === 'pending' && (
                      <button className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors">
                        Request Reschedule
                      </button>
                    )}
                    {consultation.status === 'confirmed' && (
                      <button className="px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">
                        Join Meeting
                      </button>
                    )}
                    <button className="px-4 py-2 text-sm bg-primary-blue text-white rounded-md hover:bg-blue-700 transition-colors">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't booked any consultations yet."
                : `No ${filter} consultations found.`
              }
            </p>
            <button
              className="btn-primary px-6 py-3 rounded-md font-medium"
            >
              Book Your First Consultation
            </button>
          </div>
        )}

        {/* Book New Consultation CTA */}
        {consultations.length > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-primary-blue to-secondary-blue rounded-lg p-8 text-white">
              <h3 className="text-xl font-bold mb-2">Need Another Consultation?</h3>
              <p className="mb-4 opacity-90">Book a new consultation for additional legal services</p>
              <button
                className="bg-white text-primary-blue px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Book New Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientConsultations() {
  // Redirect to dashboard with consultations tab
  window.location.href = '/client/dashboard?tab=consultations';
  return null;
}