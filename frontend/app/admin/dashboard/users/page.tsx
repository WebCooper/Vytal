"use client";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useState, useEffect } from "react";
import { FaUsers, FaSearch, FaEdit, FaTrash, FaEye, FaUserCheck, FaUserTimes } from "react-icons/fa";

// Mock data - replace with actual API calls
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890", role: "recipient", categories: ["blood", "organs"], status: "active", joinedAt: "2025-01-15", lastActive: "2025-01-17" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1234567891", role: "donor", categories: ["blood"], status: "active", joinedAt: "2025-01-14", lastActive: "2025-01-17" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1234567892", role: "recipient", categories: ["medicines", "supplies"], status: "inactive", joinedAt: "2025-01-13", lastActive: "2025-01-16" },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", phone: "+1234567893", role: "donor", categories: ["blood", "organs"], status: "active", joinedAt: "2025-01-12", lastActive: "2025-01-17" },
  { id: 5, name: "David Brown", email: "david@example.com", phone: "+1234567894", role: "recipient", categories: ["fundraiser"], status: "suspended", joinedAt: "2025-01-11", lastActive: "2025-01-15" },
];

type User = typeof mockUsers[0];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Filter users based on search term, role, and status
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'donor': return 'bg-purple-100 text-purple-800';
      case 'recipient': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout currentPage="Users">
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
                <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'donor').length}</p>
              </div>
              <FaUsers className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recipients</p>
                <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'recipient').length}</p>
              </div>
              <FaUsers className="w-8 h-8 text-blue-600" />
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-black"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
              >
                <option value="all">All Roles</option>
                <option value="donor">Donors</option>
                <option value="recipient">Recipients</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
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
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-semibold text-red-700">
              Users ({filteredUsers.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-red-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-red-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-red-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{user.joinedAt}</div>
                        <div className="text-xs">Last: {user.lastActive}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900" title="View">
                            <FaEye />
                          </button>
                          <button className="text-green-600 hover:text-green-900" title="Edit">
                            <FaEdit />
                          </button>
                          {user.status === 'active' ? (
                            <button 
                              onClick={() => handleStatusChange(user.id, 'suspended')}
                              className="text-yellow-600 hover:text-yellow-900" 
                              title="Suspend"
                            >
                              <FaUserTimes />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStatusChange(user.id, 'active')}
                              className="text-green-600 hover:text-green-900" 
                              title="Activate"
                            >
                              <FaUserCheck />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
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
