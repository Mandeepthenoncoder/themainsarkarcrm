"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { Gem } from 'lucide-react'; // Icon for branding

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const { session, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session && profile && profile.role) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        router.replace(redirectPath);
      } else {
        switch (profile.role) {
          case 'admin': router.replace('/admin/dashboard'); break;
          case 'manager': router.replace('/manager/dashboard'); break;
          case 'salesperson': router.replace('/salesperson/dashboard'); break;
          default: router.replace('/');
        }
      }
    }
  }, [session, profile, authLoading, router, searchParams]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLocalLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    const intendedRedirect = searchParams.get('redirect');
    if (intendedRedirect) {
        router.push(intendedRedirect);
    }
    // If no specific redirect, AuthContext logic for SIGNED_IN from /login will handle it
  };
  
  if (authLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <Gem className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="ml-4 text-lg">Loading authentication...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center">
      <div className="relative py-3 sm:max-w-xl md:max-w-4xl mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-xl sm:rounded-3xl md:p-20 grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          
          {/* Branding Side */}
          <div className="md:col-span-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <Gem className="h-16 w-16 text-blue-600" /> 
              {/* Replace Gem with your actual logo component or img tag if you have one */}
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Jewelry CRM</h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              Welcome back! Access your dedicated portal to manage customers, appointments, and drive sales.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Secure & Reliable Access for Authorized Personnel.
            </p>
          </div>

          {/* Form Side */}
          <div className="md:col-span-1">
            <div className="w-full">
              <h2 className="text-3xl font-semibold text-slate-800 mb-2 text-center">Sign In</h2>
              <p className="text-slate-500 mb-8 text-center">Enter your credentials to continue.</p>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={localLoading}
                    className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-base"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={localLoading}
                    className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-base"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {/* You can add an error icon here */}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base"
                    disabled={localLoading || authLoading}
                  >
                    {localLoading ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </div>
              </form>
              <p className="mt-8 text-xs text-slate-500 text-center">
                &copy; {new Date().getFullYear()} Jewelry CRM. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <Gem className="h-12 w-12 text-blue-600 animate-spin" />
      <p className="ml-4 text-lg">Loading...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
} 