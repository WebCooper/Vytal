'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import ProfileHeader from "@/components/shared/ProfileHeader";
import Sidebar from "@/components/recipientProfile/Sidebar";
import Filterbar from "@/components/recipientProfile/Filterbar";
import PostsGrid from "@/components/shared/PostsGrid";
import { myPosts, recipientUser } from "../mockData"; // get myPosts from API

export default function RecipientDashboard() {
  const [activeTab, setActiveTab] = useState("posts");
  const [filterCategory, setFilterCategory] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      <ProfileHeader user={recipientUser} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <Sidebar user={recipientUser} activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "posts" && (
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
                        My Posts
                      </h2>
                      <p className="text-gray-600">Manage your support requests and track engagement</p>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center">
                      <FaPlus className="mr-2" />
                      Create New Post
                    </button>
                  </div>

                  <Filterbar 
                    posts={myPosts} 
                    filterCategory={filterCategory} 
                    setFilterCategory={setFilterCategory}
                    urgencyFilter={urgencyFilter}
                    setUrgencyFilter={setUrgencyFilter}
                  />
                </div>

                <PostsGrid
                  posts={myPosts} 
                  filterCategory={filterCategory}
                />

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
                <p className="text-gray-600 text-lg">Coming soon! Communicate directly with potential donors.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}