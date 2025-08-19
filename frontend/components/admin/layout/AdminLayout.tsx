"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaShieldAlt, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaHome, FaChartBar } from "react-icons/fa";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const navigationItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: FaHome, key: "dashboard" },
  { name: "Users", href: "/admin/dashboard/users", icon: FaUsers, key: "users" },
  { name: "Posts", href: "/admin/dashboard/posts", icon: FaFileAlt, key: "posts" },
  { name: "Analytics", href: "/admin/dashboard/analytics", icon: FaChartBar, key: "analytics" },
  { name: "Settings", href: "/admin/dashboard/settings", icon: FaCog, key: "settings" },
];

export default function AdminLayout({ children, currentPage = "Dashboard", activeTab, setActiveTab }: AdminLayoutProps) {
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAdminInStorage, setIsAdminInStorage] = useState(false);

  // Effect to check if we're running on the client
  useEffect(() => {
    setIsClient(true);
    
    // Check localStorage for admin user (client-side only)
    try {
      const storedUser = localStorage.getItem('vytal_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsAdminInStorage(parsedUser.role === 'admin');
      }
    } catch {
      setIsAdminInStorage(false);
    }
  }, []);

  // Redirect effect (client-side only)
  useEffect(() => {
    if (!isClient) return; // Skip on server-side

    if (!isLoading && !isAdminInStorage && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, isLoading, router, isClient, isAdminInStorage]);

  const handleSignOut = () => {
    // Only execute this on client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vytal_user');
      localStorage.removeItem('vytal_token');
      
      // Use context sign out
      signOut();
      
      // Redirect
      window.location.href = "/admin/login";
    }
  };

  // Client-side rendering for admin email
  const [adminEmail, setAdminEmail] = useState('admin@vytal.com');
  
  // Update admin email from localStorage on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('vytal_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setAdminEmail(parsedUser.email || 'admin@vytal.com');
        }
      } catch {
        // Fallback to default if there's an error
        setAdminEmail('admin@vytal.com');
      }
    }
  }, [isClient]);

  // During server-side rendering, or when still loading, show a simplified loading view
  if (!isClient || (isLoading && !isAdminInStorage)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-white to-blue-700">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center h-screen">
          <div className="text-blue-700 text-xl font-semibold">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  // Once on client-side, if not authenticated as admin, return null
  if (!isAdminInStorage && (!isAuthenticated || user?.role !== "admin")) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-white to-blue-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Header - Full Width */}
          <div className="lg:col-span-4 mb-6">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl">
                    <FaShieldAlt className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-600">Welcome back, Administrator</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        ADMIN
                      </span>
                      <span className="text-xs text-gray-500">
                        {adminEmail}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 sticky top-8">
              <div className="space-y-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.key === activeTab || item.name === currentPage;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setActiveTab && setActiveTab(item.key)}
                      className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg transform scale-105"
                          : "text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:transform hover:scale-105 hover:shadow-lg"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-blue-500"}`} />
                      <span className="font-medium text-base">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
