'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaClock, 
  FaReply, 
  FaInbox,
  FaHeart,
  FaHandHoldingHeart,
  FaTimes,
  FaPaperPlane,
  FaComments,
  FaArrowLeft,
  FaCheck,
  FaCheckDouble,
  FaUser,
  FaCircle
} from 'react-icons/fa';
import { 
  getUserMessages, 
  getSentMessages,
  getUserConversations,
  getConversation,
  markMessageAsRead,
  markConversationAsRead,
  sendMessage,
  Message,
  ConversationSummary,
  getMessageDirection,
  getOtherUser
} from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';

interface RecipientMessagesTabProps {
  userId: number;
}

type ViewMode = 'conversations' | 'inbox' | 'sent' | 'conversation';

const RecipientMessagesTab: React.FC<RecipientMessagesTabProps> = ({ userId }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('conversations');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getUserConversations(userId);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch messages for a view
  const fetchMessages = useCallback(async (mode: 'inbox' | 'sent') => {
    try {
      setIsLoading(true);
      const response = mode === 'inbox' 
        ? await getUserMessages(userId)
        : await getSentMessages(userId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch conversation thread
  const fetchConversationThread = useCallback(async (otherUserId: number) => {
    try {
      setIsLoading(true);
      const response = await getConversation(userId, otherUserId);
      setMessages(response.data);
      
      await markConversationAsRead(userId, otherUserId);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Handle view changes
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedConversation(null);
    setMessages([]);
    
    switch (mode) {
      case 'conversations':
        fetchConversations();
        break;
      case 'inbox':
        fetchMessages('inbox');
        break;
      case 'sent':
        fetchMessages('sent');
        break;
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation: ConversationSummary) => {
    setSelectedConversation(conversation);
    setViewMode('conversation');
    fetchConversationThread(conversation.other_user.id);
  };

  // Handle reply
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedConversation || !replyText.trim()) return;
    
    setIsSending(true);
    
    try {
      await sendMessage({
        sender_id: user.id,
        receiver_id: selectedConversation.other_user.id,
        post_id: null,
        subject: `Re: ${selectedConversation.latest_message.subject}`,
        content: replyText,
        message_type: 'general'
      });
      
      setReplyText('');
      fetchConversationThread(selectedConversation.other_user.id);
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getMessageTypeInfo = (type: string) => {
    switch (type) {
      case 'help_offer':
        return { 
          icon: <FaHeart className="text-red-500" />, 
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Help Offer'
        };
      case 'contact':
        return { 
          icon: <FaHandHoldingHeart className="text-blue-500" />, 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Contact Message'
        };
      default:
        return { 
          icon: <FaEnvelope className="text-gray-500" />, 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'General Message'
        };
    }
  };

  if (isLoading && viewMode !== 'conversation') {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-4 text-white flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {viewMode === 'conversation' && (
              <button
                onClick={() => handleViewChange('conversations')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaArrowLeft />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold">
                {viewMode === 'conversations' && 'Help Messages'}
                {viewMode === 'inbox' && 'Help Offers'}
                {viewMode === 'sent' && 'My Replies'}
                {viewMode === 'conversation' && selectedConversation?.other_user.name}
              </h2>
              <p className="text-emerald-100 text-sm">
                {viewMode === 'conversations' && `${conversations.length} conversations`}
                {viewMode === 'inbox' && `${messages.filter(m => m.status === 'unread').length} unread offers`}
                {viewMode === 'sent' && `${messages.length} replies`}
                {viewMode === 'conversation' && 'Help coordination'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          {viewMode !== 'conversation' && (
            <div className="flex space-x-1">
              <button
                onClick={() => handleViewChange('conversations')}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  viewMode === 'conversations' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <FaComments className="inline mr-1" />
                Chats
              </button>
              <button
                onClick={() => handleViewChange('inbox')}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  viewMode === 'inbox' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <FaInbox className="inline mr-1" />
                Offers
              </button>
              <button
                onClick={() => handleViewChange('sent')}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  viewMode === 'sent' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <FaPaperPlane className="inline mr-1" />
                Replies
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'conversations' && (
          <RecipientConversationsView 
            conversations={conversations}
            onConversationSelect={handleConversationSelect}
            formatTime={formatTime}
            getUserInitials={getUserInitials}
          />
        )}

        {(viewMode === 'inbox' || viewMode === 'sent') && (
          <RecipientMessagesListView 
            messages={messages}
            currentUserId={userId}
            viewMode={viewMode}
            formatTime={formatTime}
            getMessageTypeInfo={getMessageTypeInfo}
            getUserInitials={getUserInitials}
          />
        )}

        {viewMode === 'conversation' && selectedConversation && (
          <RecipientConversationView
            messages={messages}
            currentUserId={userId}
            currentUser={user}
            otherUser={selectedConversation.other_user}
            replyText={replyText}
            setReplyText={setReplyText}
            onReply={handleReply}
            isSending={isSending}
            isLoading={isLoading}
            formatTime={formatTime}
            getUserInitials={getUserInitials}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>
    </div>
  );
};

// Enhanced Conversations List View for Recipients
const RecipientConversationsView: React.FC<{
  conversations: ConversationSummary[];
  onConversationSelect: (conversation: ConversationSummary) => void;
  formatTime: (date: string) => string;
  getUserInitials: (name: string) => string;
}> = ({ conversations, onConversationSelect, formatTime, getUserInitials }) => {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
        <div>
          <FaComments className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-sm mt-2">People offering help will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation, index) => (
        <motion.div
          key={conversation.other_user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
          className="p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0"
          onClick={() => onConversationSelect(conversation)}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {getUserInitials(conversation.other_user.name)}
                </span>
              </div>
              {conversation.unread_count > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {conversation.other_user.name}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatTime(conversation.last_activity)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 truncate mb-1">
                {conversation.latest_message.content}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  Offering help
                </span>
                {conversation.unread_count > 0 && (
                  <FaCircle className="text-emerald-500 text-xs" />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced Messages List View for Recipients
const RecipientMessagesListView: React.FC<{
  messages: Message[];
  currentUserId: number;
  viewMode: 'inbox' | 'sent';
  formatTime: (date: string) => string;
  getMessageTypeInfo: (type: string) => any;
  getUserInitials: (name: string) => string;
}> = ({ messages, currentUserId, viewMode, formatTime, getMessageTypeInfo, getUserInitials }) => {
  if (messages.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
        <div>
          <FaEnvelope className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No {viewMode === 'inbox' ? 'help offers' : 'replies'} yet</p>
          <p className="text-sm mt-2">
            {viewMode === 'inbox' 
              ? 'Help offers for your posts will appear here'
              : 'Your replies to help offers will appear here'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {messages.map((message, index) => {
        const direction = getMessageDirection(message, currentUserId);
        const otherUser = getOtherUser(message, currentUserId);
        const typeInfo = getMessageTypeInfo(message.message_type);
        
        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: direction === 'sent' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
            className={`p-4 transition-all duration-200 border-b border-gray-100 ${
              message.status === 'unread' && direction === 'received' ? 'bg-emerald-50/50' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {getUserInitials(otherUser.name)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {direction === 'sent' ? `To: ${otherUser.name}` : otherUser.name}
                    </p>
                    {direction === 'sent' && (
                      <div className="text-emerald-600">
                        {message.status === 'read' ? <FaCheckDouble className="text-xs" /> : <FaCheck className="text-xs" />}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-800 mb-1 truncate">
                  {message.subject}
                </h4>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {message.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${typeInfo.color}`}>
                    {typeInfo.icon}
                    <span className="ml-1">{typeInfo.label}</span>
                  </span>
                  
                  {direction === 'received' && message.status === 'unread' && (
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Enhanced Conversation View for Recipients
const RecipientConversationView: React.FC<{
  messages: Message[];
  currentUserId: number;
  currentUser: any;
  otherUser: any;
  replyText: string;
  setReplyText: (text: string) => void;
  onReply: (e: React.FormEvent) => void;
  isSending: boolean;
  isLoading: boolean;
  formatTime: (date: string) => string;
  getUserInitials: (name: string) => string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}> = ({
  messages,
  currentUserId,
  currentUser,
  otherUser,
  replyText,
  setReplyText,
  onReply,
  isSending,
  isLoading,
  formatTime,
  getUserInitials,
  messagesEndRef
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {getUserInitials(otherUser.name)}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{otherUser.name}</h3>
          <p className="text-sm text-gray-500">{otherUser.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isSent = message.sender_id === currentUserId;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isSent ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSent 
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    <span className="text-white font-bold text-xs">
                      {isSent ? getUserInitials(currentUser?.name || 'You') : getUserInitials(otherUser.name)}
                    </span>
                  </div>
                  
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      isSent
                        ? 'bg-emerald-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        isSent ? 'text-emerald-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Help Tip */}
      <div className="px-4 py-3 bg-green-50 border-t border-green-100">
        <p className="text-sm text-green-700">
          <strong>Remember:</strong> Share specific details about your needs, timeline, and how they can help you best.
        </p>
      </div>

      {/* Reply Form */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-3">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Thank ${otherUser.name} and share your needs...`}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                disabled={isSending}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
                    e.preventDefault();
                    onReply(e);
                  }
                }}
              />
              <button
                onClick={onReply}
                disabled={isSending || !replyText.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <FaPaperPlane className="text-sm" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientMessagesTab;