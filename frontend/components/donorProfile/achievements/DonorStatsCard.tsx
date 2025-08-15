import React from 'react'
import { motion } from 'framer-motion';
import { FaTrophy, FaHeart, FaFire, FaStar } from 'react-icons/fa';
import { calcTotalNumberOfDonations, calcTotalPoints, calculateLevel } from './calculations';
import { donations } from '@/app/mockData';

const DonorStatsCard = ({ currentUserId }: { currentUserId: number }) => {

  const points = calcTotalPoints(donations, currentUserId);
  const level = calculateLevel(points).level;
  const livesTouched = calcTotalNumberOfDonations(donations, currentUserId);

  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaTrophy className="text-2xl text-white" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">5</p>
            <p className="text-gray-600 text-sm">Rank</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaFire className="text-2xl text-white" />
            </div>
            <p className="text-2xl font-bold text-orange-700">{level}</p>
            <p className="text-gray-600 text-sm">Level</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaHeart className="text-2xl text-white" />
            </div>
            <p className="text-2xl font-bold text-red-700">{livesTouched}</p>
            <p className="text-gray-600 text-sm">Lives Touched</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaStar className="text-2xl text-white" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{points}</p>
            <p className="text-gray-600 text-sm">Total Points</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DonorStatsCard