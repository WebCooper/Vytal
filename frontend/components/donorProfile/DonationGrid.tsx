import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaComment, FaShare, FaEye, FaClock, FaHandHoldingHeart } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import React from 'react'
import { Post, PostCategory, PostGridProps } from '@/components/types';
import Link from 'next/link';
import { formatDate, getCategoryColor, getCategoryIcon, getUrgencyColor } from '@/components/utils';

const DonationGrid: React.FC<PostGridProps> = ({ posts, filterCategory ,setFilterCategory }) => {

  const filteredPosts = filterCategory === "all" 
    ? posts 
    : posts.filter(post => post.category === filterCategory);

  return (
    <div>
      <div className="space-y-6">
        <AnimatePresence>
          {filteredPosts.map((post: Post, index: number) => {
            const CategoryIcon = getCategoryIcon(post.category);
            return (
              <Link key={post.id} href={`/donate/${post.id}`} className='block'>
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
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(post.urgency)}`}>
                            {post.urgency.toUpperCase()} PRIORITY
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {post.distance} away
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-xl shadow hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center">
                      <FaHandHoldingHeart className="mr-2" />
                      Donate
                    </button>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                  {post.category === PostCategory.FUNDRAISER && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Raised: LKR {post.fundraiserDetails?.received?.toLocaleString() ?? 0}</span>
                        <span className="text-gray-600">Goal: LKR {post.fundraiserDetails?.goal?.toLocaleString() ?? 0}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((post.fundraiserDetails?.received ?? 0) / (post.fundraiserDetails?.goal ?? 1) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <FaLocationDot className="text-emerald-400" />
                        <span>{post.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <FaClock className="text-emerald-400" />
                        <span>Posted {formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
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
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </AnimatePresence>
        {filteredPosts.length === 0 && (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
            <FaHandHoldingHeart className="text-6xl text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-emerald-700 mb-2">No Opportunities Found</h3>
            <p className="text-gray-600 mb-6">There are currently no donation opportunities in this category.</p>
            <button 
              onClick={() => setFilterCategory("all")}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
            >
              Browse All Opportunities
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DonationGrid;