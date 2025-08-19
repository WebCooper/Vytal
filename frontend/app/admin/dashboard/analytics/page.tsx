"use client";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useState } from "react";
import { FaUsers, FaFileAlt, FaEye, FaCalendarAlt, FaChartLine, FaArrowUp } from "react-icons/fa";

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalUsers: 156,
    totalPosts: 43,
    totalViews: 12450,
    conversionRate: 8.5,
  },
  trends: {
    userGrowth: [
      { month: "Jan", users: 45, posts: 12 },
      { month: "Feb", users: 67, posts: 18 },
      { month: "Mar", users: 89, posts: 25 },
      { month: "Apr", users: 112, posts: 32 },
      { month: "May", users: 134, posts: 38 },
      { month: "Jun", users: 156, posts: 43 },
    ],
  },
  categories: {
    blood: 45,
    organs: 23,
    medicines: 18,
    supplies: 15,
    fundraiser: 39,
  },
  userActivity: {
    activeUsers: 134,
    newUsersThisWeek: 12,
    avgSessionTime: "8m 32s",
    bounceRate: "23.5%",
  },
};

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: string;
    subtitle?: string;
  }) => (
    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout currentPage="Analytics">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-red-700">Analytics Dashboard</h2>
          <div className="flex items-center space-x-4">
            <FaCalendarAlt className="text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={mockAnalytics.overview.totalUsers}
            icon={FaUsers}
            color="text-blue-600"
            trend="+12.5% from last month"
          />
          <StatCard
            title="Total Posts"
            value={mockAnalytics.overview.totalPosts}
            icon={FaFileAlt}
            color="text-green-600"
            trend="+8.3% from last month"
          />
          <StatCard
            title="Total Views"
            value={mockAnalytics.overview.totalViews.toLocaleString()}
            icon={FaEye}
            color="text-purple-600"
            trend="+15.7% from last month"
          />
          <StatCard
            title="Conversion Rate"
            value={`${mockAnalytics.overview.conversionRate}%`}
            icon={FaChartLine}
            color="text-orange-600"
            trend="+2.1% from last month"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
              <FaChartLine className="mr-2" />
              User Growth Trend
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {mockAnalytics.trends.userGrowth.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-blue-500 rounded-t w-full relative"
                    style={{ height: `${(data.users / 156) * 200}px` }}
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-blue-600">
                      {data.users}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">Monthly User Growth</span>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Post Categories Distribution</h3>
            <div className="space-y-4">
              {Object.entries(mockAnalytics.categories).map(([category, count]) => {
                const percentage = (count / Object.values(mockAnalytics.categories).reduce((a, b) => a + b, 0)) * 100;
                const colors = {
                  blood: 'bg-red-500',
                  organs: 'bg-purple-500',
                  medicines: 'bg-blue-500',
                  supplies: 'bg-green-500',
                  fundraiser: 'bg-yellow-500',
                };
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${colors[category as keyof typeof colors]}`}></div>
                      <span className="text-sm font-medium capitalize text-black">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colors[category as keyof typeof colors]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-black font-medium">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Users"
            value={mockAnalytics.userActivity.activeUsers}
            icon={FaUsers}
            color="text-green-600"
            subtitle="Currently active"
          />
          <StatCard
            title="New Users This Week"
            value={mockAnalytics.userActivity.newUsersThisWeek}
            icon={FaUsers}
            color="text-blue-600"
            subtitle="Weekly registrations"
          />
          <StatCard
            title="Avg. Session Time"
            value={mockAnalytics.userActivity.avgSessionTime}
            icon={FaEye}
            color="text-purple-600"
            subtitle="Per session"
          />
          <StatCard
            title="Bounce Rate"
            value={mockAnalytics.userActivity.bounceRate}
            icon={FaChartLine}
            color="text-orange-600"
            subtitle="Exit without interaction"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Recent Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FaUsers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">23</p>
              <p className="text-sm text-gray-600">New registrations today</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FaFileAlt className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">7</p>
              <p className="text-sm text-gray-600">Posts created today</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FaEye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">1,247</p>
              <p className="text-sm text-gray-600">Page views today</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
