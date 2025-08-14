'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaPlus, FaMapMarkerAlt, FaClock, FaUsers } from "react-icons/fa";
import { MdBloodtype } from "react-icons/md";

interface CreateBloodCampProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campData: any) => void;
}

export default function CreateBloodCamp({ isOpen, onClose, onSubmit }: CreateBloodCampProps) {
  const [formData, setFormData] = useState({
    name: '',
    organizer: '',
    location: '',
    address: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: '',
    contact: '',
    description: '',
    requirements: '',
    bloodTypes: {
      'A+': true,
      'A-': false,
      'B+': true,
      'B-': false,
      'O+': true,
      'O-': false,
      'AB+': true,
      'AB-': false
    },
    facilities: {
      parking: false,
      refreshments: false,
      certificates: false,
      medical_screening: true,
      air_conditioning: false
    }
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBloodTypeChange = (bloodType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      bloodTypes: {
        ...prev.bloodTypes,
        [bloodType]: checked
      }
    }));
  };

  const handleFacilityChange = (facility: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facility]: checked
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Camp name is required';
    if (!formData.organizer.trim()) newErrors.organizer = 'Organizer name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.capacity || isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1) {
      newErrors.capacity = 'Please enter a valid capacity';
    }
    if (!formData.contact.trim()) newErrors.contact = 'Contact information is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    // Validate that at least one blood type is selected
    const selectedBloodTypes = Object.values(formData.bloodTypes).some(selected => selected);
    if (!selectedBloodTypes) {
      newErrors.bloodTypes = 'Please select at least one blood type';
    }

    // Validate time logic
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    // Validate date is not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const selectedBloodTypes = Object.entries(formData.bloodTypes)
        .filter(([_, selected]) => selected)
        .map(([bloodType, _]) => bloodType);

      const selectedFacilities = Object.entries(formData.facilities)
        .filter(([_, selected]) => selected)
        .map(([facility, _]) => facility.replace('_', ' '));

      const campData = {
        id: Date.now(), // Temporary ID generation
        name: formData.name,
        organizer: formData.organizer,
        location: formData.location,
        address: formData.address,
        date: formData.date,
        time: `${formData.startTime} - ${formData.endTime}`,
        capacity: Number(formData.capacity),
        contact: formData.contact,
        description: formData.description,
        requirements: formData.requirements,
        bloodTypes: selectedBloodTypes,
        facilities: selectedFacilities,
        status: 'upcoming',
        coordinates: [6.9271, 79.8612], // Default coordinates - should be geocoded in real app
        createdAt: new Date().toISOString()
      };

      onSubmit(campData);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        organizer: '',
        location: '',
        address: '',
        date: '',
        startTime: '',
        endTime: '',
        capacity: '',
        contact: '',
        description: '',
        requirements: '',
        bloodTypes: {
          'A+': true,
          'A-': false,
          'B+': true,
          'B-': false,
          'O+': true,
          'O-': false,
          'AB+': true,
          'AB-': false
        },
        facilities: {
          parking: false,
          refreshments: false,
          certificates: false,
          medical_screening: true,
          air_conditioning: false
        }
      });
    }
  };

  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const facilityOptions = [
    { key: 'parking', label: 'Free Parking' },
    { key: 'refreshments', label: 'Refreshments Provided' },
    { key: 'certificates', label: 'Donation Certificates' },
    { key: 'medical_screening', label: 'Medical Screening' },
    { key: 'air_conditioning', label: 'Air Conditioning' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MdBloodtype className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create Blood Donation Camp</h2>
                <p className="text-red-100">Organize a blood drive to save lives in your community</p>
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
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Camp Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Community Health Blood Drive"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organizer *
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => handleInputChange('organizer', e.target.value)}
                placeholder="e.g., Red Cross Sri Lanka"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.organizer ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.organizer && <p className="text-red-500 text-sm mt-1">{errors.organizer}</p>}
            </div>
          </div>

          {/* Location Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-1" />
                Location (City) *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Colombo"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., Colombo General Hospital, Regent Street"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaClock className="inline mr-1" />
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.startTime ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.endTime ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Capacity and Contact */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaUsers className="inline mr-1" />
                Expected Capacity *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="e.g., 200"
                min="1"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.capacity ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Information *
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="Phone: +94112345678, Email: contact@example.com"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.contact ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
            </div>
          </div>

          {/* Blood Types Needed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <MdBloodtype className="inline mr-1" />
              Blood Types Needed *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {bloodTypeOptions.map((bloodType) => (
                <label
                  key={bloodType}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.bloodTypes[bloodType]
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.bloodTypes[bloodType]}
                    onChange={(e) => handleBloodTypeChange(bloodType, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center ${
                    formData.bloodTypes[bloodType]
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.bloodTypes[bloodType] && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className={`font-semibold ${
                    formData.bloodTypes[bloodType] ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    {bloodType}
                  </span>
                </label>
              ))}
            </div>
            {errors.bloodTypes && <p className="text-red-500 text-sm mt-1">{errors.bloodTypes}</p>}
          </div>

          {/* Facilities Available */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Facilities Available
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {facilityOptions.map((facility) => (
                <label
                  key={facility.key}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.facilities[facility.key]
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.facilities[facility.key]}
                    onChange={(e) => handleFacilityChange(facility.key, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    formData.facilities[facility.key]
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.facilities[facility.key] && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className={`font-medium ${
                    formData.facilities[facility.key] ? 'text-emerald-700' : 'text-gray-600'
                  }`}>
                    {facility.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Camp Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Describe the purpose of this blood camp, any special focus (emergency need, community drive, etc.), and what donors can expect..."
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Donor Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              rows={3}
              placeholder="Any specific requirements for donors (age limits, health conditions, documents to bring, etc.)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <MdBloodtype className="mr-2" />
              Create Blood Camp
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );}