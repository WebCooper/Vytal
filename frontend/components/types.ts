export interface User {
    id: string;
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
    category: PostCategory;
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
}

export enum PostCategory {
    ORGANS = "organs",
    FUNDRAISER = "fundraiser",
    MEDICINES = "medicines"
}

export interface FundraiserDetails {
    goal: number;
    received: number;
}

export interface FilterbarProps {
    filterCategory: string;
    setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
    posts: Array<Post>;
}

export interface PostGridProps {
    posts: Array<Post>;
    filterCategory: string;
}

export interface BloodCamp {
    id: number;
    name: string;
    location: string;
    coordinates: Array<number>; // [latitude, longitude]
    date: string; // ISO date string
    time: string; // Time in HH:MM format
    status: string;
    organizer: string;
    contact: string; // Phone number or email
    capacity: number; // Number of donors expected
    bloodTypes: Array<string>; // e.g., "A+", "O-", etc.
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

export interface CampsListProps {
    bloodCamps: Array<BloodCamp>;
    setSelectedCamp: React.Dispatch<React.SetStateAction<BloodCamp | null>>;
    selectedCamp: BloodCamp | null;
}

export interface CampDetailsModalProps {
    selectedCamp: BloodCamp | null;
    setSelectedCamp: React.Dispatch<React.SetStateAction<BloodCamp | null>>;
}