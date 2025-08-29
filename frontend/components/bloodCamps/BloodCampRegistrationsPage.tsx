import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaClock, FaPhone, FaUser,
  FaTimes, FaEye, FaSpinner,
  FaExclamationTriangle, FaCheckCircle, FaUserMd
} from 'react-icons/fa';
import { MdBloodtype } from 'react-icons/md';
import { 
  getDonorRegistrations, 
  cancelRegistration,
  BloodCampRegistration 
} from '../../lib/bloodCampsApi';
import { toast } from 'react-hot-toast';

interface BloodCampRegistrationsPageProps {
  userId: number;
}

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled';

const BloodCampRegistrationsPage: React.FC<BloodCampRegistrationsPageProps> = ({ userId }) => {
  const [registrations, setRegistrations] = useState<BloodCampRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<BloodCampRegistration | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDonorRegistrations(userId);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const handleCancelRegistration = async (registrationId: number) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;

    try {
      await cancelRegistration(registrationId);
      toast.success('Registration cancelled successfully');
      loadRegistrations();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'attended':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'text-green-600';
      case 'pending_review':
        return 'text-yellow-600';
      case 'not_eligible':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredRegistrations = registrations.filter(registration => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['registered', 'confirmed'].includes(registration.status);
    if (filter === 'completed') return ['attended'].includes(registration.status);
    if (filter === 'cancelled') return ['cancelled', 'no_show'].includes(registration.status);
    return true;
  });

  const RegistrationDetailsModal = () => {
    if (!selectedRegistration) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Registration Details</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedRegistration(null);
                }}
                className="text-gray-500 hover:text-emerald-600 text-xl"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Camp Information */}
            <div className="bg-emerald-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-emerald-800 mb-2">{selectedRegistration.camp?.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-emerald-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{selectedRegistration.camp?.location}</span>
                </div>
                <div className="flex items-center text-emerald-600">
                  <FaCalendarAlt className="mr-2" />
                  <span>{selectedRegistration.camp?.date ? new Date(selectedRegistration.camp.date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center text-emerald-600">
                  <FaClock className="mr-2" />
                  <span>Check camp details</span>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Status Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Registration Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRegistration.status)}`}>
                      {selectedRegistration.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Health Status:</span>
                    <span className={`font-medium ${getHealthStatusColor(selectedRegistration.health_status)}`}>
                      {selectedRegistration.health_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Registration Date:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(selectedRegistration.registration_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Blood Type:</span>
                    <span className="flex items-center font-medium text-red-600">
                      <MdBloodtype className="mr-1" />
                      {selectedRegistration.blood_type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Contact Phone:</span>
                    <span className="font-medium text-gray-800">{selectedRegistration.contact_phone}</span>
                  </div>
                  {selectedRegistration.last_donation_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Donation:</span>
                      <span className="font-medium text-gray-800">
                        {new Date(selectedRegistration.last_donation_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {(selectedRegistration.emergency_contact_name || selectedRegistration.emergency_contact_phone) && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Emergency Contact</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRegistration.emergency_contact_name && (
                      <div className="flex items-center">
                        <FaUser className="text-gray-500 mr-2" />
                        <span>{selectedRegistration.emergency_contact_name}</span>
                      </div>
                    )}
                    {selectedRegistration.emergency_contact_phone && (
                      <div className="flex items-center">
                        <FaPhone className="text-gray-500 mr-2" />
                        <span>{selectedRegistration.emergency_contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Information */}
            {(selectedRegistration.medical_conditions || selectedRegistration.medications) && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Medical Information</h4>
                <div className="space-y-4">
                  {selectedRegistration.medical_conditions && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <FaUserMd className="mr-2" />
                        Medical Conditions:
                      </label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-800">
                        {selectedRegistration.medical_conditions}
                      </p>
                    </div>
                  )}
                  {selectedRegistration.medications && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Medications:</label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-800">
                        {selectedRegistration.medications}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedRegistration.notes && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Additional Notes</h4>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {selectedRegistration.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => {
                setShowDetails(false);
                setSelectedRegistration(null);
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            {['registered', 'confirmed'].includes(selectedRegistration.status) && (
              <button
                onClick={() => handleCancelRegistration(selectedRegistration.id)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Registration
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
              Blood Camp Registrations
            </h2>
            <p className="text-gray-600">Manage your blood camp registrations and track your donation schedule</p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as FilterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
          <div className="text-6xl mb-4">🩸</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Registrations Found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? "You haven't registered for any blood camps yet."
              : `No ${filter} registrations found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((registration) => (
            <motion.div
              key={registration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-300"
            >
              {/* Camp Info */}
              <div className="mb-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {registration.camp?.name || 'Blood Camp'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-emerald-500" />
                    <span>{registration.camp?.location || 'Location TBD'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2 text-emerald-500" />
                    <span>
                      {registration.camp?.date 
                        ? new Date(registration.camp.date).toLocaleDateString()
                        : 'Date TBD'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Blood Type */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                  {registration.status.replace('_', ' ').toUpperCase()}
                </span>
                <div className="flex items-center text-red-600 font-semibold">
                  <MdBloodtype className="mr-1" />
                  {registration.blood_type}
                </div>
              </div>

              {/* Health Status */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Health Status:</span>
                  <span className={`font-medium ${getHealthStatusColor(registration.health_status)}`}>
                    {registration.health_status === 'eligible' && <FaCheckCircle className="inline mr-1" />}
                    {registration.health_status === 'pending_review' && <FaClock className="inline mr-1" />}
                    {registration.health_status === 'not_eligible' && <FaExclamationTriangle className="inline mr-1" />}
                    {registration.health_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedRegistration(registration);
                    setShowDetails(true);
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center justify-center"
                >
                  <FaEye className="mr-2" />
                  Details
                </button>
                {['registered', 'confirmed'].includes(registration.status) && (
                  <button
                    onClick={() => handleCancelRegistration(registration.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Registration Details Modal */}
      {showDetails && <RegistrationDetailsModal />}
    </div>
  );
};

export default BloodCampRegistrationsPage;