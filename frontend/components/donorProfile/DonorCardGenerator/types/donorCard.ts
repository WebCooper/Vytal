// types/donorCard.ts
export enum DonorCardCategory {
  BLOOD = 'BLOOD',
  ORGANS = 'ORGANS', 
  FUNDRAISER = 'FUNDRAISER',
  MEDICINES = 'MEDICINES',
  SUPPLIES = 'SUPPLIES'
}

export enum Urgency {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// Base donor card data that applies to all categories
export interface BaseDonorCardData {
  donorName: string;
  category: DonorCardCategory;
  location: string;
  contactPerson: string;
  primaryPhone: string;
  secondaryPhone: string;
  relationship: string;
  message: string;
  urgency: Urgency;
  availability: string;
}

// Category-specific offering data
export interface BloodOfferingCard {
  bloodType: string;
  lastDonation: string;
  donationCount: string;
}

export interface OrganOfferingCard {
  organType: string;
  healthStatus: string;
}

export interface FundraiserOfferingCard {
  maxAmount: string;
  preferredUse: string;
  requirements: string;
}

export interface MedicineOfferingCard {
  medicineTypes: string[];
  quantity: string;
  expiry: string;
}

export interface SuppliesOfferingCard {
  suppliesType: string;
  quantity: string;
}

// Combined donor card data interface
export interface DonorCardData extends BaseDonorCardData {
  // Optional category-specific data
  bloodOffering?: BloodOfferingCard;
  organOffering?: OrganOfferingCard;
  fundraiserOffering?: FundraiserOfferingCard;
  medicineOffering?: MedicineOfferingCard;
  suppliesOffering?: SuppliesOfferingCard;
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