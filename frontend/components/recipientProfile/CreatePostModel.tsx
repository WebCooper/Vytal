'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { MdBloodtype, MdLocalHospital, MdMedication } from 'react-icons/md';
import { createPost, CreatePostInput, PostCategory, PostUrgency } from '@/lib/recipientPosts';
import { useAuth } from '@/contexts/AuthContext';

interface CreateRecipientPostProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreateRecipientPost({
  isOpen,
  onClose,
  onPostCreated,
}: CreateRecipientPostProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreatePostInput>({
    recipient_id: user?.id || 0,
    title: '',
    content: '',
    category: 'fundraiser',
    status: 'pending',
    location: '',
    urgency: 'medium',
    contact: '',
    goal: undefined,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CreatePostInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Description is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    if (!formData.contact?.trim()) newErrors.contact = 'Contact is required';
    if (formData.category === 'fundraiser' && (!formData.goal || isNaN(formData.goal))) {
      newErrors.goal = 'Valid fundraising goal is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createPost(formData);
      onPostCreated();
      onClose();
    } catch (err) {
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category: PostCategory) => {
    switch (category) {
      case 'blood': return MdBloodtype;
      case 'organs': return MdBloodtype;
      case 'fundraiser': return MdLocalHospital;
      case 'medicines': return MdMedication;
      case 'supplies': return MdMedication;
      default: return MdLocalHospital;
    }
  };

  const CategoryIcon = getCategoryIcon(formData.category);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
                <h2 className="text-2xl font-bold">Create Request Post</h2>
                <p className="text-emerald-100">Share what you need with the community</p>
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
              What do you need? *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 'blood', label: 'Blood', icon: MdBloodtype, color: 'red' },
                { value: 'organs', label: 'Organs', icon: MdBloodtype, color: 'purple' },
                { value: 'fundraiser', label: 'Funds', icon: MdLocalHospital, color: 'blue' },
                { value: 'medicines', label: 'Medicines', icon: MdMedication, color: 'yellow' },
                { value: 'supplies', label: 'Supplies', icon: MdMedication, color: 'green' }
              ].map((category) => {
                const Icon = category.icon;
                const isSelected = formData.category === category.value;
                const bgColor = isSelected 
                  ? `bg-${category.color}-100 border-${category.color}-500` 
                  : 'bg-white/80 border-gray-200 hover:bg-gray-50';
                
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleInputChange('category', category.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 ${bgColor} transition-colors`}
                  >
                    <Icon className={`text-2xl ${isSelected ? `text-${category.color}-500` : 'text-gray-500'}`} />
                    <span className={`text-xs mt-1 font-medium ${isSelected ? `text-${category.color}-700` : 'text-gray-700'}`}>
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
              className={`w-full px-4 py-3 rounded-xl border text-black ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={`e.g., Need ${formData.category === 'blood' ? 'Blood Donation Type O+' : 
                formData.category === 'organs' ? 'Kidney Donor' : 
                formData.category === 'fundraiser' ? 'Financial Support for Surgery' : 
                formData.category === 'medicines' ? 'Insulin Medication' : 
                'Medical Supplies'}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              className={`w-full px-4 py-3 rounded-xl border text-black ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none`}
              rows={4}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Describe your need in detail, including any requirements, timeframes, or special considerations..."
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          {/* Category-specific fields */}
          {formData.category === 'fundraiser' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fundraising Goal (LKR) *
              </label>
              <input
                type="number"
                className={`w-full px-4 py-3 rounded-xl border text-black ${
                  errors.goal ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                value={formData.goal ?? ''}
                onChange={(e) => handleInputChange('goal', parseFloat(e.target.value))}
                placeholder="e.g., 500000"
              />
              {errors.goal && <p className="text-red-500 text-sm mt-1">{errors.goal}</p>}
            </div>
          )}

          {/* Location & Urgency */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-xl border text-black ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Colombo"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Urgency *
              </label>
              <select
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value as PostUrgency)}
              >
                <option value="low">Low - Within weeks</option>
                <option value="medium">Medium - Within days</option>
                <option value="high">High - Urgent (24-48 hours)</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Information *
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 rounded-xl border text-black ${
                errors.contact ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              value={formData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              placeholder="Phone: +94771234567, Email: your.email@example.com"
            />
            {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-200"
            >
              {submitting ? 'Submitting...' : 'Create Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
