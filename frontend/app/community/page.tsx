"use client";
import React, { useState} from "react";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/shared/ProfileHeader";
import TabNavigation from "@/components/community/TabNavigation";
import FilterSection from "@/components/community/FilterSection";
import PostsGrid from "@/components/community/PostsGrid";
import MapSection from "@/components/community/MapSection";
import CampsList from "@/components/community/CampsList";
import CampDetailsModal from "@/components/community/CampDetailsModal";
import { BloodCamp } from "@/components/types";
import { bloodCamps, recipientPosts, user } from "../mockData";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);

  const filteredPosts = recipientPosts.filter(post => {
    const categoryMatch = filterCategory === "all" || post.category === filterCategory;
    const urgencyMatch = filterUrgency === "all" || post.urgency === filterUrgency;
    return categoryMatch && urgencyMatch;
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      <ProfileHeader user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "posts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <FilterSection filterCategory={filterCategory} setFilterCategory={setFilterCategory} filterUrgency={filterUrgency} setFilterUrgency={setFilterUrgency} filteredPosts={filteredPosts} />
            <PostsGrid filteredPosts={filteredPosts} />
          </motion.div>
        )}

        {activeTab === "camps" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <MapSection bloodCamps={bloodCamps} setSelectedCamp={setSelectedCamp} />
            <CampsList bloodCamps={bloodCamps} selectedCamp={selectedCamp} setSelectedCamp={setSelectedCamp} />
          </motion.div>
        )}
      </div>

      <CampDetailsModal selectedCamp={selectedCamp} setSelectedCamp={setSelectedCamp} />

    </div>
  );
}