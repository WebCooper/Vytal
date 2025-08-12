'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaHeart, FaPlus } from "react-icons/fa";
import { MdBloodtype, MdLocalHospital, MdMedication } from "react-icons/md";

interface CreateDonorPostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
}

export default function CreateDonorPost({ isOpen, onClose, onSubmit }: CreateDonorPostProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'organs',
    content: '',
    location: '',
    urgency: 'medium',
    contact: '',
    // Category-specific fields
    bloodType: '',
    organType: '',
    maxAmount: '',
    medicineTypes: [''],
    availability: '',
    requirements: '',
    healthStatus: 'excellent'
  });

  const [errors, setErrors] = useState({});

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
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact information is required';

    // Category-specific validations
    if (formData.category === 'organs') {
      if (!formData.bloodType && !formData.organType) {
        newErrors.bloodOrOrgan = 'Please specify blood type or organ type';
      }
    }
    
    if (formData.category === 'fundraiser') {
      if (!formData.maxAmount || isNaN(Number(formData.maxAmount))) {
        newErrors.maxAmount = 'Please enter a valid amount';
      }
    }
    
    if (formData.category === 'medicines') {
      if (formData.medicineTypes.every(type => !type.trim())) {
        newErrors.medicineTypes = 'Please specify at least one medicine type';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const postData = {
        ...formData,
        id: Date.now(), // Temporary ID generation
        status: 'available',
        createdAt: new Date().toISOString(),
        engagement: { likes: 0, comments: 0, shares: 0, views: 0 }
      };
      onSubmit(postData);
      onClose();
      // Reset form
      setFormData({
        title: '',
        category: 'organs',
        content: '',
        location: '',
        urgency: 'medium',
        contact: '',
        bloodType: '',
        organType: '',
        maxAmount: '',
        medicineTypes: [''],
        availability: '',
        requirements: '',
        healthStatus: 'excellent'
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'organs': return MdBloodtype;
      case 'fundraiser': return MdLocalHospital;
      case 'medicines': return MdMedication;
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
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'organs', label: 'Blood/Organs', icon: MdBloodtype, color: 'red' },
                { value: 'fundraiser', label: 'Financial Help', icon: MdLocalHospital, color: 'blue' },
                { value: 'medicines', label: 'Medicines', icon: MdMedication, color: 'yellow' }
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
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Category-Specific Fields */}
          {formData.category === 'organs' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Type
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  Organ Type
                </label>
                <select
                  value={formData.organType}
                  onChange={(e) => handleInputChange('organType', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select organ (if applicable)</option>
                  <option value="kidney">Kidney</option>
                  <option value="liver">Liver (partial)</option>
                  <option value="bone_marrow">Bone Marrow</option>
                </select>
              </div>
            </div>
          )}

          {formData.category === 'fundraiser' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Amount (LKR) *
              </label>
              <input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                placeholder="e.g., 500000"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.maxAmount ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {errors.maxAmount && <p className="text-red-500 text-sm mt-1">{errors.maxAmount}</p>}
            </div>
          )}

          {formData.category === 'medicines' && (
            <div>
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
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className={`w-full px-4 py-3 rounded-xl border ${
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
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="high">Can help immediately</option>
                <option value="medium">Available soon</option>
                <option value="low">Flexible timing</option>
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
                className={`w-full px-4 py-3 rounded-xl border ${
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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