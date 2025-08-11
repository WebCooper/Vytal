export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    verified: boolean;
    joinedDate: string; // Format: "Month YYYY"
}

export interface sidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export interface Post {
    id: number;
    title: string;
    category: string; // "organs", "funding", "medicines"
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
}

export interface filterbarProps {
    filterCategory: string;
    setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
    posts: Array<Post>; // Example post structure
}

export interface PostGridProps {
    posts: Array<Post>;
    filterCategory: string;
}