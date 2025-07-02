'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// Interfaces for the structured data we will return
export interface ReportFilterData {
    showrooms: { id: string; name: string | null; }[];
    managers: { id: string; full_name: string | null; }[];
    salespeople: { id: string; full_name: string | null; }[];
}

export interface ReportData {
    totalRevenue: number;
    totalTransactions: number;
    avgTransactionValue: number;
    newCustomers: number;
    leadConversionRate: number;
    topShowroomByRevenue: { name: string | null; total: number; };
    topSalespersonByRevenue: { name: string | null; total: number; };
    topManagerByTeamRevenue: { name: string | null; total: number; };
    // We can add more complex data structures for charts later
}

// Main function to fetch all data needed for the reports page
export async function getAdminReportsPageData(): Promise<{
    filters: ReportFilterData;
    reports: ReportData; // This will hold the calculated data
    error: string | null;
}> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // 1. Fetch data for filters first
        const [showroomsRes, managersRes, salespeopleRes] = await Promise.all([
            supabase.from('showrooms').select('id, name'),
            supabase.from('profiles').select('id, full_name').eq('role', 'manager'),
            supabase.from('profiles').select('id, full_name').eq('role', 'salesperson')
        ]);
        
        if (showroomsRes.error || managersRes.error || salespeopleRes.error) {
            console.error("Error fetching filter data:", showroomsRes.error, managersRes.error, salespeopleRes.error);
            throw new Error("Failed to load filter options.");
        }
        
        const filters: ReportFilterData = {
            showrooms: showroomsRes.data || [],
            managers: managersRes.data || [],
            salespeople: salespeopleRes.data || []
        };
        
        // 2. Fetch data for reports (can be filtered later with URL params)
        const { data: sales, error: salesError } = await supabase.from('sales_transactions').select(`*, showrooms(name), profiles(full_name, supervising_manager_id), customers!inner(id, deleted_at)`).is('customers.deleted_at', null);
        const { data: customers, error: customersError } = await supabase.from('customers').select('id, lead_status').is('deleted_at', null);
        
        if (salesError || customersError) {
             console.error("Error fetching report data:", salesError, customersError);
            throw new Error("Failed to load report data.");
        }

        // 3. Process the data
        const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
        const totalTransactions = sales.length;
        const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const newCustomers = customers.length;
        const closedWonLeads = customers.filter(c => c.lead_status === 'Closed Won').length;
        const leadConversionRate = newCustomers > 0 ? (closedWonLeads / newCustomers) * 100 : 0;

        // More complex aggregations
        const showroomRevenue = sales.reduce((acc, sale) => {
            const name = sale.showrooms?.name || 'Unknown';
            acc[name] = (acc[name] || 0) + (sale.total_amount || 0);
            return acc;
        }, {} as Record<string, number>);
        
        const topShowroomByRevenue = Object.entries(showroomRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 1)
            .map(([name, total]) => ({ name, total }))[0] || { name: 'N/A', total: 0 };


        // For brevity, salesperson and manager calculations are simplified.
        // A more robust solution might need more complex queries or data joins.
        const reports: ReportData = {
            totalRevenue,
            totalTransactions,
            avgTransactionValue,
            newCustomers,
            leadConversionRate,
            topShowroomByRevenue,
            topSalespersonByRevenue: { name: 'Aarav Patel (Dummy)', total: 500000 }, // Placeholder
            topManagerByTeamRevenue: { name: 'Priya Sharma (Dummy)', total: 1200000 } // Placeholder
        };

        return { filters, reports, error: null };

    } catch (e: any) {
        return { 
            filters: { showrooms: [], managers: [], salespeople: [] },
            reports: {} as ReportData, // Return empty shell on error
            error: e.message 
        };
    }
} 