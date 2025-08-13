'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaMapMarkerAlt, FaClock, FaUsers, FaHeart, FaTrash, FaEye, FaComment, FaShare, FaPhone } from "react-icons/fa";
import { MdBloodtype, MdLocalHospital, MdMedication, MdVerified } from "react-icons/md";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { bloodCamps, donorUser, myDonorPosts, otherDonorPosts, recipientPosts } from "../mockData";
import CreateDonorPost from "@/components/donorProfile/CreateDonorPost";
import CreateBloodCamp from "@/components/donorProfile/CreateBloodCamp";
import { sriLankaMapPath } from "@/components/community/sriLankaMapPath";
import CampDetailsModal from "@/components/community/CampDetailsModal";
import { BloodCamp } from "@/components/types";
import DonationCardGenerator from "@/components/shared/MedicalCardGenerator";
import {
    getCategoryIcon,
    getCategoryColor,
    getUrgencyColor,
    getStatusColor,
    formatDate,
    getDonorStatusColor,
    getDonorUrgencyText
} from "@/components/utils";

export default function DonorDashboard() {
    const [activeTab, setActiveTab] = useState("explore");
    const [filterCategory, setFilterCategory] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [showDonorPostForm, setShowDonorPostForm] = useState(false);
    const [showBloodCampForm, setShowBloodCampForm] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
    // Filter functions
    const filteredDonorPosts = filterCategory === "all"
        ? myDonorPosts
        : myDonorPosts.filter(post => post.category === filterCategory);

    const filteredRecipientPosts = recipientPosts.filter(post => {
        const categoryMatch = filterCategory === "all" || post.category === filterCategory;
        const urgencyMatch = urgencyFilter === "all" || post.urgency === urgencyFilter;
        return categoryMatch && urgencyMatch;
    });

    const filteredOtherDonorPosts = filterCategory === "all"
        ? otherDonorPosts
        : otherDonorPosts.filter(post => post.category === filterCategory);

    const upcomingCamps = bloodCamps.filter(camp => camp.status === "upcoming");
    const activeCamps = bloodCamps.filter(camp => camp.status === "active");
    const [showCardGenerator, setShowCardGenerator] = useState(false);
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
            <ProfileHeader user={donorUser} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 sticky top-24"
                        >
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                                    {donorUser.avatar}
                                </div>
                                <div className="flex items-center justify-center space-x-1 mb-2">
                                    <h3 className="text-xl font-bold text-teal-700">{donorUser.name}</h3>
                                    {donorUser.verified && <MdVerified className="text-teal-500" />}
                                </div>
                                <p className="text-gray-600 text-sm mb-4">Donor since {donorUser.joinedDate}</p>
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
                                    My Donor Posts
                                </button>
                                <button
                                    onClick={() => setActiveTab("otherdonors")}
                                    className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "otherdonors"
                                        ? "bg-teal-500 text-white shadow-lg"
                                        : "text-teal-700 hover:bg-teal-50"
                                        }`}
                                >
                                    Other Donors
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
                                    onClick={() => setActiveTab("donations")}
                                    className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "donations"
                                        ? "bg-teal-500 text-white shadow-lg"
                                        : "text-teal-700 hover:bg-teal-50"
                                        }`}
                                >
                                    My Donations
                                </button>
                                <button
                                    onClick={() => setActiveTab("messages")}
                                    className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === "messages"
                                        ? "bg-teal-500 text-white shadow-lg"
                                        : "text-teal-700 hover:bg-teal-50"
                                        }`}
                                >
                                    Messages
                                </button>
                            </nav>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === "explore" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Header */}
                                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                                                Explore Donation Opportunities
                                            </h2>
                                            <p className="text-gray-600">Find people who need your help and make a difference</p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {filteredRecipientPosts.length} {filteredRecipientPosts.length === 1 ? 'person needs' : 'people need'} help
                                        </div>
                                    </div>

                                    {/* Category Filter Bar */}
                                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-emerald-100">
                                        <button
                                            onClick={() => setFilterCategory("all")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${filterCategory === "all"
                                                ? "bg-emerald-500 text-white shadow-md"
                                                : "bg-white/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                                                }`}
                                        >
                                            All Needs ({recipientPosts.length})
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("organs")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "organs"
                                                ? "bg-red-500 text-white shadow-md"
                                                : "bg-white/80 text-red-700 border border-red-200 hover:bg-red-50"
                                                }`}
                                        >
                                            <MdBloodtype className="mr-1" />
                                            Blood/Organs ({recipientPosts.filter(p => p.category === "organs").length})
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("fundraiser")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "fundraiser"
                                                ? "bg-blue-500 text-white shadow-md"
                                                : "bg-white/80 text-blue-700 border border-blue-200 hover:bg-blue-50"
                                                }`}
                                        >
                                            <MdLocalHospital className="mr-1" />
                                            Fundraisers ({recipientPosts.filter(p => p.category === "fundraiser").length})
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("medicines")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "medicines"
                                                ? "bg-yellow-500 text-white shadow-md"
                                                : "bg-white/80 text-yellow-700 border border-yellow-200 hover:bg-yellow-50"
                                                }`}
                                        >
                                            <MdMedication className="mr-1" />
                                            Medicines ({recipientPosts.filter(p => p.category === "medicines").length})
                                        </button>
                                    </div>

                                    {/* Urgency Filter */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <span className="text-sm font-medium text-gray-600 mr-2">Priority:</span>
                                        {['all', 'high', 'medium', 'low'].map((urgency) => (
                                            <button
                                                key={urgency}
                                                onClick={() => setUrgencyFilter(urgency)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${urgencyFilter === urgency
                                                    ? urgency === 'high' ? 'bg-red-100 text-red-700 border border-red-200'
                                                        : urgency === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                            : urgency === 'low' ? 'bg-green-100 text-green-700 border border-green-200'
                                                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {urgency === 'all' ? 'All Priority' : `${urgency} Priority`.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Recipient Posts Grid */}
                                <div className="space-y-6">
                                    {filteredRecipientPosts.map((post, index) => {
                                        const CategoryIcon = getCategoryIcon(post.category);
                                        return (
                                            <motion.div
                                                key={post.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-2xl transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-2xl flex items-center justify-center`}>
                                                            <CategoryIcon className="text-2xl text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-emerald-700 mb-1">{post.title}</h3>
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(post.status)}`}>
                                                                    {post.status.toUpperCase()}
                                                                </span>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(post.urgency)}`}>
                                                                    {post.urgency.toUpperCase()} PRIORITY
                                                                </span>
                                                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                                    <FaMapMarkerAlt className="text-emerald-400" />
                                                                    <span>{post.location}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                                {post.user.avatar}
                                                            </div>
                                                            <span className="text-sm text-gray-600">{post.user.name}</span>
                                                            {post.user.verified && <MdVerified className="text-emerald-500 text-sm" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                                                {/* Fundraiser Progress Bar */}
                                                {post.category === "fundraiser" && post.fundraiserDetails && (
                                                    <div className="mb-4">
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-gray-600">
                                                                Raised: LKR {post.fundraiserDetails.received.toLocaleString()}
                                                            </span>
                                                            <span className="text-gray-600">
                                                                Goal: LKR {post.fundraiserDetails.goal.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-3 bg-gray-200 rounded-full">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${Math.min((post.fundraiserDetails.received / post.fundraiserDetails.goal) * 100, 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {((post.fundraiserDetails.received / post.fundraiserDetails.goal) * 100).toFixed(1)}% reached
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                            <FaClock className="text-emerald-400" />
                                                            <span>Posted {formatDate(post.createdAt)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                                <FaEye className="text-emerald-400" />
                                                                <span>{post.engagement.views}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                                <FaHeart className="text-red-400" />
                                                                <span>{post.engagement.likes}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                                <FaComment className="text-blue-400" />
                                                                <span>{post.engagement.comments}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-2">
                                                        <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-sm">
                                                            Help Now
                                                        </button>
                                                        <button className="px-4 py-2 text-emerald-600 border border-emerald-300 font-semibold rounded-lg hover:bg-emerald-50 transition-colors text-sm">
                                                            Contact
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {filteredRecipientPosts.length === 0 && (
                                    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                                        <FaHeart className="text-6xl text-emerald-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-emerald-700 mb-2">No Posts Found</h3>
                                        <p className="text-gray-600 mb-6">Try adjusting your filters to see more donation opportunities.</p>
                                        <button
                                            onClick={() => {
                                                setFilterCategory("all");
                                                setUrgencyFilter("all");
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "myposts" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Header */}
                                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                                                My Donor Posts
                                            </h2>
                                            <p className="text-gray-600">Manage your donation offers and track responses</p>
                                        </div>
                                        <button
                                            onClick={() => setShowDonorPostForm(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
                                        >
                                            <FaPlus className="mr-2" />
                                            Create Donor Post
                                        </button>
                                    </div>

                                    {/* Filter Bar */}
                                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-emerald-100">
                                        <button
                                            onClick={() => setFilterCategory("all")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${filterCategory === "all"
                                                ? "bg-emerald-500 text-white shadow-md"
                                                : "bg-white/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                                                }`}
                                        >
                                            All Posts ({myDonorPosts.length})
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("organs")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "organs"
                                                ? "bg-red-500 text-white shadow-md"
                                                : "bg-white/80 text-red-700 border border-red-200 hover:bg-red-50"
                                                }`}
                                        >
                                            <MdBloodtype className="mr-1" />
                                            Blood/Organs
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("fundraiser")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "fundraiser"
                                                ? "bg-blue-500 text-white shadow-md"
                                                : "bg-white/80 text-blue-700 border border-blue-200 hover:bg-blue-50"
                                                }`}
                                        >
                                            <MdLocalHospital className="mr-1" />
                                            Financial Help
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("medicines")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "medicines"
                                                ? "bg-yellow-500 text-white shadow-md"
                                                : "bg-white/80 text-yellow-700 border border-yellow-200 hover:bg-yellow-50"
                                                }`}
                                        >
                                            <MdMedication className="mr-1" />
                                            Medicines
                                        </button>
                                    </div>
                                </div>

                                {/* Donor Posts Grid */}
                                <div className="space-y-6">
                                    {filteredDonorPosts.map((post, index) => {
                                        const CategoryIcon = getCategoryIcon(post.category);
                                        return (
                                            <motion.div
                                                key={post.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-2xl transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-2xl flex items-center justify-center`}>
                                                            <CategoryIcon className="text-2xl text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-emerald-700 mb-1">{post.title}</h3>
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDonorStatusColor(post.status)}`}>
                                                                    {post.status.toUpperCase()}
                                                                </span>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200`}>
                                                                    {getDonorUrgencyText(post.urgency)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                                                <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                        <FaClock className="text-emerald-400" />
                                                        <span>Posted {formatDate(post.createdAt)}</span>
                                                    </div>

                                                    <div className="flex items-center space-x-6">
                                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                            <FaEye className="text-emerald-400" />
                                                            <span>{post.engagement.views}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                            <FaHeart className="text-red-400" />
                                                            <span>{post.engagement.likes}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                            <FaComment className="text-blue-400" />
                                                            <span>{post.engagement.comments}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                            <FaShare className="text-emerald-400" />
                                                            <span>{post.engagement.shares}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {filteredDonorPosts.length === 0 && (
                                    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                                        <FaHeart className="text-6xl text-emerald-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-emerald-700 mb-2">No Donor Posts Yet</h3>
                                        <p className="text-gray-600 mb-6">Start making a difference by creating your first donation offer.</p>
                                        <button
                                            onClick={() => setShowDonorPostForm(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center mx-auto"
                                        >
                                            <FaPlus className="mr-2" />
                                            Create Your First Post
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "otherdonors" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Header */}
                                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                                                Other Donors
                                            </h2>
                                            <p className="text-gray-600">See what other donors are offering and get inspired</p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {filteredOtherDonorPosts.length} active donor offers
                                        </div>
                                    </div>

                                    {/* Filter Bar */}
                                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-emerald-100">
                                        <button
                                            onClick={() => setFilterCategory("all")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${filterCategory === "all"
                                                ? "bg-emerald-500 text-white shadow-md"
                                                : "bg-white/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                                                }`}
                                        >
                                            All Offers ({otherDonorPosts.length})
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("organs")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "organs"
                                                ? "bg-red-500 text-white shadow-md"
                                                : "bg-white/80 text-red-700 border border-red-200 hover:bg-red-50"
                                                }`}
                                        >
                                            <MdBloodtype className="mr-1" />
                                            Blood/Organs
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("fundraiser")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "fundraiser"
                                                ? "bg-blue-500 text-white shadow-md"
                                                : "bg-white/80 text-blue-700 border border-blue-200 hover:bg-blue-50"
                                                }`}
                                        >
                                            <MdLocalHospital className="mr-1" />
                                            Services/Financial
                                        </button>
                                        <button
                                            onClick={() => setFilterCategory("medicines")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "medicines"
                                                ? "bg-yellow-500 text-white shadow-md"
                                                : "bg-white/80 text-yellow-700 border border-yellow-200 hover:bg-yellow-50"
                                                }`}
                                        >
                                            <MdMedication className="mr-1" />
                                            Medical/Medicines
                                        </button>
                                    </div>
                                </div>

                                {/* Other Donors Posts Grid */}
                                <div className="space-y-6">
                                    {filteredOtherDonorPosts.map((post, index) => {
                                        const CategoryIcon = getCategoryIcon(post.category);
                                        return (
                                            <motion.div
                                                key={post.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-2xl transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-2xl flex items-center justify-center`}>
                                                            <CategoryIcon className="text-2xl text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-emerald-700 mb-1">{post.title}</h3>
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDonorStatusColor(post.status)}`}>
                                                                    {post.status.toUpperCase()}
                                                                </span>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200`}>
                                                                    {getDonorUrgencyText(post.urgency)}
                                                                </span>
                                                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                                    <FaMapMarkerAlt className="text-emerald-400" />
                                                                    <span>{post.location}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                                {post.user.avatar}
                                                            </div>
                                                            <span className="text-sm text-gray-600">{post.user.name}</span>
                                                            {post.user.verified && <MdVerified className="text-emerald-500 text-sm" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                                                <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                            <FaClock className="text-emerald-400" />
                                                            <span>Posted {formatDate(post.createdAt)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                                <FaEye className="text-emerald-400" />
                                                                <span>{post.engagement.views}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                                <FaHeart className="text-red-400" />
                                                                <span>{post.engagement.likes}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                                <FaComment className="text-blue-400" />
                                                                <span>{post.engagement.comments}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-2">
                                                        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                                            Collaborate
                                                        </button>
                                                        <button className="px-4 py-2 text-blue-600 border border-blue-300 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm">
                                                            Message
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {filteredOtherDonorPosts.length === 0 && (
                                    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                                        <FaHeart className="text-6xl text-emerald-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-emerald-700 mb-2">No Other Donor Posts Found</h3>
                                        <p className="text-gray-600 mb-6">Try adjusting your filters to see more donor offers.</p>
                                        <button
                                            onClick={() => setFilterCategory("all")}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                       // Replace the bloodcamps tab section in your donor dashboard with this:

                        {activeTab === "bloodcamps" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Header */}
                                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                                                Blood Donation Camps
                                            </h2>
                                            <p className="text-gray-600">Find nearby camps or organize your own blood drive</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex space-x-2">
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                    {activeCamps.length} Active
                                                </span>
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                                                    {upcomingCamps.length} Upcoming
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setShowBloodCampForm(true)}
                                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
                                            >
                                                <FaPlus className="mr-2" />
                                                Create Blood Camp
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Section */}
                                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-teal-700 mb-2">Interactive Camp Map</h3>
                                            <p className="text-gray-600">Click on markers to view camp details and locations across Sri Lanka</p>
                                        </div>
                                    </div>

                                    {/* Sri Lanka Map */}
                                    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl overflow-hidden border border-emerald-200">
                                        <svg viewBox="0 0 1000 1000" className="w-full h-full">
                                            <path
                                                d={sriLankaMapPath}
                                                fill="rgba(16, 185, 129, 0.1)"
                                                stroke="rgba(16, 185, 129, 0.3)"
                                                strokeWidth="2"
                                                className="hover:fill-emerald-200 transition-all duration-300 cursor-pointer"
                                            />

                                            {/* Blood camp markers */}
                                            {bloodCamps.map((camp) => {
                                                // Simple coordinate projection for Sri Lanka
                                                const projectSriLanka = (lat: number, lng: number): [number, number] => {
                                                    const minLat = 5.7;
                                                    const maxLat = 10.0;
                                                    const minLng = 79.4;
                                                    const maxLng = 81.9;
                                                    const viewBoxHeight = 1000;
                                                    const svgMinX = 180;
                                                    const svgMaxX = 770;
                                                    const usableWidth = svgMaxX - svgMinX;

                                                    const x = svgMinX + ((lng - minLng) / (maxLng - minLng)) * usableWidth;
                                                    const y = viewBoxHeight - ((lat - minLat) / (maxLat - minLat)) * viewBoxHeight;

                                                    return [x, y];
                                                };

                                                const [x, y] = projectSriLanka(camp.coordinates[0], camp.coordinates[1]);

                                                return (
                                                    <g key={camp.id}>
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="8"
                                                            fill={camp.status === "active" ? "#ef4444" : "#f59e0b"}
                                                            stroke="white"
                                                            strokeWidth="2"
                                                            className="hover:r-12 cursor-pointer transition-all duration-200 animate-pulse"
                                                            onClick={() => setSelectedCamp(camp)}
                                                        />
                                                    </g>
                                                );
                                            })}
                                        </svg>

                                        {/* Map Legend */}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                                            <h4 className="font-bold text-teal-700 text-sm mb-2">Legend</h4>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2 text-xs">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                    <span className="text-teal-800">Active Camps</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-xs">
                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                                    <span className="text-teal-800">Upcoming Camps</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Camps Section */}
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

                                {/* Upcoming Camps List */}
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
                                                            <FaPhone className="mr-1 text-emerald-500" />
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
                                            Create First Blood Camp
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "donations" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                                            My Donor Posts
                                        </h2>
                                        <p className="text-gray-600">Manage your donation offers and track responses</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowCardGenerator(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
                                        >
                                            <FaShare className="mr-2" />
                                            Create Shareable Card
                                        </button>
                                        <button
                                            onClick={() => setShowDonorPostForm(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
                                        >
                                            <FaPlus className="mr-2" />
                                            Create Donor Post
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "messages" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8"
                            >
                                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-6">
                                    Messages
                                </h2>
                                <p className="text-gray-600 text-lg">Coming soon! Communicate directly with recipients.</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Components - Place these at the very end, outside all other content */}
            <CreateDonorPost
                isOpen={showDonorPostForm}
                onClose={() => setShowDonorPostForm(false)}
                onSubmit={(postData) => {
                    console.log('New donor post:', postData);
                    // Handle the new post data here - you can add it to your posts array
                    setShowDonorPostForm(false);
                }}
            />

            <CreateBloodCamp
                isOpen={showBloodCampForm}
                onClose={() => setShowBloodCampForm(false)}
                onSubmit={(campData) => {
                    console.log('New blood camp:', campData);
                    // Handle the new camp data here - you can add it to your camps array
                    setShowBloodCampForm(false);
                }}
            />
            <CampDetailsModal
                selectedCamp={selectedCamp}
                setSelectedCamp={setSelectedCamp}
            />
            <DonationCardGenerator
                isOpen={showCardGenerator}
                onClose={() => setShowCardGenerator(false)}
                userType="donor"
                userData={donorUser}
            />
        </div>
    );
}