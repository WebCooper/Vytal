"use client";
import AdminPageWrapper from "@/components/admin/layout/AdminPageWrapper";
import { useState, useEffect } from "react";
import { FaFileAlt, FaSearch, FaTrash, FaEye, FaCheck, FaClock, FaUser, FaCalendarAlt } from "react-icons/fa";

import { getPendingRecipientPosts, approveRecipientPost, setRecipientPostStatus, deleteRecipientPost, getRecipientPostDetails } from "@/lib/adminPosts";
import AdminPostModal from "@/components/admin/AdminPostModal";
import { AnimatePresence } from "framer-motion";
import { getAllPosts as getAllOpenPosts, type RecipientPost } from "@/lib/recipientPosts";

type Post = {
  id: number;
  title: string;
  author: string;
  authorEmail: string;
  category: string;
  status: string;
  urgency: string;
  location?: string;
  goal?: number | null;
  received?: number | null;
  views: number;
  likes: number;
  createdAt: string;
  content: string;
};

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewData, setViewData] = useState<RecipientPost | null>(null);

  // Load posts from backend (pending via admin route + open via public route)
  useEffect(() => {
    const loadPending = async () => {
      try {
        setLoading(true);
        const [{ data: pending }, { data: open }] = await Promise.all([
          getPendingRecipientPosts(),
          getAllOpenPosts()
        ]);

  const toPost = (p: RecipientPost): Post => ({
          id: p.id,
          title: p.title,
          author: p.user?.name || 'Unknown',
          authorEmail: p.user?.email || '',
          category: p.category,
          status: p.status,
          urgency: p.urgency || 'medium',
          location: p.location,
          goal: p.fundraiserDetails?.goal ?? null,
          received: p.fundraiserDetails?.received ?? null,
          views: p.engagement?.views ?? 0,
          likes: p.engagement?.likes ?? 0,
          createdAt: p.createdAt,
          content: p.content,
        });

        const mapped: Post[] = [...pending.map(toPost), ...open.map(toPost)]
          // ensure unique and keep latest by createdAt
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(mapped);
      } catch (e) {
        console.error('Failed to load pending posts', e);
      } finally {
        setLoading(false);
      }
    };
    loadPending();
  }, []);

  useEffect(() => {
    // Filter posts based on search term, category, status, and urgency
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    if (urgencyFilter !== "all") {
      filtered = filtered.filter(post => post.urgency === urgencyFilter);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, categoryFilter, statusFilter, urgencyFilter]);

  const handleStatusChange = async (
    postId: number,
    newStatus: 'pending' | 'open' | 'fulfilled' | 'cancelled'
  ) => {
    try {
      setLoading(true);
      if (newStatus === 'open') {
        await approveRecipientPost(postId);
      } else {
        await setRecipientPostStatus(postId, newStatus);
      }
      setPosts(prev => prev.map(post => post.id === postId ? { ...post, status: newStatus } : post));
    } catch (e) {
      console.error('Failed to change status', e);
    } finally {
      setLoading(false);
    }
  };

  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const handleDeletePost = async (postId: number) => {
    if (deleteId !== postId) {
      setDeleteId(postId);
      return;
    }
    try {
      setLoading(true);
      await deleteRecipientPost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (e) {
      console.error('Failed to delete post', e);
    } finally {
      setDeleteId(null);
      setLoading(false);
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  const handleDeletePostImmediate = async (postId: number) => {
    try {
      setLoading(true);
      await deleteRecipientPost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      closeView();
    } catch (e) {
      console.error('Failed to delete post', e);
    } finally {
      setDeleteId(null);
      setLoading(false);
    }
  };

  const openView = async (postId: number) => {
    try {
      setViewId(postId);
      const { data } = await getRecipientPostDetails(postId);
      setViewData(data);
    } catch (e) {
      console.error('Failed to load post details', e);
    } 
  };

  const closeView = () => {
    setViewId(null);
    setViewData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'fulfilled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blood': return 'bg-red-100 text-red-800';
      case 'organs': return 'bg-purple-100 text-purple-800';
      case 'medicines': return 'bg-blue-100 text-blue-800';
      case 'supplies': return 'bg-green-100 text-green-800';
      case 'fundraiser': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminPageWrapper currentPage="Posts">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
              </div>
              <FaFileAlt className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{posts.filter(p => p.status === 'pending').length}</p>
              </div>
              <FaClock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{posts.filter(p => p.status === 'open').length}</p>
              </div>
              <FaCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{posts.filter(p => p.urgency === 'high').length}</p>
              </div>
              <FaFileAlt className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="all">All Categories</option>
                <option value="blood">Blood</option>
                <option value="organs">Organs</option>
                <option value="medicines">Medicines</option>
                <option value="supplies">Supplies</option>
                <option value="fundraiser">Fundraiser</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="open">Open</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="all">All Urgency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700">
              Posts ({filteredPosts.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading posts...</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full table-fixed divide-y divide-blue-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-[20%]">
                      Post
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-[15%]">
                      Author
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-[12%]">
                      Category
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-[12%]">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-[12%]">
                      Urgency
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-[12%]">
                      Engagement
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider w-[17%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-blue-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-blue-50/50">
                      <td className="px-3 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
                          <div className="text-xs text-gray-500">{post.location}</div>
                          <div className="text-xs text-gray-400">{post.createdAt}</div>
                          {post.status === 'pending' && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
                                Pending review
                              </span>
                            </div>
                          )}
                          {post.goal && (
                            <div className="text-xs text-green-600">
                              Goal: Rs. {post.goal.toLocaleString()}
                              {post.received && ` (${Math.round((post.received / post.goal) * 100)}%)`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate">{post.author}</div>
                          <div className="text-xs text-gray-500 truncate">{post.authorEmail}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(post.urgency)}`}>
                          {post.urgency}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div className="text-xs">
                          <div>Views: {post.views}</div>
                          <div>Likes: {post.likes}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm font-medium">
                        <div className="relative flex justify-center gap-2">
                          {post.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => openView(post.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                title="Review to approve"
                              >
                                <FaEye size={12} />
                                Review
                              </button>
                              <button 
                                onClick={() => handleStatusChange(post.id, 'open')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100" 
                                title="Approve post"
                              >
                                <FaCheck size={12} />
                                Approve
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => openView(post.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" 
                              title="View details"
                            >
                              <FaEye size={12} />
                              View
                            </button>
                          )}
                          
                          <div className="relative">
                            <button
                              onClick={() => (deleteId === post.id ? setDeleteId(null) : setDeleteId(post.id))}
                              className="text-red-600 hover:text-red-900 bg-red-100 p-1.5 rounded" 
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                            {deleteId === post.id && (
                              <div className="absolute z-40 right-0 top-8 w-60 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-3">
                                <p className="text-sm font-semibold text-gray-800">Delete this post?</p>
                                <p className="text-xs text-gray-600 mb-3">This action cannot be undone.</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded font-medium transition-colors"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={handleCancelDelete}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded font-medium transition-colors border border-gray-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {viewId !== null && viewData && (
          <AdminPostModal
            title="Post Details"
            onClose={closeView}
            actions={
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                <button 
                  onClick={closeView} 
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleDeletePostImmediate(viewData.id)} 
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm transition-colors"
                >
                  Delete Post
                </button>
                {viewData.status === 'pending' && (
                  <button 
                    onClick={async () => { await handleStatusChange(viewData.id, 'open'); closeView(); }} 
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-sm transition-all"
                  >
                    Approve Post
                  </button>
                )}
              </div>
            }
          >
            <div className="space-y-6">
              {/* Header Section */}
              <div className="space-y-3">
                <h5 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                  {viewData.title}
                </h5>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(viewData.category)}`}>
                    {viewData.category}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewData.status)}`}>
                    {viewData.status}
                  </span>
                  {viewData.urgency && (
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(viewData.urgency)}`}>
                      {viewData.urgency} priority
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  Contact Information
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Author</div>
                    <div className="text-sm font-semibold text-gray-900">{viewData.user?.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</div>
                    <div className="text-sm text-gray-800 break-all">{viewData.user?.email}</div>
                  </div>
                  {viewData.contact && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</div>
                      <div className="text-sm font-medium text-gray-900">{viewData.contact}</div>
                    </div>
                  )}
                  {viewData.location && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</div>
                      <div className="text-sm text-gray-800">{viewData.location}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics & Fundraiser */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Metrics */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                  <h6 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-600" />
                    Post Metrics
                  </h6>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium text-gray-900">{new Date(viewData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="text-sm font-medium text-gray-900">{(viewData.engagement?.views ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Likes</span>
                      <span className="text-sm font-medium text-gray-900">{(viewData.engagement?.likes ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Fundraiser (if applicable) */}
                {viewData.fundraiserDetails && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 sm:p-5 border border-emerald-200">
                    <h6 className="text-base font-semibold text-emerald-800 mb-3">
                      Fundraiser Progress
                    </h6>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-emerald-700">Goal</span>
                        <span className="text-sm font-bold text-emerald-900">
                          Rs. {viewData.fundraiserDetails.goal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-emerald-700">Raised</span>
                        <span className="text-sm font-bold text-emerald-900">
                          Rs. {viewData.fundraiserDetails.received.toLocaleString()}
                        </span>
                      </div>
                      {(() => {
                        const goal = viewData.fundraiserDetails?.goal ?? 0;
                        const received = viewData.fundraiserDetails?.received ?? 0;
                        const pct = goal > 0 ? Math.min(100, Math.round((received / goal) * 100)) : 0;
                        return (
                          <div className="space-y-2">
                            <div className="h-3 w-full rounded-full bg-emerald-100 overflow-hidden">
                              <div 
                                className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500" 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                            <div className="text-center">
                              <span className="text-lg font-bold text-emerald-800">{pct}%</span>
                              <span className="text-sm text-emerald-700 ml-1">funded</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <h6 className="text-base font-semibold text-gray-900 mb-3">Description</h6>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {viewData.content.split('\n').map((paragraph, index) => (
                    <p key={index} className={index > 0 ? 'mt-4' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </AdminPostModal>
        )}
      </AnimatePresence>
    </AdminPageWrapper>
  );
}

//
