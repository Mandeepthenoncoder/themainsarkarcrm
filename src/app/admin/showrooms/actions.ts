'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export interface ShowroomForAdminView {
    id: string;
    name: string;
    location_address: string | null;
    city: string | null;
    state: string | null;
    phone_number: string | null;
    email_address: string | null;
    status: string;
    date_established: string | null;
    created_at: string;
    updated_at: string;
    manager: {
        id: string;
        full_name: string | null;
        email: string | null;
    } | null;
    salesperson_count: number;
    ytd_sales: number;
}

export interface DetailedShowroom extends ShowroomForAdminView {
    zip_code: string | null;
    operating_hours: any;
    salespeople: Array<{
        id: string;
        full_name: string | null;
        email: string | null;
        employee_id: string | null;
        status: string;
    }>;
}

export async function getShowroomsForAdminView(): Promise<{
    showrooms: ShowroomForAdminView[];
    error: string | null;
}> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // Get showrooms with manager info and calculate salespeople count and YTD sales
        const { data: showrooms, error: showroomsError } = await supabase
            .from('showrooms')
            .select(`
                id,
                name,
                location_address,
                city,
                state,
                phone_number,
                email_address,
                status,
                date_established,
                created_at,
                updated_at,
                manager:profiles!manager_id (
                    id,
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (showroomsError) {
            console.error('Error fetching showrooms:', showroomsError);
            return { showrooms: [], error: 'Failed to fetch showrooms' };
        }

        // For each showroom, get salespeople count and YTD sales
        const enrichedShowrooms = await Promise.all(
            (showrooms || []).map(async (showroom) => {
                // Get salespeople count for this showroom
                const { count: salespeopleCount, error: countError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('assigned_showroom_id', showroom.id)
                    .eq('role', 'salesperson')
                    .eq('status', 'active');

                // Get YTD sales for this showroom
                const { data: salesData, error: salesError } = await supabase
                    .from('sales_transactions')
                    .select('total_amount, customers!inner(id, deleted_at)')
                    .is('customers.deleted_at', null)
                    .eq('showroom_id', showroom.id)
                    .gte('transaction_date', new Date(new Date().getFullYear(), 0, 1).toISOString());

                const ytdSales = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

                return {
                    ...showroom,
                    salesperson_count: salespeopleCount || 0,
                    ytd_sales: ytdSales
                } as ShowroomForAdminView;
            })
        );

        return { showrooms: enrichedShowrooms, error: null };

    } catch (error: any) {
        console.error('Unexpected error fetching showrooms:', error);
        return { showrooms: [], error: error.message || 'An unexpected error occurred' };
    }
}

export async function getShowroomDetailForAdmin(showroomId: string): Promise<{
    showroom: DetailedShowroom | null;
    error: string | null;
}> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // Get detailed showroom info
        const { data: showroom, error: showroomError } = await supabase
            .from('showrooms')
            .select(`
                id,
                name,
                location_address,
                city,
                state,
                zip_code,
                phone_number,
                email_address,
                status,
                date_established,
                operating_hours,
                created_at,
                updated_at,
                manager:profiles!manager_id (
                    id,
                    full_name,
                    email
                )
            `)
            .eq('id', showroomId)
            .single();

        if (showroomError) {
            return { showroom: null, error: 'Showroom not found' };
        }

        // Get salespeople for this showroom
        const { data: salespeople, error: salespeopleError } = await supabase
            .from('profiles')
            .select('id, full_name, email, employee_id, status')
            .eq('assigned_showroom_id', showroomId)
            .eq('role', 'salesperson')
            .order('full_name');

        // Get sales count and YTD sales
        const { count: salespeopleCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_showroom_id', showroomId)
            .eq('role', 'salesperson')
            .eq('status', 'active');

        const { data: salesData } = await supabase
            .from('sales_transactions')
            .select('total_amount, customers!inner(id, deleted_at)')
            .is('customers.deleted_at', null)
            .eq('showroom_id', showroomId)
            .gte('transaction_date', new Date(new Date().getFullYear(), 0, 1).toISOString());

        const ytdSales = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

        const detailedShowroom: DetailedShowroom = {
            ...showroom,
            salesperson_count: salespeopleCount || 0,
            ytd_sales: ytdSales,
            salespeople: salespeople || []
        };

        return { showroom: detailedShowroom, error: null };

    } catch (error: any) {
        console.error('Error fetching showroom detail:', error);
        return { showroom: null, error: error.message || 'Failed to fetch showroom details' };
    }
}

export async function updateShowroomStatus(showroomId: string, newStatus: 'active' | 'inactive'): Promise<{
    success: boolean;
    error: string | null;
}> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        const { error } = await supabase
            .from('showrooms')
            .update({ status: newStatus })
            .eq('id', showroomId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };

    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update showroom status' };
    }
} 