// lib/bloodCampsApi.ts
import { axiosInstance } from './axiosInstance';
import { BloodCamp, BloodCampCreateRequest } from '@/components/types';


export interface BloodCampsResponse {
  data: BloodCamp[];
  total: number;
  timestamp: string;
}

export interface CreateBloodCampResponse {
  message: string;
  id: number;
  timestamp: string;
}

// API functions
export const createBloodCamp = async (campData: BloodCampCreateRequest): Promise<CreateBloodCampResponse> => {
  const response = await axiosInstance.post<CreateBloodCampResponse>('/blood-camps', campData);
  return response.data;
};

// lib/bloodCampsApi.ts
export const getAllBloodCamps = async (): Promise<BloodCampsResponse> => {
  const response = await axiosInstance.get<BloodCampsResponse>('/blood-camps');
  
  const currentDateTime = new Date();
  
  // Transform backend data and calculate real-time status
  const transformedData = response.data.data.map(camp => {
    const campDate = new Date(camp.date);
    const [startHour, startMinute] = camp.start_time.split(':').map(Number);
    const [endHour, endMinute] = camp.end_time.split(':').map(Number);
    
    const campStartDateTime = new Date(campDate);
    campStartDateTime.setHours(startHour, startMinute, 0, 0);
    
    const campEndDateTime = new Date(campDate);
    campEndDateTime.setHours(endHour, endMinute, 0, 0);
    
    // Calculate real-time status
    let calculatedStatus: 'active' | 'upcoming' | 'completed';
    
    if (currentDateTime >= campStartDateTime && currentDateTime <= campEndDateTime) {
      calculatedStatus = 'active';
    } else if (currentDateTime < campStartDateTime) {
      calculatedStatus = 'upcoming';
    } else {
      calculatedStatus = 'completed';
    }
    
    return {
      ...camp,
      status: calculatedStatus, // Override backend status with calculated status
      time: `${camp.start_time} - ${camp.end_time}`,
      bloodTypes: camp.blood_types,
    };
  });
  
  return {
    ...response.data,
    data: transformedData
  };
};

export const getBloodCampById = async (id: number): Promise<{ data: BloodCamp }> => {
  const response = await axiosInstance.get<{ data: BloodCamp }>(`/blood-camps/${id}`);
  return response.data;
};

export const updateBloodCamp = async (id: number, campData: Partial<BloodCampCreateRequest>): Promise<{ message: string }> => {
  const response = await axiosInstance.put<{ message: string }>(`/blood-camps/${id}`, campData);
  return response.data;
};

export const deleteBloodCamp = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/blood-camps/${id}`);
  return response.data;
};