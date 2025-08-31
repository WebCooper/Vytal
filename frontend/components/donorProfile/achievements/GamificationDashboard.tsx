// File: components/gamification/GamificationDashboard.tsx
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { badges, achievements, donorStat } from '@/app/mockData';
import DonorStatsCard from '@/components/donorProfile/achievements/DonorStatsCard';
import BadgesTab from '@/components/donorProfile/achievements/BadgesTab';
import AchievementsTab from './AchievementsTab';
import TabNavigation from './TabNavigation';
import ActionCards from './ActionCards';

const GamificationDashboard = () => {
  const [activeTab, setActiveTab] = useState('badges');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
            🏆 Your Achievements
          </h2>
          <p className="text-gray-600">Track your impact, earn rewards, and compete with fellow heroes</p>
        </div>
      </div>

      {/* User Stats Overview */}
      <DonorStatsCard donorStat={donorStat} />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence mode="wait">
        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <BadgesTab badges={badges as import('@/components/types').Badges[]} />
        )}

        {/* Achievements Tab */}
        {activeTab === 'GamificationAchievement' && (
          <AchievementsTab GamificationAchievement={achievements} />
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
            <h3 className="text-2xl font-bold text-emerald-700 mb-3">🏆 Leaderboard Coming Soon!</h3>
            <p className="text-gray-600">We&apos;re working hard to bring you an exciting leaderboard feature. Stay tuned for updates!</p>
          </div>
        )}
      </AnimatePresence>

      {/* Action Cards */}
      <ActionCards />
    </div>
  );
};

export default GamificationDashboard;