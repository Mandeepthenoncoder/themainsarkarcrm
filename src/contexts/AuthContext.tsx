"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient, Session, User } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';

export interface Profile {
  id: string;
  role: 'admin' | 'manager' | 'salesperson' | null;
  full_name: string | null;
  avatar_url: string | null;
  assigned_showroom_id: string | null;
  // Add other profile fields as needed
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setLoading(true);
      console.log("[AuthContext] getSessionAndProfile: Fetching session...");
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("[AuthContext] getSessionAndProfile: Error getting session:", sessionError);
        setLoading(false);
        return;
      }
      console.log("[AuthContext] getSessionAndProfile: Session fetched:", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        console.log(`[AuthContext] getSessionAndProfile: Fetching profile for user ${currentSession.user.id}`);
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*') 
          .eq('id', currentSession.user.id)
          .single<Profile>();

        if (profileError) {
          console.error(`[AuthContext] getSessionAndProfile: Error fetching profile for user ${currentSession.user.id}:`, profileError);
          setProfile(null); // Explicitly set profile to null on error
        } else {
          console.log(`[AuthContext] getSessionAndProfile: Profile fetched for user ${currentSession.user.id}:`, userProfile);
          setProfile(userProfile);
        }
      } else {
        console.log("[AuthContext] getSessionAndProfile: No current session user, setting profile to null.");
        setProfile(null); 
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListenerData } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`[AuthContext] onAuthStateChange: Event - ${event}, New Session:`, newSession);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_OUT') {
        console.log("[AuthContext] onAuthStateChange: SIGNED_OUT - setting profile to null and redirecting.");
        setProfile(null);
        if (pathname !== '/login') {
            router.push('/login');
        }
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          console.log(`[AuthContext] onAuthStateChange: ${event} - Fetching profile for user ${newSession.user.id}`);
          supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single<Profile>()
            .then(({ data, error }) => {
              if (error) {
                console.error(`[AuthContext] onAuthStateChange: ${event} - Error fetching profile for user ${newSession.user.id}:`, error);
                setProfile(null); 
                supabase.auth.signOut().then(() => router.push('/login?error=profile_fetch_failed'));
              } else {
                console.log(`[AuthContext] onAuthStateChange: ${event} - Profile fetched successfully for user ${newSession.user.id}:`, data);
                setProfile(data);

                if (data && data.role && pathname === '/login') { 
                    console.log(`[AuthContext] onAuthStateChange: ${event} - User on login page with role ${data.role}. Redirecting to role dashboard.`);
                    switch (data.role) {
                        case 'admin': router.push('/admin/dashboard'); break;
                        case 'manager': router.push('/manager/dashboard'); break;
                        case 'salesperson': router.push('/salesperson/dashboard'); break;
                        default: 
                            console.warn(`[AuthContext] onAuthStateChange: ${event} - Unknown role ${data.role} for redirect. Sending to /`);
                            router.push('/');
                    }
                } else if (data && data.role && pathname !== '/login') {
                    console.log(`[AuthContext] onAuthStateChange: ${event} - Profile updated for user ${newSession.user.id} on path ${pathname}. State updated.`);
                }
              }
            });
        } else {
            console.log(`[AuthContext] onAuthStateChange: ${event} - No user in new session, setting profile to null.`);
            setProfile(null);
        }
      }
    });

    return () => {
      console.log("[AuthContext] Unsubscribing auth listener.");
      authListenerData.subscription?.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // State updates (session, user, profile to null) handled by onAuthStateChange
    // Router push to /login also handled by onAuthStateChange
    setLoading(false);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
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