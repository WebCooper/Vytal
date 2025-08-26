import { axiosInstance } from './axiosInstance';
import { Post } from '@/components/types';

export interface CommunityPostsResponse {
  data: Post[];
  total: number;
  timestamp: string;
}

export const getAllRecipientPosts = async (): Promise<CommunityPostsResponse> => {
  const response = await axiosInstance.get('/posts'); // Changed this line
  return response.data;
};

export const getAllDonorPosts = async (): Promise<CommunityPostsResponse> => {
  const response = await axiosInstance.get<{
    data: Post[];
    total: number;
    timestamp: string;
  }>('/donor_post');
  return response.data;
};