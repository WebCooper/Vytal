import { TabNavigationProps } from '@/components/types'
import React from 'react'

const TabNavigation:React.FC<TabNavigationProps> = ({activeTab, setActiveTab}) => {
  return (
    <div>
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
    </div>
  )
}

export default TabNavigation