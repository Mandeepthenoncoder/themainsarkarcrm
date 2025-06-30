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
    purchase_amount: number | null;
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
        // First get the customer basic info
        const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single();

        if (customerError) {
            console.error("Error fetching customer details for admin:", customerError);
            return { customer: null, error: customerError.message };
        }

        if (!customerData) {
            return { customer: null, error: "Customer not found." };
        }

        // Get showroom info if assigned
        let showroomInfo = null;
        if (customerData.assigned_showroom_id) {
            const { data: showroomData } = await supabase
                .from('showrooms')
                .select('name')
                .eq('id', customerData.assigned_showroom_id)
                .single();
            
            if (showroomData) {
                showroomInfo = showroomData;
            }
        }

        // Get salesperson and manager info if assigned
        let salespersonInfo = null;
        if (customerData.assigned_salesperson_id) {
            const { data: salespersonData } = await supabase
                .from('profiles')
                .select('full_name, supervising_manager_id')
                .eq('id', customerData.assigned_salesperson_id)
                .single();
            
            if (salespersonData) {
                // Get manager info if salesperson has a supervising manager
                let managerInfo = null;
                if (salespersonData.supervising_manager_id) {
                    const { data: managerData } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', salespersonData.supervising_manager_id)
                        .single();
                    
                    if (managerData) {
                        managerInfo = managerData;
                    }
                }

                salespersonInfo = {
                    full_name: salespersonData.full_name,
                    ...(managerInfo && { manager: managerInfo })
                };
            }
        }

        const enrichedCustomer = {
            ...customerData,
            purchase_amount: (customerData as any).purchase_amount || null,
            showrooms: showroomInfo,
            profiles: salespersonInfo
        } as CustomerDetailForAdmin;

        return { customer: enrichedCustomer, error: null };

    } catch (e: any) {
        console.error('Unexpected error in getCustomerDetailsForAdmin:', e);
        return { customer: null, error: "An unexpected server error occurred." };
    }
} 