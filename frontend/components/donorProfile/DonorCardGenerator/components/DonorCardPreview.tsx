// components/DonorCardPreview.tsx
import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaUser, FaClock, FaHeart } from 'react-icons/fa';
import { MdBloodtype, MdFavorite, MdLocalHospital, MdMedication } from 'react-icons/md';
import { DonorCardData, DonorCardCategory, Urgency } from '../types/donorCard';
import { CATEGORY_CONFIG } from '../utils/constants';

interface DonorCardPreviewProps {
  cardData: DonorCardData;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export const DonorCardPreview: React.FC<DonorCardPreviewProps> = ({ cardData, cardRef }) => {
  const getCategoryIcon = (category: DonorCardCategory) => {
    switch (category) {
      case DonorCardCategory.BLOOD: return MdBloodtype;
      case DonorCardCategory.ORGANS: return MdFavorite;
      case DonorCardCategory.FUNDRAISER: return MdLocalHospital;
      case DonorCardCategory.MEDICINES: return MdMedication;
      case DonorCardCategory.SUPPLIES: return FaHeart;
      default: return MdBloodtype;
    }
  };

  const getUrgencyColor = (urgency: Urgency) => {
    switch (urgency) {
      case Urgency.HIGH: return 'text-red-600 bg-red-100';
      case Urgency.MEDIUM: return 'text-yellow-600 bg-yellow-100';
      case Urgency.LOW: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyLabel = (urgency: Urgency) => {
    switch (urgency) {
      case Urgency.HIGH: return 'High Priority';
      case Urgency.MEDIUM: return 'Medium Priority';
      case Urgency.LOW: return 'Low Priority';
      default: return 'Medium Priority';
    }
  };

  const categoryConfig = CATEGORY_CONFIG[cardData.category];
  const CategoryIcon = getCategoryIcon(cardData.category);

  const renderCategorySpecificInfo = () => {
    switch (cardData.category) {
      case DonorCardCategory.BLOOD:
        return (
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-800">Blood Type</span>
              <span className="text-lg font-bold text-red-600">
                {cardData.bloodOffering?.bloodType || 'Not specified'}
              </span>
            </div>
            {cardData.bloodOffering?.donationCount && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-red-700">Donations</span>
                <span className="text-sm font-medium text-red-800">
                  {cardData.bloodOffering.donationCount}
                </span>
              </div>
            )}
            {cardData.bloodOffering?.lastDonation && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-700">Last Donation</span>
                <span className="text-sm font-medium text-red-800">
                  {cardData.bloodOffering.lastDonation}
                </span>
              </div>
            )}
          </div>
        );

      case DonorCardCategory.ORGANS:
        return (
          <div className="bg-pink-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-pink-800">Organ Type</span>
              <span className="text-sm font-bold text-pink-600">
                {cardData.organOffering?.organType || 'Not specified'}
              </span>
            </div>
            {cardData.organOffering?.healthStatus && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-pink-700">Health Status</span>
                <span className="text-sm font-medium text-pink-800">
                  {cardData.organOffering.healthStatus}
                </span>
              </div>
            )}
          </div>
        );

      case DonorCardCategory.FUNDRAISER:
        return (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Max Amount</span>
              <span className="text-sm font-bold text-blue-600">
                LKR {cardData.fundraiserOffering?.maxAmount ? 
                  Number(cardData.fundraiserOffering.maxAmount).toLocaleString() : 
                  'Not specified'}
              </span>
            </div>
            {cardData.fundraiserOffering?.preferredUse && (
              <div className="mb-1">
                <span className="text-xs text-blue-700 block">Preferred Use:</span>
                <span className="text-sm text-blue-800">
                  {cardData.fundraiserOffering.preferredUse}
                </span>
              </div>
            )}
            {cardData.fundraiserOffering?.requirements && (
              <div>
                <span className="text-xs text-blue-700 block">Requirements:</span>
                <span className="text-sm text-blue-800">
                  {cardData.fundraiserOffering.requirements}
                </span>
              </div>
            )}
          </div>
        );

      case DonorCardCategory.MEDICINES:
        return (
          <div className="bg-yellow-50 p-3 rounded-lg">
            {cardData.medicineOffering?.medicineTypes && cardData.medicineOffering.medicineTypes.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-medium text-yellow-800 block mb-1">Available Medicines:</span>
                <div className="flex flex-wrap gap-1">
                  {cardData.medicineOffering.medicineTypes
                    .filter(medicine => medicine.trim() !== '')
                    .map((medicine, index) => (
                    <span key={index} className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      {medicine}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {cardData.medicineOffering?.quantity && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-yellow-700">Quantity</span>
                <span className="text-sm font-medium text-yellow-800">
                  {cardData.medicineOffering.quantity}
                </span>
              </div>
            )}
            {cardData.medicineOffering?.expiry && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-700">Expiry Date</span>
                <span className="text-sm font-medium text-yellow-800">
                  {new Date(cardData.medicineOffering.expiry).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        );

      case DonorCardCategory.SUPPLIES:
        return (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Supply Type</span>
              <span className="text-sm font-bold text-green-600">
                {cardData.suppliesOffering?.suppliesType || 'Not specified'}
              </span>
            </div>
            {cardData.suppliesOffering?.quantity && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-700">Quantity</span>
                <span className="text-sm font-medium text-green-800">
                  {cardData.suppliesOffering.quantity}
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        ref={cardRef}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 relative"
        style={{ 
          width: '384px', 
          minHeight: '480px',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header with category-specific gradient */}
        <div 
          className="p-6 text-white relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${categoryConfig.primaryColor}, ${categoryConfig.primaryColor}dd)` 
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CategoryIcon className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{categoryConfig.label}</h3>
                  <p className="text-white/80 text-sm">Donor Card</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(cardData.urgency)}`}>
                {getUrgencyLabel(cardData.urgency)}
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">{cardData.donorName || 'Donor Name'}</h2>
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <FaMapMarkerAlt className="text-sm" />
                <span className="text-sm">{cardData.location || 'Location'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Category-specific information */}
          {renderCategorySpecificInfo()}

          {/* Message */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <FaHeart className="mr-2 text-emerald-500" />
              Message
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {cardData.message || 'Your message here...'}
            </p>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-700 text-sm">
              <FaClock className="mr-2 text-emerald-500" />
              Availability
            </span>
            <span className="text-sm font-medium text-gray-800">
              {cardData.availability || 'Not specified'}
            </span>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaUser className="mr-2 text-emerald-500" />
              Contact Information
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contact Person</span>
                <span className="text-sm font-medium text-gray-800">
                  {cardData.contactPerson || 'Not specified'}
                </span>
              </div>
              
              {cardData.primaryPhone && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-1 text-emerald-500" />
                    Primary
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {cardData.primaryPhone}
                  </span>
                </div>
              )}
              
              {cardData.secondaryPhone && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-1 text-emerald-500" />
                    Secondary
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {cardData.secondaryPhone}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Relationship</span>
                <span className="text-sm font-medium text-gray-800">
                  {cardData.relationship || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-3 text-center text-white text-sm"
          style={{ backgroundColor: categoryConfig.primaryColor }}
        >
          <p className="font-medium">Together We Can Save Lives</p>
          <p className="text-white/80 text-xs">Emergency Contact Available</p>
        </div>
      </div>
    </div>
  );
};