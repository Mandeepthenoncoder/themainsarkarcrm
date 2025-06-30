"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthButton from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

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
          console.warn(`Unknown or null role: ${profile.role} for user ${user?.id}. Staying on home page.`);
      }
    }
    // If not logged in, show the login choice page (don't auto-redirect)

  }, [session, profile, authLoading, user, router]);

  // If still loading, show loading screen
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-foreground">
            Initializing Sarkar Jewellers CRM...
          </p>
        </div>
      </div>
    );
  }

  // Show login options if not authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="h-16 w-16 text-blue-600 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 7V17L12 22L22 17V7L12 2Z" />
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Sarkar Jewellers</h1>
              <p className="text-sm text-slate-600">Est. 1985 • Ahmedabad</p>
            </div>
          </div>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          {/* Sales Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Sales Team</h2>
              <p className="text-sm text-slate-600">Quick access for salespeople</p>
            </div>
            <Link href="/sales-login">
              <Button className="w-full" size="lg">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Login
              </Button>
            </Link>
          </div>

          {/* Admin/Manager Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 00-2-2v0a2 2 0 00-2 2v9m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Admin & Managers</h2>
              <p className="text-sm text-slate-600">Full system access</p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full" size="lg">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Secure Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Sarkar Jewellers CRM. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
