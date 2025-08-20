// utils/constants.ts
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export const DONATION_TYPES = [
  'Blood Donation',
  'Platelet Donation', 
  'Plasma Donation',
  'Organ Donation',
  'Bone Marrow',
  'Financial Support',
  'Medical Equipment',
  'Medicine Donation'
] as const;

export const AVAILABILITY_OPTIONS = [
  'Available Now',
  'Available This Week',
  'Available Weekends', 
  'Emergency Only',
  'By Appointment'
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
  'Guardian'
] as const;

export const DEFAULT_CARD_DATA = {
  donorName: 'Rangana Viranin',
  bloodType: 'B+',
  donationType: 'Blood Donation',
  availability: 'Available Now',
  location: 'Kalutara, Sri Lanka',
  contactPerson: 'Rangana Viranin',
  primaryPhone: '094-869-624',
  secondaryPhone: '078-471-7407',
  relationship: 'Self',
  message: 'Willing to donate blood to help save lives. Available for emergency donations.',
  lastDonation: '3 months ago',
  donationCount: '12',
  urgency: 'available'
} as const;