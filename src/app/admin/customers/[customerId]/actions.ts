'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// This interface can be expanded as needed, reusing types from other actions
export interface CustomerDetailForAdmin {
    id: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    avatar_url: string | null;
    lead_status: string | null;
    address_street: string | null;
    address_city: string | null;
    address_state: string | null;
    address_zip: string | null;
    address_country: string | null;
    notes: string | null;
    manager_notes: string | null;
    lead_source: string | null;
    created_at: string;
    updated_at: string;
    birth_date: string | null;
    anniversary_date: string | null;
    catchment_area: string | null;
    community: string | null;
    mother_tongue: string | null;
    reason_for_visit: string | null;
    age_of_end_user: string | null;
    customer_preferences: any | null; // Keep as any for flexibility with old/new structures
    follow_up_date: string | null;
    interest_categories_json: any | null; // Keep as any for flexibility
    visit_logs: any[] | null;
    call_logs: any[] | null;
    interest_level: string | null;
    monthly_saving_scheme_status?: string | null;
    // Relations
    showrooms: { name: string | null; } | null;
    profiles: { full_name: string | null; manager?: { full_name: string | null } } | null;
}

export async function getCustomerDetailsForAdmin(customerId: string): Promise<{
    customer: CustomerDetailForAdmin | null;
    error: string | null;
}> {
    if (!customerId) {
        return { customer: null, error: "Customer ID is required." };
    }

    const supabase = createServerActionClient<Database>({ cookies });

    try {
        const { data, error } = await supabase
            .from('customers')
            .select(`
                *,
                showrooms ( name ),
                profiles!customers_assigned_salesperson_id_fkey ( full_name, manager:profiles!supervising_manager_id(full_name) )
            `)
            .eq('id', customerId)
            .single();

        if (error) {
            console.error("Error fetching customer details for admin:", error);
            return { customer: null, error: error.message };
        }

        return { customer: data as CustomerDetailForAdmin, error: null };

    } catch (e: any) {
        console.error('Unexpected error in getCustomerDetailsForAdmin:', e);
        return { customer: null, error: "An unexpected server error occurred." };
    }
} 