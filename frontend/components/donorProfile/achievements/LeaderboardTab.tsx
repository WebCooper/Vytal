import React from 'react'
import { motion } from 'framer-motion';
import { LeaderboardDetails } from '@/components/types';

const LeaderboardTab = ({ leaderboardDetails }: { leaderboardDetails: LeaderboardDetails[] }) => {
  return (
    <div>
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
            {leaderboardDetails.map((user, index) => (
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
                    <p className="text-emerald-600 text-sm font-semibold">That&apos;s you! 🎉</p>
                    )}
                </div>
                </motion.div>
            ))}
            </div>
        </div>
        </motion.div>
    </div>
  )
}

export default LeaderboardTab