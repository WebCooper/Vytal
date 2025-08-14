'use client';

import React, { useState } from "react";
import Header from "@/components/shared/Header";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Footer from "@/components/shared/Footer";
import About from "@/components/home/About";
import Testimonials from "@/components/home/Testimonials";

// Quick test component
function NotificationTest() {
  const [token, setToken] = useState<string>('');

  const requestPermission = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { requestNotificationPermission } = await import('@/lib/firebase');
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        setToken(fcmToken);
        alert('Permission granted! Check console for token.');
        console.log('FCM Token:', fcmToken);
      } else {
        alert('Permission denied or error occurred.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error requesting permission. Check console.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border-2 border-emerald-500">
      <h3 className="font-bold text-emerald-700 mb-2">🔔 Test Notifications</h3>
      <button
        onClick={requestPermission}
        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 mb-2"
      >
        Request Permission
      </button>
      {token && (
        <div className="text-xs text-gray-600">
          <p>Token ready! Check console.</p>
          <p className="mt-1 p-2 bg-gray-100 rounded text-xs break-all">
            {token.substring(0, 30)}...
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      <Header />
      <Hero />
      <Services />
      <About />
      <Testimonials />
      <Footer />
      
      {/* Add test component */}
      <NotificationTest />
    </div>
  )
}