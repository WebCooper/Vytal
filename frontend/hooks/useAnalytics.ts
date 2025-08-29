import { useState, useEffect, useCallback } from 'react';
import { 
  getDonorDashboard, 
  getDonorStats, 
  getDonorAchievements, 
  getDonationsByDonor,
  getDonorAnalytics,
  getDonorTrends,
  transformDonationsToAnalytics,
  DonorStats,
  Achievement,
  DonationResponse
} from '@/lib/donationApi';
import { AnalyticsData } from '@/components/types';
interface UseAnalyticsOptions {
  userId: number | null;
  timeRange?: string;
  refreshInterval?: number; // in milliseconds
}

interface UseAnalyticsReturn {
  analyticsData: AnalyticsData | null;
  stats: DonorStats | null;
  achievements: Achievement[];
  recentDonations: DonationResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setTimeRange: (range: string) => void;
  timeRange: string;
}

export const useAnalytics = (options: UseAnalyticsOptions): UseAnalyticsReturn => {
  const { userId, timeRange: initialTimeRange = '6months', refreshInterval } = options;
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState<DonorStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(initialTimeRange);

  const fetchAnalyticsData = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [dashboardResult, statsResult, achievementsResult, donationsResult] = await Promise.all([
        getDonorDashboard(userId),
        getDonorStats(userId),
        getDonorAchievements(userId),
        getDonationsByDonor(userId)
      ]);

      // Set individual data
      setStats(statsResult.data);
      setAchievements(achievementsResult.data);
      setRecentDonations(donationsResult.data.slice(0, 5)); // Get 5 most recent

      // Transform and set analytics data
      const transformedData = transformDonationsToAnalytics(
        donationsResult.data,
        statsResult.data,
        achievementsResult.data
      );

      setAnalyticsData(transformedData);

      // Try to get enhanced analytics from backend if available
      try {
        const backendAnalytics = await getDonorAnalytics(userId, timeRange);
        // Merge with transformed data, preferring backend data when available
        setAnalyticsData(prev => ({
          ...prev!,
          ...backendAnalytics.data
        }));
      } catch (backendError) {
        console.warn('Backend analytics not available, using transformed data:', backendError);
        // Continue with transformed data
      }

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [userId, timeRange]);

  // Initial fetch and refresh when dependencies change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Set up auto-refresh if interval is provided
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchAnalyticsData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchAnalyticsData, refreshInterval]);

  return {
    analyticsData,
    stats,
    achievements,
    recentDonations,
    loading,
    error,
    refresh: fetchAnalyticsData,
    setTimeRange,
    timeRange
  };
};

// Additional utility hook for getting current user ID
export const useCurrentUser = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const userData = localStorage.getItem('vytal_user');
      const token = localStorage.getItem('vytal_token');
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setUserId(parsedUser.id);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      localStorage.removeItem('vytal_user');
      localStorage.removeItem('vytal_token');
    }
  }, []);

  return { userId, user };
};