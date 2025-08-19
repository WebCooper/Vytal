'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaHeart, FaPlus } from "react-icons/fa";
import { MdBloodtype, MdLocalHospital, MdMedication } from "react-icons/md";
import { 
  Category, 
  Urgency, 
  Status,
  DonorPostCreate,
  createDonorPost
} from "@/lib/donorPosts";
import { useAuth } from "@/contexts/AuthContext";

interface CreateDonorPostProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormDataType = {
  title: string;
  category: Category;
  content: string;
  location: string;
  urgency: Urgency;
  contact: string;
  // Blood/Organ specific fields
  bloodType: string;
  availability: string;
  lastDonation: string;
  organType: string;
  healthStatus: string;
  // Fundraiser specific fields
  maxAmount: string;
  preferredUse: string;
  requirements: string;
  // Medicine specific fields
  medicineTypes: string[];
  quantity: string;
  expiry: string;
};

export default function CreateDonorPost({ isOpen, onClose }: CreateDonorPostProps) {
  // Get the current user from AuthContext
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    category: Category.ORGANS,
    content: '',
    location: '',
    urgency: Urgency.MEDIUM,
    contact: '',
    // Blood/Organ specific fields
    bloodType: '',
    availability: '',
    lastDonation: '',
    organType: '',
    healthStatus: 'excellent',
    // Fundraiser specific fields
    maxAmount: '',
    preferredUse: '',
    requirements: '',
    // Medicine specific fields
    medicineTypes: [''],
    quantity: '',
    expiry: ''
  });

  interface FormErrors {
    title?: string;
    content?: string;
    location?: string;
    contact?: string;
    bloodOrOrgan?: string;
    maxAmount?: string;
    medicineTypes?: string;
    [key: string]: string | undefined; // Index signature to fix TypeScript error
  }

  const [errors, setErrors] = useState<FormErrors>({});
  
  // Check if user is authenticated on component mount
  React.useEffect(() => {
    if (isOpen && !isAuthenticated) {
      alert('You must be logged in to create a donation offer.');
      onClose();
    }
  }, [isOpen, isAuthenticated, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMedicineTypeChange = (index: number, value: string) => {
    const newMedicineTypes = [...formData.medicineTypes];
    newMedicineTypes[index] = value;
    setFormData(prev => ({
      ...prev,
      medicineTypes: newMedicineTypes
    }));
  };

  const addMedicineType = () => {
    setFormData(prev => ({
      ...prev,
      medicineTypes: [...prev.medicineTypes, '']
    }));
  };

  const removeMedicineType = (index: number) => {
    if (formData.medicineTypes.length > 1) {
      const newMedicineTypes = formData.medicineTypes.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medicineTypes: newMedicineTypes
      }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Common validations for all categories
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact information is required';

    // Category-specific validations
    switch (formData.category) {
      case Category.ORGANS:
        if (!formData.organType) {
          newErrors.organType = 'Please specify organ type';
        }
        break;
        
      case Category.BLOOD:
        if (!formData.bloodType) {
          newErrors.bloodType = 'Please specify blood type';
        }
        break;
        
      case Category.FUNDRAISER:
        if (!formData.maxAmount || isNaN(Number(formData.maxAmount)) || Number(formData.maxAmount) <= 0) {
          newErrors.maxAmount = 'Please enter a valid amount';
        }
        break;
        
      case Category.MEDICINES:
        if (formData.medicineTypes.every(type => !type.trim())) {
          newErrors.medicineTypes = 'Please specify at least one medicine type';
        }
        break;
        
      case Category.SUPPLIES:
        if (!formData.quantity) {
          newErrors.quantity = 'Please specify quantity';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) {
    return;
  }
  
  // Ensure user is logged in
  if (!user || !user.id) {
    alert('You must be logged in to create a post');
    return;
  }

  console.log('Submitting form with user ID:', user.id);
  
  try {
    // Base donor post data without any offering fields
    const basePostData = {
      donor_id: user.id,
      title: formData.title,
      category: formData.category,
      content: formData.content,
      location: formData.location,
      status: Status.OPEN,
      urgency: formData.urgency,
      contact: formData.contact,
    };

    // Create donor post data with only the relevant offering based on category
    let donorPostData: DonorPostCreate;

    switch (formData.category) {
      case Category.BLOOD:
        donorPostData = {
          ...basePostData,
          bloodOffering: {
            bloodType: formData.bloodType,
            availability: formData.availability,
            lastDonation: formData.lastDonation
          }
        };
        break;
      case Category.ORGANS:
        donorPostData = {
          ...basePostData,
          organOffering: {
            organType: formData.organType,
            healthStatus: formData.healthStatus,
            availability: formData.availability
          }
        };
        break;
      case Category.FUNDRAISER:
        donorPostData = {
          ...basePostData,
          fundraiserOffering: {
            maxAmount: parseFloat(formData.maxAmount),
            preferredUse: formData.preferredUse,
            requirements: formData.requirements
          }
        };
        break;
      case Category.MEDICINES:
        donorPostData = {
          ...basePostData,
          medicineOffering: {
            medicineTypes: formData.medicineTypes.filter(type => type.trim() !== ''),
            quantity: formData.quantity,
            expiry: formData.expiry
          }
        };
        break;
      case Category.SUPPLIES:
        // Default case for supplies
        donorPostData = basePostData;
        break;
      default:
        donorPostData = basePostData;
        break;
    }

    // Debug the final payload
    console.log('Submitting donor post with data:', JSON.stringify(donorPostData, null, 2));

    // Always call the API directly
    console.log('Calling API directly with createDonorPost');
    const response = await createDonorPost(donorPostData);
    console.log('Post created successfully:', response);
    
    // Show success message
    alert('Donation offer created successfully!');
    
    // Only close and reset on success
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      category: Category.ORGANS,
      content: '',
      location: '',
      urgency: Urgency.MEDIUM,
      contact: '',
      bloodType: '',
      organType: '',
      maxAmount: '',
      medicineTypes: [''],
      availability: '',
      lastDonation: '',
      requirements: '',
      preferredUse: '',
      healthStatus: 'excellent',
      quantity: '',
      expiry: ''
    });
  } catch (error) {
    console.error('Error creating donor post:', error);
    alert('Failed to create post. Please try again.');
  }
};

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case Category.ORGANS: return MdBloodtype;
      case Category.BLOOD: return MdBloodtype;
      case Category.FUNDRAISER: return MdLocalHospital;
      case Category.MEDICINES: return MdMedication;
      case Category.SUPPLIES: 
      default: return FaHeart;
    }
  };

  const CategoryIcon = getCategoryIcon(formData.category);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <CategoryIcon className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create Donation Offer</h2>
                <p className="text-emerald-100">Share what you can offer to help others</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What are you offering? *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: Category.ORGANS, label: 'Organs', icon: MdBloodtype, color: 'red' },
                { value: Category.BLOOD, label: 'Blood', icon: MdBloodtype, color: 'red' },
                { value: Category.FUNDRAISER, label: 'Financial Help', icon: MdLocalHospital, color: 'blue' },
                { value: Category.MEDICINES, label: 'Medicines', icon: MdMedication, color: 'yellow' },
                { value: Category.SUPPLIES, label: 'Supplies', icon: FaHeart, color: 'green' }
              ].map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleInputChange('category', category.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                      formData.category === category.value
                        ? `border-${category.color}-500 bg-${category.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`text-2xl ${
                      formData.category === category.value ? `text-${category.color}-600` : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.category === category.value ? `text-${category.color}-700` : 'text-gray-600'
                    }`}>
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Offering Blood Donation - Type O+ Available"
              className={`w-full px-4 py-3 rounded-xl border text-black ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Category-Specific Fields */}
          {formData.category === Category.ORGANS && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organ Type *
                </label>
                <select
                  value={formData.organType}
                  onChange={(e) => handleInputChange('organType', e.target.value)}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select organ type</option>
                  <option value="kidney">Kidney</option>
                  <option value="liver">Liver (partial)</option>
                  <option value="bone_marrow">Bone Marrow</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Health Status
                </label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Availability
                </label>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  placeholder="When are you available for donation?"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {formData.category === Category.BLOOD && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Type *
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Availability
                </label>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  placeholder="When are you available for donation?"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Donation Date
                </label>
                <input
                  type="date"
                  value={formData.lastDonation}
                  onChange={(e) => handleInputChange('lastDonation', e.target.value)}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {formData.category === Category.FUNDRAISER && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Amount (LKR) *
                </label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                  placeholder="e.g., 500000"
                  className={`w-full px-4 py-3 text-black rounded-xl border ${
                    errors.maxAmount ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                />
                {errors.maxAmount && <p className="text-red-500 text-sm mt-1">{errors.maxAmount}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Use
                </label>
                <input
                  type="text"
                  value={formData.preferredUse}
                  onChange={(e) => handleInputChange('preferredUse', e.target.value)}
                  placeholder="How should the funds be used?"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requirements
                </label>
                <input
                  type="text"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Any conditions for the recipient?"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {formData.category === Category.MEDICINES && (
            <div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="e.g., 30 tablets, 3 bottles"
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiry}
                    onChange={(e) => handleInputChange('expiry', e.target.value)}
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medicine Types Available *
              </label>
              <div className="space-y-3">
                {formData.medicineTypes.map((medicine, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={medicine}
                      onChange={(e) => handleMedicineTypeChange(index, e.target.value)}
                      placeholder="e.g., Insulin, Blood pressure medication"
                      className="flex-1 px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {formData.medicineTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineType(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <FaTimes />
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
              {errors.medicineTypes && <p className="text-red-500 text-sm mt-1">{errors.medicineTypes}</p>}
            </div>
          )}
          
          {formData.category === Category.SUPPLIES && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="e.g., 5 boxes, 10 units"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Availability
                </label>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  placeholder="When are the supplies available?"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
              placeholder="Describe what you're offering, any conditions, and how people can benefit from your help..."
              className={`w-full px-4 py-3 text-black rounded-xl border ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none`}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          {/* Location & Availability */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Colombo"
                className={`w-full px-4 py-3 text-black rounded-xl border ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value as Urgency)}
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value={Urgency.HIGH}>High (Immediate)</option>
                <option value={Urgency.MEDIUM}>Medium (Soon)</option>
                <option value={Urgency.LOW}>Low (Flexible)</option>
              </select>
            </div>
          </div>

          {/* Contact & Requirements */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Information *
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="Phone: +94771234567, Email: your.email@example.com"
                className={`w-full px-4 py-3 text-black rounded-xl border ${
                  errors.contact ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Any Requirements
              </label>
              <input
                type="text"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="e.g., Medical documentation required"
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-200"
            >
              Create Donation Offer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}