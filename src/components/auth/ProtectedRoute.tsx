"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, Profile } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Array<Profile['role']>; // Array of allowed roles (e.g., ['admin', 'manager'])
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading, session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log(`[ProtectedRoute] Path: ${pathname}, Allowed: ${allowedRoles.join(', ')}, AuthLoading: ${loading}, Session: ${!!session}, Profile:`, profile);

    if (loading) {
      console.log("[ProtectedRoute] Auth is loading. Waiting...");
      return; 
    }

    if (!session) {
      console.log("[ProtectedRoute] No session. Redirecting to login.");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Session exists, now check profile and role
    if (!profile) {
        console.warn(`[ProtectedRoute] Path: ${pathname}. Session exists but profile is not yet available (could be loading or an error). Current profile value:`, profile);
        // This state might be hit if profile is still loading from AuthContext
        // The loading screen of ProtectedRoute should ideally cover this.
    }

    // THE CRITICAL CHECK:
    console.log(`[ProtectedRoute] Path: ${pathname}. Evaluating access: Profile Role: ${profile?.role}, Allowed Roles: ${allowedRoles.join(', ')}`);
    if (!profile || !profile.role || !allowedRoles.includes(profile.role)) {
      console.warn(
        `[ProtectedRoute] UNAUTHORIZED access attempt or incomplete profile. Path: ${pathname}, User ID: ${user?.id}, Profile Role: ${profile?.role}, Allowed: ${allowedRoles.join(', ')}. Redirecting...`
      );
      
      if (profile && profile.role) {
        console.log(`[ProtectedRoute] User has role ${profile.role}, but not allowed for ${pathname}. Redirecting to their own dashboard.`);
        switch (profile.role) {
          case 'admin': router.push('/admin/dashboard'); break;
          case 'manager': router.push('/manager/dashboard'); break;
          case 'salesperson': router.push('/salesperson/dashboard'); break;
          default: 
            console.log("[ProtectedRoute] Unknown role in profile for secondary redirect. Redirecting to login.");
            router.push('/login'); 
        }
      } else {
        console.log("[ProtectedRoute] No profile or no role after auth loading complete. Redirecting to login.");
        router.push('/login');
      }
      return;
    } else {
        console.log(`[ProtectedRoute] Path: ${pathname}. Access GRANTED. User role: ${profile.role}`);
    }

  }, [user, profile, loading, session, router, allowedRoles, pathname]);

  // Conditional rendering for loading state
  if (loading) {
    // console.log(`[ProtectedRoute] Path: ${pathname}. Rendering loading screen (auth loading).`);
    return <div className="flex items-center justify-center min-h-screen"><p>Initializing Authentication...</p></div>;
  }
  if (!session) {
    // console.log(`[ProtectedRoute] Path: ${pathname}. Rendering loading screen (no session, redirecting to login).`);
    return <div className="flex items-center justify-center min-h-screen"><p>Redirecting to Login...</p></div>;
  }
  // This check is crucial: if profile is still null/undefined even after loading=false & session=true, 
  // it means profile fetch failed or hasn't completed. The useEffect handles redirection for this.
  // However, to prevent flashing content, we show loading until profile is definitively available OR redirection has occurred.
  if (!profile || !profile.role) {
    // console.log(`[ProtectedRoute] Path: ${pathname}. Rendering loading screen (profile or role not yet available post-auth load).`);
    return <div className="flex items-center justify-center min-h-screen"><p>Verifying Profile...</p></div>;
  }
  if (!allowedRoles.includes(profile.role)){
    // console.log(`[ProtectedRoute] Path: ${pathname}. Rendering loading screen (role not allowed, redirecting).`);
    return <div className="flex items-center justify-center min-h-screen"><p>Access Denied. Redirecting...</p></div>;
  }

  // console.log(`[ProtectedRoute] Path: ${pathname}. All checks passed, rendering children.`);
  return <>{children}</>; 
};

export default ProtectedRoute; 