"use client";
import React, { useState} from "react";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/shared/ProfileHeader";
import TabNavigation from "@/components/community/TabNavigation";
import PostsGrid from "@/components/shared/PostsGrid";
import MapSection from "@/components/bloodCamps/MapSection";
import CampDetailsModal from "@/components/bloodCamps/CampDetailsModal";
import { BloodCamp } from "@/components/types";
import { bloodCamps, recipientPosts, myDonorPosts, donorPosts, recipientUser, myRecipientPosts } from "../mockData";
import Filterbar from "@/components/shared/Filterbar";
import CampsSection from "@/components/bloodCamps/CampsSection";

export default function CommunityPage() {
  const allPosts = [...myDonorPosts, ...donorPosts, ...recipientPosts, ...myRecipientPosts];
  const [activeTab, setActiveTab] = useState("posts");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
  const [showBloodCampForm, setShowBloodCampForm] = useState(false);

  const filteredPosts = allPosts.filter(post => {
    const categoryMatch = filterCategory === "all" || post.category === filterCategory;
    const urgencyMatch = filterUrgency === "all" || post.urgency === filterUrgency;
    return categoryMatch && urgencyMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      <ProfileHeader user={recipientUser} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "posts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Filterbar filterCategory={filterCategory} setFilterCategory={setFilterCategory} urgencyFilter={filterUrgency} setUrgencyFilter={setFilterUrgency} posts={filteredPosts} />
            <PostsGrid posts={filteredPosts} filterCategory={filterCategory} />
          </motion.div>
        )}

        {activeTab === "camps" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <MapSection bloodCamps={bloodCamps} setSelectedCamp={setSelectedCamp} />
            <CampsSection bloodCamps={bloodCamps} setSelectedCamp={setSelectedCamp} showBloodCampForm={showBloodCampForm} setShowBloodCampForm={setShowBloodCampForm} />
          </motion.div>
        )}
      </div>

      <CampDetailsModal selectedCamp={selectedCamp} setSelectedCamp={setSelectedCamp} />

    </div>
  );
}