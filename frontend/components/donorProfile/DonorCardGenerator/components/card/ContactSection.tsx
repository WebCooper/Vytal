// components/card/ContactSection.tsx
import React from 'react';
import { FaPhone, FaQrcode } from 'react-icons/fa';
import { DonorCardData } from '../../types/donorCard';

interface ContactSectionProps {
  cardData: DonorCardData;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ cardData }) => {
  return (
    <div className="p-2.5 bg-emerald-50 rounded-lg border-2 border-emerald-200">
      <h4 className="font-bold text-emerald-800 mb-2 flex items-center text-sm">
        <FaPhone className="mr-1.5 text-xs" />
        Contact for Donation
      </h4>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-700 font-bold">Contact Person</p>
          <p className="font-bold text-gray-900 leading-tight">{cardData.contactPerson}</p>
          <p className="text-gray-600 text-xs font-semibold">({cardData.relationship})</p>
        </div>
        
        <div>
          <p className="text-gray-700 font-bold">Primary Phone</p>
          <p className="font-bold text-gray-900">{cardData.primaryPhone}</p>
        </div>
        
        <div>
          <p className="text-gray-700 font-bold">Secondary Phone</p>
          <p className="font-bold text-gray-900">{cardData.secondaryPhone}</p>
        </div>
        
        <div className="flex items-end justify-end">
          <div className="bg-white p-1.5 rounded border-2 border-gray-300">
            <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded w-10 h-10 flex items-center justify-center">
              <FaQrcode className="text-gray-500 text-lg" />
            </div>
            <p className="text-xs text-gray-600 mt-0.5 text-center font-semibold">Scan</p>
          </div>
        </div>
      </div>
    </div>
  );
};