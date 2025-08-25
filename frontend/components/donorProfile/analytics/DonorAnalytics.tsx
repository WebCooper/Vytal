import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaUsers, 
  FaChartLine,
  FaAward,
  FaTint as FaDroplet,
  FaDollarSign,
  FaGift,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaSync
} from 'react-icons/fa';
import { useAnalytics, useCurrentUser } from '@/hooks/useAnalytics';

// Simple Bar Chart Component
const SimpleBarChart = ({ data, height = 200, color = '#10b981' }: { 
  data: Array<{ day: string; donations: number; height?: number }>; 
  height?: number; 
  color?: string;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height: `${height}px` }}>
        No activity data
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.donations || 0));
  
  return (
    <div className="flex items-end justify-between space-x-2" style={{ height: `${height}px` }}>
      {data.map((item) => (
        <div key={item.day} className="flex flex-col items-center space-y-2 flex-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${maxValue > 0 ? ((item.donations || 0) / maxValue) * (height - 40) : 0}px` }}
            transition={{ duration: 0.8, delay: data.indexOf(item) * 0.1 }}
            className="w-full rounded-t-lg"
            style={{ backgroundColor: color, minHeight: (item.donations || 0) > 0 ? '8px' : '0' }}
          />
          <span className="text-xs text-gray-600 font-medium">{item.day}</span>
        </div>
      ))}
    </div>
  );
};

// Simple Line Chart Component
const SimpleLineChart = ({ data, color = '#3b82f6' }: { data: number[]; color?: string }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-gray-500">
        No trend data available
      </div>
    );
  }

  const maxValue = Math.max(...data.filter(val => val > 0));
  if (maxValue === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-gray-500">
        No donations yet
      </div>
    );
  }

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (value / maxValue) * 80
  }));
  
  const pathD = points.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');

  return (
    <div className="relative w-full h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${color?.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill={`url(#gradient-${color?.replace('#', '')})`}
        />
        
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
};

// Donut Chart Component
const SimpleDonutChart = ({ data, size = 120 }: { 
  data: Array<{ name: string; value: number; color: string }>; 
  size?: number;
}) => {
  if (!data || data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ width: size, height: size }}>
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm">No data</div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="flex items-center space-x-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 42 42" className="w-full h-full">
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          {data.filter(segment => segment.value > 0).map((segment) => {
            const percentage = total > 0 ? segment.value / total : 0;
            const strokeDasharray = `${percentage * 100} ${100 - percentage * 100}`;
            const strokeDashoffset = -cumulativePercentage * 100;
            cumulativePercentage += percentage;

            return (
              <motion.circle
                key={segment.name}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={segment.color}
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 21 21)"
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: strokeDasharray }}
                transition={{ duration: 1, delay: data.indexOf(segment) * 0.2 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{Math.round(total)}</span>
          <span className="text-xs text-gray-600">Total</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {data.filter(segment => segment.value > 0).map((segment) => (
          <motion.div
            key={segment.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: data.indexOf(segment) * 0.1 }}
            className="flex items-center space-x-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-gray-700">{segment.name}</span>
            <span className="text-sm font-semibold text-gray-900">{Math.round(segment.value)}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DonorAnalytics = () => {
  const { userId } = useCurrentUser();
  const { 
    analyticsData, 
    stats,
    achievements,
    loading, 
    error, 
    refresh, 
    setTimeRange, 
    timeRange 
  } = useAnalytics({ 
    userId,
    refreshInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Icon mapping for dynamic icon rendering
  const iconMap = {
    'FaHeart': FaHeart,
    'FaUsers': FaUsers,
    'FaGift': FaGift,
    'FaDollarSign': FaDollarSign,
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!analyticsData || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-gray-600 mb-4">No analytics data available</p>
          <p className="text-sm text-gray-500 mb-4">Start making donations to see your analytics</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
              Donation Analytics
            </h2>
            <p className="text-gray-600">Track your impact and donation patterns over time</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={refresh}
              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              title="Refresh data"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.impactMetrics.map((metric) => {
          const IconComponent = iconMap[metric.icon as keyof typeof iconMap] || FaGift;
          const isPositiveTrend = metric.trend > 0;
          return (
            <div key={metric.metric} className={`${metric.bg} rounded-2xl p-6 border border-gray-100`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${metric.bg} rounded-full flex items-center justify-center`}>
                  <IconComponent className={`text-xl ${metric.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositiveTrend ? <FaArrowUp /> : <FaArrowDown />}
                  <span>{Math.abs(metric.trend)}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.metric}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Blood Donation Trend</h3>
          <SimpleLineChart data={analyticsData.bloodDonationStats.monthlyTrend} color="#ef4444" />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            {analyticsData.donationTrends.slice(0, 6).map((trend) => (
              <span key={trend.month}>{trend.month}</span>
            ))}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Donation Categories</h3>
          <SimpleDonutChart data={analyticsData.categoryDistribution} />
        </motion.div>
      </div>

      {/* Secondary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blood Donation Details */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl shadow-2xl border border-red-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FaDroplet className="text-2xl text-red-600" />
            <h3 className="text-xl font-bold text-red-800">Blood Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-red-700">Total Donations</span>
              <span className="font-bold text-red-900">{stats.blood_donations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-700">Estimated Volume</span>
              <span className="font-bold text-red-900">{stats.blood_donations * 500}ml</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-700">Last Donation</span>
              <span className="font-bold text-red-900">
                {stats.last_donation_date 
                  ? new Date(stats.last_donation_date).toLocaleDateString() 
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-700">Lives Impacted</span>
              <span className="font-bold text-red-900">{stats.blood_donations * 3}</span>
            </div>
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Activity</h3>
          <SimpleBarChart data={analyticsData.weeklyActivity} color="#10b981" />
        </motion.div>

        {/* Achievement Progress */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl shadow-2xl border border-yellow-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FaAward className="text-2xl text-yellow-600" />
            <h3 className="text-xl font-bold text-yellow-800">Achievements</h3>
          </div>
          <div className="space-y-3">
            {achievements.slice(0, 5).map((achievement) => (
              <div key={achievement.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-yellow-800">{achievement.achievement_name}</span>
                  <span className="text-xs text-yellow-600">✓</span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full bg-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: achievements.indexOf(achievement) * 0.2 }}
                  />
                </div>
                <p className="text-xs text-yellow-700">{achievement.description}</p>
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="text-sm text-yellow-700 text-center py-4">
                No achievements yet. Keep donating to earn badges!
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Key Insights */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-3xl shadow-2xl border border-emerald-200 p-6"
      >
        <h3 className="text-xl font-bold text-emerald-800 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-4">
            <FaChartLine className="text-2xl text-emerald-600 mb-2" />
            <h4 className="font-bold text-emerald-800 mb-1">Total Impact</h4>
            <p className="text-sm text-emerald-700">
              You&apos;ve made {stats.total_donations} donations potentially impacting {stats.blood_donations * 3} lives
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <FaHeart className="text-2xl text-red-600 mb-2" />
            <h4 className="font-bold text-emerald-800 mb-1">Primary Category</h4>
            <p className="text-sm text-emerald-700">
              {stats.blood_donations > 0 ? 'Blood donations' : 
               stats.medicine_donations > 0 ? 'Medicine donations' : 
               stats.supply_donations > 0 ? 'Supply donations' :
               stats.organ_donations > 0 ? 'Organ donations' : 'Fundraising'} 
              {' '}is your main contribution type
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <FaDollarSign className="text-2xl text-blue-600 mb-2" />
            <h4 className="font-bold text-emerald-800 mb-1">Financial Impact</h4>
            <p className="text-sm text-emerald-700">
              ${stats.total_fundraiser_amount} raised through fundraising efforts
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DonorAnalytics;