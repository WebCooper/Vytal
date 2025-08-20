// types/donorCard.ts
export interface DonorCardData {
  donorName: string;
  bloodType: string;
  donationType: string;
  availability: string;
  location: string;
  contactPerson: string;
  primaryPhone: string;
  secondaryPhone: string;
  relationship: string;
  message: string;
  lastDonation: string;
  donationCount: string;
  urgency: string;
}

export interface DonorCardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'donor' | 'recipient';
  userData: unknown;
}

export interface ShareContent {
  title: string;
  text: string;
}