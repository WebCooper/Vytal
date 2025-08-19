// Backend API response types
export interface RecipientPostResponse {
  id: number;
  title: string;
  category: string;
  content: string;
  created_at?: string;
  createdAt?: string;
  status: string;
  urgency: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  recipient_id: number;
  user?: {
    name: string;
    email: string;
  };
  contact?: string;
  goal?: number;
  received?: number;
  location?: string;
}

export interface DonorPostResponse {
  id: number;
  title: string;
  category: string;
  content: string;
  created_at?: string;
  createdAt?: string;
  status: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  donor_id: number;
  user?: {
    name: string;
    email: string;
  };
  contact?: string;
  location?: string;
}
