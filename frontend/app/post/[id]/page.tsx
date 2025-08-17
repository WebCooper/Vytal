'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaEye, 
  FaClock, 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPause,
  FaTimes
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { RecipientPost, getAllPosts } from '@/lib/recipientPosts';
import { Post, Category, UserType } from '@/components/types';
import { getCategoryIcon, getCategoryColor, getUrgencyColor, getStatusColor, formatDate } from '@/components/utils';
import FundraiserProgressbar from '@/components/shared/FundraiserProgressbar';
import ContactModal from '@/components/shared/ContactModal';
import HelpNowModal from '@/components/shared/HelpNowModal';

const PostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Function to convert RecipientPost to Post
  const mapRecipientPostToPost = (recipientPost: RecipientPost): Post => {
    const mapCategory = (category: string): Category => {
      switch(category) {
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
      createdAt: recipientPost.createdAt,
      status: recipientPost.status,
      urgency: recipientPost.urgency || 'medium',
      engagement: recipientPost.engagement,
      user: {
        id: recipientPost.user.id,
        name: recipientPost.user.name,
        email: recipientPost.user.email,
        avatar: '/images/default-avatar.png',
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
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Get all posts and find the specific one
        const response = await getAllPosts();
        const foundPost = response.data.find(p => p.id === parseInt(postId));
        
        if (foundPost) {
          setPost(mapRecipientPostToPost(foundPost));
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'fulfilled':
        return <FaCheckCircle className="text-blue-500" />;
      case 'cancelled':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaPause className="text-gray-500" />;
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'medium':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'low':
        return <FaExclamationTriangle className="text-green-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
        <div className="text-emerald-700 text-xl font-semibold">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'Post not found'}</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(post.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        post={post}
      />

      {/* Help Now Modal */}
      <HelpNowModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        post={post}
      />

      {/* Navigation Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full font-semibold transition-all duration-200"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back</span>
          </button>
          <div className="text-emerald-700 font-semibold">Post Details</div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
        >
          {/* Post Header */}
          <div className={`bg-gradient-to-r ${getCategoryColor(post.category)} p-8 text-white`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <CategoryIcon className="text-3xl" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                <div className="flex items-center space-x-4">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    {post.category.toUpperCase()}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getUrgencyIcon(post.urgency)}
                    <span className="text-sm font-semibold">
                      {post.urgency.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(post.status)}
                    <span className="text-sm font-semibold">
                      {post.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {post.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-lg text-white">{post.user.name}</h3>
                    {post.user.verified && <MdVerified className="text-white text-lg" />}
                  </div>
                  <p className="text-white/90 text-sm flex items-center space-x-1">
                    <FaEnvelope className="text-xs" />
                    <span>{post.user.email}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-white/90 bg-white/10 px-3 py-2 rounded-full">
                <FaClock className="text-sm" />
                <span className="text-sm font-medium">Posted {formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-8">
            {/* Location */}
            {post.location && (
              <div className="flex items-center space-x-2 mb-6 text-gray-600">
                <FaMapMarkerAlt className="text-emerald-500" />
                <span>{post.location}</span>
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Fundraiser Progress */}
            {post.category === Category.FUNDRAISER && post.fundraiserDetails && (
              <div className="mb-8">
                <FundraiserProgressbar {...post} />
              </div>
            )}

            {/* Contact Information */}
            {post.contact && (
              <div className="bg-emerald-50 rounded-2xl p-6 mb-8 border border-emerald-200">
                <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
                  <FaPhone className="mr-2" />
                  Direct Contact Information
                </h3>
                <p className="text-emerald-700 font-medium">{post.contact}</p>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl mb-8">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaEye className="text-emerald-500" />
                  <span className="font-semibold">{post.engagement.views}</span>
                  <span className="text-sm">views</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaHeart className="text-red-500" />
                  <span className="font-semibold">{post.engagement.likes}</span>
                  <span className="text-sm">likes</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaComment className="text-blue-500" />
                  <span className="font-semibold">{post.engagement.comments}</span>
                  <span className="text-sm">comments</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaShare className="text-emerald-500" />
                  <span className="font-semibold">{post.engagement.shares}</span>
                  <span className="text-sm">shares</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setHelpModalOpen(true)}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:from-emerald-600 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center"
              >
                <FaHeart className="mr-2" />
                Help Now
              </button>
              <button
                onClick={() => setContactModalOpen(true)}
                className="flex-1 px-8 py-4 text-emerald-700 border-2 border-emerald-300 font-bold rounded-2xl hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center"
              >
                <FaEnvelope className="mr-2" />
                Contact
              </button>
              <button className="px-8 py-4 text-gray-600 border-2 border-gray-300 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center">
                <FaShare className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Similar Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-emerald-800 mb-6">Similar Requests</h2>
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
            <p className="text-gray-600 text-center">Similar posts will be displayed here</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetailPage;