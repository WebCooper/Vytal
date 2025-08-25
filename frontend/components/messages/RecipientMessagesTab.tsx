'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getUserMessages, 
  getSentMessages,
  getUserConversations,
  getConversation,
  markMessageAsRead,
  markConversationAsRead,
  sendMessage
} from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessagesContext';

// Import our modular components
import MessageHeader from '@/components/messages/components/MessageHeader';
import ConversationsList from '@/components/messages/components/ConversationsList';
import MessagesList from '@/components/messages/components/MessagesList';
import ConversationView from '@/components/messages/components/ConversationView';

// Import types and utilities
import { 
  Message, 
  ConversationSummary, 
  ViewMode, 
  formatTime, 
  getUserInitials 
} from '@/components/messages/utils/messageUtils';

interface RecipientMessagesTabProps {
  userId: number;
}

const RecipientMessagesTab: React.FC<RecipientMessagesTabProps> = ({ userId }) => {
  const { user } = useAuth();
  const { decrementUnreadCount, refreshUnreadCount } = useMessages();
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('conversations');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Message interaction handlers
  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markMessageAsRead(messageId);
      decrementUnreadCount(1);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Data fetching functions
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

  const fetchConversationThread = useCallback(async (otherUserId: number) => {
    try {
      setIsLoading(true);
      const response = await getConversation(userId, otherUserId);
      setMessages(response.data);

      await markConversationAsRead(userId, otherUserId);
      refreshUnreadCount();
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshUnreadCount]);

  // Navigation and interaction handlers
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

  const handleConversationSelect = (conversation: ConversationSummary) => {
    setSelectedConversation(conversation);
    setViewMode('conversation');
    fetchConversationThread(conversation.other_user.id);
  };

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

  // Initial data load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Loading state
  if (isLoading && viewMode !== 'conversation') {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden h-[600px] flex flex-col">
      <MessageHeader
        viewMode={viewMode}
        selectedConversation={selectedConversation}
        conversations={conversations}
        messages={messages}
        onViewChange={handleViewChange}
        userType="recipient"
      />

      <div className="flex-1 overflow-hidden">
        {viewMode === 'conversations' && (
          <ConversationsList
            conversations={conversations}
            onConversationSelect={handleConversationSelect}
            formatTime={formatTime}
            getUserInitials={getUserInitials}
            userType="recipient"
          />
        )}

        {(viewMode === 'inbox' || viewMode === 'sent') && (
          <MessagesList
            messages={messages}
            currentUserId={userId}
            viewMode={viewMode}
            formatTime={formatTime}
            getUserInitials={getUserInitials}
            onMarkAsRead={handleMarkAsRead}
            userType="recipient"
          />
        )}

        {viewMode === 'conversation' && selectedConversation && (
          <ConversationView
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
            userType="recipient"
          />
        )}
      </div>
    </div>
  );
};

export default RecipientMessagesTab;