import axios from 'axios';
import { axiosInstance } from './axiosInstance';

export enum Category {
  ORGANS = "organs",
  BLOOD = "blood",
  FUNDRAISER = "fundraiser",
  MEDICINES = "medicines",
  SUPPLIES = "supplies"
}

export enum Status {
  PENDING = "pending",
  OPEN = "open",
  FULFILLED = "fulfilled",
  CANCELLED = "cancelled"
}

export enum Urgency {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export interface Engagement {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface BloodOffering {
  bloodType: string;
  availability: string;
  lastDonation: string;
}

export interface FundraiserOffering {
  maxAmount: number;
  preferredUse: string;
  requirements: string;
}

export interface MedicineOffering {
  medicineTypes: string[];
  quantity: string;
  expiry: string;
}

export interface OrganOffering {
  organType: string;
  healthStatus: string;
  availability: string;
}

export interface DonorPostCreate {
  donor_id: number;
  title: string;
  category: Category;
  content: string;
  location: string;
  status?: Status;
  urgency: Urgency;
  contact: string;
  bloodOffering?: BloodOffering;
  fundraiserOffering?: FundraiserOffering;
  medicineOffering?: MedicineOffering;
  organOffering?: OrganOffering;
}

export interface DonorPost {
  id: number;
  donor_id: number;
  title: string;
  status: Status;
  category: Category;
  content: string;
  location: string;
  createdAt: string;
  urgency: Urgency;
  engagement: Engagement;
  contact: string;
  bloodOffering?: BloodOffering;
  fundraiserOffering?: FundraiserOffering;
  medicineOffering?: MedicineOffering;
  organOffering?: OrganOffering;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  timestamp: number[];
}

export const createDonorPost = async (post: DonorPostCreate): Promise<ApiResponse<DonorPost>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<DonorPost>>('/donor_post', post);
    return response.data;
  } catch (error: unknown) {
    console.error('Failed to create donor post:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

export const getAllDonorPosts = async (): Promise<ApiResponse<DonorPost[]>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DonorPost[]>>('/donor_post');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch donor posts:', error);
    throw error;
  }
};

export const getDonorPostsByUser = async (userId: number): Promise<ApiResponse<DonorPost[]>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DonorPost[]>>(`/donor_post/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch donor posts for user ${userId}:`, error);
    throw error;
  }
};
