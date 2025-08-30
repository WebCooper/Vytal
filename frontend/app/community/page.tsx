'use client';
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import TabNavigation from "@/components/community/TabNavigation";
import PostsGrid from "@/components/shared/PostsGrid";
import MapSection from "@/components/bloodCamps/MapSection";
import CampDetailsModal from "@/components/bloodCamps/CampDetailsModal";
import { BloodCamp, Post, Category, UserType } from "@/components/types";
import Filterbar from "@/components/shared/Filterbar";
import CampsSection from "@/components/bloodCamps/CampsSection";
import { getAllRecipientPosts, getAllDonorPosts } from "@/lib/communityApi";
import { useAuth } from "@/contexts/AuthContext";
import { getAllBloodCamps } from "@/lib/bloodCampsApi";
import { RecipientPostResponse, DonorPostResponse } from "@/lib/types";

export default function CommunityPage() {
  const { user } = useAuth();
  const [recipientPosts, setRecipientPosts] = useState<Post[]>([]);
  const [donorPosts, setDonorPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
  const [showBloodCampForm, setShowBloodCampForm] = useState(false);
  const [bloodCampsList, setBloodCampsList] = useState<BloodCamp[]>([]);

  const mapRecipientPostToPost = (recipientPost: unknown): Post => {
    const post = recipientPost as RecipientPostResponse;

    const mapCategory = (category: string): Category => {
      switch (category.toLowerCase()) {
        case 'blood': return Category.BLOOD;
        case 'organs': return Category.ORGANS;
        case 'fundraiser': return Category.FUNDRAISER;
        case 'medicines': return Category.MEDICINES;
        case 'supplies': return Category.SUPPLIES;
        default: return Category.SUPPLIES;
      }
    };

    return {
      id: post.id,
      title: post.title,
      category: mapCategory(post.category),
      content: post.content,
      createdAt: post.created_at || post.createdAt || new Date().toISOString(),
      status: post.status,
      urgency: post.urgency || 'medium',
      engagement: {
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0
      },
      user: {
        id: post.recipient_id,
        name: post.user?.name || 'Anonymous User',
        email: post.user?.email || '',
        avatar: '/images/default-avatar.png',
        verified: true,
        joinedDate: new Date().toISOString().split('T')[0],
        type: UserType.RECIPIENT
      },
      contact: post.contact || '',
      fundraiserDetails: post.goal ? {
        goal: post.goal,
        received: post.received || 0
      } : undefined,
      location: post.location
    };
  };

  const mapDonorPostToPost = (donorPost: unknown): Post => {
    const post = donorPost as DonorPostResponse;

    const mapCategory = (category: string): Category => {
      switch (category.toLowerCase()) {
        case 'blood': return Category.BLOOD;
        case 'organs': return Category.ORGANS;
        case 'fundraiser': return Category.FUNDRAISER;
        case 'medicines': return Category.MEDICINES;
        case 'supplies': return Category.SUPPLIES;
        default: return Category.SUPPLIES;
      }
    };

    return {
      id: post.id,
      title: post.title,
      category: mapCategory(post.category),
      content: post.content,
      createdAt: post.created_at || post.createdAt || new Date().toISOString(),
      status: post.status,
      urgency: 'medium',
      engagement: {
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0
      },
      user: {
        id: post.donor_id,
        name: post.user?.name || 'Anonymous Donor',
        email: post.user?.email || '',
        avatar: '/images/default-avatar.png',
        verified: true,
        joinedDate: new Date().toISOString().split('T')[0],
        type: UserType.DONOR
      },
      contact: post.contact || '',
      location: post.location
    };
  };

  const fetchCommunityData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch recipient posts, donor posts, and blood camps in parallel
      const [recipientResponse, donorResponse, bloodCampsResponse] = await Promise.all([
        getAllRecipientPosts().catch(err => {
          console.warn('Failed to fetch recipient posts:', err);
          return { data: [], total: 0, timestamp: '' };
        }),
        getAllDonorPosts().catch(err => {
          console.warn('Failed to fetch donor posts:', err);
          return { data: [], total: 0, timestamp: '' };
        }),
        getAllBloodCamps().catch(err => {
          console.warn('Failed to fetch blood camps:', err);
          return { data: [], total: 0, timestamp: '' };
        })
      ]);

      // Map and set posts
      const mappedRecipientPosts = recipientResponse.data.map((post) => mapRecipientPostToPost(post))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const mappedDonorPosts = donorResponse.data.map((post) => mapDonorPostToPost(post))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRecipientPosts(mappedRecipientPosts);
      setDonorPosts(mappedDonorPosts);
      setBloodCampsList(bloodCampsResponse.data);

    } catch (error) {
      console.error('Error fetching community data:', error);
      setError('Failed to load community data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');

      // Set active tab if a valid tab is provided in URL
      if (tabParam && ['requests', 'donations', 'camps'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }

    fetchCommunityData();
  }, [fetchCommunityData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCommunityData();
    }, 60000); // every 7 seconds
    return () => clearInterval(intervalId);
  }, [fetchCommunityData]);

  // Filter recipient posts based on selected filters
  const filteredRecipientPosts = recipientPosts.filter(post => {
    const categoryMatch = filterCategory === "all" || post.category === filterCategory;
    const urgencyMatch = filterUrgency === "all" || post.urgency === filterUrgency;
    return categoryMatch && urgencyMatch;
  });

  // Filter donor posts based on selected filters
  const filteredDonorPosts = donorPosts.filter(post => {
    const categoryMatch = filterCategory === "all" || post.category === filterCategory;
    const urgencyMatch = filterUrgency === "all" || post.urgency === filterUrgency;
    return categoryMatch && urgencyMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mt-6">
              <p>{error}</p>
              <button
                onClick={fetchCommunityData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {isLoading && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center mt-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading community data...</p>
            </div>
          )}

          {!isLoading && !error && activeTab === "requests" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-6"
            >
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">Help Requests</h2>
                <p className="text-gray-600 mb-6">Browse requests from recipients who need your support</p>

                <Filterbar
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  urgencyFilter={filterUrgency}
                  setUrgencyFilter={setFilterUrgency}
                  posts={recipientPosts}
                />

                {filteredRecipientPosts.length === 0 ? (
                  <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/30 p-8 text-center mt-6">
                    <p className="text-gray-600 text-lg">No help requests found matching your filters.</p>
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
                  <PostsGrid posts={filteredRecipientPosts} filterCategory={filterCategory} />
                )}
              </div>
            </motion.div>
          )}

          {!isLoading && !error && activeTab === "donations" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-6"
            >
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">Available Donations</h2>
                <p className="text-gray-600 mb-6">Browse donations from donors ready to help</p>

                <Filterbar
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  urgencyFilter={filterUrgency}
                  setUrgencyFilter={setFilterUrgency}
                  posts={donorPosts}
                />

                {filteredDonorPosts.length === 0 ? (
                  <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/30 p-8 text-center mt-6">
                    <p className="text-gray-600 text-lg">No donation offers found matching your filters.</p>
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
                  <PostsGrid posts={filteredDonorPosts} filterCategory={filterCategory} />
                )}
              </div>
            </motion.div>
          )}

          {!isLoading && !error && activeTab === "camps" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-6"
            >
              <MapSection bloodCamps={bloodCampsList} setSelectedCamp={setSelectedCamp} />
              <CampsSection
                bloodCamps={bloodCampsList}
                setSelectedCamp={setSelectedCamp}
                showBloodCampForm={showBloodCampForm}
                setShowBloodCampForm={setShowBloodCampForm}
                onCampCreated={fetchCommunityData}
              />
            </motion.div>
          )}
        </div>
      </div>

      <CampDetailsModal
        selectedCamp={selectedCamp}
        setSelectedCamp={setSelectedCamp}
        userId={user?.id || 0}
        onRegistrationSuccess={fetchCommunityData}
      />
      <Footer />
    </div>
  );
}