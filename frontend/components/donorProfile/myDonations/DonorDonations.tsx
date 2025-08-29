'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaPlus,
  FaShare,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaTint,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBan
} from 'react-icons/fa';
import { DonorDashboard } from '@/lib/donationApi';
import { getDonorRegistrations, BloodCampRegistration, CampRegistrationResponse } from '@/lib/bloodCampsApi';

// Add type definitions at the top of the component
type RegistrationData = {
  id: number;
  camp_id: number;
  donor_id: number;
  registration_date: string;
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'no_show';
  blood_type: string;
  last_donation_date?: string;
  health_status: 'eligible' | 'pending_review' | 'not_eligible';
  contact_phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  medications?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

type CampData = {
  id: number;
  name: string;
  date: string;
  location: string;
};

interface DonorDonationsProps {
  donorDashboard: DonorDashboard | null;
  isLoadingDashboard: boolean;
  setShowCreateDonation: (show: boolean) => void;
  setShowCardGenerator: (show: boolean) => void;
  userId: number;
}

const DonorDonations: React.FC<DonorDonationsProps> = ({
  donorDashboard,
  isLoadingDashboard,
  setShowCreateDonation,
  setShowCardGenerator,
  userId
}) => {
  const [activeSection, setActiveSection] = useState<'donations' | 'registrations'>('donations');
  const [registrations, setRegistrations] = useState<(BloodCampRegistration | CampRegistrationResponse)[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);

  // Fetch blood camp registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (activeSection === 'registrations' && userId) {
        try {
          setIsLoadingRegistrations(true);
          const response = await getDonorRegistrations(userId);
          setRegistrations(response.data);
        } catch (error) {
          console.error('Error fetching registrations:', error);
        } finally {
          setIsLoadingRegistrations(false);
        }
      }
    };

    fetchRegistrations();
  }, [activeSection, userId]);

  // Get status styling
  const getStatusStyling = (status: string | undefined) => {
    if (!status) {
      return {
        icon: FaCheckCircle,
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        text: 'Unknown'
      };
    }
    
    switch (status) {
      case 'registered':
        return {
          icon: FaCheckCircle,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          text: 'Registered'
        };
      case 'confirmed':
        return {
          icon: FaCheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          text: 'Confirmed'
        };
      case 'attended':
        return {
          icon: FaCheckCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-100',
          text: 'Attended'
        };
      case 'cancelled':
        return {
          icon: FaBan,
          color: 'text-red-600',
          bg: 'bg-red-100',
          text: 'Cancelled'
        };
      case 'no_show':
        return {
          icon: FaExclamationTriangle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          text: 'No Show'
        };
      default:
        return {
          icon: FaCheckCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          text: status
        };
    }
  };

  // Loading state
  if (isLoadingDashboard) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-4 flex items-center justify-center"
        >
          <FaHeart className="text-white text-2xl" />
        </motion.div>
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-emerald-700 mb-2"
        >
          Loading your impact data...
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600"
        >
          Please wait while we fetch your donation history.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Section Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
              My Donation Impact
            </h2>
            <p className="text-gray-600">Track your donations, blood camp registrations, and view your contribution history</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateDonation(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
            >
              <FaPlus className="mr-2" />
              Log Donation
            </button>
            <button
              onClick={() => setShowCardGenerator(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
            >
              <FaShare className="mr-2" />
              Create Donor Card
            </button>
          </div>
        </div>

        {/* Section Toggle - Community Hub Style */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveSection('donations')}
              className={`px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center ${
                activeSection === 'donations'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white scale-105 shadow-xl'
                  : 'bg-white/80 text-emerald-600 hover:bg-emerald-50 hover:scale-105 hover:shadow-xl border border-emerald-200'
              }`}
            >
              <FaHeart className="mr-2" />
              My Donations
            </button>
            <button
              onClick={() => setActiveSection('registrations')}
              className={`px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center ${
                activeSection === 'registrations'
                  ? 'bg-gradient-to-r from-red-500 to-red-700 text-white scale-105 shadow-xl'
                  : 'bg-white/80 text-red-600 hover:bg-red-50 hover:scale-105 hover:shadow-xl border border-red-200'
              }`}
            >
              <FaTint className="mr-2" />
              Blood Camp Registrations
            </button>
          </div>
        </div>
      </motion.div>

      {/* Donations Section */}
      {activeSection === 'donations' && (
        <>
          {!donorDashboard ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              >
                <FaHeart className="text-6xl text-emerald-400 mx-auto mb-4" />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-emerald-700 mb-2"
              >
                Start Your Impact Journey
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                Log your first donation to begin tracking your contribution to the community.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateDonation(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center mx-auto"
              >
                <FaPlus className="mr-2" />
                Log Your First Donation
              </motion.button>
            </motion.div>
          ) : (
            <>
              {/* Statistics Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid md:grid-cols-3 gap-6"
              >
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-red-800">Blood Donations</h3>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                      className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white font-bold text-lg">{donorDashboard.stats.blood_donations}</span>
                    </motion.div>
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-red-600 text-sm"
                  >
                    Lives potentially saved: ~{donorDashboard.stats.blood_donations * 3}
                  </motion.p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-green-800">Last Donation</h3>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                      className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white font-bold text-xs">
                        {donorDashboard.stats.last_donation_date
                          ? new Date(donorDashboard.stats.last_donation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'N/A'}
                      </span>
                    </motion.div>
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-green-600 text-sm"
                  >
                    {donorDashboard.availability.can_donate_blood ? 'Ready for next donation' : 'Please wait before next donation'}
                  </motion.p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-blue-800">Total Impact</h3>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                      className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white font-bold text-lg">{donorDashboard.stats.total_donations}</span>
                    </motion.div>
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-blue-600 text-sm"
                  >
                    {donorDashboard.stats.total_fundraiser_amount > 0
                      ? `$${donorDashboard.stats.total_fundraiser_amount.toFixed(2)} donated`
                      : 'Active contributor'}
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6"
              >
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl font-bold text-gray-800 mb-4"
                >
                  Recent Donation Activity
                </motion.h3>
                <div className="space-y-3">
                  {donorDashboard.recent_donations.length > 0 ? (
                    donorDashboard.recent_donations.slice(0, 5).map((donation, index) => (
                      <motion.div 
                        key={donation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                        className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.7 + (index * 0.1), type: "spring" }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            donation.donation_type === 'blood' ? 'bg-red-500' :
                            donation.donation_type === 'organs' ? 'bg-purple-500' :
                            donation.donation_type === 'medicines' ? 'bg-green-500' :
                            donation.donation_type === 'supplies' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}
                        >
                          <span className="text-white font-bold text-sm">
                            {donation.donation_type === 'blood' && donation.blood_details?.blood_type}
                            {donation.donation_type === 'organs' && 'O'}
                            {donation.donation_type === 'medicines' && 'M'}
                            {donation.donation_type === 'supplies' && 'S'}
                            {donation.donation_type === 'fundraiser' && 'F'}
                          </span>
                        </motion.div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 capitalize">{donation.donation_type} Donation</p>
                          <p className="text-sm text-gray-600">
                            {donation.location} - {new Date(donation.donation_date).toLocaleDateString()}
                            {donation.quantity && ` - ${donation.quantity}`}
                          </p>
                        </div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + (index * 0.1) }}
                          className={`font-medium ${
                            donation.status === 'completed' ? 'text-green-600' :
                            donation.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}
                        >
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </motion.div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
                      >
                        <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                      </motion.div>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-gray-500 mb-4"
                      >
                        No donations recorded yet
                      </motion.p>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateDonation(true)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Log Your First Donation
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </>
      )}

      {/* Blood Camp Registrations Section */}
      {activeSection === 'registrations' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {isLoadingRegistrations ? (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-red-400 to-red-600 mx-auto mb-4 flex items-center justify-center"
              >
                <FaTint className="text-white text-2xl" />
              </motion.div>
              <h3 className="text-2xl font-bold text-red-700 mb-2">Loading your registrations...</h3>
              <p className="text-gray-600">Please wait while we fetch your blood camp registrations.</p>
            </div>
          ) : registrations.length > 0 ? (
            <div className="grid gap-6">
              {registrations.map((regResponse, index) => {
                // Handle both flat and nested API response structures
                let registration: RegistrationData;
                let camp: CampData | null = null;
                
                if ('registration' in regResponse) {
                  // Nested structure from CampRegistrationResponse
                  registration = regResponse.registration;
                  camp = regResponse.camp;
                } else {
                  // Flat structure from BloodCampRegistration
                  registration = regResponse as RegistrationData;
                  camp = (regResponse as BloodCampRegistration).camp || null;
                }
                
                const statusInfo = getStatusStyling(registration.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <motion.div
                    key={registration.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {camp?.name || `Blood Camp #${registration.camp_id}`}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="mr-1" />
                                <span>{camp?.location || 'Location TBD'}</span>
                              </div>
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-1" />
                                <span>{camp?.date ? new Date(camp.date).toLocaleDateString() : 'Date TBD'}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                            <StatusIcon className={`text-sm ${statusInfo.color}`} />
                            <span className={`text-sm font-medium ${statusInfo.color}`}>
                              {statusInfo.text}
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <FaTint className="text-red-500" />
                            <span className="text-gray-700">
                              <strong>Blood Type:</strong> {registration.blood_type || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-blue-500" />
                            <span className="text-gray-700">
                              <strong>Registered:</strong> {registration.registration_date ? new Date(registration.registration_date).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaUsers className="text-green-500" />
                            <span className="text-gray-700">
                              <strong>Health:</strong> {registration.health_status ? registration.health_status.replace('_', ' ') : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaClock className="text-purple-500" />
                            <span className="text-gray-700">
                              <strong>Last Donation:</strong> {
                                registration.last_donation_date 
                                  ? new Date(registration.last_donation_date).toLocaleDateString()
                                  : 'First time'
                              }
                            </span>
                          </div>
                        </div>

                        {registration.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {registration.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              >
                <FaTint className="text-6xl text-red-300 mx-auto mb-4" />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-red-700 mb-2"
              >
                No Blood Camp Registrations
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                You haven&apos;t registered for any blood camps yet. Visit the Blood Camps section to find and register for upcoming camps.
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DonorDonations;