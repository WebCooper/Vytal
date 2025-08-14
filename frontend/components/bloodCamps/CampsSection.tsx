import React from 'react'
import { motion } from 'framer-motion';
import { MdBloodtype } from 'react-icons/md';
import { CampsSectionProps } from '../types';
import { FaClock, FaMapMarkerAlt, FaPhone, FaPlus, FaUsers } from 'react-icons/fa';
import CreateBloodCamp from './CreateBloodCamp';

const CampsSection:React.FC<CampsSectionProps> = ({ bloodCamps, setSelectedCamp, showBloodCampForm, setShowBloodCampForm }) => {
  const activeCamps = bloodCamps.filter(camp => camp.status === "active");
  const upcomingCamps = bloodCamps.filter(camp => camp.status === "upcoming");

  return (
    <div className="space-y-6">
        {activeCamps.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                    <MdBloodtype className="mr-2" />
                    Active Camps - Donate Now!
                </h3>
                <div className="space-y-4">
                    {activeCamps.map((camp) => (
                        <motion.div
                            key={camp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50/80 border-l-4 border-red-500 p-4 rounded-r-xl cursor-pointer hover:shadow-lg transition-all duration-200"
                            onClick={() => setSelectedCamp(camp)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-bold text-red-800 mb-2">{camp.name}</h4>
                                    <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="mr-1 text-red-500" />
                                            <span>{camp.location}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaClock className="mr-1 text-red-500" />
                                            <span>{camp.time}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaUsers className="mr-1 text-red-500" />
                                            <span>Capacity: {camp.capacity}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-xs text-gray-500 mr-2">Blood types needed:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {camp.bloodTypes.slice(0, 4).map((type, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                                    {type}
                                                </span>
                                            ))}
                                            {camp.bloodTypes.length > 4 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    +{camp.bloodTypes.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2 ml-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Handle donate now action
                                        }}
                                        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm"
                                    >
                                        Donate Now
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCamp(camp);
                                        }}
                                        className="px-4 py-2 text-red-600 border border-red-300 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
            <h3 className="text-xl font-bold text-emerald-700 mb-4">Upcoming Blood Camps</h3>
            <div className="grid md:grid-cols-2 gap-4">
                {upcomingCamps.map((camp, index) => (
                    <motion.div
                        key={camp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/30 p-4 hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedCamp(camp)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center">
                                    <MdBloodtype className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-emerald-800">{camp.name}</h4>
                                    <p className="text-gray-600 flex items-center text-sm">
                                        <FaMapMarkerAlt className="mr-1 text-emerald-500" />
                                        {camp.location}
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">
                                UPCOMING
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-700 text-sm">
                                <FaClock className="mr-2 text-emerald-500" />
                                <span>{new Date(camp.date).toLocaleDateString()} | {camp.time}</span>
                            </div>
                            <div className="flex items-center text-gray-700 text-sm">
                                <FaUsers className="mr-2 text-emerald-500" />
                                <span>Expected: {camp.capacity} donors</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Accepting blood types:</p>
                            <div className="flex flex-wrap gap-1">
                                {camp.bloodTypes.slice(0, 6).map((type, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                        {type}
                                    </span>
                                ))}
                                {camp.bloodTypes.length > 6 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        +{camp.bloodTypes.length - 6}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                            <div className="text-sm text-gray-600">
                                <p className="font-semibold">{camp.organizer}</p>
                                <p className="flex items-center mt-1">
                                    <FaPhone
                                     className="mr-1 text-emerald-500" />
                                    {camp.contact}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle register action
                                    }}
                                    className="px-3 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                                >
                                    Register
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCamp(camp);
                                    }}
                                    className="px-3 py-2 text-emerald-600 border border-emerald-300 font-semibold rounded-lg hover:bg-emerald-50 transition-colors text-sm"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {bloodCamps.length === 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                <MdBloodtype className="text-6xl text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-emerald-700 mb-2">No Blood Camps Available</h3>
                <p className="text-gray-600 mb-6">Be the first to organize a blood donation camp in your area.</p>
                <button
                    onClick={() => setShowBloodCampForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center mx-auto"
                >
                    <FaPlus className="mr-2" />
                    Create Blood Camp
                </button>
            </div>
        )}

        <CreateBloodCamp
            isOpen={showBloodCampForm}
            onClose={() => setShowBloodCampForm(false)}
            onSubmit={(campData) => {
                console.log('New blood camp:', campData);
                // Handle the new camp data here - you can add it to your camps array
                setShowBloodCampForm(false);
            }}
        />
    </div>
  )
}

export default CampsSection