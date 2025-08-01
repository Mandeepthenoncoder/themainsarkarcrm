'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

export interface CustomerForAdminView {
    id: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    avatar_url: string | null;
    assigned_showroom: { id: string; name: string | null; } | null;
    salesperson: { id: string; full_name: string | null; } | null;
    lead_status: string | null;
    created_at: string;
    last_contacted_date: string | null;
    purchase_amount: number | null;
}

export async function getCustomersForAdminView(
    filters?: { [key: string]: string | undefined }
): Promise<{ customers: CustomerForAdminView[], error: string | null }> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        let query = supabase
            .from('customers')
            .select(`
                id,
                full_name,
                email,
                phone_number,
                avatar_url,
                lead_status,
                created_at,
                last_contacted_date,
                interest_level,
                address_city,
                interest_categories_json,
                assigned_showroom_id,
                assigned_salesperson_id,
                purchase_amount
            `)
            .is('deleted_at', null); // Only show non-deleted customers

        // Apply filters
        if (filters) {
            if (filters.q) {
                const searchTerm = `%${filters.q}%`;
                query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},phone_number.ilike.${searchTerm}`);
            }
            if (filters.status) {
                query = query.eq('lead_status', filters.status as any);
            }
            if (filters.interestLevel) {
                query = query.eq('interest_level', filters.interestLevel as any);
            }
            if (filters.location) {
                query = query.ilike('address_city', `%${filters.location}%`);
            }
            if (filters.interestCategory) {
                // This is a more complex query for a JSONB field.
                // For simplicity, we'll do a basic text search on the JSONB column.
                // A more robust solution might use an RPC function in Supabase.
                query = query.like('interest_categories_json::text', `%${filters.interestCategory}%`);
            }
        }
            
        const { data, error } = await query as any;

        if (error) {
            console.error("Error fetching customers for admin view:", error);
            return { customers: [], error: error.message };
        }

        if (!data || data.length === 0) {
            return { customers: [], error: null };
        }

        // Now enrich each customer with their showroom and salesperson info
        const enrichedCustomers = await Promise.all(
            data.map(async (customer: any) => {
                // Get showroom info if assigned
                let assignedShowroom = null;
                if (customer.assigned_showroom_id) {
                    const { data: showroomData } = await supabase
                        .from('showrooms')
                        .select('id, name')
                        .eq('id', customer.assigned_showroom_id)
                        .single();
                    
                    if (showroomData) {
                        assignedShowroom = showroomData;
                    }
                }

                // Get salesperson info if assigned
                let salesperson = null;
                if (customer.assigned_salesperson_id) {
                    const { data: salespersonData } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .eq('id', customer.assigned_salesperson_id)
                        .single();
                    
                    if (salespersonData) {
                        salesperson = salespersonData;
                    }
                }

                return {
                    id: customer.id,
                    full_name: customer.full_name,
                    email: customer.email,
                    phone_number: customer.phone_number,
                    avatar_url: customer.avatar_url,
                    lead_status: customer.lead_status,
                    created_at: customer.created_at,
                    last_contacted_date: customer.last_contacted_date,
                    purchase_amount: (customer as any).purchase_amount || null,
                    assigned_showroom: assignedShowroom,
                    salesperson: salesperson,
                } as CustomerForAdminView;
            })
        );

        return { customers: enrichedCustomers, error: null };

    } catch (e: any) {
        console.error('Unexpected error in getCustomersForAdminView:', e);
        return { customers: [], error: "An unexpected server error occurred." };
    }
}

export interface DeleteCustomerResult {
    success: boolean;
    error?: string;
}

export async function deleteCustomerAction(customerId: string): Promise<DeleteCustomerResult> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // Verify user is admin
        const { data: { user }, error: sessionError } = await supabase.auth.getUser();
        
        if (sessionError || !user) {
            return { success: false, error: "User not authenticated." };
        }

        // Get user profile to verify admin role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: "Could not verify user permissions." };
        }

        if (profile.role !== 'admin') {
            return { success: false, error: "Only administrators can delete customers." };
        }

        // First, get customer details for logging
        const { data: customer, error: fetchError } = await supabase
            .from('customers')
            .select('full_name, email')
            .eq('id', customerId)
            .single();

        if (fetchError) {
            return { success: false, error: "Customer not found." };
        }

        // Soft delete the customer (move to trash)
        const { error: deleteError } = await supabase
            .from('customers')
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: user.id
            } as any)
            .eq('id', customerId);

        if (deleteError) {
            console.error('Error soft deleting customer:', deleteError);
            return { success: false, error: "Failed to delete customer. Please try again." };
        }

        console.log(`Admin ${user.email} moved customer to trash: ${customer.full_name} (${customer.email})`);

        // Revalidate relevant paths
        revalidatePath('/admin/customers');
        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/customers/trash');

        return { success: true };

    } catch (error: any) {
        console.error('Unexpected error in deleteCustomerAction:', error);
        return { success: false, error: "An unexpected error occurred while deleting the customer." };
    }
} 