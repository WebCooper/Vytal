"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAdminInStorage, setIsAdminInStorage] = useState(false);
  
  // Check if we're on client-side and set admin status from localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Only run localStorage checks on client
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('vytal_user');
        const storedToken = localStorage.getItem('vytal_token');
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === 'admin') {
            setIsAdminInStorage(true);
            return;
          }
        }
        setIsAdminInStorage(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdminInStorage(false);
      }
    }
  }, []);
  
  // Handle redirects only on client-side
  useEffect(() => {
    // Skip on server-side or when still loading
    if (!isClient || isLoading) return;
    
    // If admin in localStorage, allow access
    if (isAdminInStorage) return;
    
    // Fall back to AuthContext if localStorage check fails
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
      return;
    }

    if (user?.role !== "admin") {
      // Redirect non-admin users to their appropriate dashboard
      if (typeof window !== 'undefined') {
        if (user?.role === "donor") {
          window.location.href = "/donor";
        } else if (user?.role === "recipient") {
          window.location.href = "/me";
        } else {
          window.location.href = "/";
        }
      }
      return;
    }
  }, [isAuthenticated, user, isLoading, router, isClient, isAdminInStorage]);
  
  // On server-side or during initial loading, return a stable UI that won't change during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-white to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-blue-600">Loading admin area...</p>
        </div>
      </div>
    );
  }
  
  // On client-side, show loading while checking auth
  if (isLoading && !isAdminInStorage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-white to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-blue-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirecting UI and trigger redirect
  if (!isAdminInStorage && (!isAuthenticated || user?.role !== "admin")) {
    // Redirect on client-side
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-white to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-blue-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
