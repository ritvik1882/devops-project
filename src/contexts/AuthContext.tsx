
"use client";

import type { AuthenticatedUser } from '@/lib/types';
import type { ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const SESSION_KEY = 'blog-sphere-active-user-id';

const getSessionUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SESSION_KEY);
};

const setSessionUserId = (userId: string | null) => {
  if (typeof window === 'undefined') return;
  if (!userId) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, userId);
};

const parseResponse = async <T,>(response: Response): Promise<T> => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }
  return payload as T;
};

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (credentials: { email: string; pass: string }) => Promise<void>;
  signup: (details: { name: string, email: string; pass: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (details: { name?: string; bio?: string; avatarUrl?: string; email?: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const bootstrapSession = async () => {
      setIsLoading(true);
      try {
        const activeUserId = getSessionUserId();
        if (!activeUserId) {
          setUser(null);
          return;
        }

        const response = await fetch(`/api/auth/session/${activeUserId}`, { cache: 'no-store' });
        if (response.status === 404) {
          setSessionUserId(null);
          setUser(null);
          return;
        }

        const payload = await parseResponse<{ user: AuthenticatedUser }>(response);
        setUser(payload.user);
      } catch (error) {
        console.error('Failed to restore session from offline store:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const login = async (credentials: { email: string; pass: string }) => {
    setIsLoading(true);
    try {
      const payload = await parseResponse<{ user: AuthenticatedUser }>(
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })
      );
      setSessionUserId(payload.user.id);
      setUser(payload.user);
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({ title: "Login Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (details: { name: string, email: string; pass: string }) => {
    setIsLoading(true);
    try {
      const payload = await parseResponse<{ user: AuthenticatedUser }>(
        await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(details),
        })
      );
      setSessionUserId(payload.user.id);
      setUser(payload.user);
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast({ title: "Signup Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setSessionUserId(null);
      setUser(null);
      router.push('/');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileDetails: { name?: string; bio?: string; avatarUrl?: string; email?: string }) => {
    if (!user) {
      toast({ title: "Error", description: "No user logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const payload = await parseResponse<{ user: AuthenticatedUser }>(
        await fetch(`/api/profile/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileDetails),
        })
      );
      setUser(payload.user);

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast({ title: "Update Failed", description: error.message || "Could not update profile.", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
