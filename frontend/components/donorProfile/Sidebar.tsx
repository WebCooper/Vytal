import React from 'react'
import { motion } from "framer-motion";
import { MdVerified } from 'react-icons/md';
import { SidebarProps } from '@/components/types';
import { FaCompass, FaDonate, FaChartLine, FaInbox } from 'react-icons/fa';

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab  }) => {
  return (
    <div className="lg:col-span-1">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 sticky top-24"
      >
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            {user.avatar}
          </div>
          <div className="flex items-center justify-center space-x-1 mb-2">
            <h3 className="text-xl font-bold text-teal-700">{user.name}</h3>
            {user.verified && <MdVerified className="text-teal-500" />}
          </div>
          <p className="text-gray-600 text-sm mb-4">Member since {user.joinedDate}</p>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("browse")}
            className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
              activeTab === "browse" 
                ? "bg-teal-500 text-white shadow-lg" 
                : "text-teal-700 hover:bg-teal-50"
            }`}
          >
            <FaCompass className="mr-3" />
            Browse Opportunities
          </button>
          <button
            onClick={() => setActiveTab("myDonations")}
            className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
              activeTab === "myDonations" 
                ? "bg-teal-500 text-white shadow-lg" 
                : "text-teal-700 hover:bg-teal-50"
            }`}
          >
            <FaDonate className="mr-3" />
            My Donations
          </button>
          <button
            onClick={() => setActiveTab("impact")}
            className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
              activeTab === "impact" 
                ? "bg-teal-500 text-white shadow-lg" 
                : "text-teal-700 hover:bg-teal-50"
            }`}
          >
            <FaChartLine className="mr-3" />
            My Impact
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
              activeTab === "messages" 
                ? "bg-teal-500 text-white shadow-lg" 
                : "text-teal-700 hover:bg-teal-50"
            }`}
          >
            <FaInbox className="mr-3" />
            Messages
          </button>
        </nav>
        
        <div className="mt-8 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center">
            <div className="bg-emerald-500 rounded-lg p-2 mr-3">
              <FaDonate className="text-white text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Donor Level</p>
              <p className="text-xs text-emerald-600">Gold Supporter</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-emerald-700">Next milestone</span>
              <span className="text-xs text-emerald-700">5/10 donations</span>
            </div>
            <div className="w-full h-2 bg-emerald-200 rounded-full">
              <div className="h-2 bg-emerald-500 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Sidebar;