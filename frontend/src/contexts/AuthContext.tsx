/**
 * Authentication Context with Supabase
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabase, onAuthStateChange, getCurrentUser, getUserProfile, upsertUserProfile } from '../services/supabase';
import type { UserProfile } from '../types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'github' | 'google' | 'discord') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await getUserProfile(userId);
      if (error) {
        console.error('Failed to fetch profile:', error);
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [fetchProfile]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchProfile]);

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.user) {
        // Profile will be created via database trigger or we create it here
        await upsertUserProfile({
          id: data.user.id,
          email: data.user.email!,
          username,
          display_name: displayName,
          tier: 'free',
          spotify_connected: false,
          preferences: {
            theme: 'system',
            language: 'en',
            auto_save_enabled: true,
            cloud_sync_enabled: true,
            music_quality: 'high',
            emulator_settings: {
              video_driver: 'gl',
              audio_driver: 'web',
              aspect_ratio: '4:3',
              integer_scaling: true,
              vsync: true,
              bilinear_filter: false,
              rewind_enabled: true,
              fast_forward_ratio: 2,
            },
          },
        });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: 'github' | 'google' | 'discord') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      const { error } = await upsertUserProfile({ id: user.id, ...updates });
      if (error) {
        return { error: new Error(error.message) };
      }
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) {
        return { error: new Error(error.message) };
      }
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        initialized,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        updateProfile,
        updatePreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}