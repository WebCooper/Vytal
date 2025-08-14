import React from 'react'
import { motion } from 'framer-motion';
import { FaTrophy, FaHeart, FaFire, FaStar } from 'react-icons/fa';
import { DonorStat } from '@/components/types';
import { calcTotalNumberOfDonations, calcTotalPoints } from './calculations';
import { donations } from '@/app/mockData';

const currentUserId = 2; // Replace with actual user ID from context

const DonorStatsCard = ({ donorStat }: { donorStat: DonorStat }) => {

  type LevelInfo = {
    level: number;
    title: string;
    pointsForNextLevel: number | null; // null if max level
    pointsToNextLevel: number | null; // null if max level
    progressPercent: number; // 0–100
  };

  const levelThresholds = [
    { level: 1, points: 0, title: "Newcomer" },
    { level: 2, points: 500, title: "Supporter" },
    { level: 3, points: 1500, title: "Helper" },
    { level: 4, points: 3000, title: "Advocate" },
    { level: 5, points: 5000, title: "Lifesaver" },
    { level: 6, points: 8000, title: "Guardian" },
    { level: 7, points: 12000, title: "Hero" },
    { level: 8, points: 18000, title: "Champion" },
    { level: 9, points: 26000, title: "Protector" },
    { level: 10, points: 36000, title: "Rescuer" },
    { level: 11, points: 48000, title: "Benefactor" },
    { level: 12, points: 62000, title: "Saviour" },
    { level: 13, points: 80000, title: "Philanthropist" },
    { level: 14, points: 100000, title: "National Hero" },
    { level: 15, points: 125000, title: "Legendary Giver" }
  ];

  function calculateLevel(totalPoints: number): LevelInfo {
    let currentLevel = levelThresholds[0];
    let nextLevel = null;

    for (let i = 0; i < levelThresholds.length; i++) {
      if (totalPoints >= levelThresholds[i].points) {
        currentLevel = levelThresholds[i];
        nextLevel = levelThresholds[i + 1] || null;
      }
    }

    if (!nextLevel) {
      return {
        level: currentLevel.level,
        title: currentLevel.title,
        pointsForNextLevel: null,
        pointsToNextLevel: null,
        progressPercent: 100
      };
    }

    const progress =
      ((totalPoints - currentLevel.points) /
        (nextLevel.points - currentLevel.points)) *
      100;

    return {
      level: currentLevel.level,
      title: currentLevel.title,
      pointsForNextLevel: nextLevel.points,
      pointsToNextLevel: nextLevel.points - totalPoints,
      progressPercent: Math.min(progress, 100)
    };
  }

  const donorStats = {
      livesTouched: calcTotalNumberOfDonations(donations, currentUserId),
      points: calcTotalPoints(donations, currentUserId),
  }
const level = calculateLevel(donorStats.points).level;

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
            <p className="text-2xl font-bold text-emerald-700">{donorStat.streakDays}</p>
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
            <p className="text-2xl font-bold text-red-700">{donorStats.livesTouched}</p>
            <p className="text-gray-600 text-sm">Lives Touched</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaStar className="text-2xl text-white" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{donorStats.points}</p>
            <p className="text-gray-600 text-sm">Total Points</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DonorStatsCard