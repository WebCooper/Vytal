import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaComment, FaShare, FaEye, FaClock, FaTrash, FaUser } from "react-icons/fa";
import React, { useState } from 'react'
import { Post, Category } from '../types';
import Link from 'next/link';
import { formatDate, getCategoryColor, getCategoryIcon, getUrgencyColor, getStatusColor } from '../utils';
import FundraiserProgressbar from './FundraiserProgressbar';
import { MdVerified } from 'react-icons/md';
import ContactModal from './ContactModal';
import HelpNowModal from './HelpNowModal';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface PostsGridProps {
  posts: Post[];
  filterCategory: string;
}

const PostsGrid: React.FC<PostsGridProps> = ({posts, filterCategory}) => {
  const { user } = useAuth(); // Get the current user
  const isPostOwner = false; // TODO: Replace with actual logic to check if the user is the post owner
  
  // Modal states
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filteredPosts = filterCategory === "all" 
    ? posts 
    : posts.filter(post => post.category === filterCategory);

  const handleContactClick = (e: React.MouseEvent, post: Post) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPost(post);
    setContactModalOpen(true);
  };

  const handleHelpClick = (e: React.MouseEvent, post: Post) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPost(post);
    setHelpModalOpen(true);
  };

  return (
    <div>
      {/* Contact Modal */}
      {selectedPost && (
        <ContactModal
          isOpen={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          currentUserId={user?.id} // Pass the current user ID
        />
      )}

      {/* Help Now Modal */}
      {selectedPost && (
        <HelpNowModal
          isOpen={helpModalOpen}
          onClose={() => {
            setHelpModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          currentUserId={user?.id} // Pass the current user ID
        />
      )}

      <div className="space-y-6">
        <AnimatePresence>
        {filteredPosts.map((post: Post, index: number) => {
          console.log(
            post.fundraiserDetails?.received,
            post.fundraiserDetails?.goal,
          );
            const CategoryIcon = getCategoryIcon(post.category);
            return (
              <Link key={post.id} href={`/post/${post.id}`} className='block'>
                <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-2xl flex items-center justify-center`}>
                        <CategoryIcon className="text-2xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-emerald-700 mb-1">{post.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(post.status)}`}>
                          {post.status.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(post.urgency)}`}>
                          {post.urgency.toUpperCase()} PRIORITY
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isPostOwner ? (
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <FaTrash />
                      </button>
                      ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {post.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-semibold text-gray-700">{post.user.name}</span>
                            {post.user.verified && <MdVerified className="text-emerald-500 text-sm" />}
                          </div>
                          <p className="text-xs text-gray-500">{post.user.email}</p>
                        </div>
                      </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                  {post.category === Category.FUNDRAISER && (
                    <FundraiserProgressbar {...post} />
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <FaClock className="text-emerald-400" />
                      <span>Posted {formatDate(post.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <FaEye className="text-emerald-400" />
                      <span>{post.engagement.views}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <FaHeart className="text-red-400" />
                      <span>{post.engagement.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <FaComment className="text-blue-400" />
                      <span>{post.engagement.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <FaShare className="text-emerald-400" />
                      <span>{post.engagement.shares}</span>
                    </div>
                    <button 
                      onClick={(e) => handleHelpClick(e, post)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                    >
                        Help Now
                    </button>
                    <button 
                      onClick={(e) => handleContactClick(e, post)}
                      className="px-4 py-2 text-emerald-600 border border-emerald-300 font-semibold rounded-lg hover:bg-emerald-50 transition-colors text-sm"
                    >
                        Contact
                    </button>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
        </AnimatePresence>
          {filteredPosts.length === 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
              <FaUser className="text-6xl text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-700 mb-2">No Posts Found</h3>
              <p className="text-gray-600 mb-6">You haven&apos;t created any posts in this category yet.</p>
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200">
                Create Your First Post
              </button>
            </div>
          )}
      </div>
    </div>
  )
}

export default PostsGrid