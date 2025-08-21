"use client";
import AdminPageWrapper from "@/components/admin/layout/AdminPageWrapper";
import { useState, useEffect } from "react";
import { FaUsers, FaSearch, FaTrash, FaEye, FaUserCheck, FaUserTimes, FaCalendarAlt } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

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

  useEffect(() => {
    // Filter users based on search term, role, and status
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
                          <button className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors" title="View">
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
    </AdminPageWrapper>
  );
}
