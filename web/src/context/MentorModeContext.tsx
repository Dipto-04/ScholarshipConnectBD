"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface MentorModeContextType {
  isMentorMode: boolean;
  toggleMentorMode: () => void;
}

const MentorModeContext = createContext<MentorModeContextType | undefined>(undefined);

export function MentorModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isMentorMode, setIsMentorMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('mentorMode');
    if (savedMode === 'true' && user?.is_staff) { // or user.is_mentor if that field exists
      setIsMentorMode(true);
    }
  }, [user]);

  const toggleMentorMode = () => {
    const newMode = !isMentorMode;
    setIsMentorMode(newMode);
    localStorage.setItem('mentorMode', String(newMode));
  };

  return (
    <MentorModeContext.Provider value={{ isMentorMode, toggleMentorMode }}>
      {children}
    </MentorModeContext.Provider>
  );
}

export const useMentorMode = () => {
  const context = useContext(MentorModeContext);
  if (context === undefined) {
    throw new Error('useMentorMode must be used within a MentorModeProvider');
  }
  return context;
};
