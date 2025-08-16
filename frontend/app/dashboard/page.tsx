"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient, User } from "@/lib/api";

export default function Dashboard() {
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState<string>("checking...");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    // Test API connectivity
    const checkAPI = async () => {
      try {
        const health = await apiClient.healthCheck();
        setApiHealth(`✅ ${health.status} - ${health.service}`);
        
        const usersData = await apiClient.getUsers();
        setUsers(usersData);
      } catch (error) {
        setApiHealth("❌ API not responding");
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAPI();
  }, [isAuthenticated, router]);

  const handleSignOut = () => {
    signOut();
    router.push("/auth/signin");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-emerald-700">Vytal Dashboard</h1>
              <p className="text-emerald-600">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-emerald-700 mb-4">Your Profile</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {user?.name}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">ID:</span> {user?.id}</p>
              {user?.phone_number && <p><span className="font-medium">Phone:</span> {user.phone_number}</p>}
            </div>
          </div>

          {/* API Status Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-emerald-700 mb-4">API Status</h3>
            <p className="text-sm">{apiHealth}</p>
            <p className="text-xs text-gray-600 mt-2">
              Backend: http://localhost:8080/api
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-emerald-700 mb-4">Statistics</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Total Users:</span> {users.length}</p>
              <p><span className="font-medium">Status:</span> Active</p>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-700">All Users</h3>
          </div>
          
          {loading ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-200">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-emerald-200">
                  {users.map((userData) => (
                    <tr key={userData.id} className="hover:bg-emerald-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button className="text-emerald-600 hover:text-emerald-900">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
