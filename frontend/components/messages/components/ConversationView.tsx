import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';
import { Message } from '@/components/messages/utils/messageUtils';

interface ConversationViewProps {
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
  userType: 'donor' | 'recipient';
}

const ConversationView: React.FC<ConversationViewProps> = ({
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
  messagesEndRef,
  userType
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
      <ConversationHeader 
        otherUser={otherUser}
        getUserInitials={getUserInitials}
      />
      
      <MessagesArea
        messages={messages}
        currentUserId={currentUserId}
        currentUser={currentUser}
        otherUser={otherUser}
        formatTime={formatTime}
        getUserInitials={getUserInitials}
        messagesEndRef={messagesEndRef}
      />
      
      <ConversationTip userType={userType} />
      
      <ReplyForm
        replyText={replyText}
        setReplyText={setReplyText}
        onReply={onReply}
        isSending={isSending}
        otherUser={otherUser}
      />
    </div>
  );
};

interface ConversationHeaderProps {
  otherUser: any;
  getUserInitials: (name: string) => string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  otherUser,
  getUserInitials
}) => {
  return (
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
  );
};

interface MessagesAreaProps {
  messages: Message[];
  currentUserId: number;
  currentUser: any;
  otherUser: any;
  formatTime: (date: string) => string;
  getUserInitials: (name: string) => string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessagesArea: React.FC<MessagesAreaProps> = ({
  messages,
  currentUserId,
  currentUser,
  otherUser,
  formatTime,
  getUserInitials,
  messagesEndRef
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      <AnimatePresence>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            index={index}
            isSent={message.sender_id === currentUserId}
            currentUser={currentUser}
            otherUser={otherUser}
            formatTime={formatTime}
            getUserInitials={getUserInitials}
          />
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  index: number;
  isSent: boolean;
  currentUser: any;
  otherUser: any;
  formatTime: (date: string) => string;
  getUserInitials: (name: string) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  isSent,
  currentUser,
  otherUser,
  formatTime,
  getUserInitials
}) => {
  return (
    <motion.div
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
};

interface ConversationTipProps {
  userType: 'donor' | 'recipient';
}

const ConversationTip: React.FC<ConversationTipProps> = ({ userType }) => {
  const tipText = userType === 'recipient'
    ? 'Share specific details about your needs, timeline, and how they can help you best.'
    : 'Share your contact details, availability, and pickup/delivery preferences to coordinate your donation.';

  const tipColor = userType === 'recipient' ? 'green' : 'blue';

  return (
    <div className={`px-4 py-3 bg-${tipColor}-50 border-t border-${tipColor}-100`}>
      <p className={`text-sm text-${tipColor}-700`}>
        <strong>{userType === 'recipient' ? 'Remember:' : 'Tip:'}</strong> {tipText}
      </p>
    </div>
  );
};

interface ReplyFormProps {
  replyText: string;
  setReplyText: (text: string) => void;
  onReply: (e: React.FormEvent) => void;
  isSending: boolean;
  otherUser: any;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  replyText,
  setReplyText,
  onReply,
  isSending,
  otherUser
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
      e.preventDefault();
      onReply(e as any);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex space-x-3">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Message ${otherUser.name}...`}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
              disabled={isSending}
              onKeyPress={handleKeyPress}
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
  );
};

export default ConversationView;