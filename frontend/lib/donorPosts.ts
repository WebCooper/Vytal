// donorPosts.ts
import axios from 'axios';
import { axiosInstance } from './axiosInstance';

// Enum types matching Ballerina definitions
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

// Type definitions for post components
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

// DonorPost creation type
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

// DonorPost response type
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

// API response structure
export interface ApiResponse<T> {
  message: string;
  data: T;
  timestamp: number[];
}

/**
 * Create a new donor post
 * @param post The donor post data to be created
 * @returns Promise with the created post data
 */
export const createDonorPost = async (post: DonorPostCreate): Promise<ApiResponse<DonorPost>> => {
  try {
    console.log('Making API request to create donor post:', post);
    console.log('API Base URL:', axiosInstance.defaults.baseURL);
    console.log('Headers:', axiosInstance.defaults.headers);
    
    const response = await axiosInstance.post<ApiResponse<DonorPost>>('/donor_post', post);
    console.log('API Response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create donor post:', error);
    // Log more detailed error information
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

/**
 * Get all donor posts
 * @returns Promise with array of donor posts
 */
export const getAllDonorPosts = async (): Promise<ApiResponse<DonorPost[]>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DonorPost[]>>('/donor_post');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch donor posts:', error);
    throw error;
  }
};

/**
 * Get donor posts by user ID
 * @param userId The user ID whose posts to retrieve
 * @returns Promise with array of donor posts
 */
export const getDonorPostsByUser = async (userId: number): Promise<ApiResponse<DonorPost[]>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DonorPost[]>>(`/donor_post/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch donor posts for user ${userId}:`, error);
    throw error;
  }
};

// Note: The following operations are not currently available in the backend API:
// - getDonorPostById (get a single post by ID)
// - updateDonorPost (update an existing post)
// - deleteDonorPost (delete a post)
// These methods will need to be implemented in the backend before they can be used.
