// components/card/CardBody.tsx
import React from 'react';
import { FaGift, FaMapMarkerAlt, FaHeartbeat } from 'react-icons/fa';
import { MdVolunteerActivism } from 'react-icons/md';
import { DonorCardData, DonorCardCategory } from '../../types/donorCard';
import { CATEGORY_CONFIG } from '../../utils/constants';

interface CardBodyProps {
  cardData: DonorCardData;
}

export const CardBody: React.FC<CardBodyProps> = ({ cardData }) => {
  // Get category-specific information
  const getCategoryDisplay = () => {
    switch (cardData.category) {
      case DonorCardCategory.BLOOD:
        return {
          type: cardData.bloodOffering?.bloodType || 'N/A',
          offering: 'Blood Donation',
          count: cardData.bloodOffering?.donationCount || '0'
        };
      case DonorCardCategory.ORGANS:
        return {
          type: cardData.organOffering?.organType || 'N/A',
          offering: 'Organ Donation',
          count: '1'
        };
      case DonorCardCategory.FUNDRAISER:
        return {
          type: `LKR ${cardData.fundraiserOffering?.maxAmount ? Number(cardData.fundraiserOffering.maxAmount).toLocaleString() : '0'}`,
          offering: 'Financial Support',
          count: '1'
        };
      case DonorCardCategory.MEDICINES:
        return {
          type: cardData.medicineOffering?.medicineTypes?.[0] || 'N/A',
          offering: 'Medicine Donation',
          count: cardData.medicineOffering?.medicineTypes?.length?.toString() || '0'
        };
      case DonorCardCategory.SUPPLIES:
        return {
          type: cardData.suppliesOffering?.suppliesType || 'N/A',
          offering: 'Medical Supplies',
          count: '1'
        };
      default:
        return {
          type: 'N/A',
          offering: 'Donation',
          count: '0'
        };
    }
  };

  const categoryInfo = getCategoryDisplay();
  const categoryConfig = CATEGORY_CONFIG[cardData.category];

  return (
    <div className="p-3 relative">
      {/* Subtle watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <FaHeartbeat className="text-6xl text-emerald-500" />
      </div>
      
      {/* Donor Info */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{cardData.donorName}</h2>
            <p className="text-gray-700 text-xs mt-1 font-medium leading-relaxed">{cardData.message}</p>
          </div>
          
          {/* Category Badge */}
          <div 
            className="text-white rounded-full w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 shadow-lg"
            style={{ backgroundColor: categoryConfig.primaryColor }}
          >
            <span className="text-xs font-bold">DONOR</span>
            <span className="text-sm font-bold">{categoryInfo.type}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex items-start">
            <FaGift className="text-emerald-600 mt-0.5 mr-1 flex-shrink-0" />
            <div>
              <p className="text-gray-600 font-semibold">Offering</p>
              <p className="font-bold text-gray-900 leading-tight">{categoryInfo.offering}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-emerald-600 mt-0.5 mr-1 flex-shrink-0" />
            <div>
              <p className="text-gray-600 font-semibold">Location</p>
              <p className="font-bold text-gray-900 leading-tight">{cardData.location}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaHeartbeat className="text-emerald-500 mt-0.5 mr-1 flex-shrink-0" />
            <div>
              <p className="text-gray-600 font-semibold">Availability</p>
              <p className="font-bold text-emerald-700">{cardData.availability}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MdVolunteerActivism className="text-emerald-500 mt-0.5 mr-1 flex-shrink-0" />
            <div>
              <p className="text-gray-600 font-semibold">Contributions</p>
              <p className="font-bold text-emerald-700">{categoryInfo.count} times</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};