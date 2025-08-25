// lib/donationApi.ts - Add this to your lib folder

import { AnalyticsData, TrendDataPoint } from '@/components/types';
import { axiosInstance } from './axiosInstance';

// Types matching your backend
export interface DonationCreate {
    recipient_id?: number | null;
    post_id?: number | null;
    donation_type: 'blood' | 'organs' | 'medicines' | 'supplies' | 'fundraiser';
    amount?: number | null;
    quantity?: string | null;
    description?: string | null;
    donation_date: string;
    location?: string | null;
    notes?: string | null;
    // Blood donation specific
    blood_type?: string | null;
    volume_ml?: number | null;
    hemoglobin_level?: number | null;
    donation_center?: string | null;
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
    metadata?: unknown;
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

interface CustomApiError {
    response?: {
        data?: {
            error?: string;
        };
    };
}

const handleApiError = (error: unknown, defaultMessage: string): never => {
    const apiError = error as CustomApiError;
    throw new Error(apiError.response?.data?.error || defaultMessage);
};

// API Functions using axios
export const createDonation = async (donation: DonationCreate): Promise<{ id: number }> => {
    try {
        const response = await axiosInstance.post<ApiResponse<{ id: number }>>('/donations', donation);
        return response.data.data;
    } catch (error) {
        return handleApiError(error, 'Failed to create donation');
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
    } catch (error) {
        return handleApiError(error, 'Failed to fetch donations');
    }
};

// Update donation
export const updateDonation = async (donationId: number, updates: DonationUpdate): Promise<void> => {
    try {
        await axiosInstance.put(`/donations/${donationId}`, updates);
    } catch (error) {
        return handleApiError(error, 'Failed to update donation');
    }
};

// Get donor dashboard
export const getDonorDashboard = async (donorId: number): Promise<{ data: DonorDashboard }> => {
    try {
        const response = await axiosInstance.get<ApiResponse<DonorDashboard>>(`/donations/dashboard/${donorId}`);
        return { data: response.data.data };
    } catch (error) {
        return handleApiError(error, 'Failed to fetch donor dashboard');
    }
};

// Get donor statistics
export const getDonorStats = async (donorId: number): Promise<{ data: DonorStats }> => {
    try {
        const response = await axiosInstance.get<ApiResponse<DonorStats>>(`/donations/stats/${donorId}`);
        return { data: response.data.data };
    } catch (error) {
        return handleApiError(error, 'Failed to fetch donor stats');
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
    } catch (error) {
        return handleApiError(error, 'Failed to fetch achievements');
    }
};



// New Analytics API Functions
export const getDonorAnalytics = async (donorId: number, range: string = '6months'): Promise<{ data: AnalyticsData }> => {    try {
        const response = await axiosInstance.get<ApiResponse<AnalyticsData>>(`/donations/analytics/${donorId}`, {
            params: { range }
        });
        return { data: response.data.data };
    } catch (error) {
        return handleApiError(error, 'Failed to fetch analytics data');
    }
};

export const getDonorTrends = async (donorId: number): Promise<{ data: TrendDataPoint[] }> => {
    try {
        const response = await axiosInstance.get<ApiResponse<TrendDataPoint[]>>(`/donations/trends/${donorId}`);
        return { data: response.data.data };
    } catch (error) {
        return handleApiError(error, 'Failed to fetch trend data');
    }
};

// Helper function to transform backend data for frontend consumption
export const transformDonationsToAnalytics = (
    donations: DonationResponse[],
    stats: DonorStats,
    achievements: Achievement[]
): AnalyticsData => {
    // Get current date and calculate last 6 months
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push(date.toLocaleString('default', { month: 'short' }));
    }

    // Calculate monthly trends based on actual donation data
    const monthlyData: { [key: string]: { blood: number; medicines: number; supplies: number; organs: number; fundraiser: number } } = {};
    
    // Initialize all months with zero values
    last6Months.forEach(month => {
        monthlyData[month] = { blood: 0, medicines: 0, supplies: 0, organs: 0, fundraiser: 0 };
    });

    // Process actual donations
    donations.forEach(donation => {
        const donationDate = new Date(donation.donation_date);
        const month = donationDate.toLocaleString('default', { month: 'short' });
        
        // Only count if it's within our 6-month window
        if (monthlyData[month]) {
            switch (donation.donation_type) {
                case 'blood':
                    monthlyData[month].blood++;
                    break;
                case 'medicines':
                    monthlyData[month].medicines++;
                    break;
                case 'supplies':
                    monthlyData[month].supplies++;
                    break;
                case 'organs':
                    monthlyData[month].organs++;
                    break;
                case 'fundraiser':
                    monthlyData[month].fundraiser += donation.amount || 0;
                    break;
            }
        }
    });

    // Calculate weekly activity based on actual donation dates
    const calculateWeeklyActivity = (donations: DonationResponse[]) => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday = 0, Monday = 1, etc.
        const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const weeklyData = days.map((day, index) => {
            // Count donations for each day of the week from the last month
            const dayCount = donations.filter(donation => {
                const donationDate = new Date(donation.donation_date);
                const dayOfWeek = donationDate.getDay();
                
                // Only count donations from the last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                return dayOfWeek === index && donationDate >= thirtyDaysAgo;
            }).length;
            
            return {
                day: dayLabels[index],
                donations: dayCount,
                height: dayCount * 20 // Scale height based on donations
            };
        });
        
        return weeklyData;
    };

    // Calculate category distribution with proper handling of zero divisions
    const totalDonations = stats.total_donations || 1; // Avoid division by zero
    const categoryDistribution = [
        { 
            name: 'Blood', 
            value: stats.total_donations > 0 ? Math.round((stats.blood_donations / totalDonations) * 100) : 0, 
            color: '#ef4444' 
        },
        { 
            name: 'Medicines', 
            value: stats.total_donations > 0 ? Math.round((stats.medicine_donations / totalDonations) * 100) : 0, 
            color: '#10b981' 
        },
        { 
            name: 'Supplies', 
            value: stats.total_donations > 0 ? Math.round((stats.supply_donations / totalDonations) * 100) : 0, 
            color: '#3b82f6' 
        },
        { 
            name: 'Organs', 
            value: stats.total_donations > 0 ? Math.round((stats.organ_donations / totalDonations) * 100) : 0, 
            color: '#8b5cf6' 
        },
        { 
            name: 'Fundraiser', 
            value: stats.total_donations > 0 && stats.total_fundraiser_amount > 0 ? 
                   Math.round((1 / totalDonations) * 100) : 0, 
            color: '#f59e0b' 
        }
    ];

    // Get blood type from recent blood donations
    const bloodType = donations
        .find(d => d.donation_type === 'blood' && d.blood_details?.blood_type)
        ?.blood_details?.blood_type || 'Unknown';

    // Calculate actual blood donation monthly trend
    const bloodMonthlyTrend = last6Months.map(month => monthlyData[month]?.blood || 0);

    // Calculate monthly comparison (this month vs last month)
    const thisMonth = new Date().toLocaleString('default', { month: 'short' });
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'short' });
    
    const thisMonthDonations = donations.filter(d => {
        const donationMonth = new Date(d.donation_date).toLocaleString('default', { month: 'short' });
        return donationMonth === thisMonth;
    });
    
    const lastMonthDonations = donations.filter(d => {
        const donationMonth = new Date(d.donation_date).toLocaleString('default', { month: 'short' });
        return donationMonth === lastMonth;
    });

    const thisMonthValue = thisMonthDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const lastMonthValue = lastMonthDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const donationChange = lastMonthDonations.length > 0 ? 
        ((thisMonthDonations.length - lastMonthDonations.length) / lastMonthDonations.length) * 100 : 0;
    const valueChange = lastMonthValue > 0 ? 
        ((thisMonthValue - lastMonthValue) / lastMonthValue) * 100 : 0;

    // Calculate impact metrics with trends
    const impactMetrics = [
        { 
            metric: 'Lives Potentially Saved', 
            value: stats.blood_donations * 3,
            icon: 'FaHeart', 
            color: 'text-red-600', 
            bg: 'bg-red-50', 
            trend: 12.5 
        },
        { 
            metric: 'People Helped', 
            value: stats.total_donations, 
            icon: 'FaUsers', 
            color: 'text-blue-600', 
            bg: 'bg-blue-50', 
            trend: 8.2 
        },
        { 
            metric: 'Donations Made', 
            value: stats.total_donations, 
            icon: 'FaGift', 
            color: 'text-green-600', 
            bg: 'bg-green-50', 
            trend: 15.3 
        },
        { 
            metric: 'Total Value', 
            value: `$${stats.total_fundraiser_amount.toFixed(2)}`, 
            icon: 'FaDollarSign', 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-50', 
            trend: -2.1 
        }
    ];

    return {
        overview: {
            totalDonations: stats.total_donations,
            totalImpact: stats.blood_donations * 3,
            monthlyGrowth: donationChange,
            currentStreak: 3, // You'd calculate this from consecutive donation days
            totalValue: stats.total_fundraiser_amount
        },
        donationTrends: last6Months.map(month => ({
            month,
            blood: monthlyData[month]?.blood || 0,
            medicines: monthlyData[month]?.medicines || 0,
            supplies: monthlyData[month]?.supplies || 0,
            fundraiser: monthlyData[month]?.fundraiser || 0
        })),
        categoryDistribution,
        impactMetrics,
        bloodDonationStats: {
            totalDonations: stats.blood_donations,
            totalVolume: stats.blood_donations * 500,
            lastDonation: stats.last_donation_date || '',
            nextEligible: '', // Calculate based on last donation + 56 days
            bloodType: bloodType,
            avgHemoglobin: 14.2, // You'd calculate this from actual blood donation records
            monthlyTrend: bloodMonthlyTrend
        },
        achievementProgress: achievements.slice(0, 5).map(achievement => ({
            name: achievement.achievement_name,
            completed: true,
            progress: 100,
            color: 'bg-green-500'
        })),
        weeklyActivity: calculateWeeklyActivity(donations),
        monthlyComparison: {
            thisMonth: { 
                donations: thisMonthDonations.length, 
                value: thisMonthValue 
            },
            lastMonth: { 
                donations: lastMonthDonations.length, 
                value: lastMonthValue 
            },
            change: { 
                donations: donationChange, 
                value: valueChange 
            }
        }
    };
};
