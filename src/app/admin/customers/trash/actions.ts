'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

export interface DeletedCustomer {
    id: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    deleted_at: string;
    deleted_by: string | null;
    deleted_by_admin: { full_name: string | null; email: string | null } | null;
    assigned_showroom: { id: string; name: string | null; } | null;
    salesperson: { id: string; full_name: string | null; } | null;
    purchase_amount: number | null;
}

export async function getDeletedCustomers(): Promise<{ customers: DeletedCustomer[], error: string | null }> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // Verify user is admin
        const { data: { user }, error: sessionError } = await supabase.auth.getUser();
        
        if (sessionError || !user) {
            return { customers: [], error: "User not authenticated." };
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            return { customers: [], error: "Only administrators can view deleted customers." };
        }

        // Get deleted customers
        const { data, error } = await supabase
            .from('customers')
            .select(`
                id,
                full_name,
                email,
                phone_number,
                deleted_at,
                deleted_by,
                assigned_showroom_id,
                assigned_salesperson_id,
                purchase_amount
            `)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });

        if (error) {
            console.error("Error fetching deleted customers:", error);
            return { customers: [], error: error.message };
        }

        if (!data || data.length === 0) {
            return { customers: [], error: null };
        }

        // Enrich with admin and relationship info
        const enrichedCustomers = await Promise.all(
            data.map(async (customer: any) => {
                // Get admin who deleted this customer
                let deletedByAdmin = null;
                if (customer.deleted_by) {
                    const { data: adminData } = await supabase
                        .from('profiles')
                        .select('full_name, email')
                        .eq('id', customer.deleted_by)
                        .single();
                    
                    if (adminData) {
                        deletedByAdmin = adminData;
                    }
                }

                // Get showroom info
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

                // Get salesperson info
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
                    deleted_at: customer.deleted_at,
                    deleted_by: customer.deleted_by,
                    deleted_by_admin: deletedByAdmin,
                    assigned_showroom: assignedShowroom,
                    salesperson: salesperson,
                    purchase_amount: customer.purchase_amount,
                } as DeletedCustomer;
            })
        );

        return { customers: enrichedCustomers, error: null };

    } catch (e: any) {
        console.error('Unexpected error in getDeletedCustomers:', e);
        return { customers: [], error: "An unexpected server error occurred." };
    }
}

export interface RestoreCustomerResult {
    success: boolean;
    error?: string;
}

export async function restoreCustomerAction(customerId: string): Promise<RestoreCustomerResult> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // Verify user is admin
        const { data: { user }, error: sessionError } = await supabase.auth.getUser();
        
        if (sessionError || !user) {
            return { success: false, error: "User not authenticated." };
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            return { success: false, error: "Only administrators can restore customers." };
        }

        // Get customer details for logging
        const { data: customer, error: fetchError } = await supabase
            .from('customers')
            .select('full_name, email')
            .eq('id', customerId)
            .not('deleted_at', 'is', null)
            .single();

        if (fetchError || !customer) {
            return { success: false, error: "Customer not found in trash." };
        }

        // Restore the customer (remove soft delete)
        const { error: restoreError } = await supabase
            .from('customers')
            .update({
                deleted_at: null,
                deleted_by: null
            } as any)
            .eq('id', customerId);

        if (restoreError) {
            console.error('Error restoring customer:', restoreError);
            return { success: false, error: "Failed to restore customer. Please try again." };
        }

        console.log(`Admin ${user.email} restored customer: ${customer.full_name} (${customer.email})`);

        // Revalidate relevant paths
        revalidatePath('/admin/customers');
        revalidatePath('/admin/customers/trash');
        revalidatePath('/admin/dashboard');

        return { success: true };

    } catch (error: any) {
        console.error('Unexpected error in restoreCustomerAction:', error);
        return { success: false, error: "An unexpected error occurred while restoring the customer." };
    }
}

export interface PermanentDeleteResult {
    success: boolean;
    error?: string;
}

export async function permanentDeleteCustomerAction(customerId: string): Promise<PermanentDeleteResult> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // Verify user is admin
        const { data: { user }, error: sessionError } = await supabase.auth.getUser();
        
        if (sessionError || !user) {
            return { success: false, error: "User not authenticated." };
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            return { success: false, error: "Only administrators can permanently delete customers." };
        }

        // Get customer details for logging
        const { data: customer, error: fetchError } = await supabase
            .from('customers')
            .select('full_name, email')
            .eq('id', customerId)
            .not('deleted_at', 'is', null)
            .single();

        if (fetchError || !customer) {
            return { success: false, error: "Customer not found in trash." };
        }

        // Permanently delete the customer
        const { error: deleteError } = await supabase
            .from('customers')
            .delete()
            .eq('id', customerId);

        if (deleteError) {
            console.error('Error permanently deleting customer:', deleteError);
            return { success: false, error: "Failed to permanently delete customer. Please try again." };
        }

        console.log(`Admin ${user.email} PERMANENTLY deleted customer: ${customer.full_name} (${customer.email})`);

        // Revalidate relevant paths
        revalidatePath('/admin/customers/trash');

        return { success: true };

    } catch (error: any) {
        console.error('Unexpected error in permanentDeleteCustomerAction:', error);
        return { success: false, error: "An unexpected error occurred while permanently deleting the customer." };
    }
} 