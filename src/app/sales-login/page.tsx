"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Gem, User, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

interface Salesperson {
  id: string;
  full_name: string | null;
  email: string | null;
  assigned_showroom_id: string | null;
  showroom_name?: string | null;
  avatar_url: string | null;
}

interface ShowroomGroup {
  showroom_id: string | null;
  showroom_name: string;
  salespeople: Salesperson[];
}

export default function SalesLoginPage() {
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [showroomGroups, setShowroomGroups] = useState<ShowroomGroup[]>([]);
  const [selectedShowroom, setSelectedShowroom] = useState<ShowroomGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { session, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session && profile && profile.role) {
      // If already logged in, redirect to appropriate dashboard
      switch (profile.role) {
        case 'admin': router.replace('/admin/dashboard'); break;
        case 'manager': router.replace('/manager/dashboard'); break;
        case 'salesperson': router.replace('/salesperson/dashboard'); break;
        default: router.replace('/');
      }
    }
  }, [session, profile, authLoading, router]);

  useEffect(() => {
    const fetchSalespeople = async () => {
      try {
        // First, let's try a simple query without status filter
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            avatar_url,
            assigned_showroom_id
          `)
          .eq('role', 'salesperson')
          .order('full_name');

        console.log('Salespeople query result:', { data, error });

        if (error) {
          console.error('Error fetching salespeople:', error);
          setError(`Failed to load salespeople: ${error.message}`);
        } else if (!data || data.length === 0) {
          console.warn('No salespeople found in database');
          setError('No salespeople found. Please check if sales accounts have been created.');
        } else {
          // Get showroom names separately to avoid join issues
          const salespeopleWithShowrooms = await Promise.all(
            data.map(async (person) => {
              let showroom_name = null;
              if (person.assigned_showroom_id) {
                const { data: showroomData } = await supabase
                  .from('showrooms')
                  .select('name')
                  .eq('id', person.assigned_showroom_id)
                  .single();
                showroom_name = showroomData?.name || null;
              }
              return {
                ...person,
                showroom_name
              };
            })
          );
          
          console.log('Processed salespeople:', salespeopleWithShowrooms);
          setSalespeople(salespeopleWithShowrooms);

          // Group salespeople by showroom
          const groups: Record<string, Salesperson[]> = {};
          salespeopleWithShowrooms.forEach(person => {
            const showroomKey = person.assigned_showroom_id || 'unassigned';
            if (!groups[showroomKey]) {
              groups[showroomKey] = [];
            }
            groups[showroomKey].push(person);
          });

          // Convert to ShowroomGroup array
          const showroomGroupsArray: ShowroomGroup[] = Object.entries(groups).map(([showroomId, people]) => ({
            showroom_id: showroomId === 'unassigned' ? null : showroomId,
            showroom_name: people[0]?.showroom_name || 'Unassigned Store',
            salespeople: people
          }));

          setShowroomGroups(showroomGroupsArray);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Failed to load salespeople: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSalespeople();
  }, [supabase]);

  const handleSalesLogin = async (salesperson: Salesperson) => {
    if (!salesperson.email) {
      setError('Email not found for this salesperson');
      return;
    }

    setLoginLoading(salesperson.id);
    setError(null);

    try {
      // Use a default password for all salespeople - in production, this should be more secure
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: salesperson.email,
        password: 'sales123', // Default password for all sales accounts
      });

      if (signInError) {
        console.error('Login error:', signInError);
        setError(`Login failed: ${signInError.message}`);
      }
      // Success will be handled by AuthContext which will redirect automatically
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred during login');
    } finally {
      setLoginLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Gem className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="ml-4 text-lg">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Gem className="h-16 w-16 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-slate-800">Sarkar Jewellers</h1>
              <p className="text-lg text-slate-600">Sales Team Portal</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/login">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Admin/Manager Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading sales team...</p>
          </div>
        ) : (
          <>
            {!selectedShowroom ? (
              <>
                {/* Store Selection */}
                <div className="max-w-2xl mx-auto text-center mb-8">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                    Welcome Sales Team!
                  </h2>
                  <p className="text-slate-600">
                    First, select your store location to continue.
                  </p>
                </div>

                {/* Showroom Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {showroomGroups.map((showroom) => (
                    <Card 
                      key={showroom.showroom_id || 'unassigned'} 
                      className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 hover:border-blue-300"
                      onClick={() => setSelectedShowroom(showroom)}
                    >
                      <CardHeader className="text-center pb-3">
                        <div className="mx-auto mb-3 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Gem className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-slate-800">
                          {showroom.showroom_name}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                          {showroom.salespeople.length} {showroom.salespeople.length === 1 ? 'salesperson' : 'salespeople'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button className="w-full">
                          Select Store
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Salesperson Selection */}
                <div className="max-w-2xl mx-auto text-center mb-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedShowroom(null)}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Store Selection
                  </Button>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                    {selectedShowroom.showroom_name}
                  </h2>
                  <p className="text-slate-600">
                    Select your name to access your dashboard.
                  </p>
                </div>

                {/* Salespeople Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {selectedShowroom.salespeople.map((salesperson) => (
                    <Card 
                      key={salesperson.id} 
                      className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 hover:border-blue-300"
                      onClick={() => handleSalesLogin(salesperson)}
                    >
                      <CardHeader className="text-center pb-3">
                        <div className="mx-auto mb-3 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          {salesperson.avatar_url ? (
                            <img 
                              src={salesperson.avatar_url} 
                              alt={salesperson.full_name || 'Avatar'} 
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-blue-600" />
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold text-slate-800">
                          {salesperson.full_name || 'Unknown'}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                          Sales Representative
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button 
                          className="w-full"
                          disabled={loginLoading === salesperson.id}
                          variant={loginLoading === salesperson.id ? "secondary" : "default"}
                        >
                          {loginLoading === salesperson.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Signing In...
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Quick Login
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* No salespeople message */}
            {salespeople.length === 0 && !loading && (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Salespeople Found</h3>
                <p className="text-slate-500 mb-4">Database query returned no results.</p>
                
                {/* Fallback Test Login */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">Test Login Available</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Use this temporary login while we debug the salespeople loading issue.
                  </p>
                  <Button 
                    onClick={() => handleSalesLogin({
                      id: 'test-chirag',
                      full_name: 'Chirag (Test)',
                      email: 'chiragbhai@sarkarjewellers.com',
                      assigned_showroom_id: null,
                      showroom_name: 'Sarkar Jewellers',
                      avatar_url: null
                    })}
                    disabled={loginLoading === 'test-chirag'}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {loginLoading === 'test-chirag' ? 'Signing In...' : 'Test Login (Chirag)'}
                  </Button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-12 pt-8 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} Sarkar Jewellers. All rights reserved.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Established 1985 • Ahmedabad, Gujarat
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 