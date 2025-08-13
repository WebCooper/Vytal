import React from 'react'
import { FaClock, FaUser, FaCalendarAlt, FaTimes, FaPhone, FaExternalLinkAlt } from "react-icons/fa";
import { MdBloodtype, MdLocationOn } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { CampDetailsModalProps } from '../types';

const CampDetailsModal: React.FC<CampDetailsModalProps> = ({selectedCamp, setSelectedCamp}) => {
  return (
    <div>
      <AnimatePresence>
        {selectedCamp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCamp(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 max-w-md w-full p-8 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-emerald-600 text-xl"
                onClick={() => setSelectedCamp(null)}
              >
                <FaTimes />
              </button>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  selectedCamp.status === 'active' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  <MdBloodtype className="text-white text-2xl" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-emerald-700">{selectedCamp.name}</h4>
                  <p className="text-gray-600 flex items-center">
                    <MdLocationOn className="mr-1 text-emerald-500" />
                    {selectedCamp.location}
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-700">
                  <FaCalendarAlt className="mr-2 text-emerald-500" />
                  <span>{new Date(selectedCamp.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FaClock className="mr-2 text-emerald-500" />
                  <span>{selectedCamp.time}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FaUser className="mr-2 text-emerald-500" />
                  <span>{selectedCamp.capacity}</span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Accepting blood types:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedCamp.bloodTypes.map((type, idx) => (
                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p className="font-semibold">{selectedCamp.organizer}</p>
                <p className="flex items-center mt-1">
                  <FaPhone className="mr-1 text-emerald-500" />
                  {selectedCamp.contact}
                </p>
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-lg font-semibold hover:scale-105 transition flex items-center justify-center">
                Register
                <FaExternalLinkAlt className="ml-2 text-sm" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CampDetailsModal