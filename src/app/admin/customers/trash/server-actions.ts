'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

export interface RestoreCustomerResult {
    success: boolean;
    error?: string;
}

export async function restoreCustomerAction(customerId: string): Promise<RestoreCustomerResult> {
    const supabase = createServerActionClient<Database>({ cookies });

    try {
        // Get current user for logging (authentication is handled by ProtectedRoute)
        const { data: { user } } = await supabase.auth.getUser();

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

        console.log(`Admin ${user?.email || 'Unknown'} restored customer: ${customer.full_name} (${customer.email})`);

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
        // Get current user for logging (authentication is handled by ProtectedRoute)
        const { data: { user } } = await supabase.auth.getUser();

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

        // Delete all related records and the customer in sequence
        // Note: We do this in order to handle foreign key constraints
        
        console.log(`Starting permanent deletion of customer ${customerId} and all related records...`);

        // Delete related appointments
        const { error: appointmentsError } = await supabase
            .from('appointments')
            .delete()
            .eq('customer_id', customerId);
        
        if (appointmentsError) {
            console.error('Error deleting related appointments:', appointmentsError);
            return { success: false, error: `Failed to delete customer appointments: ${appointmentsError.message}` };
        }

        // Delete related tasks
        const { error: tasksError } = await supabase
            .from('tasks')
            .delete()
            .eq('customer_id', customerId);
        
        if (tasksError) {
            console.error('Error deleting related tasks:', tasksError);
            return { success: false, error: `Failed to delete customer tasks: ${tasksError.message}` };
        }

        // Delete related escalations
        const { error: escalationsError } = await supabase
            .from('escalations')
            .delete()
            .eq('customer_id', customerId);
        
        if (escalationsError) {
            console.error('Error deleting related escalations:', escalationsError);
            return { success: false, error: `Failed to delete customer escalations: ${escalationsError.message}` };
        }

        // Delete related sales transactions (this will cascade to transaction_items)
        const { error: salesError } = await supabase
            .from('sales_transactions')
            .delete()
            .eq('customer_id', customerId);
        
        if (salesError) {
            console.error('Error deleting related sales transactions:', salesError);
            return { success: false, error: `Failed to delete customer sales transactions: ${salesError.message}` };
        }

        // Finally, delete the customer
        const { error: deleteError } = await supabase
            .from('customers')
            .delete()
            .eq('id', customerId);

        if (deleteError) {
            console.error('Error permanently deleting customer:', deleteError);
            return { success: false, error: `Failed to permanently delete customer: ${deleteError.message}` };
        }

        console.log(`Successfully permanently deleted customer ${customerId} and all related records.`);

        console.log(`Admin ${user?.email || 'Unknown'} PERMANENTLY deleted customer: ${customer.full_name} (${customer.email})`);

        // Revalidate relevant paths
        revalidatePath('/admin/customers/trash');

        return { success: true };

    } catch (error: any) {
        console.error('Unexpected error in permanentDeleteCustomerAction:', error);
        return { success: false, error: "An unexpected error occurred while permanently deleting the customer." };
    }
} 