// components/DonorCardForm.tsx
import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { DonorCardData } from '../types/donorCard';
import { 
  BloodTypeSelect, 
  DonationTypeSelect, 
  PhoneInput, 
  AvailabilitySelect, 
  RelationshipSelect 
} from './form';

interface DonorCardFormProps {
  cardData: DonorCardData;
  onUpdate: (updates: Partial<DonorCardData>) => void;
}

export const DonorCardForm: React.FC<DonorCardFormProps> = ({ cardData, onUpdate }) => {
  return (
    <div className="lg:w-2/5 p-4 overflow-y-auto border-r border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Donor Information</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name *</label>
          <input
            type="text"
            value={cardData.donorName}
            onChange={(e) => onUpdate({ donorName: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
            placeholder="e.g., Rangana Viranin"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <BloodTypeSelect 
            value={cardData.bloodType}
            onChange={(value) => onUpdate({ bloodType: value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donation Count</label>
            <input
              type="text"
              value={cardData.donationCount}
              onChange={(e) => onUpdate({ donationCount: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
              placeholder="e.g., 12"
            />
          </div>
        </div>
        
        <DonationTypeSelect
          value={cardData.donationType}
          onChange={(value) => onUpdate({ donationType: value })}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            value={cardData.message}
            onChange={(e) => onUpdate({ message: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-gray-900 font-medium"
            placeholder="e.g., Willing to donate blood to help save lives. Available for emergency donations."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <div className="relative">
              <input
                type="text"
                value={cardData.location}
                onChange={(e) => onUpdate({ location: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-8 text-gray-900 font-medium"
                placeholder="e.g., Kalutara, Sri Lanka"
              />
              <FaMapMarkerAlt className="absolute left-2 top-2.5 text-gray-500 text-sm" />
            </div>
          </div>
          
          <AvailabilitySelect
            value={cardData.availability}
            onChange={(value) => onUpdate({ availability: value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation</label>
          <input
            type="text"
            value={cardData.lastDonation}
            onChange={(e) => onUpdate({ lastDonation: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
            placeholder="e.g., 3 months ago"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
          <input
            type="text"
            value={cardData.contactPerson}
            onChange={(e) => onUpdate({ contactPerson: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
            placeholder="e.g., Rangana Viranin"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <PhoneInput
            label="Primary Phone"
            value={cardData.primaryPhone}
            onChange={(value) => onUpdate({ primaryPhone: value })}
            placeholder="094-869-624"
            required
          />
          
          <PhoneInput
            label="Secondary Phone"
            value={cardData.secondaryPhone}
            onChange={(value) => onUpdate({ secondaryPhone: value })}
            placeholder="078-471-7407"
          />
        </div>
        
        <RelationshipSelect
          value={cardData.relationship}
          onChange={(value) => onUpdate({ relationship: value })}
        />
      </div>
    </div>
  );
};