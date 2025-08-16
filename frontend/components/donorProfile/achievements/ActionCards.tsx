import React from 'react'
import { motion } from 'framer-motion';
import { FaUsers, FaShareAlt } from 'react-icons/fa';

const ActionCards = () => {
  return (
    <div>
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
  )
}

export default ActionCards