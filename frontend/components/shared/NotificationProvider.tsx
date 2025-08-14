'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    // Request notification permission and get token
    const initializeNotifications = async () => {
      const token = await requestNotificationPermission();
      
      if (token) {
        console.log('FCM Token:', token);
        // For now, just log the token. Later you'll send it to your backend
        // try {
        //   await fetch('/api/notifications/register', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ 
        //       token,
        //       userId: 'test-user-123',
        //       deviceType: 'web'
        //     }),
        //   });
        //   console.log('Token registered successfully');
        // } catch (error) {
        //   console.error('Failed to register token:', error);
        // }
      }
    };

    initializeNotifications();

    // Listen for foreground messages
    onMessageListener()
      .then((payload: any) => {
        console.log('Received foreground message:', payload);
        setNotification({
          title: payload.notification?.title || 'New Notification',
          body: payload.notification?.body || 'You have a new message',
          data: payload.data
        });
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      })
      .catch((err) => console.log('Failed to receive message:', err));

  }, []);

  return (
    <>
      {/* Custom notification for foreground messages */}
      {notification && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-slide-in">
          <h3 className="font-bold">{notification.title}</h3>
          <p className="text-sm mt-1">{notification.body}</p>
          <button 
            onClick={() => setNotification(null)}
            className="absolute top-2 right-2 text-white hover:text-gray-200 text-lg font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      {children}
    </>
  );
}