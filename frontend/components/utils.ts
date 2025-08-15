import { FaHeart } from "react-icons/fa";
import { MdBloodtype, MdLocalHospital, MdMedication } from "react-icons/md";

export const getCategoryIcon = (category: string) => {
    switch (category) {
      case "organs": return MdBloodtype;
      case "fundraiser": return MdLocalHospital;
      case "medicines": return MdMedication;
      default: return FaHeart;
    }
  };

export const getCategoryColor = (category: string) => {
    switch (category) {
      case "organs": return "from-red-400 to-red-600";
      case "fundraiser": return "from-blue-400 to-blue-600";
      case "medicines": return "from-emerald-400 to-emerald-600";
      default: return "from-gray-400 to-gray-600";
    }
  };

export const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

export const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "fulfilled": return "bg-blue-100 text-blue-700 border-blue-200";
      case "expired": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

export const levelThresholds = [
  { level: 1, points: 0, title: "Newcomer" },
  { level: 2, points: 500, title: "Supporter" },
  { level: 3, points: 1500, title: "Helper" },
  { level: 4, points: 3000, title: "Advocate" },
  { level: 5, points: 5000, title: "Lifesaver" },
  { level: 6, points: 8000, title: "Guardian" },
  { level: 7, points: 12000, title: "Hero" },
  { level: 8, points: 18000, title: "Champion" },
  { level: 9, points: 26000, title: "Protector" },
  { level: 10, points: 36000, title: "Rescuer" },
  { level: 11, points: 48000, title: "Benefactor" },
  { level: 12, points: 62000, title: "Saviour" },
  { level: 13, points: 80000, title: "Philanthropist" },
  { level: 14, points: 100000, title: "National Hero" },
  { level: 15, points: 125000, title: "Legendary Giver" }
];

export const achievements = [
  // Easy (beginner-friendly, quick wins)
  { id: 1, title: 'First Step', description: 'Complete your first donation', target: 1, reward: '100 points + Badge' },
  { id: 2, title: 'Monthly Challenge', description: 'Help 3 people this month', target: 3, reward: '200 points + Badge' },
  { id: 3, title: 'Referral Rookie', description: 'Invite your first friend to join', target: 1, reward: '150 points' },
  { id: 4, title: 'Event Helper', description: 'Attend 1 health or blood camp', target: 1, reward: '150 points' },

  // Medium (requires commitment)
  { id: 5, title: 'Blood Camp Hero', description: 'Attend 2 blood camps', target: 2, reward: '300 points' },
  { id: 6, title: 'Blood Champion', description: 'Donate blood 5 times', target: 5, reward: '500 points + Badge' },
  { id: 7, title: 'Medicine Giver', description: 'Donate medicines worth LKR 10,000 total', target: 10000, reward: '500 points' },
  { id: 8, title: 'Referral Master', description: 'Invite 5 friends to join', target: 5, reward: '500 points + Title' },

  // Hard (long-term dedication)
  { id: 9, title: 'Fundraiser Leader', description: 'Raise LKR 50,000 for medical causes', target: 50000, reward: '800 points + Badge' },
  { id: 10, title: 'Life Saver', description: 'Help save 10 lives', target: 10, reward: '1000 points + Title' },
  { id: 11, title: 'Organ Donor Legend', description: 'Pledge to donate an organ', target: 1, reward: '1500 points + Rare Badge' },

  // Legendary (prestige-level)
  { id: 12, title: 'Community Hero', description: 'Be the top donor in your city for a month', target: 1, reward: '2000 points + Crown Badge' },
  { id: 13, title: 'Lifetime Giver', description: 'Reach 100 total donations of any kind', target: 100, reward: '3000 points + Legendary Title' }
];

export const badges = [
  { id: 1, name: 'First Step', description: 'Complete your first donation', icon: 'FaHeart', rarity: 'common', points: 100 },
  { id: 2, name: 'Monthly Challenge', description: 'Help 3 people this month', icon: 'FaStar', rarity: 'common', points: 200 },
  { id: 3, name: 'Blood Camp Hero', description: 'Attend 2 blood camps', icon: 'FaUsers', rarity: 'rare', points: 300 },
  { id: 4, name: 'Blood Champion', description: 'Donate blood 5 times', icon: 'MdBloodtype', rarity: 'epic', points: 500 },
  { id: 5, name: 'Fundraiser Leader', description: 'Raise LKR 50,000 for medical causes', icon: 'FaGift', rarity: 'epic', points: 800 },
  { id: 6, name: 'Life Saver', description: 'Help save 10 lives', icon: 'FaMedal', rarity: 'legendary', points: 1000 },
  { id: 7, name: 'Community Hero', description: 'Be the top donor in your city for a month', icon: 'FaCrown', rarity: 'legendary', points: 2000 },
  { id: 8, name: 'Lifetime Giver', description: 'Reach 100 total donations of any kind', icon: 'FaTrophy', rarity: 'legendary', points: 3000 }
];