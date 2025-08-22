"use client";
import AdminPageWrapper from "@/components/admin/layout/AdminPageWrapper";
import { useState, useEffect } from "react";
import { getUsers as apiGetUsers, type User as ApiUser } from "@/lib/userService";
import { getPostsByUser, type RecipientPost } from "@/lib/recipientPosts";
import { FaUsers, FaSearch, FaTrash, FaEye, FaUserCheck, FaUserTimes, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaIdBadge, FaHistory, FaFileAlt, FaExclamationTriangle } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import AdminUserModal from "@/components/admin/AdminUserModal";

// Mock data - replace with actual API calls
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890", role: "recipient", categories: ["blood", "organs"], status: "active", joinedAt: "2025-01-15", lastActive: "2025-01-17" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1234567891", role: "donor", categories: ["blood"], status: "active", joinedAt: "2025-01-14", lastActive: "2025-01-17" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1234567892", role: "recipient", categories: ["medicines", "supplies"], status: "inactive", joinedAt: "2025-01-13", lastActive: "2025-01-16" },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", phone: "+1234567893", role: "donor", categories: ["blood", "organs"], status: "active", joinedAt: "2025-01-12", lastActive: "2025-01-17" },
  { id: 5, name: "David Brown", email: "david@example.com", phone: "+1234567894", role: "recipient", categories: ["fundraiser"], status: "suspended", joinedAt: "2025-01-11", lastActive: "2025-01-15" },
  { id: 6, name: "Admin User", email: "admin@vytal.com", phone: "+1234567895", role: "admin", categories: [], status: "active", joinedAt: "2025-01-01", lastActive: "2025-01-17" },
];

type User = typeof mockUsers[0];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewData, setViewData] = useState<User | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [userPosts, setUserPosts] = useState<RecipientPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Fetch once on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const apiUsers = await apiGetUsers();
        type ApiUserWithDates = ApiUser & { created_at?: string; updated_at?: string; phone_number?: string };
        const mapped: User[] = (apiUsers as ApiUserWithDates[]).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone_number || "",
          role: u.role || "recipient",
          categories: Array.isArray(u.categories) ? u.categories : [],
          status: "active",
          joinedAt: u.created_at || new Date().toISOString(),
          lastActive: u.updated_at || u.created_at || new Date().toISOString(),
        }));
        if (isMounted && mapped.length) {
          setUsers(mapped);
          setFilteredUsers(mapped);
        }
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Filter when inputs change (no re-fetch)
  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleStatusChange = (userId: number, newStatus: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      setLoading(false);
    }, 500);
  };

  const handleDeleteUser = (userId: number) => {
    if (showDeleteConfirm !== userId) {
      setShowDeleteConfirm(userId);
      return;
    }

    // Check if user is admin
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete?.role === 'admin') {
      alert("Admin users cannot be deleted");
      setShowDeleteConfirm(null);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setShowDeleteConfirm(null);
      setLoading(false);
    }, 500);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const openView = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setViewId(userId);
      setViewData(user);
    }
  };

  const closeView = () => {
    setViewId(null);
    setViewData(null);
    setShowActivity(false);
    setUserPosts([]);
  };

  const loadUserActivity = async (userId: number) => {
    setLoadingPosts(true);
    try {
      const response = await getPostsByUser(userId);
      setUserPosts(response.data || []);
      setShowActivity(true);
    } catch (error) {
      console.error('Failed to load user posts:', error);
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'donor': return 'bg-green-100 text-green-800 border-green-300';
      case 'recipient': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getPostStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'fulfilled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPostCategoryColor = (category: string) => {
    switch (category) {
      case 'blood': return 'bg-red-100 text-red-800';
      case 'organs': return 'bg-purple-100 text-purple-800';
      case 'medicines': return 'bg-blue-100 text-blue-800';
      case 'supplies': return 'bg-green-100 text-green-800';
      case 'fundraiser': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminPageWrapper currentPage="Users">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
              <FaUsers className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <FaUserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Donors</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'donor').length}</p>
              </div>
              <FaUsers className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recipients</p>
                <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'recipient').length}</p>
              </div>
              <FaUsers className="w-8 h-8 text-purple-600" />
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="donor">Donors</option>
                <option value="recipient">Recipients</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700">
              Users ({filteredUsers.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider min-w-[150px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-blue-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.categories.map((category) => (
                            <span key={category} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-blue-400 text-xs" />
                          {formatDate(user.joinedAt)}
                        </div>
                        <div className="text-xs mt-1">Last active: {formatDate(user.lastActive)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative min-w-[150px]">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openView(user.id)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors" 
                            title="View"
                          >
                            <FaEye />
                          </button>
                          {user.role !== 'admin' && (
                            <>
                              {user.status === 'active' ? (
                                <button 
                                  onClick={() => handleStatusChange(user.id, 'suspended')}
                                  className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 p-2 rounded-full hover:bg-yellow-100 transition-colors" 
                                  title="Suspend"
                                >
                                  <FaUserTimes />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleStatusChange(user.id, 'active')}
                                  className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full hover:bg-green-100 transition-colors" 
                                  title="Activate"
                                >
                                  <FaUserCheck />
                                </button>
                              )}
                              
                              {/* Delete with confirmation */}
                              <AnimatePresence mode="wait">
                                {showDeleteConfirm === user.id ? (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white shadow-lg border border-gray-200 rounded-lg p-2 absolute right-4 z-10"
                                  >
                                    <div className="flex flex-col gap-2">
                                      <p className="text-gray-700 text-xs font-medium mb-1">Delete this user?</p>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="text-white bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-sm font-medium w-full"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={handleCancelDelete}
                                          className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium w-full border border-gray-300"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </motion.button>
                                )}
                              </AnimatePresence>
                            </>
                          )}
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
          <AdminUserModal
            title="User Details"
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
                  onClick={() => loadUserActivity(viewData.id)}
                  disabled={loadingPosts}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaHistory />
                  {loadingPosts ? 'Loading...' : 'View Activity'}
                </button>
                {viewData.role !== 'admin' && (
                  <>
                    {viewData.status === 'active' ? (
                      <button 
                        onClick={() => { handleStatusChange(viewData.id, 'suspended'); closeView(); }}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold shadow-sm transition-colors"
                      >
                        Suspend User
                      </button>
                    ) : (
                      <button 
                        onClick={() => { handleStatusChange(viewData.id, 'active'); closeView(); }}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition-colors"
                      >
                        Activate User
                      </button>
                    )}
                  </>
                )}
              </div>
            }
          >
            <div className="space-y-6">
              {/* Header Section */}
              <div className="space-y-3">
                <h5 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                  {viewData.name}
                </h5>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(viewData.role)}`}>
                    {viewData.role}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(viewData.status)}`}>
                    {viewData.status}
                  </span>
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
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FaEnvelope className="text-blue-500" />
                      Email
                    </div>
                    <div className="text-sm text-gray-800 break-all">{viewData.email}</div>
                  </div>
                  {viewData.phone && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <FaPhone className="text-green-500" />
                        Phone
                      </div>
                      <div className="text-sm font-medium text-gray-900">{viewData.phone}</div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FaIdBadge className="text-purple-500" />
                      User ID
                    </div>
                    <div className="text-sm font-medium text-gray-900">#{viewData.id}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</div>
                    <div className="text-sm text-gray-800 capitalize">{viewData.role}</div>
                  </div>
                </div>
              </div>

              {/* Categories & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Categories */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                  <h6 className="text-base font-semibold text-gray-900 mb-3">
                    Interested Categories
                  </h6>
                  {viewData.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewData.categories.map((category) => (
                        <span key={category} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg font-medium">
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No categories selected</p>
                  )}
                </div>

                {/* Activity */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 sm:p-5 border border-emerald-200">
                  <h6 className="text-base font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-emerald-600" />
                    Activity Timeline
                  </h6>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-700">Joined</span>
                      <span className="text-sm font-bold text-emerald-900">
                        {formatDate(viewData.joinedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-700">Last Active</span>
                      <span className="text-sm font-bold text-emerald-900">
                        {formatDate(viewData.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Activity Section */}
              {showActivity && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h6 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaFileAlt className="text-blue-600" />
                    User Activity & Posts ({userPosts.length})
                  </h6>
                  
                  {loadingPosts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading user activity...</p>
                    </div>
                  ) : userPosts.length > 0 ? (
                    <div className="space-y-4">
                      {userPosts.map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{post.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPostCategoryColor(post.category)}`}>
                                {post.category}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPostStatusColor(post.status)}`}>
                                {post.status}
                              </span>
                              {post.status === 'pending' && (
                                <FaExclamationTriangle className="text-yellow-500 text-sm" title="Needs Review" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>Created: {formatDate(post.createdAt)}</span>
                              {post.location && <span>📍 {post.location}</span>}
                              {post.urgency && (
                                <span className={`px-2 py-0.5 rounded ${post.urgency === 'high' ? 'bg-red-100 text-red-700' : post.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                  {post.urgency} priority
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span>👁 {post.engagement?.views || 0}</span>
                              <span>❤️ {post.engagement?.likes || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Summary Stats */}
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Activity Summary</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{userPosts.length}</div>
                            <div className="text-gray-600">Total Posts</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-yellow-600">{userPosts.filter(p => p.status === 'pending').length}</div>
                            <div className="text-gray-600">Pending</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{userPosts.filter(p => p.status === 'open').length}</div>
                            <div className="text-gray-600">Active</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-600">{userPosts.filter(p => p.urgency === 'high').length}</div>
                            <div className="text-gray-600">High Priority</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No posts found for this user</p>
                      <p className="text-sm text-gray-500 mt-1">This user hasn&apos;t created any posts yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AdminUserModal>
        )}
      </AnimatePresence>
    </AdminPageWrapper>
  );
}
