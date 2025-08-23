// lib/donationApi.ts - Add this to your lib folder

import { axiosInstance } from './axiosInstance';

// Types matching your backend
export interface DonationCreate {
  recipient_id?: number;
  post_id?: number;
  donation_type: 'blood' | 'organs' | 'medicines' | 'supplies' | 'fundraiser';
  amount?: number;
  quantity?: string;
  description?: string;
  donation_date: string;
  location?: string;
  notes?: string;
  // Blood donation specific
  blood_type?: string;
  volume_ml?: number;
  hemoglobin_level?: number;
  donation_center?: string;
}

export interface DonationUpdate {
  status?: 'pending' | 'completed' | 'cancelled';
  amount?: number;
  quantity?: string;
  description?: string;
  location?: string;
  notes?: string;
}

export interface BloodDonation {
  id: number;
  donation_id: number;
  blood_type: string;
  volume_ml: number;
  hemoglobin_level?: number;
  donation_center?: string;
  next_eligible_date?: string;
  created_at?: string;
}

export interface DonationResponse {
  id: number;
  donor_id: number;
  recipient_id?: number;
  post_id?: number;
  donation_type: 'blood' | 'organs' | 'medicines' | 'supplies' | 'fundraiser';
  amount?: number;
  quantity?: string;
  description?: string;
  donation_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  recipient?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  post?: {
    id: number;
    title: string;
    category: string;
  };
  blood_details?: BloodDonation;
}

export interface DonorStats {
  donor_id: number;
  total_donations: number;
  blood_donations: number;
  organ_donations: number;
  medicine_donations: number;
  supply_donations: number;
  total_fundraiser_amount: number;
  last_donation_date?: string;
  first_donation_date?: string;
}

export interface Achievement {
  id: number;
  donor_id: number;
  achievement_type: string;
  achievement_name: string;
  description?: string;
  earned_date: string;
  metadata?: any;
  created_at?: string;
}

export interface DonorDashboard {
  stats: DonorStats;
  recent_donations: DonationResponse[];
  achievements: Achievement[];
  availability: {
    can_donate_blood: boolean;
    next_eligible_date?: string;
    last_donation_date?: string;
  };
}

// API Response interfaces
interface ApiResponse<T> {
  data: T;
  timestamp: string;
  message?: string;
  total?: number;
}

// API Functions using axios
export const createDonation = async (donation: DonationCreate): Promise<{ id: number }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ id: number }>>('/donations', donation);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to create donation');
  }
};

// Get donations by donor
export const getDonationsByDonor = async (donorId: number, status?: string): Promise<{ data: DonationResponse[]; total: number }> => {
  try {
    const params = status ? { status } : {};
    const response = await axiosInstance.get<ApiResponse<DonationResponse[]>>(`/donations/donor/${donorId}`, { params });
    return {
      data: response.data.data,
      total: response.data.total || response.data.data.length
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch donations');
  }
};

// Update donation
export const updateDonation = async (donationId: number, updates: DonationUpdate): Promise<void> => {
  try {
    await axiosInstance.put(`/donations/${donationId}`, updates);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update donation');
  }
};

// Get donor dashboard
export const getDonorDashboard = async (donorId: number): Promise<{ data: DonorDashboard }> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DonorDashboard>>(`/donations/dashboard/${donorId}`);
    return { data: response.data.data };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch donor dashboard');
  }
};

// Get donor statistics
export const getDonorStats = async (donorId: number): Promise<{ data: DonorStats }> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DonorStats>>(`/donations/stats/${donorId}`);
    return { data: response.data.data };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch donor stats');
  }
};

// Get donor achievements
export const getDonorAchievements = async (donorId: number): Promise<{ data: Achievement[]; total: number }> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Achievement[]>>(`/donations/achievements/${donorId}`);
    return {
      data: response.data.data,
      total: response.data.total || response.data.data.length
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch achievements');
  }
};