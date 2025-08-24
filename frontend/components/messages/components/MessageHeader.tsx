import React from 'react';
import { FaArrowLeft, FaComments, FaInbox, FaPaperPlane } from 'react-icons/fa';

type ViewMode = 'conversations' | 'inbox' | 'sent' | 'conversation';

interface SelectedConversation {
  other_user: {
    name: string;
  };
}

interface Message {
  status: string;
}

interface MessageHeaderProps {
  viewMode: ViewMode;
  selectedConversation?: SelectedConversation | null;
  conversations: unknown[];
  messages: Message[];
  onViewChange: (mode: ViewMode) => void;
  userType: 'donor' | 'recipient';
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  viewMode,
  selectedConversation,
  conversations,
  messages,
  onViewChange,
  userType
}) => {
  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'conversations':
        return userType === 'recipient' ? 'Help Messages' : 'Messages';
      case 'inbox':
        return userType === 'recipient' ? 'Help Offers' : 'Inbox';
      case 'sent':
        return userType === 'recipient' ? 'My Replies' : 'Sent';
      case 'conversation':
        return selectedConversation?.other_user.name || '';
      default:
        return 'Messages';
    }
  };

  const getHeaderSubtitle = () => {
    switch (viewMode) {
      case 'conversations':
        return `${conversations.length} conversations`;
      case 'inbox':
        const unreadCount = messages.filter(m => m.status === 'unread').length;
        return userType === 'recipient' 
          ? `${unreadCount} unread offers`
          : `${unreadCount} unread`;
      case 'sent':
        const label = userType === 'recipient' ? 'replies' : 'messages';
        return `${messages.length} ${label}`;
      case 'conversation':
        return userType === 'recipient' ? 'Help coordination' : 'Donation coordination';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-4 text-white flex-shrink-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {viewMode === 'conversation' && (
            <button
              onClick={() => onViewChange('conversations')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaArrowLeft />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold">{getHeaderTitle()}</h2>
            <p className="text-emerald-100 text-sm">{getHeaderSubtitle()}</p>
          </div>
        </div>

        {/* Navigation */}
        {viewMode !== 'conversation' && (
          <div className="flex space-x-1">
            <button
              onClick={() => onViewChange('conversations')}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                viewMode === 'conversations' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <FaComments className="inline mr-1" />
              Chats
            </button>
            <button
              onClick={() => onViewChange('inbox')}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                viewMode === 'inbox' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <FaInbox className="inline mr-1" />
              {userType === 'recipient' ? 'Offers' : 'Inbox'}
            </button>
            <button
              onClick={() => onViewChange('sent')}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                viewMode === 'sent' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <FaPaperPlane className="inline mr-1" />
              {userType === 'recipient' ? 'Replies' : 'Sent'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageHeader;