// components/DonorCardForm.tsx
import React from 'react';
import { FaMapMarkerAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { MdBloodtype, MdFavorite, MdLocalHospital, MdMedication } from 'react-icons/md';
import { DonorCardData, DonorCardCategory, Urgency } from '../types/donorCard';
import { 
  BLOOD_TYPES,
  ORGAN_TYPES, 
  HEALTH_STATUS_OPTIONS,
  MEDICINE_TYPES,
  SUPPLIES_TYPES,
  AVAILABILITY_OPTIONS,
  RELATIONSHIP_OPTIONS,
  URGENCY_OPTIONS,
  CATEGORY_CONFIG
} from '../utils/constants';

interface DonorCardFormProps {
  cardData: DonorCardData;
  onUpdate: (updates: Partial<DonorCardData>) => void;
}

export const DonorCardForm: React.FC<DonorCardFormProps> = ({ cardData, onUpdate }) => {
  const getCategoryIcon = (category: DonorCardCategory) => {
    switch (category) {
      case DonorCardCategory.BLOOD: return MdBloodtype;
      case DonorCardCategory.ORGANS: return MdFavorite;
      case DonorCardCategory.FUNDRAISER: return MdLocalHospital;
      case DonorCardCategory.MEDICINES: return MdMedication;
      default: return MdBloodtype;
    }
  };

  const handleMedicineTypeChange = (index: number, value: string) => {
    if (!cardData.medicineOffering) return;
    
    const newMedicineTypes = [...cardData.medicineOffering.medicineTypes];
    newMedicineTypes[index] = value;
    
    onUpdate({
      medicineOffering: {
        ...cardData.medicineOffering,
        medicineTypes: newMedicineTypes
      }
    });
  };

  const addMedicineType = () => {
    if (!cardData.medicineOffering) return;
    
    onUpdate({
      medicineOffering: {
        ...cardData.medicineOffering,
        medicineTypes: [...cardData.medicineOffering.medicineTypes, '']
      }
    });
  };

  const removeMedicineType = (index: number) => {
    if (!cardData.medicineOffering || cardData.medicineOffering.medicineTypes.length <= 1) return;
    
    const newMedicineTypes = cardData.medicineOffering.medicineTypes.filter((_, i) => i !== index);
    onUpdate({
      medicineOffering: {
        ...cardData.medicineOffering,
        medicineTypes: newMedicineTypes
      }
    });
  };

  return (
    <div className="lg:w-2/5 p-4 overflow-y-auto border-r border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Donor Information</h3>
      
      <div className="space-y-3">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Donation Category *</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
              const Icon = getCategoryIcon(category as DonorCardCategory);
              const isSelected = cardData.category === category;
              
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onUpdate({ category: category as DonorCardCategory })}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                    isSelected
                      ? `border-${config.color}-500 bg-${config.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`text-lg ${
                    isSelected ? `text-${config.color}-600` : 'text-gray-400'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isSelected ? `text-${config.color}-700` : 'text-gray-600'
                  }`}>
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic Information */}
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

        {/* Category-Specific Fields */}
        {cardData.category === DonorCardCategory.BLOOD && (
          <div className="space-y-3 p-3 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800">Blood Donation Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
                <select
                  value={cardData.bloodOffering?.bloodType || ''}
                  onChange={(e) => onUpdate({ 
                    bloodOffering: { 
                      ...cardData.bloodOffering,
                      bloodType: e.target.value,
                      lastDonation: cardData.bloodOffering?.lastDonation || '',
                      donationCount: cardData.bloodOffering?.donationCount || ''
                    }
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Donation Count</label>
                <input
                  type="text"
                  value={cardData.bloodOffering?.donationCount || ''}
                  onChange={(e) => onUpdate({ 
                    bloodOffering: { 
                      ...cardData.bloodOffering,
                      donationCount: e.target.value,
                      bloodType: cardData.bloodOffering?.bloodType || '',
                      lastDonation: cardData.bloodOffering?.lastDonation || ''
                    }
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                  placeholder="e.g., 12"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation</label>
              <input
                type="text"
                value={cardData.bloodOffering?.lastDonation || ''}
                onChange={(e) => onUpdate({ 
                  bloodOffering: { 
                    ...cardData.bloodOffering,
                    lastDonation: e.target.value,
                    bloodType: cardData.bloodOffering?.bloodType || '',
                    donationCount: cardData.bloodOffering?.donationCount || ''
                  }
                })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                placeholder="e.g., 3 months ago"
              />
            </div>
          </div>
        )}

        {cardData.category === DonorCardCategory.ORGANS && (
          <div className="space-y-3 p-3 bg-pink-50 rounded-lg">
            <h4 className="font-medium text-pink-800">Organ Donation Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organ Type *</label>
                <select
                  value={cardData.organOffering?.organType || ''}
                  onChange={(e) => onUpdate({ 
                    organOffering: { 
                      ...cardData.organOffering,
                      organType: e.target.value,
                      healthStatus: cardData.organOffering?.healthStatus || 'Excellent'
                    }
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                >
                  <option value="">Select organ type</option>
                  {ORGAN_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                <select
                  value={cardData.organOffering?.healthStatus || 'Excellent'}
                  onChange={(e) => onUpdate({ 
                    organOffering: { 
                      ...cardData.organOffering,
                      healthStatus: e.target.value,
                      organType: cardData.organOffering?.organType || ''
                    }
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                >
                  {HEALTH_STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {cardData.category === DonorCardCategory.FUNDRAISER && (
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">Financial Support Details</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Amount (LKR) *</label>
              <input
                type="number"
                value={cardData.fundraiserOffering?.maxAmount || ''}
                onChange={(e) => onUpdate({ 
                  fundraiserOffering: { 
                    ...cardData.fundraiserOffering,
                    maxAmount: e.target.value,
                    preferredUse: cardData.fundraiserOffering?.preferredUse || '',
                    requirements: cardData.fundraiserOffering?.requirements || ''
                  }
                })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                placeholder="e.g., 500000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Use</label>
              <input
                type="text"
                value={cardData.fundraiserOffering?.preferredUse || ''}
                onChange={(e) => onUpdate({ 
                  fundraiserOffering: { 
                    ...cardData.fundraiserOffering,
                    preferredUse: e.target.value,
                    maxAmount: cardData.fundraiserOffering?.maxAmount || '',
                    requirements: cardData.fundraiserOffering?.requirements || ''
                  }
                })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                placeholder="e.g., Medical treatments and surgeries"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <input
                type="text"
                value={cardData.fundraiserOffering?.requirements || ''}
                onChange={(e) => onUpdate({ 
                  fundraiserOffering: { 
                    ...cardData.fundraiserOffering,
                    requirements: e.target.value,
                    maxAmount: cardData.fundraiserOffering?.maxAmount || '',
                    preferredUse: cardData.fundraiserOffering?.preferredUse || ''
                  }
                })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                placeholder="e.g., Medical documentation required"
              />
            </div>
          </div>
        )}

        {cardData.category === DonorCardCategory.MEDICINES && (
          <div className="space-y-3 p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800">Medicine Donation Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Medicines *</label>
              <div className="space-y-2">
                {(cardData.medicineOffering?.medicineTypes || ['']).map((medicine, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={medicine}
                      onChange={(e) => handleMedicineTypeChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                    >
                      <option value="">Select medicine type</option>
                      {MEDICINE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {(cardData.medicineOffering?.medicineTypes?.length || 0) > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineType(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMedicineType}
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <FaPlus className="text-sm" />
                  <span className="text-sm font-medium">Add another medicine</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="text"
                  value={cardData.medicineOffering?.quantity || ''}
                  onChange={(e) => onUpdate({ 
                    medicineOffering: { 
                      ...cardData.medicineOffering,
                      quantity: e.target.value,
                      medicineTypes: cardData.medicineOffering?.medicineTypes || [''],
                      expiry: cardData.medicineOffering?.expiry || ''
                    }
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                  placeholder="e.g., 30 tablets"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={cardData.medicineOffering?.expiry || ''}
                  onChange={(e) => onUpdate({ 
                    medicineOffering: { 
                      ...cardData.medicineOffering,
                      expiry: e.target.value,
                      medicineTypes: cardData.medicineOffering?.medicineTypes || [''],
                      quantity: cardData.medicineOffering?.quantity || ''
                    }
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {cardData.category === DonorCardCategory.SUPPLIES && (
          <div className="space-y-3 p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">Medical Supplies Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supply Type *</label>
                <select
                  value={cardData.suppliesOffering?.suppliesType || ''}
                  onChange={(e) => onUpdate({ 
                    suppliesOffering: { 
                      ...cardData.suppliesOffering,
                      suppliesType: e.target.value,
                      quantity: cardData.suppliesOffering?.quantity || ''
                    }
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                >
                  <option value="">Select supply type</option>
                  {SUPPLIES_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="text"
                  value={cardData.suppliesOffering?.quantity || ''}
                  onChange={(e) => onUpdate({ 
                    suppliesOffering: { 
                      ...cardData.suppliesOffering,
                      quantity: e.target.value,
                      suppliesType: cardData.suppliesOffering?.suppliesType || ''
                    }
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                  placeholder="e.g., 2 wheelchairs, 1 oxygen tank"
                />
              </div>
            </div>
          </div>
        )}

        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            value={cardData.message}
            onChange={(e) => onUpdate({ message: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-gray-900 font-medium"
            placeholder="Describe your offering and how you can help..."
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <select
              value={cardData.availability}
              onChange={(e) => onUpdate({ availability: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
            >
              {AVAILABILITY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
          <select
            value={cardData.urgency}
            onChange={(e) => onUpdate({ urgency: e.target.value as Urgency })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
          >
            {URGENCY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone *</label>
            <input
              type="text"
              value={cardData.primaryPhone}
              onChange={(e) => onUpdate({ primaryPhone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
              placeholder="094-869-624"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
            <input
              type="text"
              value={cardData.secondaryPhone}
              onChange={(e) => onUpdate({ secondaryPhone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
              placeholder="078-471-7407"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
          <select
            value={cardData.relationship}
            onChange={(e) => onUpdate({ relationship: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
          >
            {RELATIONSHIP_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};