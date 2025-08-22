// recipientPost.ts
import { axiosInstance } from './axiosInstance';

// Enums from backend
export type PostCategory = 'blood' | 'organs' | 'fundraiser' | 'medicines' | 'supplies';
export type PostStatus = 'pending' | 'open' | 'fulfilled' | 'cancelled' | 'rejected';
export type PostUrgency = 'low' | 'medium' | 'high';

// Engagement metrics
export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

// Fundraiser details
export interface FundraiserDetails {
  goal: number;
  received: number;
}

// User preview data
export interface UserPreview {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  role: string;
  categories: PostCategory[];
}

// Post model from backend
export interface RecipientPost {
  id: number;
  user: UserPreview;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  location?: string;
  urgency?: PostUrgency;
  createdAt: string;
  contact?: string;
  fundraiserDetails?: FundraiserDetails | null;
  engagement: PostEngagement;
}

// Input to create a post
export interface CreatePostInput {
  recipient_id: number;
  title: string;
  content: string;
  category: PostCategory;
  status?: PostStatus; // default = 'pending' if omitted
  location?: string;
  urgency?: PostUrgency;
  contact?: string;
  goal?: number;
}

// Input to update a post
export interface UpdatePostInput {
  title?: string;
  content?: string;
  category?: PostCategory;
  status?: PostStatus;
  location?: string;
  urgency?: PostUrgency;
  contact?: string;
  goal?: number;
  received?: number;
}

// Full post response
export interface PostResponse {
  message: string;
  data: RecipientPost;
  timestamp: string;
}

// List of posts
export interface PostsListResponse {
  data: RecipientPost[];
  timestamp: string;
}

// API methods
export const createPost = async (data: CreatePostInput): Promise<PostResponse> => {
  const response = await axiosInstance.post<PostResponse>('/posts', data);
  return response.data;
};

export const getAllPosts = async (): Promise<PostsListResponse> => {
  const response = await axiosInstance.get<PostsListResponse>('/posts');
  return response.data;
};

export const getPostsByUser = async (userId: number): Promise<PostsListResponse> => {
  const response = await axiosInstance.get<PostsListResponse>(`/posts/${userId}`);
  return response.data;
};

export const updatePost = async (postId: number, data: UpdatePostInput): Promise<PostResponse> => {
  const response = await axiosInstance.put<PostResponse>(`/posts/${postId}`, data);
  return response.data;
};

export const deletePost = async (postId: number): Promise<{ message: string; timestamp: string }> => {
  const response = await axiosInstance.delete(`/posts/${postId}`);
  return response.data;
};
