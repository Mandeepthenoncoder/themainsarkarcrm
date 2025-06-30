"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthButton from "@/components/auth/AuthButton";

export default function HomePage() {
  const { session, profile, loading: authLoading, user } = useAuth(); // useAuth provides authLoading
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      // Still loading auth state, do nothing yet
      return;
    }

    if (session && profile && profile.role) {
      // User is logged in and has a profile with a role
      switch (profile.role) {
        case 'admin':
          router.replace('/admin/dashboard');
          break;
        case 'manager':
          router.replace('/manager/dashboard');
          break;
        case 'salesperson':
          router.replace('/salesperson/dashboard');
          break;
        default:
          console.warn(`Unknown or null role: ${profile.role} for user ${user?.id}. Redirecting to login.`);
          router.replace('/login');
      }
    } else if (!session) {
      // No session, user is not logged in
      router.replace('/login');
    } else if (session && !profile && !authLoading) {
        // Session exists, auth is not loading, but profile is still not available.
        // This indicates an issue (e.g., profile record missing, or error during fetch in AuthContext).
        console.warn(`User ${user?.id} has session but no profile after loading. Redirecting to login.`);
        router.replace('/login');
    }
    // If session exists, profile is null, AND authLoading IS true, we do nothing, waiting for profile.

  }, [session, profile, authLoading, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-foreground">
          Initializing...
        </p>
      </div>
    </div>
  );
}
