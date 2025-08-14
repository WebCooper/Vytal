import React from 'react'
import { motion } from 'framer-motion';
import { TabNavigationProps } from '../types';

const TabNavigation: React.FC<TabNavigationProps> = ({activeTab, setActiveTab}) => {
  return (
    <div>
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                  Community Hub
                </h2>
                <p className="text-gray-600">Connect with those in need and find local donation opportunities</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === "posts" 
                      ? "bg-teal-500 text-white shadow-lg" 
                      : "bg-white/80 text-teal-700 border border-teal-200 hover:bg-teal-50"
                  }`}
                >
                  Support Requests
                </button>
                <button
                  onClick={() => setActiveTab("camps")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === "camps" 
                      ? "bg-teal-500 text-white shadow-lg" 
                      : "bg-white/80 text-teal-700 border border-teal-200 hover:bg-teal-50"
                  }`}
                >
                  Blood Camps
                </button>
              </div>
            </div>
          </motion.div>
        </div>
    </div>
  )
}

export default TabNavigation