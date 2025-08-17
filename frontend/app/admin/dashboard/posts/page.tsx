"use client";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useState, useEffect } from "react";
import { FaFileAlt, FaSearch, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaClock } from "react-icons/fa";

// Mock data - replace with actual API calls
const mockPosts = [
  { 
    id: 1, 
    title: "Urgent Blood Donation Needed", 
    author: "John Doe", 
    authorEmail: "john@example.com",
    category: "blood", 
    status: "pending", 
    urgency: "high",
    location: "Colombo",
    goal: 50000,
    received: 0,
    views: 234,
    likes: 12,
    createdAt: "2025-01-15",
    content: "I urgently need O+ blood for my upcoming surgery. Please help if you can."
  },
  { 
    id: 2, 
    title: "Medical Equipment Required", 
    author: "Jane Smith", 
    authorEmail: "jane@example.com",
    category: "supplies", 
    status: "open", 
    urgency: "medium",
    location: "Kandy",
    goal: null,
    received: null,
    views: 156,
    likes: 8,
    createdAt: "2025-01-14",
    content: "Looking for medical equipment donations for our local clinic."
  },
  { 
    id: 3, 
    title: "Fundraiser for Surgery", 
    author: "Mike Johnson", 
    authorEmail: "mike@example.com",
    category: "fundraiser", 
    status: "pending", 
    urgency: "high",
    location: "Galle",
    goal: 200000,
    received: 45000,
    views: 567,
    likes: 34,
    createdAt: "2025-01-13",
    content: "Raising funds for my child's critical heart surgery. Every contribution helps."
  },
];

type Post = typeof mockPosts[0];

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(mockPosts);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

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

  const handleStatusChange = (postId: number, newStatus: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, status: newStatus } : post
    ));
  };

  const handleDeletePost = (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setPosts(prev => prev.filter(post => post.id !== postId));
    }
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
    <AdminLayout currentPage="Posts">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-black"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
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
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-semibold text-red-700">
              Posts ({filteredPosts.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading posts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-red-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-red-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-red-50/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{post.title}</div>
                          <div className="text-xs text-gray-500">{post.location}</div>
                          <div className="text-xs text-gray-400">{post.createdAt}</div>
                          {post.goal && (
                            <div className="text-xs text-green-600">
                              Goal: Rs. {post.goal.toLocaleString()}
                              {post.received && ` (${Math.round((post.received / post.goal) * 100)}%)`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.author}</div>
                          <div className="text-xs text-gray-500">{post.authorEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(post.urgency)}`}>
                          {post.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          <div>Views: {post.views}</div>
                          <div>Likes: {post.likes}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900" title="View">
                            <FaEye />
                          </button>
                          <button className="text-green-600 hover:text-green-900" title="Edit">
                            <FaEdit />
                          </button>
                          {post.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusChange(post.id, 'open')}
                              className="text-green-600 hover:text-green-900" 
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                          )}
                          {post.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleStatusChange(post.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900" 
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-900" 
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
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
    </AdminLayout>
  );
}
