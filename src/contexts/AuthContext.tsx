
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database for demo purposes
const MOCK_USERS: Record<string, { password: string; userData: User }> = {
  'admin@example.com': {
    password: 'admin123',
    userData: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff',
    },
  },
  'teacher@example.com': {
    password: 'teacher123',
    userData: {
      id: '2',
      name: 'Teacher User',
      email: 'teacher@example.com',
      role: 'teacher',
      avatar: 'https://ui-avatars.com/api/?name=Teacher+User&background=8b5cf6&color=fff',
    },
  },
  'student@example.com': {
    password: 'student123',
    userData: {
      id: '3',
      name: 'Student User',
      email: 'student@example.com',
      role: 'student',
      avatar: 'https://ui-avatars.com/api/?name=Student+User&background=22c55e&color=fff',
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored user on initial load
    const storedUser = localStorage.getItem('gms_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('gms_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const userRecord = MOCK_USERS[email.toLowerCase()];
      if (!userRecord || userRecord.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      setUser(userRecord.userData);
      localStorage.setItem('gms_user', JSON.stringify(userRecord.userData));
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (MOCK_USERS[email.toLowerCase()]) {
        throw new Error('Email already registered');
      }
      
      // In a real app, we'd send this to a server
      // For demo, just add to our mock database
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
      };
      
      MOCK_USERS[email.toLowerCase()] = {
        password,
        userData: newUser,
      };
      
      setUser(newUser);
      localStorage.setItem('gms_user', JSON.stringify(newUser));
      toast.success('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gms_user');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
