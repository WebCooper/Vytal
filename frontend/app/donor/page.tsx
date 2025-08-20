'use client';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaHeart, FaShare } from "react-icons/fa";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { myDonorPosts } from "../mockData";
import { getAllPosts, RecipientPost } from "@/lib/recipientPosts";
import { useAuth } from "@/contexts/AuthContext";
import { Category, Post, UserType } from "@/components/types";
import { useRouter } from "next/navigation";
import CreateDonorPost from "@/components/donorProfile/donorPost/CreateDonorPost";
import CampDetailsModal from "@/components/bloodCamps/CampDetailsModal";
import Sidebar from "@/components/donorProfile/Sidebar";
import Filterbar from "@/components/shared/Filterbar";
import PostsGrid from "@/components/shared/PostsGrid";
import MapSection from "@/components/bloodCamps/MapSection";
import CampsSection from "@/components/bloodCamps/CampsSection";
import GamificationDashboard from "@/components/donorProfile/achievements/GamificationDashboard";
import DonorCardGenerator from "@/components/donorProfile/DonorCardGenerator/DonorCardGenerator";
import { getAllBloodCamps } from '@/lib/bloodCampsApi';
import { BloodCamp } from "@/components/types";
import { getDonorPostsByUser, DonorPost } from "@/lib/donorPosts";
import DonorMessagesTab from "@/components/messages/DonorMessagesTab";
import { MessagesProvider } from '@/contexts/MessagesContext';

// Helper function to map RecipientPost to Post type
const mapRecipientPostToPost = (post: RecipientPost): Post => {
    // Map category string to Category enum
    const mapCategory = (category: string): Category => {
        switch (category) {
            case 'blood': return Category.BLOOD;
            case 'organs': return Category.ORGANS;
            case 'fundraiser': return Category.FUNDRAISER;
            case 'medicines': return Category.MEDICINES;
            case 'supplies': return Category.SUPPLIES;
            default: return Category.BLOOD;
        }
    };

    const userType = post.user.role === 'donor' ? UserType.DONOR : UserType.RECIPIENT;

    return {
        id: post.id,
        title: post.title,
        content: post.content,
        category: mapCategory(post.category),
        status: post.status,
        urgency: post.urgency || 'medium',
        createdAt: post.createdAt,
        engagement: post.engagement,
        user: {
            id: post.user.id,
            name: post.user.name,
            email: post.user.email,
            avatar: post.user.name.substring(0, 2).toUpperCase(), // Using initials as avatar
            verified: true,
            joinedDate: new Date().toISOString().split('T')[0],
            type: userType
        },
        contact: post.contact || '',
        location: post.location,
        fundraiserDetails: post.fundraiserDetails || undefined
    };
};

// Helper function to map DonorPost to Post type
const mapDonorPostToPost = (post: DonorPost, user: { id: number; name: string; email: string; role?: string }): Post => {
    // Map category enum to Category enum
    const mapCategory = (category: string): Category => {
        switch (category) {
            case 'blood': return Category.BLOOD;
            case 'organs': return Category.ORGANS;
            case 'fundraiser': return Category.FUNDRAISER;
            case 'medicines': return Category.MEDICINES;
            case 'supplies': return Category.SUPPLIES;
            default: return Category.BLOOD;
        }
    };

    return {
        id: post.id,
        title: post.title,
        content: post.content,
        category: mapCategory(post.category),
        status: post.status,
        urgency: post.urgency,
        createdAt: post.createdAt,
        engagement: post.engagement,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.name?.substring(0, 2).toUpperCase() || 'U',
            verified: true,
            joinedDate: new Date().toISOString().split('T')[0],
            type: UserType.DONOR
        },
        contact: post.contact,
        location: post.location,
        // Add fundraiser details if available
        fundraiserDetails: post.fundraiserOffering ? {
            goal: post.fundraiserOffering.maxAmount,
            received: 0, // Default since API doesn't provide this
        } : undefined
    };
};

export default function DonorDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("explore");
    const [filterCategory, setFilterCategory] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [showDonorPostForm, setShowDonorPostForm] = useState(false);
    const [showBloodCampForm, setShowBloodCampForm] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
    const [showCardGenerator, setShowCardGenerator] = useState(false);
    const [recipientPosts, setRecipientPosts] = useState<Post[]>([]);
    const [donorPosts, setDonorPosts] = useState<Post[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [isLoadingDonorPosts, setIsLoadingDonorPosts] = useState(true);

    // Blood camps state
    const [bloodCamps, setBloodCamps] = useState<BloodCamp[]>([]);
    const [isLoadingCamps, setIsLoadingCamps] = useState(true);

    useEffect(() => {
        // Protect the donor page
        if (!isLoading && (!isAuthenticated || user?.role !== 'donor')) {
            router.push('/auth/signin');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Fetch recipient posts from API
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoadingPosts(true);
                const response = await getAllPosts();
                if (response && response.data) {
                    // Map the API response to the Post type expected by our components
                    const mappedPosts = response.data.map(post => mapRecipientPostToPost(post));
                    setRecipientPosts(mappedPosts);
                }
            } catch (error) {
                console.error("Error fetching recipient posts:", error);
            } finally {
                setIsLoadingPosts(false);
            }
        };

        if (isAuthenticated && user) {
            fetchPosts();
        }
    }, [isAuthenticated, user]);

    // Fetch donor posts from API when user navigates to "myposts" tab
    useEffect(() => {
        const fetchDonorPosts = async () => {
            if (activeTab !== 'myposts' || !user?.id) return;

            try {
                setIsLoadingDonorPosts(true);
                const response = await getDonorPostsByUser(user.id);
                if (response && response.data) {
                    // Map the API response to the Post type expected by our components
                    const mappedPosts = response.data.map(post => mapDonorPostToPost(post, user));
                    setDonorPosts(mappedPosts);
                }
            } catch (error) {
                console.error("Error fetching donor posts:", error);
            } finally {
                setIsLoadingDonorPosts(false);
            }
        };

        if (isAuthenticated && user) {
            fetchDonorPosts();
        }
    }, [isAuthenticated, user, activeTab]);

    // Fetch blood camps from API
    useEffect(() => {
        const fetchBloodCamps = async () => {
            try {
                setIsLoadingCamps(true);
                const response = await getAllBloodCamps();
                setBloodCamps(response.data);
            } catch (error) {
                console.error('Error fetching blood camps:', error);
            } finally {
                setIsLoadingCamps(false);
            }
        };

        if (isAuthenticated && user) {
            fetchBloodCamps();
        }
    }, [isAuthenticated, user]);

    // Handle blood camp creation success
    const handleBloodCampCreated = async () => {
        try {
            const response = await getAllBloodCamps();
            setBloodCamps(response.data);
        } catch (error) {
            console.error('Error refreshing blood camps:', error);
        }
    };

    // Show loading state or return null while checking authentication
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
        avatar: 'AV', // You can set a default avatar or get it from user data
        verified: true, // You can set this based on your user data
        joinedDate: new Date().toISOString().split('T')[0], // You can get this from user data if available
        type: user.role === 'donor' ? UserType.DONOR : UserType.RECIPIENT // Map role to specific UserType
    };

    // Filter functions
    const filteredDonorPosts = filterCategory === "all"
        ? donorPosts
        : donorPosts.filter(post => post.category === filterCategory);

    const filteredRecipientPosts = recipientPosts.filter(post => {
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
                                    {isLoadingPosts ? (
                                        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                                            <div className="animate-pulse w-16 h-16 rounded-full bg-emerald-400 mx-auto mb-4"></div>
                                            <h3 className="text-2xl font-bold text-emerald-700 mb-2">Loading posts...</h3>
                                            <p className="text-gray-600 mb-6">Please wait while we fetch donation opportunities.</p>
                                        </div>
                                    ) : (
                                        <>
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
                                        </>
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
                                                    My Posts
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

                                    {isLoadingDonorPosts ? (
                                        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                                            <div className="animate-pulse w-16 h-16 rounded-full bg-emerald-400 mx-auto mb-4"></div>
                                            <h3 className="text-2xl font-bold text-emerald-700 mb-2">Loading your posts...</h3>
                                            <p className="text-gray-600 mb-6">Please wait while we fetch your donation offers.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <PostsGrid posts={donorPosts} filterCategory={filterCategory} />

                                            {filteredDonorPosts.length === 0 && (
                                                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                                                    <FaHeart className="text-6xl text-emerald-400 mx-auto mb-4" />
                                                    <h3 className="text-2xl font-bold text-emerald-700 mb-2">No Posts Yet</h3>
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
                                        </>
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

                                    {isLoadingCamps ? (
                                        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                                            <div className="animate-pulse w-16 h-16 rounded-full bg-red-400 mx-auto mb-4"></div>
                                            <h3 className="text-2xl font-bold text-red-700 mb-2">Loading blood camps...</h3>
                                            <p className="text-gray-600 mb-6">Please wait while we fetch available camps.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <MapSection bloodCamps={bloodCamps} setSelectedCamp={setSelectedCamp} />
                                            <CampsSection
                                                bloodCamps={bloodCamps}
                                                setSelectedCamp={setSelectedCamp}
                                                showBloodCampForm={showBloodCampForm}
                                                setShowBloodCampForm={setShowBloodCampForm}
                                                onCampCreated={handleBloodCampCreated} // Make sure this is passed
                                            />
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "donations" && (
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
                                                    My Donation Impact
                                                </h2>
                                                <p className="text-gray-600">Track your donations, create shareable cards, and view your contribution history</p>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => setShowCardGenerator(true)}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
                                                >
                                                    <FaShare className="mr-2" />
                                                    Create Donor Card
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics Cards */}
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-red-800">Blood Donations</h3>
                                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">12</span>
                                                </div>
                                            </div>
                                            <p className="text-red-600 text-sm">Lives potentially saved: ~36</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-green-800">Last Donation</h3>
                                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">3M</span>
                                                </div>
                                            </div>
                                            <p className="text-green-600 text-sm">Ready for next donation</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-blue-800">Availability</h3>
                                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">✓</span>
                                                </div>
                                            </div>
                                            <p className="text-blue-600 text-sm">Currently available</p>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Donation Activity</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">B+</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">Blood Donation</p>
                                                    <p className="text-sm text-gray-600">Kalutara General Hospital - 3 months ago</p>
                                                </div>
                                                <div className="text-green-600 font-medium">Completed</div>
                                            </div>

                                            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">P</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">Platelet Donation</p>
                                                    <p className="text-sm text-gray-600">National Blood Bank - 6 months ago</p>
                                                </div>
                                                <div className="text-green-600 font-medium">Completed</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Donation Tools */}
                                    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">Donation Tools</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                                <h4 className="font-bold text-blue-800 mb-2">Donor Card Generator</h4>
                                                <p className="text-blue-700 text-sm mb-3">Create professional cards to share your availability and help people find donors.</p>
                                                <button
                                                    onClick={() => setShowCardGenerator(true)}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                                                >
                                                    <FaShare className="mr-2" />
                                                    Create Card
                                                </button>
                                            </div>

                                            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                                                <h4 className="font-bold text-green-800 mb-2">Donation History</h4>
                                                <p className="text-green-700 text-sm mb-3">Track your contribution history and see the impact you&apos;ve made.</p>
                                                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                                    View History
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Impact Summary */}
                                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6">
                                        <h3 className="text-xl font-bold text-emerald-800 mb-4">Your Impact</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-bold text-emerald-700 mb-2">Lives Touched</h4>
                                                <p className="text-emerald-600 text-sm">Your 12 blood donations could have helped save up to 36 lives. Each donation can help up to 3 patients.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-emerald-700 mb-2">Community Recognition</h4>
                                                <p className="text-emerald-600 text-sm">You are in the top 10% of donors in your area. Your commitment makes a real difference.</p>
                                            </div>
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
                                    className="space-y-6"
                                >
                                    <DonorMessagesTab userId={user.id} />
                                </motion.div>
                            )}

                            {activeTab === "achievements" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <GamificationDashboard />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Components - Place these at the very end, outside all other content */}
                <CreateDonorPost
                    isOpen={showDonorPostForm}
                    onClose={() => {
                        setShowDonorPostForm(false);

                        // Refresh donor posts when modal is closed (in case a new post was created)
                        if (user?.id && activeTab === 'myposts') {
                            setIsLoadingDonorPosts(true);
                            getDonorPostsByUser(user.id)
                                .then(response => {
                                    if (response && response.data) {
                                        const mappedPosts = response.data.map(post => mapDonorPostToPost(post, user));
                                        setDonorPosts(mappedPosts);
                                    }
                                })
                                .catch(error => {
                                    console.error("Error refreshing donor posts:", error);
                                })
                                .finally(() => {
                                    setIsLoadingDonorPosts(false);
                                });
                        }
                    }}
                />
                <CampDetailsModal
                    selectedCamp={selectedCamp}
                    setSelectedCamp={setSelectedCamp}
                />
                <DonorCardGenerator
                    isOpen={showCardGenerator}
                    onClose={() => setShowCardGenerator(false)}
                    userType="donor"
                    userData={adaptedUser}
                />
            </div>
        </MessagesProvider>
    );
}