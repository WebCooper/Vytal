// postService.ts
import { axiosInstance } from './axiosInstance';

export type PostCategory = 'BLOOD' | 'MONETARY';
export type PostStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PostUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface UserPreview {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  role: string;
  categories: PostCategory[];
}

export interface RecipientPost {
  id: number;
  user: UserPreview;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  location: string;
  urgency: PostUrgency;
  createdAt: string;
  contact: string;
  fundraiserDetails: any;
  engagement: PostEngagement;
}

export interface CreatePostInput {
  recipient_id: number;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  location: string;
  urgency: PostUrgency;
  contact: string;
  goal?: number;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  status?: PostStatus;
  urgency?: PostUrgency;
  received?: number;
}

export interface PostResponse {
  message: string;
  data: RecipientPost;
  timestamp: string;
}

export interface PostsListResponse {
  data: RecipientPost[];
  timestamp: string;
}

// Create a new post
export const createPost = async (data: CreatePostInput): Promise<PostResponse> => {
  const response = await axiosInstance.post<PostResponse>('/posts', data);
  return response.data;
};

// Get all posts
export const getAllPosts = async (): Promise<PostsListResponse> => {
  const response = await axiosInstance.get<PostsListResponse>('/posts');
  return response.data;
};

// Get posts by user ID
export const getPostsByUser = async (userId: number): Promise<PostsListResponse> => {
  const response = await axiosInstance.get<PostsListResponse>(`/posts/${userId}`);
  return response.data;
};

// Update a post by post ID
export const updatePost = async (postId: number, data: UpdatePostInput): Promise<PostResponse> => {
  const response = await axiosInstance.put<PostResponse>(`/posts/${postId}`, data);
  return response.data;
};

// Delete a post by post ID
export const deletePost = async (postId: number): Promise<{ message: string; timestamp: string }> => {
  const response = await axiosInstance.delete(`/posts/${postId}`);
  return response.data;
};
