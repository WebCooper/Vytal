export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    verified: boolean;
    joinedDate: string; // Format: "Month YYYY"
    type: UserType;
    location?: string;
}

export enum UserType {
    RECIPIENT = "recipient",
    DONOR = "donor",
    ORGANIZATION = "organization",
    ADMIN = "admin"
}

export interface SidebarProps {
    user: User;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export interface Post {
    id: number;
    title: string;
    category: Category;
    content: string;
    createdAt: string; // ISO date string
    status: string;
    urgency: string;
    engagement: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
    };
    user: User;
    contact: string;
    fundraiserDetails?: FundraiserDetails; // Optional, only for fundraiser posts
    location?: string; // Optional, for posts that have a location
    donation?: {
        amount: number;
        currency: string;
    }
}

export enum Category {
    ORGANS = "organs",
    BLOOD = "blood",
    FUNDRAISER = "fundraiser",
    MEDICINES = "medicines",
    SUPPLIES = "supplies",
}

export enum OrganType {
    KIDNEY = "kidney",
    LIVER = "liver",
    CORNEA = "cornea",
    BONEMARROW = "bonemarrow",
}

export enum BloodDonationType {
    WHOLE_BLOOD = "whole_blood",
    PLASMA = "plasma",
    PLATELETS = "platelets",
    STEMCELLS = "stem_cells",
}

export interface FundraiserDetails {
    goal: number;
    received: number;
}

export interface FilterbarProps {
    filterCategory: string;
    setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
    posts: Array<Post>;
    urgencyFilter: string;
    setUrgencyFilter: React.Dispatch<React.SetStateAction<string>>;
}

export interface PostGridProps {
    posts: Array<Post>;
    filterCategory: string;
}

// components/types.ts - Update your BloodCamp interface to match the API

export interface BloodCamp {
    id: number;
    organizer_id: number;
    name: string;
    organizer: string;
    location: string;
    address: string;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    contact: string;
    description: string;
    requirements?: string;
    blood_types: string[];
    facilities?: string[];
    status: 'active' | 'upcoming' | 'completed';
    coordinates: [number, number];
    created_at?: string;
    updated_at?: string;
    // Computed properties for backward compatibility
    time?: string; // Computed from start_time and end_time
    bloodTypes?: string[]; // Alias for blood_types
}

export interface BloodCampCreateRequest {
    name: string;
    organizer: string;
    location: string;
    address: string;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    contact: string;
    description: string;
    requirements?: string;
    blood_types: string[];
    facilities?: string[];
    coordinates: [number, number];
}

export interface SriLankaMapProps {
    bloodCamps: Array<BloodCamp>;
    setSelectedCamp: React.Dispatch<React.SetStateAction<BloodCamp | null>>;
}

export interface ProfileHeaderProps {
    user: User;
}

export interface TabNavigationProps {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export interface FilterSectionProps {
    filterCategory: string;
    setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
    filterUrgency: string;
    setFilterUrgency: React.Dispatch<React.SetStateAction<string>>;
    filteredPosts: Array<Post>;
}

export interface PostsGridProps {
    filteredPosts: Array<Post>;
}

export interface MapSectionProps {
    bloodCamps: Array<BloodCamp>;
    setSelectedCamp: React.Dispatch<React.SetStateAction<BloodCamp | null>>;
}

export interface CampsSectionProps {
    bloodCamps: BloodCamp[];
    setSelectedCamp: React.Dispatch<React.SetStateAction<BloodCamp | null>>;
    showBloodCampForm: boolean;
    setShowBloodCampForm: React.Dispatch<React.SetStateAction<boolean>>;
    onCampCreated?: () => void | Promise<void>; // Add this line
}

export interface CampsListProps {
    bloodCamps: Array<BloodCamp>;
    setSelectedCamp: React.Dispatch<React.SetStateAction<BloodCamp | null>>;
    selectedCamp: BloodCamp | null;
}

export interface CampDetailsModalProps {
    selectedCamp: BloodCamp | null;
    setSelectedCamp: React.Dispatch<React.SetStateAction<BloodCamp | null>>;
}

export interface RecipientPostGridProps {
    posts: Array<Post>;
    filteredRecipientPosts: Array<Post>;
}

export interface Donation {
    id: number;
    donor: User;
    amount?: number;
    date: string; // ISO date string
    status: string; // e.g., "completed", "pending"
    postId: number; // Associated post ID
    category: Category; // Category of the donation
}

export interface DonorStat {
    level: number;
    totalDonations: number;
    livesTouched: number;
    streakDays: number;
    badgesEarned: number,
    points: number;
    rank: number
}

export interface Badges {
    id: number;
    name: string;
    description: string;
    icon: string; // Icon name from react-icons
    earned: boolean; // Whether the badge has been earned
    rarity: "common" | "rare" | "epic" | "legendary"; // Rarity level
    points: number; // Points awarded for earning this badge
}

export interface Achievement {
    id: number;
    title: string;
    description: string;
    progress: number; // Current progress towards the achievement
    target: number; // Target to reach for the achievement
    reward: string; // Reward for completing the achievement
}
export interface GamificationAchievement {
    id: number;
    title: string;
    description: string;
    progress: number;
    target: number;
    reward: string;
}


export interface LeaderboardDetails {
    rank: number;
    name: string;
    avatar: string; // Initials or avatar image
    points: number; // Total points
    badges: number; // Number of badges earned
    donations: number; // Total donations made
    isUser?: boolean; // Whether this entry is for the current user
}

export interface AnalyticsData {
    overview: {
        totalDonations: number;
        totalImpact: number;
        monthlyGrowth: number;
        currentStreak: number;
        totalValue: number;
    };
    donationTrends: {
        month: string;
        blood: number;
        medicines: number;
        supplies: number;
        fundraiser: number;
    }[];
    categoryDistribution: {
        name: string;
        value: number;
        color: string;
    }[];
    impactMetrics: {
        metric: string;
        value: number | string;
        icon: string;
        color: string;
        bg: string;
        trend: number;
    }[];
    bloodDonationStats: {
        totalDonations: number;
        totalVolume: number;
        lastDonation: string;
        nextEligible: string;
        bloodType: string;
        avgHemoglobin: number;
        monthlyTrend: number[];
    };
    achievementProgress: {
        name: string;
        completed: boolean;
        progress: number;
        color: string;
    }[];
    weeklyActivity: {
        day: string;
        donations: number;
        height: number;
    }[];
    monthlyComparison: {
        thisMonth: { donations: number; value: number };
        lastMonth: { donations: number; value: number };
        change: { donations: number; value: number };
    };
}


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

// New Analytics Types
export interface AnalyticsData {
    overview: {
        totalDonations: number;
        totalImpact: number;
        monthlyGrowth: number;
        currentStreak: number;
        totalValue: number;
    };
    donationTrends: {
        month: string;
        blood: number;
        medicines: number;
        supplies: number;
        fundraiser: number;
    }[];
    categoryDistribution: {
        name: string;
        value: number;
        color: string;
    }[];
    impactMetrics: {
        metric: string;
        value: number | string;
        icon: string;
        color: string;
        bg: string;
        trend: number;
    }[];
    bloodDonationStats: {
        totalDonations: number;
        totalVolume: number;
        lastDonation: string;
        nextEligible: string;
        bloodType: string;
        avgHemoglobin: number;
        monthlyTrend: number[];
    };
    achievementProgress: {
        name: string;
        completed: boolean;
        progress: number;
        color: string;
    }[];
    weeklyActivity: {
        day: string;
        donations: number;
        height: number;
    }[];
    monthlyComparison: {
        thisMonth: { donations: number; value: number };
        lastMonth: { donations: number; value: number };
        change: { donations: number; value: number };
    };
}

export interface TrendDataPoint {
    month: string;
    donations: number;
    amount: number;
    blood: number;
    medicines: number;
    supplies: number;
    organs: number;
    fundraiser: number;
}
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