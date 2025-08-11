'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import ProfileHeader from "@/components/recipientProfile/ProfileHeader";
import Sidebar from "@/components/recipientProfile/Sidebar";
import Filterbar from "@/components/recipientProfile/Filterbar";
import PostsGrid from "@/components/recipientProfile/PostsGrid";

export default function RecipientDashboard() {
  const [activeTab, setActiveTab] = useState("posts");
  const [filterCategory, setFilterCategory] = useState("all");

  // Mock user data
  const user = {
    id: "1",
    email: "sarah@mail.com",
    name: "Sarah Chen",
    avatar: "SC",
    verified: true,
    joinedDate: "March 2024"
  };

  // Mock posts data
  const posts = [
    {
      id: 1,
      title: "Urgent: Need LKR 1,000,000 for Emergency Surgery",
      category: "funding",
      content: "Hello everyone, I'm scheduled for an emergency surgery and need LKR 1,000,000. The surgery is at City General Hospital. Please reach out if you can help or know someone who can.",
      createdAt: "2024-01-15T10:30:00Z",
      status: "active",
      engagement: {
        views: 247,
        likes: 23,
        comments: 8,
        shares: 12
      },
      urgency: "high"
    },
    {
      id: 2,
      title: "Looking for Kidney Donor - Living Donor Needed",
      category: "organs",
      content: "Hi, I'm a 34-year-old teacher with end-stage kidney disease. I'm looking for a living kidney donor. I have a great support system and am committed to following all medical protocols. Please message me if you'd like to learn more about the process.",
      createdAt: "2024-01-10T14:20:00Z",
      status: "active",
      engagement: {
        views: 892,
        likes: 67,
        comments: 34,
        shares: 28
      },
      urgency: "high"
    },
    {
      id: 3,
      title: "Seeking Insulin Donations - Type 1 Diabetic",
      category: "medicines",
      content: "I'm a college student with Type 1 diabetes struggling to afford insulin. If anyone has extra supplies or knows of assistance programs, I would be incredibly grateful for any help.",
      createdAt: "2024-01-08T09:15:00Z",
      status: "fulfilled",
      engagement: {
        views: 456,
        likes: 89,
        comments: 23,
        shares: 15
      },
      urgency: "medium"
    },
    {
      id: 4,
      title: "Looking for Kidney Donor - Living Donor Needed",
      category: "organs",
      content: "My daughter has a rare blood type AB- and needs regular transfusions due to her condition. We're always looking for donors who can help. Located in downtown area.",
      createdAt: "2024-01-05T16:45:00Z",
      status: "active",
      engagement: {
        views: 623,
        likes: 45,
        comments: 19,
        shares: 22
      },
      urgency: "medium"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      <ProfileHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

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
                    posts={posts} 
                    filterCategory={filterCategory} 
                    setFilterCategory={setFilterCategory}
                  />
                </div>

                <PostsGrid
                  posts={posts} 
                  filterCategory={filterCategory}
                />

              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8"
              >
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-6">
                  Analytics Dashboard
                </h2>
                <p className="text-gray-600 text-lg">Coming soon! Track your post performance and engagement metrics.</p>
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