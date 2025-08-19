import React from 'react'
import { motion } from 'framer-motion';
import { TabNavigationProps } from '../types';
import { FaHandHoldingHeart, FaDonate, FaHospital } from 'react-icons/fa';

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
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setActiveTab("requests");
                    // Update URL without refreshing the page
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', 'requests');
                    window.history.pushState({}, '', url.toString());
                  }}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
                    activeTab === "requests" 
                      ? "bg-teal-500 text-white shadow-lg" 
                      : "bg-white/80 text-teal-700 border border-teal-200 hover:bg-teal-50"
                  }`}
                >
                  <FaHandHoldingHeart className="mr-2" /> Help Requests
                </button>
                <button
                  onClick={() => {
                    setActiveTab("donations");
                    // Update URL without refreshing the page
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', 'donations');
                    window.history.pushState({}, '', url.toString());
                  }}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
                    activeTab === "donations" 
                      ? "bg-teal-500 text-white shadow-lg" 
                      : "bg-white/80 text-teal-700 border border-teal-200 hover:bg-teal-50"
                  }`}
                >
                  <FaDonate className="mr-2" /> Available Donations
                </button>
                <button
                  onClick={() => {
                    setActiveTab("camps");
                    // Update URL without refreshing the page
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', 'camps');
                    window.history.pushState({}, '', url.toString());
                  }}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center ${
                    activeTab === "camps" 
                      ? "bg-teal-500 text-white shadow-lg" 
                      : "bg-white/80 text-teal-700 border border-teal-200 hover:bg-teal-50"
                  }`}
                >
                  <FaHospital className="mr-2" /> Blood Camps
                </button>
              </div>
            </div>
          </motion.div>
        </div>
    </div>
  )
}

export default TabNavigation