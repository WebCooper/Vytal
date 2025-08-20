import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaCheck, FaCheckDouble, FaHeart, FaHandHoldingHeart } from 'react-icons/fa';
import { Message } from '@/components/messages/utils/messageUtils';

interface MessagesListProps {
  messages: Message[];
  currentUserId: number;
  viewMode: 'inbox' | 'sent';
  formatTime: (date: string) => string;
  getUserInitials: (name: string) => string;
  onMarkAsRead?: (messageId: number) => void;
  userType: 'donor' | 'recipient';
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId,
  viewMode,
  formatTime,
  getUserInitials,
  onMarkAsRead,
  userType
}) => {
  const getMessageTypeInfo = (type: string) => {
    switch (type) {
      case 'help_offer':
        return { 
          icon: <FaHeart className="text-red-500" />, 
          color: 'bg-red-100 text-red-800 border-red-200',
          label: userType === 'recipient' ? 'Help Offer' : 'Response to Your Post'
        };
      case 'contact':
        return { 
          icon: <FaHandHoldingHeart className="text-blue-500" />, 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: userType === 'recipient' ? 'Contact Message' : 'Direct Contact'
        };
      default:
        return { 
          icon: <FaEnvelope className="text-gray-500" />, 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'General Message'
        };
    }
  };

  const getMessageDirection = (message: Message) => {
    return message.sender_id === currentUserId ? 'sent' : 'received';
  };

  const getOtherUser = (message: Message) => {
    return message.sender_id === currentUserId ? message.receiver : message.sender;
  };

  if (messages.length === 0) {
    return (
      <EmptyMessagesList viewMode={viewMode} userType={userType} />
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          index={index}
          currentUserId={currentUserId}
          viewMode={viewMode}
          formatTime={formatTime}
          getUserInitials={getUserInitials}
          getMessageTypeInfo={getMessageTypeInfo}
          getMessageDirection={getMessageDirection}
          getOtherUser={getOtherUser}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};

interface EmptyMessagesListProps {
  viewMode: 'inbox' | 'sent';
  userType: 'donor' | 'recipient';
}

const EmptyMessagesList: React.FC<EmptyMessagesListProps> = ({ viewMode, userType }) => {
  const getEmptyMessage = () => {
    if (viewMode === 'inbox') {
      return userType === 'recipient' 
        ? 'Help offers for your posts will appear here'
        : 'Responses to your donation posts will appear here';
    } else {
      return userType === 'recipient'
        ? 'Your replies to help offers will appear here'
        : 'Messages you send will appear here';
    }
  };

  const getEmptyTitle = () => {
    if (viewMode === 'inbox') {
      return userType === 'recipient' ? 'No help offers yet' : 'No responses yet';
    } else {
      return userType === 'recipient' ? 'No replies yet' : 'No sent messages yet';
    }
  };

  return (
    <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
      <div>
        <FaEnvelope className="text-6xl mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">{getEmptyTitle()}</p>
        <p className="text-sm mt-2">{getEmptyMessage()}</p>
      </div>
    </div>
  );
};

interface MessageItemProps {
  message: Message;
  index: number;
  currentUserId: number;
  viewMode: 'inbox' | 'sent';
  formatTime: (date: string) => string;
  getUserInitials: (name: string) => string;
  getMessageTypeInfo: (type: string) => any;
  getMessageDirection: (message: Message) => 'sent' | 'received';
  getOtherUser: (message: Message) => { id: number; name: string; email: string };
  onMarkAsRead?: (messageId: number) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  currentUserId,
  viewMode,
  formatTime,
  getUserInitials,
  getMessageTypeInfo,
  getMessageDirection,
  getOtherUser,
  onMarkAsRead
}) => {
  const direction = getMessageDirection(message);
  const otherUser = getOtherUser(message);
  const typeInfo = getMessageTypeInfo(message.message_type);

  const handleClick = () => {
    if (message.status === 'unread' && direction === 'received' && onMarkAsRead) {
      onMarkAsRead(message.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: direction === 'sent' ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
      className={`p-4 transition-all duration-200 border-b border-gray-100 cursor-pointer ${
        message.status === 'unread' && direction === 'received' ? 'bg-emerald-50/50' : ''
      }`}
      onClick={handleClick}
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
};

export default MessagesList;