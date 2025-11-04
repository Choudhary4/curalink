import { useState, useEffect } from 'react';
import { messages as messagesApi } from '../services/api';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [messagesList, setMessagesList] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getAll({ type: activeTab });
      setMessagesList(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await messagesApi.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);

    // Mark as read if it's a received message and unread
    if (activeTab === 'received' && !message.is_read) {
      try {
        await messagesApi.markAsRead(message.id);
        // Update the message in the list
        setMessagesList(prev =>
          prev.map(m => m.id === message.id ? { ...m, is_read: true } : m)
        );
        loadUnreadCount();
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await messagesApi.delete(messageId);
        setMessagesList(prev => prev.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        loadUnreadCount();
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours}h ago`;
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Manage your conversations</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('received');
                  setSelectedMessage(null);
                }}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'received'
                    ? 'border-b-2 border-cyan-600 text-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Inbox
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('sent');
                  setSelectedMessage(null);
                }}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'sent'
                    ? 'border-b-2 border-cyan-600 text-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Sent
              </button>
            </div>
          </div>

          <div className="flex" style={{ height: '600px' }}>
            {/* Messages List */}
            <div className="w-2/5 border-r border-gray-200 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : messagesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600 font-semibold">No messages</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {activeTab === 'received'
                      ? 'You have no received messages'
                      : 'You have not sent any messages'}
                  </p>
                </div>
              ) : (
                messagesList.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'bg-cyan-50'
                        : 'hover:bg-gray-50'
                    } ${
                      activeTab === 'received' && !message.is_read
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {activeTab === 'received'
                              ? message.sender_name
                              : message.receiver_name}
                          </p>
                          {activeTab === 'received' && !message.is_read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {message.subject || '(No subject)'}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {message.content.substring(0, 60)}...
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Detail */}
            <div className="flex-1 overflow-y-auto">
              {selectedMessage ? (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedMessage.subject || '(No subject)'}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">
                            {activeTab === 'received' ? 'From:' : 'To:'}
                          </span>
                          <span>
                            {activeTab === 'received'
                              ? selectedMessage.sender_name
                              : selectedMessage.receiver_name}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>
                            {new Date(
                              selectedMessage.created_at
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="text-red-600 hover:text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📨</div>
                    <p>Select a message to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
