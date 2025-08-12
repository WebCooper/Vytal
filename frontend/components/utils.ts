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

export const getDonorStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-700 border-green-200";
      case "committed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed": return "bg-gray-100 text-gray-700 border-gray-200";
      case "paused": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

export const getDonorUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high": return "CAN HELP IMMEDIATELY";
      case "medium": return "AVAILABLE SOON";
      case "low": return "FLEXIBLE TIMING";
      default: return "AVAILABILITY UNCLEAR";
    }
};