// lib/bloodCampsApi.ts
import { axiosInstance } from './axiosInstance';
import { BloodCamp, BloodCampCreateRequest } from '@/components/types';

// Existing interfaces
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

// Registration interfaces
export interface BloodCampRegistration {
  id: number;
  camp_id: number;
  donor_id: number;
  registration_date: string;
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'no_show';
  blood_type: string;
  last_donation_date?: string;
  health_status: 'eligible' | 'pending_review' | 'not_eligible';
  contact_phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  medications?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  camp?: {
    id: number;
    name: string;
    date: string;
    location: string;
  };
  donor?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BloodCampRegistrationCreate {
  camp_id: number;
  blood_type: string;
  last_donation_date?: string;
  contact_phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  medications?: string;
  notes?: string;
}

export interface RegistrationResponse {
  message: string;
  id: number;
  registration: BloodCampRegistration;
  timestamp: string;
}

export interface RegistrationsListResponse {
  data: BloodCampRegistration[];
  total: number;
  timestamp: string;
}

export interface EligibilityResponse {
  eligible: boolean;
  reason?: string;
  next_eligible_date?: string;
  last_donation_date?: string;
  blood_type?: string;
  timestamp: string;
}

// Existing blood camp functions
export const createBloodCamp = async (campData: BloodCampCreateRequest): Promise<CreateBloodCampResponse> => {
  const response = await axiosInstance.post<CreateBloodCampResponse>('/blood-camps', campData);
  return response.data;
};

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

// NEW: Registration API functions
export const registerForBloodCamp = async (
  registrationData: BloodCampRegistrationCreate
): Promise<RegistrationResponse> => {
  const response = await axiosInstance.post<RegistrationResponse>(
    '/blood-camps/register', 
    registrationData
  );
  return response.data;
};

export const getDonorRegistrations = async (
  donorId: number
): Promise<RegistrationsListResponse> => {
  const response = await axiosInstance.get<RegistrationsListResponse>(
    `/blood-camps/registrations/donor/${donorId}`
  );
  return response.data;
};

export const getCampRegistrations = async (
  campId: number
): Promise<RegistrationsListResponse> => {
  const response = await axiosInstance.get<RegistrationsListResponse>(
    `/blood-camps/${campId}/registrations`
  );
  return response.data;
};

export const updateRegistration = async (
  registrationId: number,
  updateData: Partial<BloodCampRegistrationCreate>
): Promise<{ message: string; registration: BloodCampRegistration }> => {
  const response = await axiosInstance.put<{ message: string; registration: BloodCampRegistration }>(
    `/blood-camps/registrations/${registrationId}`,
    updateData
  );
  return response.data;
};

export const cancelRegistration = async (
  registrationId: number
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/blood-camps/registrations/${registrationId}`
  );
  return response.data;
};

export const checkEligibility = async (
  donorId: number
): Promise<EligibilityResponse> => {
  const response = await axiosInstance.get<EligibilityResponse>(
    `/blood-camps/eligibility/${donorId}`
  );
  return response.data;
};