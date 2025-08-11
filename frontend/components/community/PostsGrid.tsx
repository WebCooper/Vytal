import React from 'react'
import { FaHeart, FaComment, FaShare, FaPhone, FaClock } from 'react-icons/fa';
import { MdLocationOn, MdVerified } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PostsGridProps } from '../types';
import { formatDate, getCategoryColor, getCategoryIcon, getUrgencyColor } from '../utils';

const PostsGrid: React.FC<PostsGridProps> = ({filteredPosts}) => {
  
  return (
    <div>
        <div className="space-y-6">
            <AnimatePresence>
            {filteredPosts.map((post, index) => {
                const CategoryIcon = getCategoryIcon(post.category);
                return (
                <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-300"
                >
                    <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold">
                        {post.user.avatar}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-emerald-700">{post.user.name}</h4>
                        <MdVerified className="text-emerald-500 text-sm" />
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 flex items-center">
                            <MdLocationOn className="mr-1" />
                            {post.user.location}
                        </span>
                        </div>
                        <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-lg flex items-center justify-center`}>
                            <CategoryIcon className="text-white text-sm" />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-700">{post.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(post.urgency)}`}>
                            {post.urgency.toUpperCase()} PRIORITY
                        </span>
                        </div>
                    </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed ml-16">{post.content}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-emerald-100 ml-16">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <FaClock className="text-emerald-400" />
                        <span>{formatDate(post.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-500 transition">
                            <FaHeart />
                            <span>{post.engagement.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-500 transition">
                            <FaComment />
                            <span>{post.engagement.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-emerald-500 transition">
                            <FaShare />
                            <span>{post.engagement.shares}</span>
                        </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition flex items-center">
                            <FaPhone className="mr-2 text-sm" />
                            Contact
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-lg font-semibold hover:scale-105 transition">
                            Help Now
                        </button>
                        </div>
                    </div>
                    </div>
                </motion.div>
                );
            })}
            </AnimatePresence>
        </div>
    </div>
  )
}

export default PostsGrid