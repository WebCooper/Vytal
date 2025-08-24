import { axiosInstance } from './axiosInstance';

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

export interface CreateMessageRequest {
  sender_id: number;
  receiver_id: number;
  post_id?: number;
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

export const sendMessage = async (messageData: CreateMessageRequest): Promise<MessageResponse> => {
  const response = await axiosInstance.post<MessageResponse>('/messages', messageData);
  return response.data;
};

export const getUserMessages = async (userId: number, status?: string): Promise<MessagesListResponse> => {
  const params = status ? { status } : {};
  const response = await axiosInstance.get<MessagesListResponse>(`/messages/user/${userId}`, { params });
  return response.data;
};

export const getConversation = async (userId1: number, userId2: number): Promise<MessagesListResponse> => {
  const response = await axiosInstance.get<MessagesListResponse>(`/messages/conversation/${userId1}/${userId2}`);
  return response.data;
};

export const markMessageAsRead = async (messageId: number): Promise<void> => {
  await axiosInstance.put(`/messages/${messageId}/read`);
};

export const markConversationAsRead = async (senderId: number, receiverId: number): Promise<void> => {
  await axiosInstance.put(`/messages/conversation/${senderId}/${receiverId}/read`);
};

export const getUnreadCount = async (userId: number): Promise<number> => {
  const response = await axiosInstance.get<{ count: number }>(`/messages/user/${userId}/unread-count`);
  return response.data.count;
};

export const getMessageById = async (messageId: number): Promise<MessageResponse> => {
  const response = await axiosInstance.get<MessageResponse>(`/messages/${messageId}`);
  return response.data;
};