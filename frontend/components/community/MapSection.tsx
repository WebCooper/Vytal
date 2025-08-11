import React from 'react'
import SriLankaMap from './SriLankaMap'
import { MapSectionProps } from '../types'

const MapSection: React.FC<MapSectionProps> = ({bloodCamps, setSelectedCamp}) => {
  return (
    <div>
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
              <h3 className="text-2xl font-bold text-teal-700 mb-2">Blood Donation Camps</h3>
              <p className="text-gray-600">Click on markers to view camp details</p>
          </div>
          <div className="flex space-x-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              {bloodCamps.filter(camp => camp.status === 'active').length} Active
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
              {bloodCamps.filter(camp => camp.status === 'upcoming').length} Upcoming
              </span>
          </div>
        </div>
        <SriLankaMap bloodCamps={bloodCamps} setSelectedCamp={setSelectedCamp} />
      </div>
    </div>
  )
}

export default MapSection