// File: components/gamification/GamificationDashboard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, FaMedal, FaHeart, FaFire, FaStar, FaGift,
  FaUsers, FaShareAlt, FaCrown
} from 'react-icons/fa';
import { MdBloodtype, MdVerified } from 'react-icons/md';
import { badges, achievements, leaderboard, donorUserGamification } from '@/app/mockData';

interface GamificationDashboardProps {
  user?: any;
}

// Icon mapping object
const iconMap = {
  FaHeart,
  FaMedal, 
  FaFire,
  FaGift,
  FaCrown,
  FaTrophy,
  FaStar,
  FaUsers,
  FaShareAlt,
  MdBloodtype,
  MdVerified
};

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('badges');
  
  // Use the mock data from mockData.ts
  const userStats = donorUserGamification;

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600', 
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-500'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBorder = (rarity: string) => {
    const colors = {
      common: 'border-gray-300',
      rare: 'border-blue-300',
      epic: 'border-purple-300', 
      legendary: 'border-yellow-300'
    };
    return colors[rarity] || colors.common;
  };

  // Function to get icon component from string name
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || FaHeart; // fallback to FaHeart
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
            🏆 Rewards & Recognition
          </h2>
          <p className="text-gray-600">Track your impact, earn rewards, and compete with fellow heroes</p>
        </div>
      </div>

      {/* User Stats Overview */}
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
            <p className="text-2xl font-bold text-emerald-700">{userStats.level}</p>
            <p className="text-gray-600 text-sm">Level</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaHeart className="text-2xl text-white" />
            </div>
            <p className="text-2xl font-bold text-red-700">{userStats.livesTouched}</p>
            <p className="text-gray-600 text-sm">Lives Touched</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaFire className="text-2xl text-white" />
            </div>
            <p className="text-2xl font-bold text-orange-700">{userStats.streakDays}</p>
            <p className="text-gray-600 text-sm">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaStar className="text-2xl text-white" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{userStats.points}</p>
            <p className="text-gray-600 text-sm">Total Points</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-2 border border-white/30">
          {['badges', 'achievements', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {badges.map((badge, index) => {
              // Get the icon component from the string name
              const IconComponent = getIconComponent(badge.icon);
              
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 border-2 ${getRarityBorder(badge.rarity)} 
                    ${badge.earned ? 'shadow-xl' : 'opacity-50 grayscale'} hover:scale-105 transition-all duration-300`}
                >
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-2xl 
                      flex items-center justify-center mx-auto mb-4 ${badge.earned ? 'shadow-lg' : ''}`}>
                      <IconComponent className="text-3xl text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{badge.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                        badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                        badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {badge.rarity.toUpperCase()}
                      </span>
                      <span className="text-emerald-600 font-bold">{badge.points} pts</span>
                    </div>
                    {badge.earned && (
                      <div className="mt-3 flex justify-center">
                        <MdVerified className="text-emerald-500 text-xl" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{achievement.title}</h3>
                    <p className="text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{achievement.progress}/{achievement.target}</p>
                    <p className="text-gray-500 text-sm">Progress</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-emerald-600 font-semibold">
                      {Math.round((achievement.progress / achievement.target) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                    🎁 {achievement.reward}
                  </span>
                  {achievement.progress === achievement.target && (
                    <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-lg font-bold hover:scale-105 transition-all duration-200">
                      Claim Reward
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Community Champions</h3>
                <p className="text-emerald-100">Top donors making a difference</p>
              </div>
              
              <div className="p-6">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-xl mb-4 ${
                      user.isUser 
                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    } transition-all duration-200`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                        user.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                        user.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                        user.rank === 3 ? 'bg-gradient-to-r from-orange-300 to-orange-500 text-white' :
                        'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white'
                      }`}>
                        {user.rank <= 3 ? (
                          user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'
                        ) : (
                          user.rank
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold">
                          {user.avatar}
                        </div>
                        <div>
                          <h4 className={`font-bold ${user.isUser ? 'text-emerald-800' : 'text-gray-800'}`}>
                            {user.name}
                          </h4>
                          <p className="text-gray-600 text-sm">{user.donations} donations • {user.badges} badges</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-bold ${user.isUser ? 'text-emerald-700' : 'text-gray-800'}`}>
                        {user.points.toLocaleString()} pts
                      </p>
                      {user.isUser && (
                        <p className="text-emerald-600 text-sm font-semibold">That's you! 🎉</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Share Your Impact</h3>
            <FaShareAlt className="text-2xl" />
          </div>
          <p className="text-blue-100 mb-4">Show off your donation achievements on social media</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Generate Impact Card
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Refer Friends</h3>
            <FaUsers className="text-2xl" />
          </div>
          <p className="text-purple-100 mb-4">Invite friends and earn 100 points for each signup</p>
          <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
            Invite Friends
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GamificationDashboard;