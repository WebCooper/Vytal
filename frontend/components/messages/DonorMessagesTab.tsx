'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaClock, 
  FaUser, 
  FaReply, 
  FaTrash, 
  FaFilter,
  FaInbox,
  FaHeart,
  FaHandHoldingHeart,
  FaTimes,
  FaPaperPlane
} from 'react-icons/fa';
import { getUserMessages, markMessageAsRead, Message } from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';

interface DonorMessagesTabProps {
  userId: number;
}

const DonorMessagesTab: React.FC<DonorMessagesTabProps> = ({ userId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'help_offer' | 'contact'>('all');

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await getUserMessages(userId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const statusMatch = statusFilter === 'all' || message.status === statusFilter;
    const typeMatch = typeFilter === 'all' || message.message_type === typeFilter;
    return statusMatch && typeMatch;
  });

  // Mark message as read
  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markMessageAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Open message detail
  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      handleMarkAsRead(message.id);
    }
  };

  // Get message type icon and color
  const getMessageTypeInfo = (type: string) => {
    switch (type) {
      case 'help_offer':
        return { 
          icon: <FaHeart className="text-red-500" />, 
          color: 'bg-red-100 text-red-800',
          label: 'Response to Your Post'
        };
      case 'contact':
        return { 
          icon: <FaHandHoldingHeart className="text-blue-500" />, 
          color: 'bg-blue-100 text-blue-800',
          label: 'Direct Contact'
        };
      default:
        return { 
          icon: <FaEnvelope className="text-gray-500" />, 
          color: 'bg-gray-100 text-gray-800',
          label: 'General Message'
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Messages & Responses</h2>
            <p className="text-emerald-100">
              {messages.filter(m => m.status === 'unread').length} unread messages
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FaInbox className="text-2xl" />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
          >
            <option value="all">All Types</option>
            <option value="help_offer">Responses to Posts</option>
            <option value="contact">Direct Messages</option>
          </select>
        </div>
      </div>

      <div className="flex h-96">
        {/* Messages List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaEnvelope className="text-4xl mx-auto mb-4 text-gray-300" />
              <p>No messages found</p>
              <p className="text-sm mt-2">
                Messages from people interested in your donations will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredMessages.map((message) => {
                const typeInfo = getMessageTypeInfo(message.message_type);
                return (
                  <motion.div
                    key={message.id}
                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                    className={`p-4 cursor-pointer transition-colors ${
                      message.status === 'unread' ? 'bg-emerald-50/50' : ''
                    } ${selectedMessage?.id === message.id ? 'bg-emerald-100/50' : ''}`}
                    onClick={() => handleOpenMessage(message)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {typeInfo.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium text-gray-900 truncate ${
                            message.status === 'unread' ? 'font-bold' : ''
                          }`}>
                            {message.sender.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                        
                        <p className={`text-sm text-gray-600 truncate ${
                          message.status === 'unread' ? 'font-semibold' : ''
                        }`}>
                          {message.subject}
                        </p>
                        
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {message.content.substring(0, 50)}...
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          
                          {message.status === 'unread' && (
                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="w-1/2 flex flex-col">
          {selectedMessage ? (
            <DonorMessageDetail 
              message={selectedMessage} 
              onClose={() => setSelectedMessage(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FaEnvelopeOpen className="text-4xl mx-auto mb-4 text-gray-300" />
                <p>Select a message to view details</p>
                <p className="text-sm mt-2">
                  View responses to your donation posts
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Donor Message Detail Component
interface DonorMessageDetailProps {
  message: Message;
  onClose: () => void;
}

const DonorMessageDetail: React.FC<DonorMessageDetailProps> = ({ message, onClose }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const typeInfo = getMessageTypeInfo(message.message_type);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {message.subject}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {message.sender.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{message.sender.name}</p>
                <p className="text-xs text-gray-500">{message.sender.email}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <FaClock />
            <span>{new Date(message.created_at).toLocaleString()}</span>
          </div>
          
          {message.post && (
            <div className="flex items-center space-x-1">
              <span>Re: {message.post.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">
            {message.content}
          </div>
        </div>

        {/* Post Reference */}
        {message.post && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-700 mb-1">Your Donation Post:</h4>
            <p className="text-sm text-emerald-600">{message.post.title}</p>
            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full mt-2">
              {message.post.category}
            </span>
          </div>
        )}

        {/* Action Suggestions for Donors */}
        {message.message_type === 'help_offer' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-700 mb-2">💡 Next Steps:</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Share your contact details for coordination</li>
              <li>• Discuss pickup/delivery arrangements</li>
              <li>• Confirm donation availability and timing</li>
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center space-x-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <FaReply />
            <span>Reply</span>
          </button>
          
          <button className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm">
            <FaTrash />
            <span>Archive</span>
          </button>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <DonorReplyForm 
                originalMessage={message}
                onCancel={() => setShowReplyForm(false)}
                onSent={() => setShowReplyForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Donor Reply Form Component
interface DonorReplyFormProps {
  originalMessage: Message;
  onCancel: () => void;
  onSent: () => void;
}

const DonorReplyForm: React.FC<DonorReplyFormProps> = ({ originalMessage, onCancel, onSent }) => {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !replyContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Note: You'll need to implement sendMessage for replies
      console.log('Sending donor reply:', {
        sender_id: user.id,
        receiver_id: originalMessage.sender.id,
        post_id: originalMessage.post_id,
        subject: `Re: ${originalMessage.subject}`,
        content: replyContent,
        message_type: 'general'
      });
      
      // For now, just simulate success
      setTimeout(() => {
        setReplyContent('');
        onSent();
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending reply:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Reply to this message... Consider sharing your contact info or arranging pickup details."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
        required
      />
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || !replyContent.trim()}
          className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm flex items-center space-x-1"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <FaPaperPlane />
              <span>Send Reply</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Helper function (moved outside component to avoid re-creation)
const getMessageTypeInfo = (type: string) => {
  switch (type) {
    case 'help_offer':
      return { 
        icon: <FaHeart className="text-red-500" />, 
        color: 'bg-red-100 text-red-800',
        label: 'Response to Your Post'
      };
    case 'contact':
      return { 
        icon: <FaHandHoldingHeart className="text-blue-500" />, 
        color: 'bg-blue-100 text-blue-800',
        label: 'Direct Contact'
      };
    default:
      return { 
        icon: <FaEnvelope className="text-gray-500" />, 
        color: 'bg-gray-100 text-gray-800',
        label: 'General Message'
      };
  }
};

export default DonorMessagesTab;