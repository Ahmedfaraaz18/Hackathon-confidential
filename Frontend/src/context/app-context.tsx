'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { defaultData, AppData, Teacher, Student } from '@/lib/data';

type User = (Teacher | Student) & { type: 'teacher' | 'student' };

interface AppContextType {
  data: AppData;
  setData: (data: AppData | ((d: AppData) => AppData)) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  toggleTheme: () => void;
  addMessage: (message: AppData['messages'][0]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'campus_connect_data_v1';

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, defaultData);
  const [user, setUser] = useLocalStorage<User | null>('campus_connect_user_v1', null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', data.settings.theme === 'dark');
    }
  }, [data.settings.theme]);

  const toggleTheme = () => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  };
  
  const addMessage = (message: AppData['messages'][0]) => {
    setData(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }

  const value = {
    data,
    setData,
    user,
    setUser,
    isAuthenticated: !!user,
    toggleTheme,
    addMessage,
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
