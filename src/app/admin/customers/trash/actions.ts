import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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
    const supabase = createServerComponentClient<Database>({ cookies });

    try {
        // Get deleted customers (authentication is handled by ProtectedRoute wrapper)
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