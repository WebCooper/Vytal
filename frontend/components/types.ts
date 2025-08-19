export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    verified: boolean;
    joinedDate: string; // Format: "Month YYYY"
    type: UserType;
    location?: string;
    referrals?: Array<number>; // User IDs of referrals made
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
    CAMP = "camp",
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

export interface LevelInfo {
    level: number;
    title: string;
    pointsForNextLevel: number | null; // null if max level
    pointsToNextLevel: number | null; // null if max level
    progressPercent: number; // 0–100
};

export interface Achievement {
    id: number;
    title: string;
    description: string;
    progress: number; // Current progress towards the achievement
    target: number; // Target to reach for the achievement
    reward: string; // Reward for completing the achievement
    completed?: boolean; // Whether the achievement is completed
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