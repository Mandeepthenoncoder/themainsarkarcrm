'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { parsePriceRange } from '@/lib/utils';
import { DisplayTeamMessage, getTeamMessagesAction } from '../communication/actions'; 
import { TeamGoal, getManagerTeamGoalsAction } from '../goals/actions'; 
import { getManagerEscalatedItemsAction } from '../escalations/actions'; 

// --- Types for data fetched directly by this action --- //
type DashboardProfile = Database['public']['Tables']['profiles']['Row'];

// Type for customer with interest categories (extended to include purchase_amount)
interface CustomerWithInterest {
  id: string;
  interest_categories_json: any;
  purchase_amount?: number | null;
}

// Type for the structure within interest_categories_json
interface InterestCategoryProduct {
  price_range?: string | null;
}
interface InterestCategory {
  products?: InterestCategoryProduct[] | null;
}

export interface EnhancedManagerDashboardData {
  managerProfile: DashboardProfile | null;
  teamMembers: DashboardProfile[];
  totalTeamCustomers: number;
  totalUpcomingTeamAppointments: number;
  totalPendingTeamFollowUps: number;
  newCustomersLast30Days: number;
  totalTeamRevenueOpportunity: number;
  totalTeamConvertedRevenue: number; // New: total converted revenue from team
  teamConvertedCustomersCount: number; // New: number of converted customers in team
  teamConversionRate: string; // New: team conversion rate
  recentAnnouncements: DisplayTeamMessage[]; 
  activeGoals: TeamGoal[];
  openEscalationsCount: number;
}

interface SuccessResult {
  success: true;
  data: EnhancedManagerDashboardData;
}

interface ErrorResult {
  success: false;
  error: string;
}

export type GetEnhancedManagerDashboardDataResult = SuccessResult | ErrorResult;

export async function getEnhancedManagerDashboardDataAction(): Promise<GetEnhancedManagerDashboardDataResult> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userProfileError || !userProfile) {
      console.error("Error fetching user profile:", userProfileError?.message);
      return { success: false, error: 'Failed to load user profile.' };
    }
    
    // **
    // ** CORRECTED ACCESS CONTROL LOGIC
    // **
    const allowedRoles = ['manager', 'admin'];
    if (!userProfile.role || !allowedRoles.includes(userProfile.role)) {
        return { success: false, error: 'Access Denied. This page is for managers and admins only.' };
    }

    // Use a variable to hold the ID for the team query.
    // If the user is an admin, we want to see their own (likely empty) team, not all salespeople.
    const managerIdForQuery = userProfile.id;

    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, employee_id, assigned_showroom_id')
      .eq('supervising_manager_id', managerIdForQuery)
      .returns<DashboardProfile[]>();
      
    const teamMembers = teamMembersData || [];

    if (teamMembersError) {
      console.error("Error fetching team members:", teamMembersError.message);
    }
    const teamMemberIds = teamMembers.map(tm => tm.id);

    let totalTeamCustomers = 0;
    let totalUpcomingTeamAppointments = 0;
    let totalPendingTeamFollowUps = 0;
    let newCustomersLast30Days = 0;
    let totalTeamRevenueOpportunity = 0;
    let totalTeamConvertedRevenue = 0;
    let teamConvertedCustomersCount = 0;

    if (teamMemberIds.length > 0) {
      const today = new Date().toISOString();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: teamCustomersData } = await supabase
        .from('customers')
        .select('id, interest_categories_json, purchase_amount')
        .in('assigned_salesperson_id', teamMemberIds)
        .is('deleted_at', null)
        .returns<CustomerWithInterest[]>();

      if (teamCustomersData) {
        teamCustomersData.forEach(customer => {
          // Calculate pipeline value from interest categories
          if (customer.interest_categories_json && Array.isArray(customer.interest_categories_json)) {
            const categories = customer.interest_categories_json as InterestCategory[];
            categories.forEach(category => {
              if (category.products && Array.isArray(category.products)) {
                category.products.forEach(product => {
                  if (product.price_range) {
                    totalTeamRevenueOpportunity += parsePriceRange(product.price_range);
                  }
                });
              }
            });
          }

          // Calculate converted revenue
          if (customer.purchase_amount && customer.purchase_amount > 0) {
            totalTeamConvertedRevenue += customer.purchase_amount;
            teamConvertedCustomersCount++;
          }
        });
      }

      const [customerCountRes, apptCountRes, followUpCountRes, newCustomerCountRes] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }).in('assigned_salesperson_id', teamMemberIds).is('deleted_at', null),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).in('salesperson_id', teamMemberIds).gte('appointment_datetime', today),
        supabase.from('customers').select('id', { count: 'exact', head: true }).in('assigned_salesperson_id', teamMemberIds).not('follow_up_date', 'is', null).gte('follow_up_date', today.split('T')[0]).is('deleted_at', null),
        supabase.from('customers').select('id', { count: 'exact', head: true }).in('assigned_salesperson_id', teamMemberIds).gte('created_at', thirtyDaysAgo.toISOString()).is('deleted_at', null),
      ]);

      totalTeamCustomers = customerCountRes.count || 0;
      totalUpcomingTeamAppointments = apptCountRes.count || 0;
      totalPendingTeamFollowUps = followUpCountRes.count || 0;
      newCustomersLast30Days = newCustomerCountRes.count || 0;
    }

    // Calculate team conversion rate
    const teamConversionRate = totalTeamCustomers > 0 
      ? ((teamConvertedCustomersCount / totalTeamCustomers) * 100).toFixed(1) 
      : '0.0';

    const announcementsResult = await getTeamMessagesAction();
    const recentAnnouncements = announcementsResult.success ? announcementsResult.messages.slice(0, 2) : [];

    const goalsResult = await getManagerTeamGoalsAction();
    const activeGoals = goalsResult.success ? goalsResult.goals.slice(0, 3) : [];

    const escalationsResult = await getManagerEscalatedItemsAction();
    let openEscalationsCount = 0;
    if (escalationsResult.success) {
      openEscalationsCount = escalationsResult.escalations.filter(
        e => e.status === 'New' || e.status === 'Action Pending' || e.status === 'Under Review'
      ).length;
    }

    return {
      success: true,
      data: {
        managerProfile: userProfile,
        teamMembers,
        totalTeamCustomers,
        totalUpcomingTeamAppointments,
        totalPendingTeamFollowUps,
        newCustomersLast30Days,
        totalTeamRevenueOpportunity,
        totalTeamConvertedRevenue,
        teamConvertedCustomersCount,
        teamConversionRate,
        recentAnnouncements,
        activeGoals,
        openEscalationsCount,
      },
    };

  } catch (e: any) {
    console.error('Unexpected error in getEnhancedManagerDashboardDataAction:', e.message);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
} 