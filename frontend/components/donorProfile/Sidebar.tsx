import React from 'react'
import { motion } from 'framer-motion';
import { MdVerified } from 'react-icons/md';
import { SidebarProps } from '../types';
import { useMessages } from '@/contexts/MessagesContext';

const Sidebar:React.FC<SidebarProps> = ({user, activeTab, setActiveTab}) => {
  const { unreadCount } = useMessages();

  return (
    <div>
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
                    <p className="text-gray-600 text-sm mb-4">Donor since {user.joinedDate}</p>
                </div>

                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab("explore")}
                        className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "explore"
                            ? "bg-teal-500 text-white shadow-lg"
                            : "text-teal-700 hover:bg-teal-50"
                            }`}
                    >
                        Explore Needs
                    </button>
                    <button
                        onClick={() => setActiveTab("myposts")}
                        className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "myposts"
                            ? "bg-teal-500 text-white shadow-lg"
                            : "text-teal-700 hover:bg-teal-50"
                            }`}
                    >
                        My Posts
                    </button>
                    <button
                        onClick={() => setActiveTab("bloodcamps")}
                        className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "bloodcamps"
                            ? "bg-teal-500 text-white shadow-lg"
                            : "text-teal-700 hover:bg-teal-50"
                            }`}
                    >
                        Blood Camps
                    </button>
                    <button
                        onClick={() => setActiveTab("my-camps")}
                        className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "my-camps"
                            ? "bg-teal-500 text-white shadow-lg"
                            : "text-teal-700 hover:bg-teal-50"
                            }`}
                    >
                        My Camps
                    </button>
                    <button
                        onClick={() => setActiveTab("donations")}
                        className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "donations"
                            ? "bg-teal-500 text-white shadow-lg"
                            : "text-teal-700 hover:bg-teal-50"
                            }`}
                    >
                        My Donations
                    </button>
                    <button
                        onClick={() => setActiveTab("achievements")}
                        className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "achievements"
                            ? "bg-teal-500 text-white shadow-lg"
                            : "text-teal-700 hover:bg-teal-50"
                            }`}
                    >
                        Achievements
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "analytics"
                            ? "bg-teal-500 text-white shadow-lg"
                            : "text-teal-700 hover:bg-teal-50"
                            }`}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab("messages")}
                        className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 relative ${activeTab === "messages"
                            ? "bg-teal-500 text-white shadow-lg"
                            : "text-teal-700 hover:bg-teal-50"
                            }`}
                    >
                        <span className="flex items-center justify-between">
                            <span>Messages</span>
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full min-w-[20px] h-5 ${
                                        activeTab === "messages"
                                            ? "bg-white text-teal-600"
                                            : "bg-red-500 text-white"
                                    }`}
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </motion.span>
                            )}
                        </span>
                    </button>
                </nav>
            </motion.div>
        </div>
    </div>
  )
}

export default Sidebar