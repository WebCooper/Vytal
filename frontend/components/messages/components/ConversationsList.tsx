import React from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaCircle } from 'react-icons/fa';
import { ConversationSummary } from '@/components/messages/utils/messageUtils';

interface ConversationsListProps {
  conversations: ConversationSummary[];
  onConversationSelect: (conversation: ConversationSummary) => void;
  formatTime: (date: string) => string;
  getUserInitials: (name: string) => string;
  userType: 'donor' | 'recipient';
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onConversationSelect,
  formatTime,
  getUserInitials,
  userType
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
        <div>
          <FaComments className="text-6xl mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-sm mt-2">
            {userType === 'recipient' 
              ? 'People offering help will appear here'
              : 'People interested in your donations will appear here'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation, index) => (
        <ConversationItem
          key={conversation.other_user.id}
          conversation={conversation}
          index={index}
          onSelect={onConversationSelect}
          formatTime={formatTime}
          getUserInitials={getUserInitials}
          userType={userType}
        />
      ))}
    </div>
  );
};

interface ConversationItemProps {
  conversation: ConversationSummary;
  index: number;
  onSelect: (conversation: ConversationSummary) => void;
  formatTime: (date: string) => string;
  getUserInitials: (name: string) => string;
  userType: 'donor' | 'recipient';
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  index,
  onSelect,
  formatTime,
  getUserInitials,
  userType
}) => {
  const badgeText = userType === 'recipient' ? 'Offering help' : 'Interested in donation';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
      className="p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0"
      onClick={() => onSelect(conversation)}
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
              {badgeText}
            </span>
            {conversation.unread_count > 0 && (
              <FaCircle className="text-emerald-500 text-xs" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationsList;