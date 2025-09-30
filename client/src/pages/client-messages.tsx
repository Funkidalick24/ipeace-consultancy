import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface Message {
  _id: string;
  subject: string;
  content: string;
  messageType: 'general' | 'consultation' | 'invoice' | 'document' | 'system';
  fromUserId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  toUserId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isRead: boolean;
  createdAt: string;
  relatedConsultationId?: string;
  relatedInvoiceId?: string;
  relatedFileId?: string;
}

export default function ClientMessages() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    subject: '',
    content: '',
    messageType: 'general' as const
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('clientToken');
    if (!token) {
      navigate('/client-portal');
      return;
    }

    fetchMessages();
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else if (response.status === 401) {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        navigate('/client-portal');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!composeData.subject || !composeData.content) {
      alert('Please fill in both subject and message content');
      return;
    }

    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(composeData)
      });

      if (response.ok) {
        setShowCompose(false);
        setComposeData({ subject: '', content: '', messageType: 'general' });
        fetchMessages(); // Refresh messages
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem('clientToken');
      await fetch(`/api/client/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local state
      setMessages(messages.map(msg =>
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));

      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !message.isRead;
    if (filter === 'read') return message.isRead;
    return true;
  });

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    navigate('/client-portal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/client/dashboard')}
                className="text-primary-blue hover:text-secondary-blue font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCompose(true)}
                className="btn-primary px-4 py-2 rounded-md font-medium"
              >
                Compose Message
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
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
                  All ({messages.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Unread ({messages.filter(m => !m.isRead).length})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'read'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Read ({messages.filter(m => m.isRead).length})
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-2">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) {
                        markAsRead(message._id);
                      }
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedMessage?._id === message._id
                        ? 'bg-primary-blue text-white'
                        : message.isRead
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-primary-blue'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-medium truncate ${
                        selectedMessage?._id === message._id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {message.subject}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedMessage?._id === message._id
                          ? 'bg-white bg-opacity-20 text-white'
                          : getMessageTypeColor(message.messageType)
                      }`}>
                        {message.messageType}
                      </span>
                    </div>
                    <p className={`text-sm truncate mb-2 ${
                      selectedMessage?._id === message._id ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {message.content}
                    </p>
                    <div className={`text-xs ${
                      selectedMessage?._id === message._id ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      From: {message.fromUserId.firstName} {message.fromUserId.lastName}
                    </div>
                    <div className={`text-xs ${
                      selectedMessage?._id === message._id ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? 'You have no messages yet.' : `No ${filter} messages.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                    <span className={`px-3 py-1 text-sm rounded-full ${getMessageTypeColor(selectedMessage.messageType)}`}>
                      {selectedMessage.messageType}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>From:</strong> {selectedMessage.fromUserId.firstName} {selectedMessage.fromUserId.lastName}</p>
                    <p><strong>Email:</strong> {selectedMessage.fromUserId.email}</p>
                    <p><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                {selectedMessage.relatedConsultationId && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Related Consultation:</strong> This message is related to one of your consultations.
                      <button
                        onClick={() => navigate('/client/consultations')}
                        className="ml-2 text-primary-blue hover:text-secondary-blue font-medium"
                      >
                        View Consultation →
                      </button>
                    </p>
                  </div>
                )}

                {selectedMessage.relatedInvoiceId && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Related Invoice:</strong> This message is related to an invoice.
                      <button
                        onClick={() => navigate('/client/invoices')}
                        className="ml-2 text-primary-blue hover:text-secondary-blue font-medium"
                      >
                        View Invoice →
                      </button>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a message</h3>
                <p className="text-gray-600">Choose a message from the list to view its contents</p>
              </div>
            )}
          </div>
        </div>

        {/* Compose Message Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Compose Message</h2>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSendMessage}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">Subject *</label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">Message Type</label>
                    <select
                      value={composeData.messageType}
                      onChange={(e) => setComposeData({...composeData, messageType: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="consultation">Consultation Related</option>
                      <option value="document">Document Related</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">Message *</label>
                    <textarea
                      value={composeData.content}
                      onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                      placeholder="Type your message here..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCompose(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-6 py-2 rounded-md font-medium"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}