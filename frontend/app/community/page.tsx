'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/shared/ProfileHeader";
import TabNavigation from "@/components/community/TabNavigation";
import PostsGrid from "@/components/shared/PostsGrid";
import MapSection from "@/components/bloodCamps/MapSection";
import CampDetailsModal from "@/components/bloodCamps/CampDetailsModal";
import { BloodCamp, Post, Category, UserType } from "@/components/types";
import { bloodCamps } from "../mockData"; // Keep mock data for blood camps for now
import Filterbar from "@/components/shared/Filterbar";
import CampsSection from "@/components/bloodCamps/CampsSection";
import { getAllRecipientPosts, getAllDonorPosts } from "@/lib/communityApi";
import { useAuth } from "@/contexts/AuthContext";

export default function CommunityPage() {
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
  const [showBloodCampForm, setShowBloodCampForm] = useState(false);

  // Mapping functions to convert backend data to frontend Post format
  const mapRecipientPostToPost = (recipientPost: any): Post => {
    const mapCategory = (category: string): Category => {
      switch(category.toLowerCase()) {
        case 'blood': return Category.BLOOD;
        case 'organs': return Category.ORGANS;
        case 'fundraiser': return Category.FUNDRAISER;
        case 'medicines': return Category.MEDICINES;
        case 'supplies': return Category.SUPPLIES;
        default: return Category.SUPPLIES;
      }
    };
    
    return {
      id: recipientPost.id,
      title: recipientPost.title,
      category: mapCategory(recipientPost.category),
      content: recipientPost.content,
      createdAt: recipientPost.created_at || recipientPost.createdAt,
      status: recipientPost.status,
      urgency: recipientPost.urgency || 'medium',
      engagement: {
        views: recipientPost.views || 0,
        likes: recipientPost.likes || 0,
        comments: recipientPost.comments || 0,
        shares: recipientPost.shares || 0
      },
      user: {
        id: recipientPost.recipient_id,
        name: recipientPost.user?.name || 'Anonymous User',
        email: recipientPost.user?.email || '',
        avatar: '/images/default-avatar.png',
        verified: true,
        joinedDate: new Date().toISOString().split('T')[0],
        type: UserType.RECIPIENT
      },
      contact: recipientPost.contact || '',
      fundraiserDetails: recipientPost.goal ? {
        goal: recipientPost.goal,
        received: recipientPost.received || 0
      } : undefined,
      location: recipientPost.location
    };
  };

  const mapDonorPostToPost = (donorPost: any): Post => {
    const mapCategory = (category: string): Category => {
      switch(category.toLowerCase()) {
        case 'blood': return Category.BLOOD;
        case 'organs': return Category.ORGANS;
        case 'fundraiser': return Category.FUNDRAISER;
        case 'medicines': return Category.MEDICINES;
        case 'supplies': return Category.SUPPLIES;
        default: return Category.SUPPLIES;
      }
    };
    
    return {
      id: donorPost.id,
      title: donorPost.title,
      category: mapCategory(donorPost.category),
      content: donorPost.content,
      createdAt: donorPost.createdAt,
      status: donorPost.status,
      urgency: donorPost.urgency || 'medium',
      engagement: donorPost.engagement || {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0
      },
      user: {
        id: donorPost.donor_id,
        name: donorPost.user?.name || 'Anonymous Donor',
        email: donorPost.user?.email || '',
        avatar: '/images/default-avatar.png',
        verified: true,
        joinedDate: new Date().toISOString().split('T')[0],
        type: UserType.DONOR
      },
      contact: donorPost.contact || '',
      location: donorPost.location
    };
  };

  // Fetch all community posts
  const fetchCommunityPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both recipient and donor posts in parallel
      const [recipientResponse, donorResponse] = await Promise.all([
        getAllRecipientPosts().catch(err => {
          console.warn('Failed to fetch recipient posts:', err);
          return { data: [], total: 0, timestamp: '' };
        }),
        getAllDonorPosts().catch(err => {
          console.warn('Failed to fetch donor posts:', err);
          return { data: [], total: 0, timestamp: '' };
        })
      ]);
      
      // Map and combine posts
      const recipientPosts = recipientResponse.data.map(mapRecipientPostToPost);
      const donorPosts = donorResponse.data.map(mapDonorPostToPost);
      
      // Combine and sort by creation date (newest first)
      const combined = [...recipientPosts, ...donorPosts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAllPosts(combined);
      
    } catch (error) {
      console.error('Error fetching community posts:', error);
      setError('Failed to load community posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load posts on component mount
  useEffect(() => {
    fetchCommunityPosts();
  }, []);

  // Filter posts based on selected filters
  const filteredPosts = allPosts.filter(post => {
    const categoryMatch = filterCategory === "all" || post.category === filterCategory;
    const urgencyMatch = filterUrgency === "all" || post.urgency === filterUrgency;
    return categoryMatch && urgencyMatch;
  });

  // Default user for header (you can customize this)
  const defaultUser = user ? {
    ...user,
    avatar: '/images/default-avatar.png',
    verified: true,
    joinedDate: new Date().toISOString().split('T')[0],
    type: UserType.RECIPIENT
  } : {
    id: 0,
    name: 'Community User',
    email: '',
    avatar: '/images/default-avatar.png',
    verified: true,
    joinedDate: new Date().toISOString().split('T')[0],
    type: UserType.RECIPIENT
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      <ProfileHeader user={defaultUser} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "posts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>{error}</p>
                <button 
                  onClick={fetchCommunityPosts}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading community posts...</p>
              </div>
            )}

            {/* Content */}
            {!isLoading && !error && (
              <>
                <Filterbar 
                  filterCategory={filterCategory} 
                  setFilterCategory={setFilterCategory} 
                  urgencyFilter={filterUrgency} 
                  setUrgencyFilter={setFilterUrgency} 
                  posts={filteredPosts} 
                />
                
                {filteredPosts.length === 0 ? (
                  <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                    <p className="text-gray-600 text-lg">No posts found matching your filters.</p>
                    <button 
                      onClick={() => {
                        setFilterCategory("all");
                        setFilterUrgency("all");
                      }}
                      className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <PostsGrid posts={filteredPosts} filterCategory={filterCategory} />
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === "camps" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <MapSection bloodCamps={bloodCamps} setSelectedCamp={setSelectedCamp} />
            <CampsSection 
              bloodCamps={bloodCamps} 
              setSelectedCamp={setSelectedCamp} 
              showBloodCampForm={showBloodCampForm} 
              setShowBloodCampForm={setShowBloodCampForm} 
            />
          </motion.div>
        )}
      </div>

      <CampDetailsModal selectedCamp={selectedCamp} setSelectedCamp={setSelectedCamp} />
    </div>
  );
}