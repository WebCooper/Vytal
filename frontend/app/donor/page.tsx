'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaHeart, FaShare } from "react-icons/fa";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { bloodCamps, donorUser, myDonorPosts, recipientPosts } from "../mockData";
import CreateDonorPost from "@/components/donorProfile/CreateDonorPost";
import CampDetailsModal from "@/components/bloodCamps/CampDetailsModal";
import { BloodCamp } from "@/components/types";
import Sidebar from "@/components/donorProfile/Sidebar";
import Filterbar from "@/components/shared/Filterbar";
import PostsGrid from "@/components/shared/PostsGrid";
import MapSection from "@/components/bloodCamps/MapSection";
import CampsSection from "@/components/bloodCamps/CampsSection";
import GamificationDashboard from "@/components/gamification/GamificationDashboard";

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
            <ProfileHeader user={donorUser} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    <Sidebar user={donorUser} activeTab={activeTab} setActiveTab={setActiveTab} />

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
                                    <Filterbar 
                                        posts={recipientPosts} 
                                        filterCategory={filterCategory} 
                                        setFilterCategory={setFilterCategory}
                                        urgencyFilter={urgencyFilter}
                                        setUrgencyFilter={setUrgencyFilter}
                                    />
                                </div>
                                <PostsGrid posts={recipientPosts} filterCategory={filterCategory} />

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

                                    <Filterbar 
                                        posts={myDonorPosts} 
                                        filterCategory={filterCategory} 
                                        setFilterCategory={setFilterCategory}
                                        urgencyFilter={urgencyFilter}
                                        setUrgencyFilter={setUrgencyFilter}
                                    />
                                </div>

                                <PostsGrid posts={myDonorPosts} filterCategory={filterCategory} />

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

                                <MapSection bloodCamps={bloodCamps} setSelectedCamp={setSelectedCamp} />
                                <CampsSection bloodCamps={bloodCamps} setSelectedCamp={setSelectedCamp} showBloodCampForm={showBloodCampForm} setShowBloodCampForm={setShowBloodCampForm} />

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
                                            // onClick={() => setShowCardGenerator(true)}
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

                        {activeTab === "analytics" && (
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
                        {activeTab === "rewards" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <GamificationDashboard user={donorUser} />
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
            <CampDetailsModal
                selectedCamp={selectedCamp}
                setSelectedCamp={setSelectedCamp}
            />
            {/* <DonationCardGenerator
                isOpen={showCardGenerator}
                onClose={() => setShowCardGenerator(false)}
                userType="donor"
                userData={donorUser}
            /> */}
        </div>
    );
}