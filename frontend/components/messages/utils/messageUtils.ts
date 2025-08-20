// Message utility functions and types
// Import and re-export types from the existing messages lib to avoid conflicts
import type { Message as LibMessage, ConversationSummary as LibConversationSummary } from '@/lib/messages';

// Re-export the exact types from the lib
export type Message = LibMessage;
export type ConversationSummary = LibConversationSummary;

export type ViewMode = 'conversations' | 'inbox' | 'sent' | 'conversation';

export const formatTime = (dateString: string): string => {
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

export const getUserInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Note: These utility functions should use the Message type from @/lib/messages
export const getMessageDirection = (message: any, currentUserId: number): 'sent' | 'received' => {
  return message.sender_id === currentUserId ? 'sent' : 'received';
};

export const getOtherUser = (message: any, currentUserId: number) => {
  return message.sender_id === currentUserId ? message.receiver : message.sender;
};