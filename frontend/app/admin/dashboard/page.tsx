"use client";
import AdminPageWrapper from "@/components/admin/layout/AdminPageWrapper";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaUsers, FaFileAlt, FaUserPlus } from "react-icons/fa";
import { getPendingRecipientPosts } from "@/lib/adminPosts";
import { getUsers, type User as ApiUser } from "@/lib/userService";
import { getAllPosts as getAllOpenPosts, type RecipientPost } from "@/lib/recipientPosts";
import { getAdminStats, type AdminStats } from "@/lib/adminStats";

type DashboardStats = AdminStats & { activeUsers?: number };

const mockRecentUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "recipient", joinedAt: "2025-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "donor", joinedAt: "2025-01-14" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "recipient", joinedAt: "2025-01-13" },
];

type RecentPost = { id: number; title: string; author: string; category: string; status: string; createdAt: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(() => ({
    totalUsers: 0,
    recipients: 0,
    donors: 0,
    totalPosts: 0,
    pendingPosts: 0,
    activeUsers: undefined,
  }));
  const [recentUsers, setRecentUsers] = useState(mockRecentUsers);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch dashboard data from backend
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [{ data: pending }, { data: open }, users, adminStats] = await Promise.all([
          getPendingRecipientPosts(),
          getAllOpenPosts(),
          getUsers().catch(() => [] as ApiUser[]),
          getAdminStats().catch(() => null),
        ]);

        const toRecent = (p: RecipientPost): RecentPost => ({
          id: p.id,
          title: p.title,
          author: p.user?.name || "Unknown",
          category: p.category,
          status: p.status,
          createdAt: (p as unknown as { createdAt?: string; created_at?: string }).createdAt
            || (p as unknown as { createdAt?: string; created_at?: string }).created_at
            || new Date().toISOString(),
        });

        const combined = [...pending.map(toRecent), ...open.map(toRecent)]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setRecentPosts(combined.slice(0, 3));

        // Prefer backend-provided stats; fall back to derived numbers if unavailable
        if (adminStats) {
          setStats(s => ({
            ...s,
            totalUsers: adminStats.totalUsers,
            recipients: adminStats.recipients,
            donors: adminStats.donors,
            totalPosts: adminStats.totalPosts,
            pendingPosts: adminStats.pendingPosts,
          }));
        } else {
          setStats(s => ({
            ...s,
            // Derive donors/recipients from users list if roles present
            totalUsers: Array.isArray(users) ? users.length : 0,
            recipients: Array.isArray(users) ? users.filter(u => u.role === 'recipient').length : 0,
            donors: Array.isArray(users) ? users.filter(u => u.role === 'donor').length : 0,
            totalPosts: combined.length,
            pendingPosts: pending.length,
          }));
        }

        // Map recent users from API (fallback to mock if empty)
        type ApiUserWithDates = ApiUser & { created_at?: string; createdAt?: string };
        const mappedUsers = (users as ApiUserWithDates[]).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'recipient',
          joinedAt: u.created_at || u.createdAt || new Date().toISOString().slice(0,10),
        }));
        setRecentUsers(mappedUsers.length ? mappedUsers.slice(0,3) : mockRecentUsers);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, subtitle }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    subtitle?: string;
  }) => (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30 hover:bg-white/80 transition-all duration-300 hover:transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-blue-700 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700">
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <AdminPageWrapper currentPage="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                Admin Dashboard Overview
              </h2>
              <p className="text-gray-600">Monitor and manage your platform activities</p>
            </div>
            <div className="text-sm text-blue-600 font-medium">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={FaUsers}
            subtitle={typeof stats.activeUsers === 'number' ? `${stats.activeUsers} active` : undefined}
          />
          <StatCard
            title="Recipients"
            value={stats.recipients}
            icon={FaUserPlus}
          />
          <StatCard
            title="Donors"
            value={stats.donors}
            icon={FaUsers}
          />
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={FaFileAlt}
            subtitle={`${stats.pendingPosts} pending`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-blue-700 flex items-center mb-6">
                <FaUsers className="mr-3 text-2xl text-blue-600" />
                Recent Users
              </h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/70 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-blue-700">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
                            user.role === 'donor' 
                              ? 'bg-purple-600/80 text-purple-100 border-purple-400/50' 
                              : 'bg-green-600/80 text-green-100 border-green-400/50'
                          }`}>
                            {user.role}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{user.joinedAt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => router.push('/admin/dashboard/users')}
                      className="text-white hover:text-blue-100 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300"
                    >
                      View All Users →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-blue-700 flex items-center mb-6">
                <FaFileAlt className="mr-3 text-2xl text-blue-600" />
                Recent Posts
              </h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/70 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-blue-700 text-sm">{post.title}</p>
                          <p className="text-xs text-gray-600 mt-1">by {post.author}</p>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${
                            post.status === 'pending' 
                              ? 'bg-yellow-600/80 text-yellow-100 border-yellow-400/50' 
                              : 'bg-green-600/80 text-green-100 border-green-400/50'
                          }`}>
                            {post.status}
                          </span>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-600/80 text-blue-100 border border-blue-400/50 rounded-full">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{post.createdAt}</p>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => router.push('/admin/dashboard/posts')}
                      className="text-white hover:text-blue-100 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300"
                    >
                      View All Posts →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AdminPageWrapper>
  );
}
