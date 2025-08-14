import React from 'react'
import { motion } from 'framer-motion';
import { Achievement } from '@/components/types';

const AchievementsTab = ({ achievements }: { achievements: Achievement[] }) => {
  return (
    <div>
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
    </div>
  )
}

export default AchievementsTab