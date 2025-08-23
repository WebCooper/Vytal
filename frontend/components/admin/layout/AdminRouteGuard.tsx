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
  const [storageChecked, setStorageChecked] = useState(false);
  
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
            setStorageChecked(true);
            return;
          }
        }
        setIsAdminInStorage(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdminInStorage(false);
      }
      setStorageChecked(true);
    }
  }, []);
  
  // Handle redirects only on client-side
  useEffect(() => {
    // Skip until client-side, storage checked, and auth finished loading
    if (!isClient || !storageChecked || isLoading) return;

    // If admin in localStorage, allow access
    if (isAdminInStorage) return;

    // Fall back to AuthContext if localStorage check fails
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
  }, [isAuthenticated, user, isLoading, router, isClient, isAdminInStorage, storageChecked]);
  
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
  
  // On client-side, show loading while checking auth/storage
  if ((isLoading || !storageChecked) && !isAdminInStorage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-white to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-blue-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated as admin after checks, render a stable fallback
  if (!isAdminInStorage && (!isAuthenticated || user?.role !== 'admin')) {
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
