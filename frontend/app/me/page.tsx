'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaShare, FaHeart } from "react-icons/fa";
import ProfileHeader from "@/components/shared/ProfileHeader";
import Sidebar from "@/components/recipientProfile/Sidebar";
import Filterbar from "@/components/recipientProfile/Filterbar";
import PostsGrid from "@/components/shared/PostsGrid";
import CreateRecipientPost from "@/components/recipientProfile/CreatePostModel";
import { getPostsByUser, RecipientPost, PostCategory } from "@/lib/recipientPosts";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { UserType, Post, Category } from "@/components/types";
import RecipientMessagesTab from "@/components/messages/RecipientMessagesTab";
import RecipientCardGenerator from '@/components/recipientProfile/RecipientCardGenerator';
import { MessagesProvider } from '@/contexts/MessagesContext';

export default function RecipientDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [filterCategory, setFilterCategory] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCardGenerator, setShowCardGenerator] = useState(false);

  // Function to convert RecipientPost to Post
  const mapRecipientPostToPost = (recipientPost: RecipientPost): Post => {
    // Map PostCategory to Category enum
    const mapCategory = (category: PostCategory): Category => {
      switch (category) {
        case 'blood': return Category.BLOOD;
        case 'organs': return Category.ORGANS;
        case 'fundraiser': return Category.FUNDRAISER;
        case 'medicines': return Category.MEDICINES;
        case 'supplies': return Category.SUPPLIES;
        default: return Category.SUPPLIES; // Default fallback
      }
    };

    return {
      id: recipientPost.id,
      title: recipientPost.title,
      category: mapCategory(recipientPost.category),
      content: recipientPost.content,
      createdAt: recipientPost.createdAt,
      status: recipientPost.status,
      urgency: recipientPost.urgency || 'medium',
      engagement: recipientPost.engagement,
      user: {
        id: recipientPost.user.id,
        name: recipientPost.user.name,
        email: recipientPost.user.email,
        avatar: '/images/default-avatar.png', // Default avatar
        verified: true,
        joinedDate: new Date().toISOString().split('T')[0],
        type: UserType.RECIPIENT
      },
      contact: recipientPost.contact || '',
      fundraiserDetails: recipientPost.fundraiserDetails || undefined,
      location: recipientPost.location
    };
  };

  useEffect(() => {
    // Protect the recipient page - only recipients can access
    if (!isLoading && (!isAuthenticated || user?.role !== 'recipient')) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    // Fetch recipient's posts when user is authenticated
    const fetchUserPosts = async () => {
      if (user && user.id) {
        try {
          setIsPostsLoading(true);
          const response = await getPostsByUser(user.id);
          setMyPosts(response.data.map(post => mapRecipientPostToPost(post)));
        } catch (error) {
          console.error("Error fetching user posts:", error);
        } finally {
          setIsPostsLoading(false);
        }
      }
    };

    if (isAuthenticated && user) {
      fetchUserPosts();
    }
  }, [isAuthenticated, user]);

  // Show loading state while checking authentication or loading posts
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
        <div className="text-emerald-700 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // Adapt the user data to match the expected format
  const adaptedUser = {
    ...user,
    avatar: '/images/default-avatar.png', // You can set a default avatar or get it from user data
    verified: true, // You can set this based on your user data
    joinedDate: new Date().toISOString().split('T')[0], // You can get this from user data if available
    type: UserType.RECIPIENT // Since this is the /me page for recipients
  };

  const handlePostCreated = async () => {
    console.log('Post created successfully!');
    // Refresh posts after creating a new one
    if (user && user.id) {
      try {
        setIsPostsLoading(true);
        const response = await getPostsByUser(user.id);
        setMyPosts(response.data.map(post => mapRecipientPostToPost(post)));
      } catch (error) {
        console.error("Error refreshing user posts:", error);
      } finally {
        setIsPostsLoading(false);
      }
    }
  };

  // Filter functions
  const filteredPosts = myPosts.filter(post => {
    const categoryMatch = filterCategory === "all" || post.category === filterCategory;
    const urgencyMatch = urgencyFilter === "all" || post.urgency === urgencyFilter;
    return categoryMatch && urgencyMatch;
  });

  return (
    <MessagesProvider userId={user.id}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
        <ProfileHeader user={adaptedUser} />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <Sidebar user={adaptedUser} activeTab={activeTab} setActiveTab={setActiveTab} />

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
                          My Help Requests
                        </h2>
                        <p className="text-gray-600">Manage your support requests and track engagement</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setShowCardGenerator(true)}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
                        >
                          <FaShare className="mr-2" />
                          Create Help Request Card
                        </button>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
                        >
                          <FaPlus className="mr-2" />
                          Create New Request
                        </button>
                      </div>
                    </div>

                    <Filterbar
                      posts={myPosts}
                      filterCategory={filterCategory}
                      setFilterCategory={setFilterCategory}
                      urgencyFilter={urgencyFilter}
                      setUrgencyFilter={setUrgencyFilter}
                    />
                  </div>

                  {isPostsLoading ? (
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                      <div className="animate-pulse w-16 h-16 rounded-full bg-emerald-400 mx-auto mb-4"></div>
                      <h3 className="text-2xl font-bold text-emerald-700 mb-2">Loading your requests...</h3>
                      <p className="text-gray-600 mb-6">Please wait while we fetch your help requests.</p>
                    </div>
                  ) : (
                    <>
                      <PostsGrid
                        posts={myPosts}
                        filterCategory={filterCategory}
                      />

                      {filteredPosts.length === 0 && (
                        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                          <FaHeart className="text-6xl text-emerald-400 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-emerald-700 mb-2">No Help Requests Found</h3>
                          <p className="text-gray-600 mb-6">
                            {myPosts.length === 0
                              ? "You haven't created any help requests yet. Start by creating your first request to get the support you need."
                              : "Try adjusting your filters to see more of your requests."
                            }
                          </p>
                          {myPosts.length === 0 ? (
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center mx-auto"
                            >
                              <FaPlus className="mr-2" />
                              Create Your First Request
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setFilterCategory("all");
                                setUrgencyFilter("all");
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                            >
                              Clear All Filters
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-6">
                      Request Analytics
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-blue-800">Total Requests</h3>
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{myPosts.length}</span>
                          </div>
                        </div>
                        <p className="text-blue-600 text-sm">Lifetime help requests created</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-green-800">Active Requests</h3>
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {myPosts.filter(post => post.status === 'pending').length}
                            </span>
                          </div>
                        </div>
                        <p className="text-green-600 text-sm">Currently seeking help</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-purple-800">Total Engagement</h3>
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {myPosts.reduce((total, post) => total + (post.engagement?.likes || 0) + (post.engagement?.shares || 0), 0)}
                            </span>
                          </div>
                        </div>
                        <p className="text-purple-600 text-sm">Likes and shares received</p>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200">
                      <h4 className="text-lg font-bold text-emerald-800 mb-4">Quick Actions</h4>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setShowCardGenerator(true)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                        >
                          <FaShare className="mr-2" />
                          Create Shareable Card
                        </button>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center"
                        >
                          <FaPlus className="mr-2" />
                          New Request
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "messages" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <RecipientMessagesTab userId={user.id} />
                </motion.div>
              )}

              {activeTab === "help" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-6">
                      Help & Support
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Getting Started</h3>
                        <div className="space-y-3">
                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <h4 className="font-bold text-emerald-800 mb-2">1. Create Your Request</h4>
                            <p className="text-emerald-700 text-sm">Start by creating a detailed help request with all necessary information including urgency level and contact details.</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-2">2. Share Your Request</h4>
                            <p className="text-blue-700 text-sm">Use our card generator to create professional shareable cards for WhatsApp, social media, and other platforms.</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <h4 className="font-bold text-purple-800 mb-2">3. Track Responses</h4>
                            <p className="text-purple-700 text-sm">Monitor engagement and respond to potential helpers through our messaging system.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Best Practices</h3>
                        <div className="space-y-3">
                          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <h4 className="font-bold text-yellow-800 mb-2">Be Specific</h4>
                            <p className="text-yellow-700 text-sm">Include detailed information about what you need, when you need it, and how people can help.</p>
                          </div>
                          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <h4 className="font-bold text-red-800 mb-2">Set Urgency Correctly</h4>
                            <p className="text-red-700 text-sm">Use the right urgency level to help prioritize your request appropriately.</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <h4 className="font-bold text-green-800 mb-2">Stay Responsive</h4>
                            <p className="text-green-700 text-sm">Check your messages regularly and respond promptly to potential helpers.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Need More Help?</h4>
                      <p className="text-gray-600 mb-4">If you have questions or need assistance, our support team is here to help.</p>
                      <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Components */}
        <CreateRecipientPost
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPostCreated={handlePostCreated}
        />

        <RecipientCardGenerator
          isOpen={showCardGenerator}
          onClose={() => setShowCardGenerator(false)}
          userType="recipient"
          userData={adaptedUser}
        />
      </div>
    </MessagesProvider>

  );
}