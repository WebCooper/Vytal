import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCampground, FaUsers, FaCalendarCheck, FaCalendarTimes, FaCalendarDay,
  FaUserCheck, FaTimes, FaEye, FaMapMarkerAlt, FaClock, FaPhone, FaSpinner,
  FaExclamationCircle, FaCheckCircle, FaEnvelope, FaUser
} from 'react-icons/fa';
import { MdBloodtype } from 'react-icons/md';
import { getAllBloodCamps, getCampRegistrations, BloodCampRegistration } from '../../lib/bloodCampsApi';
import { BloodCamp } from '../../components/types';
import { toast } from 'react-hot-toast';

interface OrganizerDashboardProps {
  userId: number;
}

// Updated interfaces to match your API response structure
interface RegistrationData {
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
}

interface RegistrationResponse {
  registration: RegistrationData;
  camp: {
    id: number;
    name: string;
    location: string;
    date: string;
    start_time: string;
    end_time: string;
  };
  donor: {
    id: number;
    name: string;
    email: string;
  };
}

const BloodCampOrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ userId }) => {
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [registrations, setRegistrations] = useState<Record<number, RegistrationResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingRegistrations, setLoadingRegistrations] = useState<Record<number, boolean>>({});
  const [stats, setStats] = useState({
    totalCamps: 0,
    upcoming: 0,
    active: 0,
    completed: 0,
    totalRegistrations: 0,
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const campsResponse = await getAllBloodCamps();
      // Filter camps by organizer_id
      const myCamps = campsResponse.data.filter(camp => camp.organizer_id === userId);
      setCamps(myCamps);

      // Load registrations for each camp
      const regsMap: Record<number, RegistrationResponse[]> = {};
      const loadingMap: Record<number, boolean> = {};
      let totalRegs = 0;

      for (const camp of myCamps) {
        loadingMap[camp.id] = true;
        try {
          console.log(`Loading registrations for camp ${camp.id}...`);
          const regsResponse = await getCampRegistrations(camp.id);
          console.log(`Raw API response for camp ${camp.id}:`, regsResponse);
          
          // Handle the nested data structure from your API
          const registrationData = regsResponse.data || [];
          console.log(`Registration data for camp ${camp.id}:`, registrationData);
          
          regsMap[camp.id] = registrationData;
          totalRegs += registrationData.length;
        } catch (error) {
          console.error(`Error loading registrations for camp ${camp.id}:`, error);
          regsMap[camp.id] = [];
        }
        loadingMap[camp.id] = false;
      }

      setRegistrations(regsMap);
      setLoadingRegistrations(loadingMap);

      const upcoming = myCamps.filter(c => c.status === 'upcoming').length;
      const active = myCamps.filter(c => c.status === 'active').length;
      const completed = myCamps.filter(c => c.status === 'completed').length;

      setStats({
        totalCamps: myCamps.length,
        upcoming,
        active,
        completed,
        totalRegistrations: totalRegs,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'attended': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getHealthStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'eligible': return 'text-green-600';
      case 'pending_review': return 'text-yellow-600';
      case 'not_eligible': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'eligible': return <FaCheckCircle className="inline mr-1" />;
      case 'pending_review': return <FaClock className="inline mr-1" />;
      case 'not_eligible': return <FaExclamationCircle className="inline mr-1" />;
      default: return <FaUserCheck className="inline mr-1" />;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const RegistrationDetailsModal = () => {
    if (!selectedCamp) return null;
    const campRegistrations = registrations[selectedCamp.id] || [];
    const isLoadingRegs = loadingRegistrations[selectedCamp.id];

    console.log('Modal opened for camp:', selectedCamp.id);
    console.log('Available registrations state:', registrations);
    console.log('Camp registrations for this camp:', campRegistrations);
    console.log('Is loading registrations:', isLoadingRegs);

    return (
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedCamp.name} - Registrations</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-emerald-600 text-xl"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Camp Summary */}
              <div className="p-6 border-b border-gray-200">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-emerald-700">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{selectedCamp.location}</span>
                    </div>
                    <div className="flex items-center text-emerald-700">
                      <FaCalendarCheck className="mr-2" />
                      <span>{formatDate(selectedCamp.date)}</span>
                    </div>
                    <div className="flex items-center text-emerald-700">
                      <FaClock className="mr-2" />
                      <span>{selectedCamp.start_time} - {selectedCamp.end_time}</span>
                    </div>
                    <div className="flex items-center text-emerald-700">
                      <FaUsers className="mr-2" />
                      <span>{campRegistrations.length} / {selectedCamp.capacity} Registered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registrations Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {isLoadingRegs ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-emerald-600 mr-3" />
                    <span className="text-gray-600">Loading registrations...</span>
                  </div>
                ) : campRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Registrations Yet</h3>
                    <p className="text-gray-500">No one has registered for this camp yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {campRegistrations.map((regResponse, index) => {
                      // Extract the registration data from the nested structure
                      const reg = regResponse.registration;
                      const donor = regResponse.donor;
                      
                      return (
                        <motion.div
                          key={reg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                        >
                          {/* Registration Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                                <FaUser className="text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  {donor?.name || 'Anonymous Donor'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Reg ID: {reg.id}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reg?.status)}`}>
                              {reg?.status ? reg.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                            </span>
                          </div>

                          {/* Registration Details */}
                          <div className="space-y-3">
                            {/* Blood Type & Health Status */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center">
                                <MdBloodtype className="mr-2 text-red-500 text-lg" />
                                <span className="font-semibold text-red-600">
                                  {reg.blood_type || 'Not specified'}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className={`text-sm font-medium ${getHealthStatusColor(reg.health_status)}`}>
                                  {getHealthStatusIcon(reg.health_status)}
                                  {reg.health_status ? reg.health_status.replace('_', ' ').toUpperCase() : 'PENDING'}
                                </span>
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2">
                              {reg.contact_phone && (
                                <div className="flex items-center text-sm text-gray-700">
                                  <FaPhone className="mr-2 text-emerald-500" />
                                  <span>{reg.contact_phone}</span>
                                </div>
                              )}
                              {donor?.email && (
                                <div className="flex items-center text-sm text-gray-700">
                                  <FaEnvelope className="mr-2 text-emerald-500" />
                                  <span>{donor.email}</span>
                                </div>
                              )}
                            </div>

                            {/* Registration Date */}
                            <div className="flex items-center text-sm text-gray-600">
                              <FaCalendarCheck className="mr-2 text-emerald-500" />
                              <span>Registered: {formatDate(reg.registration_date)}</span>
                            </div>

                            {/* Last Donation */}
                            {reg.last_donation_date && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MdBloodtype className="mr-2 text-gray-400" />
                                <span>Last donation: {formatDate(reg.last_donation_date)}</span>
                              </div>
                            )}

                            {/* Emergency Contact */}
                            {(reg.emergency_contact_name || reg.emergency_contact_phone) && (
                              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                <p className="text-xs font-semibold text-gray-600 mb-1">Emergency Contact:</p>
                                <div className="text-sm text-gray-700">
                                  {reg.emergency_contact_name && (
                                    <div className="flex items-center">
                                      <FaUser className="mr-2 text-gray-400 text-xs" />
                                      {reg.emergency_contact_name}
                                    </div>
                                  )}
                                  {reg.emergency_contact_phone && (
                                    <div className="flex items-center">
                                      <FaPhone className="mr-2 text-gray-400 text-xs" />
                                      {reg.emergency_contact_phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Medical Information */}
                            {(reg.medical_conditions || reg.medications) && (
                              <div className="bg-yellow-50 rounded-lg p-3 mt-3">
                                <p className="text-xs font-semibold text-yellow-800 mb-1">Medical Information:</p>
                                {reg.medical_conditions && (
                                  <p className="text-sm text-yellow-700 mb-1">
                                    <strong>Conditions:</strong> {reg.medical_conditions}
                                  </p>
                                )}
                                {reg.medications && (
                                  <p className="text-sm text-yellow-700">
                                    <strong>Medications:</strong> {reg.medications}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Notes */}
                            {reg.notes && (
                              <div className="bg-blue-50 rounded-lg p-3 mt-3">
                                <p className="text-xs font-semibold text-blue-800 mb-1">Notes:</p>
                                <p className="text-sm text-blue-700">{reg.notes}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your blood camps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
          My Blood Camps
        </h1>
        <p className="text-gray-600 mt-2">Manage your blood donation camps and view registrations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/70 p-6 rounded-3xl shadow-xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Camps</p>
              <h3 className="text-2xl font-bold text-emerald-700">{stats.totalCamps}</h3>
            </div>
            <FaCampground className="text-3xl text-emerald-500" />
          </div>
        </div>
        <div className="bg-white/70 p-6 rounded-3xl shadow-xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <h3 className="text-2xl font-bold text-yellow-700">{stats.upcoming}</h3>
            </div>
            <FaCalendarDay className="text-3xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white/70 p-6 rounded-3xl shadow-xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <h3 className="text-2xl font-bold text-green-700">{stats.active}</h3>
            </div>
            <FaCalendarCheck className="text-3xl text-green-500" />
          </div>
        </div>
        <div className="bg-white/70 p-6 rounded-3xl shadow-xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <h3 className="text-2xl font-bold text-gray-700">{stats.completed}</h3>
            </div>
            <FaCalendarTimes className="text-3xl text-gray-500" />
          </div>
        </div>
        <div className="bg-white/70 p-6 rounded-3xl shadow-xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registrations</p>
              <h3 className="text-2xl font-bold text-blue-700">{stats.totalRegistrations}</h3>
            </div>
            <FaUsers className="text-3xl text-blue-500" />
          </div>
        </div>
      </div>

      {/* Camps List */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Blood Camps</h2>
        {camps.length === 0 ? (
          <div className="text-center py-12">
            <FaCampground className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Blood Camps Yet</h3>
            <p className="text-gray-500">You haven't created any blood camps yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map(camp => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-emerald-700 line-clamp-2">{camp.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(camp.status)}`}>
                    {camp.status ? camp.status.toUpperCase() : 'PENDING'}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarCheck className="mr-3 text-emerald-500" />
                    <span>{formatDate(camp.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-3 text-emerald-500" />
                    <span className="line-clamp-1">{camp.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="mr-3 text-emerald-500" />
                    <span>{camp.start_time} - {camp.end_time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaUsers className="mr-3 text-emerald-500" />
                    <span>
                      <span className="font-semibold text-emerald-700">
                        {registrations[camp.id]?.length || 0}
                      </span>
                      <span className="text-gray-500"> / {camp.capacity}</span>
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedCamp(camp);
                    setShowDetails(true);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <FaEye className="mr-2" />
                  View Registrations ({registrations[camp.id]?.length || 0})
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <RegistrationDetailsModal />
    </div>
  );
};

export default BloodCampOrganizerDashboard;