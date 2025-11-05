import { useState, useEffect, useRef } from 'react';
import { messages as messagesApi } from '../services/api';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUserId = parseInt(localStorage.getItem('userId'));
  const pollIntervalRef = useRef(null);
  const conversationPollIntervalRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();

    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      loadConversations();
      loadUnreadCount();
    }, 3000);

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (conversationPollIntervalRef.current) {
        clearInterval(conversationPollIntervalRef.current);
      }
    };
  }, []);

  // Poll active conversation for new messages every 2 seconds
  useEffect(() => {
    if (conversationPollIntervalRef.current) {
      clearInterval(conversationPollIntervalRef.current);
    }

    if (selectedConversation) {
      conversationPollIntervalRef.current = setInterval(() => {
        refreshActiveConversation();
      }, 2000);
    }

    return () => {
      if (conversationPollIntervalRef.current) {
        clearInterval(conversationPollIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);

      // Load both sent and received messages
      const [receivedResponse, sentResponse] = await Promise.all([
        messagesApi.getAll({ type: 'received' }),
        messagesApi.getAll({ type: 'sent' })
      ]);

      const allMessages = [...receivedResponse.data, ...sentResponse.data];

      // Group messages by conversation partner
      const conversationsMap = {};

      allMessages.forEach(message => {
        // Determine the conversation partner
        const partnerId = message.sender_id === currentUserId
          ? message.receiver_id
          : message.sender_id;

        const partnerName = message.sender_id === currentUserId
          ? message.receiver_name
          : message.sender_name;

        const partnerEmail = message.sender_id === currentUserId
          ? message.receiver_email
          : message.sender_email;

        // Initialize conversation if it doesn't exist
        if (!conversationsMap[partnerId]) {
          conversationsMap[partnerId] = {
            partnerId,
            partnerName,
            partnerEmail,
            messages: [],
            lastMessageTime: null,
            unreadCount: 0
          };
        }

        // Add message to conversation
        conversationsMap[partnerId].messages.push(message);

        // Update last message time
        const messageTime = new Date(message.created_at);
        if (!conversationsMap[partnerId].lastMessageTime ||
            messageTime > conversationsMap[partnerId].lastMessageTime) {
          conversationsMap[partnerId].lastMessageTime = messageTime;
          conversationsMap[partnerId].lastMessage = message.content;
        }

        // Count unread messages (received and not read)
        if (message.receiver_id === currentUserId && !message.is_read) {
          conversationsMap[partnerId].unreadCount++;
        }
      });

      // Convert to array and sort by last message time
      const conversationsList = Object.values(conversationsMap)
        .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      setConversations(conversationsList);
    } catch (error) {
      console.error('Error loading conversations:', error);
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

  const refreshActiveConversation = async () => {
    if (!selectedConversation) return;

    try {
      // Load both sent and received messages
      const [receivedResponse, sentResponse] = await Promise.all([
        messagesApi.getAll({ type: 'received' }),
        messagesApi.getAll({ type: 'sent' })
      ]);

      const allMessages = [...receivedResponse.data, ...sentResponse.data];

      // Filter messages for current conversation
      const conversationMsgs = allMessages.filter(msg => {
        const partnerId = msg.sender_id === currentUserId
          ? msg.receiver_id
          : msg.sender_id;
        return partnerId === selectedConversation.partnerId;
      });

      // Sort messages chronologically
      const sortedMessages = conversationMsgs.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      // Only update if there are new messages
      if (sortedMessages.length > conversationMessages.length) {
        setConversationMessages(sortedMessages);

        // Mark new unread messages as read
        const newUnreadMessages = sortedMessages
          .filter(msg => msg.receiver_id === currentUserId && !msg.is_read)
          .filter(msg => !conversationMessages.find(m => m.id === msg.id));

        for (const message of newUnreadMessages) {
          try {
            await messagesApi.markAsRead(message.id);
          } catch (error) {
            console.error('Error marking message as read:', error);
          }
        }

        if (newUnreadMessages.length > 0) {
          loadUnreadCount();
        }
      }
    } catch (error) {
      console.error('Error refreshing conversation:', error);
    }
  };

  const handleConversationClick = async (conversation) => {
    setSelectedConversation(conversation);

    // Sort messages chronologically
    const sortedMessages = [...conversation.messages].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    setConversationMessages(sortedMessages);

    // Mark unread messages as read
    const unreadMessages = sortedMessages.filter(
      msg => msg.receiver_id === currentUserId && !msg.is_read
    );

    for (const message of unreadMessages) {
      try {
        await messagesApi.markAsRead(message.id);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }

    // Update local state
    if (unreadMessages.length > 0) {
      setConversations(prev =>
        prev.map(conv =>
          conv.partnerId === conversation.partnerId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      loadUnreadCount();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!replyText.trim() || !selectedConversation || sending) {
      return;
    }

    try {
      setSending(true);

      await messagesApi.send({
        receiver_id: selectedConversation.partnerId,
        content: replyText.trim(),
        subject: '' // Chat-style doesn't need subjects
      });

      // Add the new message to the conversation
      const newMessage = {
        id: Date.now(), // Temporary ID
        sender_id: currentUserId,
        receiver_id: selectedConversation.partnerId,
        content: replyText.trim(),
        created_at: new Date().toISOString(),
        is_read: false
      };

      setConversationMessages(prev => [...prev, newMessage]);
      setReplyText('');

      // Reload conversations to update the list
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
             ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Your conversations
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '70vh', minHeight: '500px' }}>
          <div className="flex flex-col lg:flex-row h-full">
            {/* Conversations List */}
            <div className={`w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading conversations...</div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">💬</div>
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">No conversations yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Start a conversation by sending a message to someone
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.partnerId}
                    onClick={() => handleConversationClick(conversation)}
                    className={`p-3 sm:p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                      selectedConversation?.partnerId === conversation.partnerId
                        ? 'bg-cyan-50'
                        : 'hover:bg-gray-50'
                    } ${
                      conversation.unreadCount > 0
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {conversation.partnerName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {conversation.partnerName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.substring(0, 60)}
                            {conversation.lastMessage?.length > 60 ? '...' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end ml-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(conversation.lastMessageTime)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="mt-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Conversation Thread */}
            <div className={`flex-1 flex flex-col ${selectedConversation ? 'block' : 'hidden lg:flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                    <div className="flex items-center gap-3">
                      {/* Back button for mobile */}
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden text-cyan-600 hover:text-cyan-700 font-semibold"
                      >
                        ←
                      </button>

                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedConversation.partnerName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {selectedConversation.partnerName}
                        </h2>
                        <p className="text-xs text-gray-600">
                          {selectedConversation.partnerEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {conversationMessages.map((message, index) => {
                      const isSentByMe = message.sender_id === currentUserId;
                      const showDate = index === 0 ||
                        new Date(conversationMessages[index - 1].created_at).toDateString() !==
                        new Date(message.created_at).toDateString();

                      return (
                        <div key={message.id}>
                          {/* Date separator */}
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {new Date(message.created_at).toLocaleDateString([], {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          )}

                          {/* Message bubble */}
                          <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${isSentByMe ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isSentByMe
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                    : 'bg-white text-gray-900 border border-gray-200'
                                }`}
                              >
                                <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                              </div>
                              <p className={`text-xs text-gray-500 mt-1 ${isSentByMe ? 'text-right' : 'text-left'}`}>
                                {formatMessageTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim() || sending}
                        className={`px-6 py-2 rounded-full font-semibold transition-all ${
                          replyText.trim() && !sending
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 p-8">
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl mb-4">💬</div>
                    <p className="text-sm sm:text-base">Select a conversation to start chatting</p>
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
