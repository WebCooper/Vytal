'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaPlus,
  FaShare
} from 'react-icons/fa';
import { DonorDashboard } from '@/lib/donationApi';

interface DonorDonationsProps {
  donorDashboard: DonorDashboard | null;
  isLoadingDashboard: boolean;
  setShowCreateDonation: (show: boolean) => void;
  setShowCardGenerator: (show: boolean) => void;
}

const DonorDonations: React.FC<DonorDonationsProps> = ({
  donorDashboard,
  isLoadingDashboard,
  setShowCreateDonation,
  setShowCardGenerator
}) => {

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

  // No data state
  if (!donorDashboard) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <p className="text-gray-600">Track your donations, create shareable cards, and view your contribution history</p>
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
      </motion.div>

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

      {/* Achievements */}
      {donorDashboard.achievements.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6"
        >
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl font-bold text-gray-800 mb-4"
          >
            Your Achievements
          </motion.h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donorDashboard.achievements.map((achievement, index) => (
              <motion.div 
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + (index * 0.1), type: "spring" }}
                className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + (index * 0.1), type: "spring" }}
                    className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <span className="text-white font-bold text-2xl">🏆</span>
                  </motion.div>
                  <h4 className="font-bold text-yellow-800 mb-1">{achievement.achievement_name}</h4>
                  <p className="text-yellow-700 text-sm mb-2">{achievement.description}</p>
                  <p className="text-yellow-600 text-xs">Earned {new Date(achievement.earned_date).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Impact Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6"
      >
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xl font-bold text-emerald-800 mb-4"
        >
          Your Impact
        </motion.h3>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h4 className="font-bold text-emerald-700 mb-2">Lives Touched</h4>
            <p className="text-emerald-600 text-sm">
              Your {donorDashboard.stats.blood_donations} blood donations could have helped save up to {donorDashboard.stats.blood_donations * 3} lives.
              Each donation can help up to 3 patients.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <h4 className="font-bold text-emerald-700 mb-2">Community Recognition</h4>
            <p className="text-emerald-600 text-sm">
              You&apos;ve made {donorDashboard.stats.total_donations} total donations.
              Your commitment makes a real difference in the community.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DonorDonations;