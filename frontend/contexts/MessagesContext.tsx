import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUnreadCount } from '@/lib/messages';

interface MessagesContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: (amount?: number) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: ReactNode; userId: number }> = ({ 
  children, 
  userId 
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const decrementUnreadCount = (amount = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount));
  };

  useEffect(() => {
    if (userId) {
      refreshUnreadCount();
      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  return (
    <MessagesContext.Provider value={{ 
      unreadCount, 
      refreshUnreadCount, 
      decrementUnreadCount 
    }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
};