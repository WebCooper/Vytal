'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaHandHoldingHeart } from "react-icons/fa";
import ProfileHeader from "@/components/shared/ProfileHeader";
import Sidebar from "@/components/donorProfile/Sidebar";
import Filterbar from "@/components/donorProfile/Filterbar";
import DonationGrid from "@/components/donorProfile/DonationGrid";
import { donationOpportunities, user, myDonations } from "../mockData";

export default function DonorDashboard() {
    const [activeTab, setActiveTab] = useState("browse");
    const [filterCategory, setFilterCategory] = useState("all");

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
            <ProfileHeader user={user} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === "browse" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Header Actions */}
                                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                                                Donation Opportunities
                                            </h2>
                                            <p className="text-gray-600">Find recipients who need your support</p>
                                        </div>
                                        <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center">
                                            <FaSearch className="mr-2" />
                                            Search Locations
                                        </button>
                                    </div>

                                    <Filterbar
                                        posts={donationOpportunities}
                                        filterCategory={filterCategory}
                                        setFilterCategory={setFilterCategory}
                                    />
                                </div>

                                <DonationGrid
                                    posts={donationOpportunities}
                                    filterCategory={filterCategory}
                                    setFilterCategory={setFilterCategory}

                                />

                            </motion.div>
                        )}

                        {activeTab === "myDonations" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                                                My Donations
                                            </h2>
                                            <p className="text-gray-600">Track your contributions and impact</p>
                                        </div>
                                        <div className="bg-emerald-500/10 px-4 py-2 rounded-full">
                                            <p className="text-emerald-800 font-bold">
                                                Total Impact: <span className="text-2xl">42</span> donations
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {myDonations.map(donation => (
                                        <motion.div
                                            key={donation.id}
                                            whileHover={{ y: -5 }}
                                            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-white/30"
                                        >
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-lg text-gray-800">{donation.title}</h3>
                                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                                        {donation.status}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 text-sm mb-4">{donation.description}</p>

                                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                    <div className="flex items-center">
                                                        <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8" />
                                                        <span className="ml-2 text-sm font-medium text-gray-700">
                                                            {donation.recipient}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Donated on</p>
                                                        <p className="text-sm font-medium text-emerald-700">{donation.date}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "impact" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8"
                            >
                                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-6">
                                    My Impact
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
                                        <h3 className="text-lg font-bold mb-2">Total Donations</h3>
                                        <p className="text-4xl font-extrabold">42</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-2xl p-5 text-white shadow-lg">
                                        <h3 className="text-lg font-bold mb-2">People Helped</h3>
                                        <p className="text-4xl font-extrabold">127</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-200 to-emerald-400 rounded-2xl p-5 text-white shadow-lg">
                                        <h3 className="text-lg font-bold mb-2">Carbon Saved</h3>
                                        <p className="text-4xl font-extrabold">328kg</p>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                                    <h3 className="font-bold text-emerald-800 text-xl mb-4 flex items-center">
                                        <FaHandHoldingHeart className="mr-2" />
                                        Recent Impact Story
                                    </h3>
                                    <p className="text-gray-700 mb-3">
                                        "Your donation of fresh vegetables helped feed 15 families at the local shelter
                                        last week. The children especially loved the organic carrots!"
                                    </p>
                                    <p className="text-sm text-emerald-700 font-medium">
                                        - Maria, Community Kitchen Coordinator
                                    </p>
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
        </div>
    );
}