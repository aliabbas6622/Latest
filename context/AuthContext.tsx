import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { getMyProfile, signIn as supabaseSignIn, signOut as supabaseSignOut } from '../supabase/db';
import type { Profile, UserRole } from '../supabase/database.types';
import { db as mockDb } from '../services/mockBackend';
import { User as MockUser, UserRole as MockUserRole } from '../types';

// Unified user type that works with both Supabase and mock backend
interface UnifiedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole | MockUserRole;
  institutionId?: string | null;
}

interface AuthContextType {
  user: UnifiedUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, remember: boolean) => Promise<UnifiedUser | null>;
  logout: () => void;
  isLoading: boolean;
  isSupabase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const useSupabase = isSupabaseConfigured();

  useEffect(() => {
    const initAuth = async () => {
      if (useSupabase && supabase) {
        // Supabase auth initialization
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          try {
            const profile = await getMyProfile();
            if (profile) {
              setUser({
                id: profile.id,
                email: session.user.email || '',
                name: profile.full_name,
                role: profile.role,
                institutionId: profile.institute_id,
              });
            }
          } catch (err) {
            console.error('Profile fetch failed:', err);
            // Fallback to metadata if available (fixes login crash during RLS layout)
            if (session.user.user_metadata?.role) {
              console.warn('Using metadata fallback for user');
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata.full_name || 'User',
                role: session.user.user_metadata.role,
                institutionId: session.user.user_metadata.institute_id,
              });
            }
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              const profile = await getMyProfile();
              if (profile) {
                setUser({
                  id: profile.id,
                  email: session.user.email || '',
                  name: profile.full_name,
                  role: profile.role,
                  institutionId: profile.institute_id,
                });
              }
            } catch (err) {
              console.error('Profile fetch failed on auth change:', err);
              // Fallback
              if (session.user.user_metadata?.role) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata.full_name || 'User',
                  role: session.user.user_metadata.role,
                  institutionId: session.user.user_metadata.institute_id,
                });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        });

        setIsLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Mock backend initialization
        const storedUser = localStorage.getItem('aptivo_session_user') ||
          sessionStorage.getItem('aptivo_session_user');
        if (storedUser) {
          const mockUser: MockUser = JSON.parse(storedUser);
          setUser({
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
            institutionId: mockUser.institutionId,
          });
        }
        setIsLoading(false);
      }
    };

    initAuth();
  }, [useSupabase]);

  const login = async (email: string, pass: string, remember: boolean): Promise<UnifiedUser | null> => {
    setIsLoading(true);
    let loggedInUser: UnifiedUser | null = null;

    try {
      if (useSupabase) {
        // Supabase auth
        const { user: authUser } = await supabaseSignIn(email, pass);
        if (!authUser) throw new Error('Login failed');

        try {
          const profile = await getMyProfile();
          if (!profile) throw new Error('Profile not found');

          loggedInUser = {
            id: profile.id,
            email: authUser.email || '',
            name: profile.full_name,
            role: profile.role,
            institutionId: profile.institute_id,
          };
          setUser(loggedInUser);
        } catch (err: any) {
          console.error('Login profile fetch failed:', err);
          // Fallback
          if (authUser.user_metadata?.role) {
            loggedInUser = {
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata.full_name || 'User',
              role: authUser.user_metadata.role,
              institutionId: authUser.user_metadata.institute_id,
            };
            setUser(loggedInUser);
          } else {
            if (JSON.stringify(err).includes('recursion')) {
              throw new Error('Database error: Please run the fix_recursion.sql script.');
            }
            throw err;
          }
        }
      } else {
        // Mock backend auth (existing logic)
        const { user: mockUser } = await mockDb.login(email, pass);

        loggedInUser = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          institutionId: mockUser.institutionId,
        };

        setUser(loggedInUser);

        const userStr = JSON.stringify(mockUser);
        if (remember) {
          localStorage.setItem('aptivo_session_user', userStr);
          sessionStorage.removeItem('aptivo_session_user');
        } else {
          sessionStorage.setItem('aptivo_session_user', userStr);
          localStorage.removeItem('aptivo_session_user');
        }
      }
    } finally {
      setIsLoading(false);
    }
    return loggedInUser;
  };

  const logout = async () => {
    if (useSupabase) {
      await supabaseSignOut();
    } else {
      localStorage.removeItem('aptivo_session_user');
      sessionStorage.removeItem('aptivo_session_user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isLoading,
      isSupabase: useSupabase
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};