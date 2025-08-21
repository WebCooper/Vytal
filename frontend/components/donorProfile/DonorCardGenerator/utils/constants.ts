// utils/constants.ts
import { DonorCardCategory, DonorCardData, Urgency } from '../types/donorCard';

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export const ORGAN_TYPES = [
  'Kidney',
  'Liver (partial)',
  'Bone Marrow',
  'Cornea',
  'Skin',
  'Heart Valve'
] as const;

export const HEALTH_STATUS_OPTIONS = [
  'Excellent',
  'Good', 
  'Fair'
] as const;

export const MEDICINE_TYPES = [
  'Insulin',
  'Blood Pressure Medication',
  'Antibiotics',
  'Pain Relievers',
  'Asthma Medication',
  'Diabetes Medication',
  'Heart Medication',
  'Cancer Medication',
  'Other'
] as const;

export const SUPPLIES_TYPES = [
  'Medical Equipment',
  'Wheelchairs',
  'Oxygen Tanks',
  'Hospital Beds',
  'Walking Aids',
  'Medical Supplies',
  'Protective Equipment',
  'First Aid Supplies'
] as const;

export const AVAILABILITY_OPTIONS = [
  'Available Now',
  'Available This Week',
  'Available Weekends', 
  'Emergency Only',
  'By Appointment',
  'Within 24 Hours',
  'Within a Week'
] as const;

export const RELATIONSHIP_OPTIONS = [
  'Self',
  'Family Member',
  'Husband',
  'Wife', 
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Friend',
  'Guardian',
  'Organization',
  'Medical Professional'
] as const;

export const URGENCY_OPTIONS = [
  { value: Urgency.HIGH, label: 'High (Immediate)', color: 'red' },
  { value: Urgency.MEDIUM, label: 'Medium (Soon)', color: 'yellow' },
  { value: Urgency.LOW, label: 'Low (Flexible)', color: 'green' }
] as const;

export const CATEGORY_CONFIG = {
  [DonorCardCategory.BLOOD]: {
    label: 'Blood Donation',
    icon: 'MdBloodtype',
    color: 'red',
    primaryColor: '#dc2626',
    bgColor: '#fef2f2'
  },
  [DonorCardCategory.ORGANS]: {
    label: 'Organ Donation',
    icon: 'MdFavorite',
    color: 'pink',
    primaryColor: '#ec4899',
    bgColor: '#fdf2f8'
  },
  [DonorCardCategory.FUNDRAISER]: {
    label: 'Financial Support',
    icon: 'MdLocalHospital',
    color: 'blue',
    primaryColor: '#2563eb',
    bgColor: '#eff6ff'
  },
  [DonorCardCategory.MEDICINES]: {
    label: 'Medicine Donation',
    icon: 'MdMedication',
    color: 'yellow',
    primaryColor: '#ca8a04',
    bgColor: '#fefce8'
  },
  [DonorCardCategory.SUPPLIES]: {
    label: 'Medical Supplies',
    icon: 'FaHeart',
    color: 'green',
    primaryColor: '#16a34a',
    bgColor: '#f0fdf4'
  }
} as const;

// Default card data for different categories
export const DEFAULT_CARD_DATA: Record<DonorCardCategory, DonorCardData> = {
  [DonorCardCategory.BLOOD]: {
    donorName: 'Rangana Viranin',
    category: DonorCardCategory.BLOOD,
    location: 'Kalutara, Sri Lanka',
    contactPerson: 'Rangana Viranin',
    primaryPhone: '094-869-624',
    secondaryPhone: '078-471-7407',
    relationship: 'Self',
    message: 'Willing to donate blood to help save lives. Available for emergency donations.',
    urgency: Urgency.MEDIUM,
    availability: 'Available Now',
    bloodOffering: {
      bloodType: 'B+',
      lastDonation: '3 months ago',
      donationCount: '12'
    }
  },
  [DonorCardCategory.ORGANS]: {
    donorName: 'Rangana Viranin',
    category: DonorCardCategory.ORGANS,
    location: 'Kalutara, Sri Lanka',
    contactPerson: 'Rangana Viranin',
    primaryPhone: '094-869-624',
    secondaryPhone: '078-471-7407',
    relationship: 'Self',
    message: 'Registered organ donor willing to help save lives through organ donation.',
    urgency: Urgency.LOW,
    availability: 'By Appointment',
    organOffering: {
      organType: 'Kidney',
      healthStatus: 'Excellent'
    }
  },
  [DonorCardCategory.FUNDRAISER]: {
    donorName: 'Rangana Viranin',
    category: DonorCardCategory.FUNDRAISER,
    location: 'Kalutara, Sri Lanka',
    contactPerson: 'Rangana Viranin',
    primaryPhone: '094-869-624',
    secondaryPhone: '078-471-7407',
    relationship: 'Self',
    message: 'Willing to provide financial support for medical emergencies and treatments.',
    urgency: Urgency.MEDIUM,
    availability: 'Available Now',
    fundraiserOffering: {
      maxAmount: '500000',
      preferredUse: 'Medical treatments and surgeries',
      requirements: 'Medical documentation required'
    }
  },
  [DonorCardCategory.MEDICINES]: {
    donorName: 'Rangana Viranin',
    category: DonorCardCategory.MEDICINES,
    location: 'Kalutara, Sri Lanka',
    contactPerson: 'Rangana Viranin',
    primaryPhone: '094-869-624',
    secondaryPhone: '078-471-7407',
    relationship: 'Self',
    message: 'Available medicines for those in need. All medications are properly stored and within expiry.',
    urgency: Urgency.MEDIUM,
    availability: 'Available This Week',
    medicineOffering: {
      medicineTypes: ['Insulin', 'Blood Pressure Medication'],
      quantity: '30 tablets, 2 bottles',
      expiry: '2025-12-31'
    }
  },
  [DonorCardCategory.SUPPLIES]: {
    donorName: 'Rangana Viranin',
    category: DonorCardCategory.SUPPLIES,
    location: 'Kalutara, Sri Lanka',
    contactPerson: 'Rangana Viranin',
    primaryPhone: '094-869-624',
    secondaryPhone: '078-471-7407',
    relationship: 'Self',
    message: 'Medical supplies and equipment available for those who need them.',
    urgency: Urgency.LOW,
    availability: 'By Appointment',
    suppliesOffering: {
      suppliesType: 'Medical Equipment',
      quantity: '2 wheelchairs, 1 oxygen tank'
    }
  }
};