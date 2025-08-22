import { axiosInstance } from './axiosInstance';
import type { RecipientPost } from './recipientPosts';

export interface PendingPostsResponse {
  data: RecipientPost[];
  timestamp: string;
}

export const getPendingRecipientPosts = async (): Promise<PendingPostsResponse> => {
  const res = await axiosInstance.get<PendingPostsResponse>('/admin/pending-posts');
  return res.data;
};

export const approveRecipientPost = async (postId: number): Promise<{ message: string; data: RecipientPost; timestamp: string }> => {
  const res = await axiosInstance.post<{ message: string; data: RecipientPost; timestamp: string }>(`/admin/approve-post/${postId}`);
  return res.data;
};

export const setRecipientPostStatus = async (
  postId: number,
  status: 'pending' | 'open' | 'fulfilled' | 'cancelled' | 'rejected'
): Promise<{ message?: string; data?: RecipientPost; timestamp: string }> => {
  const res = await axiosInstance.put<{ message?: string; data?: RecipientPost; timestamp: string }>(
    `/posts/${postId}`,
    { status }
  );
  return res.data;
};

export const deleteRecipientPost = async (postId: number): Promise<{ message: string; timestamp: string }> => {
  const res = await axiosInstance.delete<{ message: string; timestamp: string }>(`/posts/${postId}`);
  return res.data;
};

export interface AdminPostDetailsResponse {
  data: RecipientPost;
  timestamp: string;
}

export const getRecipientPostDetails = async (postId: number): Promise<AdminPostDetailsResponse> => {
  const res = await axiosInstance.get<AdminPostDetailsResponse>(`/admin/post-details/${postId}`);
  return res.data;
};

export interface RejectedPostsResponse {
  data: RecipientPost[];
  timestamp: string;
}

export const getRejectedRecipientPosts = async (): Promise<RejectedPostsResponse> => {
  const res = await axiosInstance.get<RejectedPostsResponse>('/admin/rejected-posts');
  return res.data;
};

export const rejectRecipientPost = async (postId: number): Promise<{ message: string; data: RecipientPost; timestamp: string }> => {
  const res = await axiosInstance.post<{ message: string; data: RecipientPost; timestamp: string }>(`/admin/reject-post/${postId}`);
  return res.data;
};
