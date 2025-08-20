// lib/messages.ts - Updated version
import { axiosInstance } from './axiosInstance';

// Types
export interface MessageUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface PostPreview {
  id: number;
  title: string;
  category: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  post_id?: number;
  subject: string;
  content: string;
  message_type: 'help_offer' | 'contact' | 'general';
  status: 'unread' | 'read' | 'archived';
  created_at: string;
  updated_at: string;
  sender: MessageUser;
  receiver: MessageUser;
  post?: PostPreview;
}

export interface ConversationSummary {
  other_user_id: number;
  other_user: MessageUser;
  latest_message: Message;
  unread_count: number;
  last_activity: string;
}

export interface CreateMessageRequest {
  sender_id: number;
  receiver_id: number;
  post_id?: number | null;
  subject: string;
  content: string;
  message_type: 'help_offer' | 'contact' | 'general';
}

export interface MessageResponse {
  message: string;
  data: Message;
  timestamp: string;
}

export interface MessagesListResponse {
  data: Message[];
  total: number;
  timestamp: string;
}

export interface ConversationsListResponse {
  data: ConversationSummary[];
  total: number;
  timestamp: string;
}

// Existing API functions
export const sendMessage = async (messageData: CreateMessageRequest): Promise<MessageResponse> => {
  const response = await axiosInstance.post<MessageResponse>('/messages', messageData);
  return response.data;
};

export const getUserMessages = async (userId: number, status?: string): Promise<MessagesListResponse> => {
  const params = status ? { status } : {};
  const response = await axiosInstance.get<MessagesListResponse>(`/messages/user/${userId}`, { params });
  return response.data;
};

// NEW: Get sent messages
export const getSentMessages = async (userId: number, status?: string): Promise<MessagesListResponse> => {
  const params = status ? { status } : {};
  const response = await axiosInstance.get<MessagesListResponse>(`/messages/sent/${userId}`, { params });
  return response.data;
};

// UPDATED: Get conversation between two users
export const getConversation = async (userId1: number, userId2: number): Promise<MessagesListResponse> => {
  const response = await axiosInstance.get<MessagesListResponse>(`/messages/conversation/${userId1}/${userId2}`);
  return response.data;
};

// NEW: Get all conversations for a user
export const getUserConversations = async (userId: number): Promise<ConversationsListResponse> => {
  const response = await axiosInstance.get<ConversationsListResponse>(`/messages/conversations/${userId}`);
  return response.data;
};

export const markMessageAsRead = async (messageId: number): Promise<void> => {
  await axiosInstance.put(`/messages/${messageId}/read`);
};

// UPDATED: Mark conversation as read
export const markConversationAsRead = async (currentUserId: number, otherUserId: number): Promise<void> => {
  await axiosInstance.put(`/messages/conversation/${currentUserId}/${otherUserId}/read`);
};

export const getUnreadCount = async (userId: number): Promise<number> => {
  const response = await axiosInstance.get<{ count: number }>(`/messages/user/${userId}/unread-count`);
  return response.data.count;
};

export const getMessageById = async (messageId: number): Promise<MessageResponse> => {
  const response = await axiosInstance.get<MessageResponse>(`/messages/${messageId}`);
  return response.data;
};

// NEW: Helper function to determine message direction
export const getMessageDirection = (message: Message, currentUserId: number): 'sent' | 'received' => {
  return message.sender_id === currentUserId ? 'sent' : 'received';
};

// NEW: Helper function to get the other user in a conversation
export const getOtherUser = (message: Message, currentUserId: number): MessageUser => {
  return message.sender_id === currentUserId ? message.receiver : message.sender;
};