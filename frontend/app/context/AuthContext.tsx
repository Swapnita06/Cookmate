"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../component/types/auth";
import { getUserProfile } from "../services/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 const [token, setToken] = useState<string | null>(null);
  
 useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);
  }, []);

  // Check if token exists in localStorage
  //const isAuthenticated = typeof window !== 'undefined' && Boolean(localStorage.getItem('token'));
const isAuthenticated = Boolean(token);
  const fetchUser = async () => {
    try {
      // Only fetch user if token exists
      if (isAuthenticated) {
        const { data } = await getUserProfile();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchUser();
  // }, [isAuthenticated]); // Re-run when authentication status changes

 useEffect(() => {
    fetchUser();
  }, [token]);


  const login = (token: string) => {
    localStorage.setItem('token', token);
    fetchUser(); // Fetch user profile after login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};