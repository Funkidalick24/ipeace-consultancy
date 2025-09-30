import { useState, useEffect } from 'react';

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

interface Message {
  _id: string;
  conversationId: string;
  fromUserId: any;
  toUserId: any;
  content: string;
  messageType: string;
  createdAt: string;
}

export function ClientMessagesTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    content: '',
    messageType: 'general' as const
  });

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch(`/api/client/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversationMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!composeData.content) {
      alert('Please fill in message content');
      return;
    }

    try {
      const token = localStorage.getItem('clientToken');
      const response = await fetch('/api/client/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toUserId: 'admin', // For now, send to admin
          subject: 'Support Request',
          content: composeData.content,
          messageType: composeData.messageType
        })
      });

      if (response.ok) {
        setShowCompose(false);
        setComposeData({ content: '', messageType: 'general' });
        fetchConversations(); // Refresh conversations
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('clientToken');
      await fetch(`/api/client/conversations/${conversationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local state
      setConversations(conversations.map(conv =>
        conv._id === conversationId ? { ...conv, unreadCount: { ...conv.unreadCount, [localStorage.getItem('clientUser') ? JSON.parse(localStorage.getItem('clientUser')!).id : '']: 0 } } : conv
      ));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (filter === 'all') return true;
    if (filter === 'unread') {
      const userId = localStorage.getItem('clientUser') ? JSON.parse(localStorage.getItem('clientUser')!).id : '';
      return (conversation.unreadCount[userId] || 0) > 0;
    }
    if (filter === 'read') {
      const userId = localStorage.getItem('clientUser') ? JSON.parse(localStorage.getItem('clientUser')!).id : '';
      return (conversation.unreadCount[userId] || 0) === 0;
    }
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
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
          <button
            onClick={() => setShowCompose(true)}
            className="btn-primary px-4 py-2 rounded-md font-medium"
          >
            Start Conversation
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversations List */}
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
                  All ({conversations.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Unread ({filteredConversations.filter(c => {
                    const userId = localStorage.getItem('clientUser') ? JSON.parse(localStorage.getItem('clientUser')!).id : '';
                    return (c.unreadCount[userId] || 0) > 0;
                  }).length})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    filter === 'read'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Read ({filteredConversations.filter(c => {
                    const userId = localStorage.getItem('clientUser') ? JSON.parse(localStorage.getItem('clientUser')!).id : '';
                    return (c.unreadCount[userId] || 0) === 0;
                  }).length})
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="space-y-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const userId = localStorage.getItem('clientUser') ? JSON.parse(localStorage.getItem('clientUser')!).id : '';
                  const isUnread = (conversation.unreadCount[userId] || 0) > 0;
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        fetchConversationMessages(conversation._id);
                        if (isUnread) {
                          markConversationAsRead(conversation._id);
                        }
                      }}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?._id === conversation._id
                          ? 'bg-primary-blue text-white'
                          : isUnread
                          ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-primary-blue'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-medium truncate ${
                          selectedConversation?._id === conversation._id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {conversation.subject}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedConversation?._id === conversation._id
                            ? 'bg-white bg-opacity-20 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.messageCount} messages
                        </span>
                      </div>
                      {conversation.lastMessage && (
                        <>
                          <p className={`text-sm truncate mb-2 ${
                            selectedConversation?._id === conversation._id ? 'text-blue-100' : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage.content}
                          </p>
                          <div className={`text-xs ${
                            selectedConversation?._id === conversation._id ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                          </div>
                        </>
                      )}
                      {isUnread && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                          Unread
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? 'You have no conversations yet.' : `No ${filter} conversations.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedConversation.subject}</h2>
                    <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                      {selectedConversation.messageCount} messages
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Started:</strong> {new Date(selectedConversation.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {loadingMessages ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {conversationMessages.map((message) => (
                      <div key={message._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">
                            {message.fromUserId.firstName} {message.fromUserId.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{message.content}</p>
                      </div>
                    ))}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to view messages</p>
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
                  <h2 className="text-xl font-bold text-gray-900">Start New Conversation</h2>
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

export default function ClientMessages() {
  // Redirect to dashboard with messages tab
  window.location.href = '/client/dashboard?tab=messages';
  return null;
}