import { axiosInstance } from './axiosInstance';
import { Post } from '@/components/types';

export interface CommunityPostsResponse {
  data: Post[];
  total: number;
  timestamp: string;
}

// Get all recipient posts
// Change from '/recipient-posts' to '/posts'
export const getAllRecipientPosts = async (): Promise<CommunityPostsResponse> => {
  const response = await axiosInstance.get('/posts'); // Changed this line
  return response.data;
};

// Get all donor posts
export const getAllDonorPosts = async (): Promise<CommunityPostsResponse> => {
  const response = await axiosInstance.get<{
    data: Post[];
    total: number;
    timestamp: string;
  }>('/donor_post');
  return response.data;
};