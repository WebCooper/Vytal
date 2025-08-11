import React from 'react'
import { motion } from 'framer-motion';
import { MdBloodtype, MdLocationOn } from 'react-icons/md';
import { FaCalendarAlt, FaClock, FaExternalLinkAlt, FaPhone, FaUser } from 'react-icons/fa';
import { CampsListProps } from '../types';

const CampsList: React.FC<CampsListProps> = ({bloodCamps, selectedCamp, setSelectedCamp}) => {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        {bloodCamps.map((camp, index) => (
          <motion.div
            key={camp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-300 cursor-pointer ${
              selectedCamp?.id === camp.id ? 'ring-2 ring-emerald-500' : ''
            }`}
            onClick={() => setSelectedCamp(camp)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  camp.status === 'active' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  <MdBloodtype className="text-white text-2xl" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-emerald-700">{camp.name}</h4>
                  <p className="text-gray-600 flex items-center">
                    <MdLocationOn className="mr-1 text-emerald-500" />
                    {camp.location}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                camp.status === 'active' 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                {camp.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-700">
                <FaCalendarAlt className="mr-2 text-emerald-500" />
                <span>{new Date(camp.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FaClock className="mr-2 text-emerald-500" />
                <span>{camp.time}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FaUser className="mr-2 text-emerald-500" />
                <span>{camp.capacity} donors</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Accepting blood types:</p>
              <div className="flex flex-wrap gap-1">
                {camp.bloodTypes.map((type, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
              <div className="text-sm text-gray-600">
                <p className="font-semibold">{camp.organizer}</p>
                <p className="flex items-center mt-1">
                  <FaPhone className="mr-1 text-emerald-500" />
                  {camp.contact}
                </p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg font-semibold hover:scale-105 transition flex items-center">
                Register
                <FaExternalLinkAlt className="ml-2 text-sm" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default CampsList